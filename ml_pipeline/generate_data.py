import pandas as pd
from faker import Faker
import random
import os

fake = Faker()

CATEGORIES = {
    "Housing": [
        "Rent payment", "Mortgage", "Home insurance", "Property tax", "HOA fees",
        "Maintenance", "Apartment rent", "House payment"
    ],
    "Transport": [
        "Uber trip", "Gas station", "Subway pass", "Car repair", "Parking ticket",
        "Lyft ride", "Bus ticket", "Taxi", "Car insurance", "Oil change"
    ],
    "Food": [
        "Walmart groceries", "Whole Foods", "McDonalds", "Starbucks", "Dining at Olive Garden",
        "Pizza delivery", "Target groceries", "Costco groceries", "KFC", "Subway sandwich",
        "Coffee shop", "Restaurant dinner", "Lunch at work"
    ],
    "Entertainment": [
        "Movie theater", "Concert tickets", "Bowling", "Theme park",
        "Arcade games", "Comedy show", "Museum tickets", "Zoo visit",
        "Escape room", "Karaoke night"
    ],
    "Utilities": [
        "Electric bill", "Water bill", "Internet service", "Trash collection",
        "Phone bill AT&T", "Gas bill", "Heating bill", "Cell phone bill"
    ],
    "Subscription": [
        "Netflix subscription", "Spotify premium", "Disney+ subscription",
        "YouTube Premium", "Amazon Prime", "HBO Max", "Apple Music",
        "Gym membership", "iCloud storage", "Google One storage",
        "Adobe Creative Cloud", "Microsoft 365", "Hulu subscription",
        "Audible membership", "PlayStation Plus"
    ],
    "Healthcare": [
        "Doctor visit", "Pharmacy prescription", "Dental checkup",
        "Eye exam", "Health insurance premium", "Therapy session",
        "Lab tests", "Urgent care visit", "Vitamins and supplements",
        "Physical therapy"
    ],
    "Shopping": [
        "Amazon purchase", "Clothing store", "Electronics store",
        "Shoes purchase", "Furniture store", "Home decor",
        "Kitchen supplies", "Jewelry purchase", "Department store",
        "Online shopping order"
    ],
    "Education": [
        "Online course", "Textbook purchase", "Tuition payment",
        "Workshop fee", "Udemy course", "Coursera subscription",
        "School supplies", "Tutoring session", "Certification exam",
        "Language learning app"
    ],
    "Other": [
        "Book purchase", "Pharmacy", "Doctor copay", "Pet food",
        "Haircut", "Dry cleaning", "Donation", "Gift"
    ]
}

SENTENCE_TEMPLATES = [
    "I spent ${amount} on {desc}",
    "Paid ${amount} for {desc}",
    "Bought {desc} for ${amount}",
    "{desc} cost ${amount}",
    "I paid ${amount} at {desc}",
    "Spent ${amount} on {desc}",
    "${amount} for {desc}",
    "{desc} ${amount}",
    "I bought {desc} ${amount}",
    "Charged ${amount} to {desc}",
    "purchased {desc} for ${amount}",
    "had to pay ${amount} for {desc}",
    # Templates without $ sign
    "I spent {amount} on {desc}",
    "Paid {amount} for {desc}",
    "Spent {amount} on {desc}",
    "{desc} cost me {amount}",
]

DATE_ADDITIONS = [
    "", " today", " yesterday", " last week", " on Monday",
    " on {date}", " last month", " this morning", " this week"
]

def generate_amount():
    return round(random.uniform(5, 500), 2)

def generate_transactions(n=15000):
    data = []
    category_keys = list(CATEGORIES.keys())
    
    for _ in range(n):
        cat = random.choice(category_keys)
        base_desc = random.choice(CATEGORIES[cat])
        amount = generate_amount()
        
        if random.random() < 0.6:
            template = random.choice(SENTENCE_TEMPLATES)
            desc = template.format(amount=f"{amount:.2f}", desc=base_desc)
            if random.random() < 0.3:
                date_add = random.choice(DATE_ADDITIONS)
                if "{date}" in date_add:
                    date_add = date_add.format(date=fake.date_this_year().strftime('%m/%d'))
                desc += date_add
        else:
            noise_type = random.choice(["none", "date", "id", "location"])
            if noise_type == "none":
                desc = base_desc
            elif noise_type == "date":
                desc = f"{base_desc} {fake.date_this_year().strftime('%m/%d')}"
            elif noise_type == "id":
                desc = f"{base_desc} TXN-{fake.ean(length=8)}"
            elif noise_type == "location":
                desc = f"{base_desc} {fake.city()}"
        
        if random.random() < 0.3:
            desc = desc.lower()
        if random.random() < 0.03:
            desc = desc + " " + fake.lexify("??????")
            
        data.append({"text": desc, "category": cat})
        
    return pd.DataFrame(data)

if __name__ == "__main__":
    print("Generating 15,000 natural-language transaction descriptions...")
    df = generate_transactions(15000)
    output_path = os.path.join(os.path.dirname(__file__), "transactions.csv")
    df.to_csv(output_path, index=False)
    print(f"Data generation complete. Saved to {output_path}")
    print(f"\nCategory distribution:")
    print(df['category'].value_counts())
    print(f"\nSample entries:")
    print(df.sample(5)[['text', 'category']].to_string(index=False))
