from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class Income(BaseModel):
    id: Optional[int] = None
    source: str
    amount: float
    frequency: str = Field(..., description="Daily, Weekly, Bi-Weekly, Monthly, Annually, Occasionally")
    type: str = Field(..., description="e.g., Salary, Freelance, Dividends")

class Expense(BaseModel):
    id: Optional[int] = None
    amount: float
    category: str
    date: date
    note: Optional[str] = None
    is_essential: bool = True
    is_recurring: bool = False

class Goal(BaseModel):
    id: Optional[int] = None
    name: str
    target_amount: float
    current_amount: float = 0.0
    deadline: Optional[date] = None
    priority: int = 1
    is_favourite: bool = False
    icon: str = "target"

class Limit(BaseModel):
    id: Optional[int] = None
    category: str
    amount: float

class ExpenseLogRequest(BaseModel):
    text: str

# --- Smart Parse Models ---
class SmartParseRequest(BaseModel):
    text: str

class ParsedExpense(BaseModel):
    amount: float
    category: str
    date: str
    note: str
    is_essential: bool = True
    is_recurring: bool = False

class ParsedIncome(BaseModel):
    source: str
    amount: float
    frequency: str = "Monthly"
    type: str = "Salary"

class ParsedGoal(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    deadline: Optional[str] = None
    priority: int = 1
    is_favourite: bool = False
    icon: str = "target"

class ParsedLimit(BaseModel):
    category: str
    amount: float

class SmartParseResponse(BaseModel):
    expenses: List[ParsedExpense] = []
    incomes: List[ParsedIncome] = []
    goals: List[ParsedGoal] = []
    limits: List[ParsedLimit] = []
    raw_text: str

class BulkSaveRequest(BaseModel):
    expenses: List[ParsedExpense] = []
    incomes: List[ParsedIncome] = []
    goals: List[ParsedGoal] = []
    limits: List[ParsedLimit] = []

class BulkSaveResponse(BaseModel):
    saved_expenses: int = 0
    saved_incomes: int = 0
    saved_goals: int = 0
    saved_limits: int = 0

# --- Optimization Models ---
class GoalAllocation(BaseModel):
    goal_id: Optional[int]
    goal_name: str
    allocated_monthly: float
    allocated_daily: float
    months_to_target: float
    is_favourite: bool = False
    icon: str = "target"

class OptimizationResponse(BaseModel):
    safe_daily_spend: float
    daily_savings_target: float = 0.0
    goal_allocations: List[GoalAllocation] = []
    alerts: List[str]
