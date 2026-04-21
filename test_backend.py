import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from backend.main import load_ml_model, ai_log_expense, create_income, create_goal, optimize_dashboard
from backend.models import ExpenseLogRequest, Income, Goal
import datetime

load_ml_model()

def run_tests():
    try:
        print('Testing Income Endpoint directly...')
        inc = Income(source="Salary", amount=5000, frequency="Monthly", type="Salary")
        create_income(inc)
        print('Income OK')

        print('Testing Expense AI Log Endpoint directly...')
        req = ExpenseLogRequest(text="Ordered pizza delivery last night")
        res_ai = ai_log_expense(req)
        assert 'Food' in res_ai['predicted_category'] or 'Entertainment' in res_ai['predicted_category']
        print('AI Log OK:', res_ai)

        print('Testing Goals Endpoint directly...')
        g = Goal(name="Vacation", target_amount=2000, deadline=datetime.date(2027,1,1), priority=1)
        create_goal(g)
        print('Goals OK')

        print('Testing Optimize Dashboard directly...')
        res_opt = optimize_dashboard()
        print('Optimize OK:', res_opt)
        print('\n--- All System Tests Passed Successfully! ---')
    except Exception as e:
        print('Failed:', str(e))
        sys.exit(1)

if __name__ == '__main__':
    run_tests()
