# Model Context Protocol (MCP) Server Specification
## Project: Smart Personal Budget Allocator
**Version:** 1.0.0

### 1. Overview
This document specifies the Model Context Protocol (MCP) server configuration for the Budget Allocator. By implementing this MCP server, compatible AI clients (e.g., Claude, Cursor, or custom local LLMs) can securely read a user's financial state, log expenses via natural language, and trigger the Linear Programming optimization engine.

### 2. MCP Resources
Resources expose static or stateful data to the LLM.

#### `budget://state/current`
* **Description:** Exposes the current financial state of the user, including normalized monthly income, total logged expenses for the current cycle, and active savings goals.
* **MIME Type:** `application/json`
* **Payload Example:**
```json
{
  "monthly_income_me": 4000.00,
  "essential_expenses": 1800.00,
  "discretionary_expenses": 450.00,
  "active_goals": [
    {"name": "Emergency Fund", "target": 500.00, "progress": 200.00}
  ],
  "days_remaining_in_month": 12
}
```

### 3. MCP Tools
Tools allow the LLM to take actions and mutate state in the Budget Allocator backend.

#### Tool 1: `log_expense`
* **Description:** Parses an expense and commits it to the database.
* **Parameters (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "amount": { "type": "number", "description": "The exact cost of the expense" },
    "description": { "type": "string", "description": "Raw description of what was bought" },
    "ai_category": { "type": "string", "enum": ["Housing", "Transport", "Food", "Entertainment", "Utilities", "Other"] },
    "is_essential": { "type": "boolean", "description": "True if the expense is an unavoidable need" }
  },
  "required": ["amount", "description", "ai_category"]
}
```

#### Tool 2: `run_optimization_engine`
* **Description:** Triggers the Linear Programming backend to recalculate the "Safe Daily Spend" limit based on the latest database state.
* **Parameters:** `None`
* **Returns:**
```json
{
  "status": "feasible",
  "safe_daily_spend": 14.50,
  "message": "You are on track to hit your savings goals.",
  "recommended_cuts": null
}
```

### 4. MCP Prompts
Pre-defined prompt templates that the LLM can invoke to understand its role.

#### Prompt: `financial_audit`
* **Description:** Instructs the LLM to audit the user's current budget using the `budget://state/current` resource and provide strategic advice.
* **Arguments:** `None`
* **Template:** > "You are an expert financial advisor AI connected to the user's Smart Budget Allocator. Analyze the data at `budget://state/current`. If they are running a deficit, identify the largest discretionary category and suggest a specific action plan to recover the funds before the month ends. Be direct and mathematically precise."
