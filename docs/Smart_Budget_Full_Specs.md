# Smart Personal Budget Allocator
## Full System Specification & Feature Matrix

### 1. Project Overview
The Smart Personal Budget Allocator is a full-stack FinTech application utilizing Natural Language Processing (NLP) for intelligent expense tracking and Linear Programming (LP) for dynamic budget optimization. This document outlines the complete feature set required for a production-ready application.

### 2. Comprehensive Feature Set (User Functions)

#### A. Income Management
* **Add Income Source:** Input fixed or variable income streams with customizable frequencies (Daily, Weekly, Bi-Weekly, Monthly, Annually).
* **Edit/Delete Income:** Modify existing income streams or remove outdated ones.
* **Income Categorization:** Tag income types (e.g., Salary, Freelance, Dividends).

#### B. Expense Management & AI Logging
* **AI Conversational Logger:** Log expenses using natural language (e.g., "I spent $50 on gas and $12 on a burger yesterday"). The NLP model extracts the amount, assigns a category, and dates it.
* **Manual Expense Entry:** Traditional form to input Amount, Category, Date, and Note.
* **Recurring Expenses (Subscriptions):** Flag an expense to automatically deduct on a specific interval (e.g., Netflix on the 15th).
* **Edit/Delete Transactions:** Modify past logs if categorized incorrectly.
* **Essential vs. Discretionary Toggles:** Override the AI's default assignment (e.g., marking a specific "Dining" expense as a "Business Meeting" essential).

#### C. Goal Management
* **Create Savings Goal:** Define a target amount, deadline, and goal name (e.g., "Emergency Fund: $5,000 by December").
* **Edit/Delete Goal:** Adjust timelines or target amounts.
* **Prioritize Goals:** Rank multiple goals so the optimizer knows which to fund first.
* **View Progress:** Visual indicators (progress bars) showing current saved amount vs. target.

#### D. Analytics & Dashboard (Optimization Output)
* **Safe Daily Spend Metric:** The core output—a dynamically updated number showing exactly how much the user can spend today while remaining on track for their goals.
* **Surplus/Deficit Alerts:** Automated AI notifications suggesting specific cuts if the user is overspending.
* **Spending Breakdown:** Visual charts (Pie/Bar) showing Income vs. Essentials vs. Discretionary.
* **Historical Trends:** View past months' performance.

#### E. Account Settings
* **Preferences:** Set base currency, timezone, and start of the financial month.
* **Data Export:** Download transaction history as CSV or PDF.

### 3. API Endpoints Matrix (For Backend Engineering)

**Income API**
* `GET /api/income` - Retrieve all active income streams.
* `POST /api/income` - Create a new income stream.
* `PUT /api/income/:id` - Update an income stream.
* `DELETE /api/income/:id` - Remove an income stream.

**Expense API**
* `GET /api/expenses` - Retrieve paginated list of transactions.
* `POST /api/expenses/ai-log` - Send raw text; returns parsed JSON + Category.
* `POST /api/expenses/manual` - Standard explicit logging.
* `PUT /api/expenses/:id` - Update a transaction.
* `DELETE /api/expenses/:id` - Delete a transaction.

**Goals API**
* `GET /api/goals` - Fetch all goals and current progress.
* `POST /api/goals` - Create a new goal.
* `PUT /api/goals/:id` - Update a goal.
* `DELETE /api/goals/:id` - Remove a goal.

**Optimization Engine API**
* `GET /api/optimize/dashboard` - Triggers the PuLP Linear Programming model. Normalizes all active incomes and expenses to a Monthly Equivalent, subtracts essentials, divides remaining by days left in the cycle, and returns the "Safe Daily Spend" and AI Actionable Alerts.
