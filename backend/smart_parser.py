"""
Smart Financial Text Parser
Uses Neural Network (MLPClassifier) for expense categorization
and regex-based NLP for entity extraction (amounts, dates, goals, income).
"""

import re
from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional


def extract_amounts(text: str) -> List[float]:
    """Extract dollar amounts from text using regex patterns."""
    patterns = [
        r'\$\s?([\d,]+\.?\d*)',          # $50, $1,200.50
        r'([\d,]+\.?\d*)\s*dollars?',    # 50 dollars
        r'([\d,]+\.?\d*)\s*bucks?',      # 50 bucks
        # Bare numbers after spending verbs (no $ required)
        r'(?:spent|paid|cost|bought|charged|pay|paying)\s+([\d,]+\.?\d*)',
    ]
    amounts = []
    seen = set()
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for m in matches:
            try:
                val = float(m.replace(',', ''))
                if 0.01 <= val <= 1000000 and val not in seen:
                    amounts.append(val)
                    seen.add(val)
            except ValueError:
                pass
    return amounts


def extract_date(text: str) -> Optional[date]:
    """Extract date from text. Returns None if no date found (defaults to today)."""
    today = datetime.now().date()
    text_lower = text.lower()
    
    if 'yesterday' in text_lower:
        return today - timedelta(days=1)
    if 'today' in text_lower or 'this morning' in text_lower:
        return today
    if 'last week' in text_lower:
        return today - timedelta(days=7)
    if 'last month' in text_lower:
        return today.replace(month=max(1, today.month - 1))
    
    # MM/DD format
    m = re.search(r'(\d{1,2})/(\d{1,2})', text)
    if m:
        try:
            month, day = int(m.group(1)), int(m.group(2))
            return date(today.year, month, day)
        except ValueError:
            pass
    
    # "March 5th", "Jan 15"
    month_names = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }
    m = re.search(r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})', text_lower)
    if m:
        try:
            month = month_names[m.group(1)[:3]]
            day = int(m.group(2))
            return date(today.year, month, day)
        except ValueError:
            pass
    
    return None


def extract_goals(text: str) -> List[Dict[str, Any]]:
    """Extract savings goals from text, deduplicating by (name, amount)."""
    goals = []
    patterns = [
        r'(?:save|saving)\s+\$?\s?([\d,]+\.?\d*)\s+(?:for|towards?)\s+(.+?)(?:\s+by\s+(.+?))?(?:\.|,|$)',
        r'(?:goal|target|want)\s+(?:to\s+)?(?:save\s+)?\$?\s?([\d,]+\.?\d*)\s+(?:for|towards?)\s+(.+?)(?:\s+by\s+(.+?))?(?:\.|,|$)',
        r'(?:need)\s+\$?\s?([\d,]+\.?\d*)\s+(?:for|towards?)\s+(.+?)(?:\s+by\s+(.+?))?(?:\.|,|$)',
    ]
    
    seen_goals = set()  # Track (name_lower, amount) to deduplicate
    
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            amount = float(match.group(1).replace(',', ''))
            name = match.group(2).strip().rstrip('.')
            deadline_str = match.group(3).strip().rstrip('.') if match.group(3) else None
            
            # Deduplicate: skip if we already have this (name, amount)
            dedup_key = (name.lower().strip(), amount)
            if dedup_key in seen_goals:
                continue
            seen_goals.add(dedup_key)
            
            # Parse deadline
            deadline = None
            if deadline_str:
                deadline = _parse_deadline(deadline_str)
            
            # Guess priority based on urgency keywords and amount
            priority = _guess_priority(name, amount, deadline)
            
            goal_data: Dict[str, Any] = {
                'name': name.title(),
                'target_amount': amount,
                'current_amount': 0.0,
                'priority': priority,
                'is_favourite': False,
                'icon': _guess_goal_icon(name),
            }
            
            if deadline:
                goal_data['deadline'] = deadline.isoformat()
            else:
                goal_data['deadline'] = None
            
            goals.append(goal_data)
    
    # If multiple goals found, mark the highest-priority one as favourite
    if goals:
        best_idx = max(range(len(goals)), key=lambda i: goals[i]['priority'])
        goals[best_idx]['is_favourite'] = True
    
    return goals


def _guess_priority(name: str, amount: float, deadline: Optional[date]) -> int:
    """
    Guess priority for a goal based on heuristics.
    Higher number = higher priority in the LP objective.
    """
    name_lower = name.lower()
    priority = 1
    
    # Urgency keywords boost priority
    urgent_keywords = ['emergency', 'urgent', 'asap', 'immediate', 'critical', 'must']
    important_keywords = ['house', 'home', 'car', 'wedding', 'medical', 'health', 'debt', 'loan']
    moderate_keywords = ['vacation', 'travel', 'education', 'course', 'phone', 'laptop', 'computer']
    
    if any(kw in name_lower for kw in urgent_keywords):
        priority = 5
    elif any(kw in name_lower for kw in important_keywords):
        priority = 3
    elif any(kw in name_lower for kw in moderate_keywords):
        priority = 2
    
    # Deadline proximity boosts priority
    if deadline:
        days_left = (deadline - datetime.now().date()).days
        if days_left < 60:
            priority += 3
        elif days_left < 180:
            priority += 1
    
    return priority


def _guess_goal_icon(name: str) -> str:
    """Guess an appropriate icon for a goal based on its name."""
    name_lower = name.lower()
    
    icon_keywords = {
        'home': ['house', 'home', 'apartment', 'flat', 'rent', 'mortgage', 'property'],
        'car': ['car', 'vehicle', 'auto', 'truck', 'motorcycle'],
        'plane': ['vacation', 'travel', 'trip', 'holiday', 'flight'],
        'graduation-cap': ['education', 'school', 'university', 'college', 'course', 'degree', 'tuition'],
        'piggy-bank': ['emergency', 'savings', 'fund', 'reserve', 'rainy day'],
        'heart': ['wedding', 'marriage', 'engagement', 'ring'],
        'smartphone': ['phone', 'iphone', 'samsung', 'mobile', 'tablet', 'ipad'],
        'laptop': ['laptop', 'computer', 'macbook', 'pc', 'tech'],
        'dumbbell': ['gym', 'fitness', 'health', 'workout', 'sport'],
        'baby': ['baby', 'child', 'kid', 'nursery'],
        'briefcase': ['business', 'startup', 'invest'],
    }
    
    for icon, keywords in icon_keywords.items():
        if any(kw in name_lower for kw in keywords):
            return icon
    
    return 'target'


def _parse_deadline(s: str) -> Optional[date]:
    """Parse deadline string into a date."""
    s = s.strip().lower()
    month_names = {
        'january': 1, 'february': 2, 'march': 3, 'april': 4,
        'may': 5, 'june': 6, 'july': 7, 'august': 8,
        'september': 9, 'october': 10, 'november': 11, 'december': 12,
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4,
        'jun': 6, 'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }
    
    # "December 2026", "Dec 2026"
    for name, num in month_names.items():
        m = re.search(rf'{name}\s*(\d{{4}})', s)
        if m:
            year = int(m.group(1))
            try:
                return date(year, num, 28)
            except ValueError:
                pass
    
    # "end of year", "next year"
    today = datetime.now().date()
    if 'end of year' in s or 'end of the year' in s:
        return date(today.year, 12, 31)
    if 'next year' in s:
        return date(today.year + 1, 12, 31)
    if '6 months' in s or 'six months' in s:
        return today + timedelta(days=180)
    
    return None


def extract_income(text: str) -> List[Dict[str, Any]]:
    """Extract income statements from text."""
    incomes = []
    patterns = [
        r'(?:I\s+)?(?:earn|make|get(?:\s+paid)?|receive|salary\s+(?:is|of))\s+\$?\s?([\d,]+\.?\d*)\s*(?:per|a|every|\/|\s)?\s*(month|week|year|day|annual|monthly|weekly|daily|bi-weekly|occasionally)?(?:\s+(?:from|at|as|for)\s+(.+?))?(?:\.|,|$)',
        r'(?:income|salary|wage|pay)\s+(?:is|of)\s+\$?\s?([\d,]+\.?\d*)\s*(?:per|a|every|\/|\s)?\s*(month|week|year|annual|monthly|weekly|daily|occasionally)?(?:\s+(?:from|at)\s+(.+?))?(?:\.|,|$)',
        r'(?:my\s+)?(?:job|work)\s+pays?\s+\$?\s?([\d,]+\.?\d*)\s*(?:per|a|every|\/|\s)?\s*(month|week|year|annual|monthly|weekly|daily)?(?:\.|,|$)',
        # Freelance patterns
        r'(?:freelanc\w*)\s+(?:income|pay|earning)s?\s+(?:is|of|about|around)?\s*\$?\s?([\d,]+\.?\d*)\s*(?:per|a|every|\/|\s)?\s*(month|week|year|occasionally|gig)?(?:\s+(?:from|at)\s+(.+?))?(?:\.|,|$)',
    ]
    
    freq_map = {
        'month': 'Monthly', 'monthly': 'Monthly',
        'week': 'Weekly', 'weekly': 'Weekly',
        'year': 'Annually', 'annual': 'Annually', 'annually': 'Annually',
        'day': 'Daily', 'daily': 'Daily',
        'bi-weekly': 'Bi-Weekly',
        'occasionally': 'Occasionally', 'gig': 'Occasionally',
    }
    
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            amount = float(match.group(1).replace(',', ''))
            freq_raw = (match.group(2) or 'monthly').lower()
            source = (match.group(3) or 'My Job').strip().rstrip('.').title() if len(match.groups()) >= 3 and match.group(3) else 'My Job'
            
            frequency = freq_map.get(freq_raw, 'Monthly')
            
            # Detect freelance type
            income_type = 'Salary'
            if 'freelanc' in text.lower() or frequency == 'Occasionally':
                income_type = 'Freelance'
            
            incomes.append({
                'source': source,
                'amount': amount,
                'frequency': frequency,
                'type': income_type
            })
    
    return incomes


def split_into_statements(text: str) -> List[str]:
    """Split compound text into individual financial statements."""
    # Split on periods, "and", semicolons, newlines
    parts = re.split(r'[.;\n]|\band\b', text)
    # Filter out empty/whitespace-only parts
    return [p.strip() for p in parts if p.strip() and len(p.strip()) > 3]


def parse_financial_text(text: str, classifier=None) -> Dict[str, Any]:
    """
    Main parser: Takes free-form financial text and returns structured data.
    Uses the neural network classifier for expense categorization.
    """
    result = {
        'expenses': [],
        'incomes': [],
        'goals': [],
        'raw_text': text
    }
    
    # Extract income and goals from full text first
    result['incomes'] = extract_income(text)
    result['goals'] = extract_goals(text)
    
    # Split into individual statements for expense parsing
    statements = split_into_statements(text)
    
    # Remove statements that were already captured as income or goals
    income_goal_keywords = ['earn', 'make', 'salary', 'income', 'save', 'saving', 'goal', 'target', 'get paid', 'receive', 'wage', 'pay']
    
    for stmt in statements:
        stmt_lower = stmt.lower()
        
        # Skip if this is an income or goal statement
        if any(kw in stmt_lower for kw in income_goal_keywords):
            continue
        
        # Extract amounts from this statement
        amounts = extract_amounts(stmt)
        if not amounts:
            continue
        
        # Extract date
        expense_date = extract_date(stmt) or datetime.now().date()
        
        # Classify category using the neural network
        category = 'Other'
        if classifier is not None:
            try:
                category = classifier.predict([stmt])[0]
            except Exception:
                category = 'Other'
        
        # Determine if essential based on category
        essential_categories = ['Housing', 'Utilities', 'Food', 'Healthcare']
        
        # Use the first amount found (primary amount for this statement)
        result['expenses'].append({
            'amount': amounts[0],
            'category': category,
            'date': expense_date.isoformat(),
            'note': stmt.strip(),
            'is_essential': category in essential_categories,
            'is_recurring': category in ['Subscription'],
        })
    
    return result
