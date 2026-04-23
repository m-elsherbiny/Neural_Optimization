"""
Budget Optimization Engine
Uses Linear Programming (PuLP with CBC solver) to optimally allocate
disposable income across competing savings goals.

Optimization Technique: Linear Programming
- Objective: Maximize priority-weighted × urgency-weighted goal funding
- Constraints: Total allocation <= disposable income, per-goal bounds
- Solver: CBC (Coin-or Branch and Cut)
"""

import pulp
from datetime import date, datetime
import calendar
from typing import List, Optional
from backend.models import Income, Expense, Goal, OptimizationResponse, GoalAllocation


def get_days_in_current_month():
    now = datetime.now()
    return calendar.monthrange(now.year, now.month)[1]

def get_days_left_in_month():
    now = datetime.now()
    days_in_month = get_days_in_current_month()
    return days_in_month - now.day + 1

def normalize_to_monthly(amount: float, frequency: str) -> float:
    freq = frequency.lower()
    if freq == 'daily':
        return amount * 30.0
    elif freq == 'weekly':
        return amount * 4.33
    elif freq == 'bi-weekly':
        return amount * 2.16
    elif freq == 'monthly':
        return amount
    elif freq == 'annually':
        return amount / 12.0
    elif freq == 'occasionally':
        return amount * 0.33
    return amount

def months_until(target_date: Optional[date]) -> float:
    if target_date is None:
        return 24.0
    today = datetime.now().date()
    if target_date <= today:
        return 0.0
    delta = target_date - today
    return max(delta.days / 30.0, 0.1)

def optimize_budget(incomes: List[Income], expenses: List[Expense], goals: List[Goal]) -> OptimizationResponse:
    total_monthly_income = sum(normalize_to_monthly(i.amount, i.frequency) for i in incomes)
    
    now = datetime.now().date()
    current_month = now.month
    current_year = now.year
    
    total_essential_expenses = 0.0
    for e in expenses:
        if e.is_essential or e.is_recurring:
            total_essential_expenses += e.amount
        elif e.date.month == current_month and e.date.year == current_year:
            total_essential_expenses += e.amount
    
    disposable_income = float(total_monthly_income - total_essential_expenses)
    
    alerts: List[str] = []
    goal_allocations: List[GoalAllocation] = []
    
    if total_monthly_income == 0.0:
        alerts.append("No income recorded yet. Add your income sources in the Allocation page to get optimization recommendations.")
        return OptimizationResponse(safe_daily_spend=0.0, daily_savings_target=0.0, goal_allocations=[], alerts=alerts)
    
    if disposable_income < 0:
        alerts.append("⚠️ Deficit Alert: Your essential expenses exceed your monthly income. Review your essentials or increase income.")
        return OptimizationResponse(safe_daily_spend=0.0, daily_savings_target=0.0, goal_allocations=[], alerts=alerts)
    
    prob = pulp.LpProblem("Budget_Optimization", pulp.LpMaximize)
    goal_vars = {}
    active_goals = []
    
    for g in goals:
        remaining = g.target_amount - g.current_amount
        if remaining <= 0:
            continue
        active_goals.append(g)
        m_until = months_until(g.deadline)
        ideal_monthly = remaining / m_until if m_until > 0 else remaining
        upper_bound = min(remaining, max(ideal_monthly * 2, remaining * 0.5))
        goal_vars[g.id] = pulp.LpVariable(f"Goal_{g.id}", lowBound=0, upBound=max(upper_bound, 0))
    
    allocated_to_goals = 0.0
    
    if active_goals:
        objective_terms = []
        for g in active_goals:
            m_until = months_until(g.deadline)
            urgency = 1.0 + (1.0 / max(m_until, 0.1)) if g.deadline is not None else 1.0
            favourite_bonus = 10.0 if g.is_favourite else 1.0
            weight = g.priority * urgency * favourite_bonus
            objective_terms.append(goal_vars[g.id] * weight)
        
        # To ensure the user always has a safe daily spend allowance, we mathematically cap 
        # the total savings allocation to 80% of their disposable income.
        max_savings_pool = disposable_income * 0.80
        
        prob += pulp.lpSum(objective_terms)
        prob += pulp.lpSum([goal_vars[g.id] for g in active_goals]) <= max_savings_pool
        prob.solve(pulp.PULP_CBC_CMD(msg=0))
        
        for g in active_goals:
            val = goal_vars[g.id].varValue or 0.0
            allocated_to_goals += val
            remaining = g.target_amount - g.current_amount
            m_until = months_until(g.deadline)
            goal_allocations.append(GoalAllocation(
                goal_id=g.id, goal_name=g.name,
                allocated_monthly=round(val, 2), allocated_daily=round(val / 30.0, 2),
                months_to_target=round(remaining / val, 1) if val > 0 else round(m_until, 1),
                is_favourite=g.is_favourite, icon=g.icon
            ))
    
    remaining_for_discretionary = disposable_income - allocated_to_goals
    days_left = get_days_left_in_month()
    safe_daily_spend = max(0.0, remaining_for_discretionary / days_left if days_left > 0 else 0)
    daily_savings_target = allocated_to_goals / 30.0 if allocated_to_goals > 0 else 0.0
    
    if disposable_income > 0 and safe_daily_spend >= 10:
        savings_rate = (allocated_to_goals / total_monthly_income) * 100 if total_monthly_income > 0 else 0
        alerts.append(f"✅ Finances look solid! You're saving {savings_rate:.0f}% of your income. Safe to spend ${safe_daily_spend:.2f}/day.")
    elif 0 < safe_daily_spend < 10 and remaining_for_discretionary > 0:
        alerts.append("⚠️ Low Daily Spend: Your budget is tight. Consider reducing non-essential spending.")
    elif safe_daily_spend == 0 and remaining_for_discretionary > 0:
        alerts.append("💡 All disposable income allocated to goals. Rebalance if you need daily spending room.")
    elif not active_goals and disposable_income > 0:
        alerts.append(f"✅ You have ${disposable_income:.2f}/month disposable. Set savings goals to optimize!")
        
    return OptimizationResponse(
        safe_daily_spend=round(safe_daily_spend, 2), daily_savings_target=round(daily_savings_target, 2),
        goal_allocations=goal_allocations, alerts=alerts
    )
