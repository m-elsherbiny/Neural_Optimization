from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from backend.models import (
    Income, Expense, Goal, 
    ExpenseLogRequest, OptimizationResponse,
    SmartParseRequest, SmartParseResponse, ParsedExpense, ParsedIncome, ParsedGoal,
    BulkSaveRequest, BulkSaveResponse
)
from backend.optimizer import optimize_budget
from backend.smart_parser import parse_financial_text
import joblib
import os
from datetime import date

app = FastAPI(title="Smart Personal Budget Allocator API")

# Add CORS middleware to allow the React frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for MVP proof of concept
INCOMES: List[Income] = []
EXPENSES: List[Expense] = []
GOALS: List[Goal] = []

MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml_pipeline", "expense_classifier.pkl"))
CLASSIFIER_MODEL = None

@app.on_event("startup")
def load_ml_model():
    global CLASSIFIER_MODEL
    if os.path.exists(MODEL_PATH):
        try:
            CLASSIFIER_MODEL = joblib.load(MODEL_PATH)
            print(f"Loaded classifier from {MODEL_PATH}")
        except Exception as e:
            print(f"Error loading model: {e}")
    else:
        print("Warning: ML model not found. Smart parsing and AI categorization will not work until model is trained.")
        print(f"Expected model at: {MODEL_PATH}")
        print("Run: python -m ml_pipeline.generate_data && python -m ml_pipeline.train_nlp")

# --- INCOME API ---
@app.get("/api/income", response_model=List[Income])
def get_incomes():
    return INCOMES

@app.post("/api/income", response_model=Income)
def create_income(income: Income):
    income.id = max((inc.id for inc in INCOMES if inc.id is not None), default=0) + 1
    INCOMES.append(income)
    return income

@app.put("/api/income/{id}", response_model=Income)
def update_income(id: int, income: Income):
    for i, inc in enumerate(INCOMES):
        if inc.id == id:
            income.id = id
            INCOMES[i] = income
            return income
    raise HTTPException(status_code=404, detail="Income not found")

@app.delete("/api/income/{id}")
def delete_income(id: int):
    global INCOMES
    INCOMES = [inc for inc in INCOMES if inc.id != id]
    return {"message": "Deleted"}

# --- EXPENSES API ---
@app.get("/api/expenses", response_model=List[Expense])
def get_expenses():
    return EXPENSES

@app.post("/api/expenses/manual", response_model=Expense)
def manual_log_expense(expense: Expense):
    expense.id = max((exp.id for exp in EXPENSES if exp.id is not None), default=0) + 1
    EXPENSES.append(expense)
    return expense

@app.post("/api/expenses/ai-log")
def ai_log_expense(request: ExpenseLogRequest):
    if CLASSIFIER_MODEL is None:
        raise HTTPException(status_code=500, detail="ML Model not trained. Please run training pipeline first.")
        
    try:
        predicted_category = CLASSIFIER_MODEL.predict([request.text])[0]
        return {
            "text": request.text,
            "predicted_category": predicted_category,
            "note": "AI categorized successfully using Neural Network (MLPClassifier)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}") from e

@app.put("/api/expenses/{id}", response_model=Expense)
def update_expense(id: int, expense: Expense):
    for i, exp in enumerate(EXPENSES):
        if exp.id == id:
            expense.id = id
            EXPENSES[i] = expense
            return expense
    raise HTTPException(status_code=404, detail="Expense not found")

@app.delete("/api/expenses/{id}")
def delete_expense(id: int):
    global EXPENSES
    EXPENSES = [exp for exp in EXPENSES if exp.id != id]
    return {"message": "Deleted"}

# --- GOALS API ---
@app.get("/api/goals", response_model=List[Goal])
def get_goals():
    return GOALS

@app.post("/api/goals", response_model=Goal)
def create_goal(goal: Goal):
    goal.id = max((g.id for g in GOALS if g.id is not None), default=0) + 1
    GOALS.append(goal)
    return goal

@app.put("/api/goals/{id}", response_model=Goal)
def update_goal(id: int, goal: Goal):
    for i, g in enumerate(GOALS):
        if g.id == id:
            goal.id = id
            GOALS[i] = goal
            return goal
    raise HTTPException(status_code=404, detail="Goal not found")

@app.delete("/api/goals/{id}")
def delete_goal(id: int):
    global GOALS
    GOALS = [g for g in GOALS if g.id != id]
    return {"message": "Deleted"}

# --- OPTIMIZATION ENGINE API ---
@app.get("/api/optimize/dashboard", response_model=OptimizationResponse)
def optimize_dashboard():
    return optimize_budget(INCOMES, EXPENSES, GOALS)

# --- SMART PARSE API (Neural Network + NLP) ---
@app.post("/api/smart-parse", response_model=SmartParseResponse)
def smart_parse(request: SmartParseRequest):
    """
    Parses free-form financial text using:
    1. Neural Network (MLPClassifier) for expense categorization
    2. Regex-based NLP for entity extraction (amounts, dates, goals, income)
    """
    result = parse_financial_text(request.text, CLASSIFIER_MODEL)
    return SmartParseResponse(
        expenses=[ParsedExpense(**e) for e in result['expenses']],
        incomes=[ParsedIncome(**i) for i in result['incomes']],
        goals=[ParsedGoal(**g) for g in result['goals']],
        raw_text=result['raw_text']
    )

@app.post("/api/smart-parse/confirm", response_model=BulkSaveResponse)
def confirm_parsed_data(request: BulkSaveRequest):
    """
    Save all confirmed parsed items from the smart parser in bulk.
    """
    saved_expenses = 0
    saved_incomes = 0
    saved_goals = 0
    
    for exp in request.expenses:
        new_expense = Expense(
            amount=exp.amount, category=exp.category,
            date=date.fromisoformat(exp.date), note=exp.note,
            is_essential=exp.is_essential, is_recurring=exp.is_recurring
        )
        new_expense.id = max((e.id for e in EXPENSES if e.id is not None), default=0) + 1
        EXPENSES.append(new_expense)
        saved_expenses += 1
    
    for inc in request.incomes:
        new_income = Income(
            source=inc.source, amount=inc.amount,
            frequency=inc.frequency, type=inc.type
        )
        new_income.id = max((i.id for i in INCOMES if i.id is not None), default=0) + 1
        INCOMES.append(new_income)
        saved_incomes += 1
    
    for g in request.goals:
        new_goal = Goal(
            name=g.name, target_amount=g.target_amount,
            current_amount=g.current_amount,
            deadline=date.fromisoformat(g.deadline) if g.deadline else None,
            priority=g.priority, is_favourite=g.is_favourite, icon=g.icon
        )
        new_goal.id = max((gl.id for gl in GOALS if gl.id is not None), default=0) + 1
        GOALS.append(new_goal)
        saved_goals += 1
    
    return BulkSaveResponse(
        saved_expenses=saved_expenses,
        saved_incomes=saved_incomes,
        saved_goals=saved_goals
    )
