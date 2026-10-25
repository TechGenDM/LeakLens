"""
Deterministic Dataset Generator for LeakLens.
Generates 4 realistic CSV datasets:
1. backend/data/seed_training.csv (exactly 350 rows)
2. backend/data/persona_dev.csv (exactly 180 rows over 90 days)
3. backend/data/persona_student.csv (exactly 160 rows over 90 days)
4. backend/data/persona_freelancer.csv (exactly 200 rows over 90 days)
"""

import os
from pathlib import Path
from datetime import datetime, timedelta
import numpy as np
import pandas as pd

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Fixed seed for absolute determinism
np.random.seed(42)

def generate_seed_training_data() -> pd.DataFrame:
    """
    Generate exactly 350 rows for TabPFNClassifier in-context training.
    Columns:
      - amount_zscore (float)
      - cadence_regularity (float, 0.0 to 1.0)
      - price_drift_pct (float, percentage increase over prior charges)
      - is_micro_charge (int, 0 or 1 for charges under $15)
      - charge_count_90d (int)
      - days_since_first_seen (int)
      - is_trial_conversion_pattern (int, 0 or 1)
      - is_essential_pos (int, 1 for rent/food/utilities/transit, 0 for software/saas)
      - has_rule_flag (int, 1 if deterministic anomaly detected, 0 otherwise)
      - label_is_leak (int, 0 = clean, 1 = silent leak)
    """
    rows = []

    # 1. Clean Monthly Essentials (Rent, Utilities, Transit) - 80 rows
    for _ in range(80):
        is_large_bill = np.random.choice([False, True], p=[0.6, 0.4])
        amount_zscore = float(np.round(np.random.uniform(1.2, 5.5) if is_large_bill else np.random.uniform(-0.5, 0.4), 3))
        cadence_regularity = float(np.round(np.random.uniform(0.92, 1.00), 3))
        price_drift_pct = float(np.round(np.random.uniform(0.0, 0.02), 3))
        is_micro = 0 if is_large_bill else int(np.random.choice([0, 1], p=[0.7, 0.3]))
        charge_count = int(np.random.choice([3, 4]))
        days_first = int(np.random.randint(60, 91))
        rows.append({
            "amount_zscore": amount_zscore,
            "cadence_regularity": cadence_regularity,
            "price_drift_pct": price_drift_pct,
            "is_micro_charge": is_micro,
            "charge_count_90d": charge_count,
            "days_since_first_seen": days_first,
            "is_trial_conversion_pattern": 0,
            "is_essential_pos": 1,
            "has_rule_flag": 0,
            "label_is_leak": 0
        })

    # 2. Clean Irregular Purchases (Groceries, Coffee, Hardware, Pharmacies) - 80 rows
    for _ in range(80):
        amount_zscore = float(np.round(np.random.uniform(-0.8, 1.5), 3))
        cadence_regularity = float(np.round(np.random.uniform(0.02, 0.50), 3))
        price_drift_pct = float(np.round(np.random.uniform(0.0, 0.08), 3))
        is_micro = int(np.random.choice([0, 1], p=[0.5, 0.5]))
        charge_count = int(np.random.randint(1, 15))
        days_first = int(np.random.randint(10, 91))
        rows.append({
            "amount_zscore": amount_zscore,
            "cadence_regularity": cadence_regularity,
            "price_drift_pct": price_drift_pct,
            "is_micro_charge": is_micro,
            "charge_count_90d": charge_count,
            "days_since_first_seen": days_first,
            "is_trial_conversion_pattern": 0,
            "is_essential_pos": 1,
            "has_rule_flag": 0,
            "label_is_leak": 0
        })

    # 3. Clean SaaS Subscriptions (Adobe, Webflow, Zoom, Loom - 0% drift, stable) - 60 rows
    for _ in range(60):
        amount_zscore = float(np.round(np.random.uniform(-0.6, 0.4), 3))
        cadence_regularity = float(np.round(np.random.uniform(0.88, 1.00), 3))
        price_drift_pct = 0.0
        is_micro = 0
        charge_count = int(np.random.choice([3, 4]))
        days_first = int(np.random.randint(60, 91))
        rows.append({
            "amount_zscore": amount_zscore,
            "cadence_regularity": cadence_regularity,
            "price_drift_pct": price_drift_pct,
            "is_micro_charge": is_micro,
            "charge_count_90d": charge_count,
            "days_since_first_seen": days_first,
            "is_trial_conversion_pattern": 0,
            "is_essential_pos": 0,
            "has_rule_flag": 0,
            "label_is_leak": 0
        })

    # 4. Leaks: Silent Price Hikes & Creep (Render, Figma, Notion AI, OpenAI) - 45 rows
    for _ in range(45):
        amount_zscore = float(np.round(np.random.uniform(-0.3, 1.5), 3))
        cadence_regularity = float(np.round(np.random.uniform(0.80, 1.00), 3))
        price_drift_pct = float(np.round(np.random.uniform(0.20, 2.00), 3))
        is_micro = int(np.random.choice([0, 1], p=[0.6, 0.4]))
        charge_count = int(np.random.choice([3, 4]))
        days_first = int(np.random.randint(60, 91))
        rows.append({
            "amount_zscore": amount_zscore,
            "cadence_regularity": cadence_regularity,
            "price_drift_pct": price_drift_pct,
            "is_micro_charge": is_micro,
            "charge_count_90d": charge_count,
            "days_since_first_seen": days_first,
            "is_trial_conversion_pattern": 0,
            "is_essential_pos": 0,
            "has_rule_flag": 1,
            "label_is_leak": 1
        })

    # 5. Leaks: Duplicate Charges in Same Cycle (Copilot billed 2x) - 30 rows
    for _ in range(30):
        amount_zscore = float(np.round(np.random.uniform(-0.5, 0.8), 3))
        cadence_regularity = float(np.round(np.random.uniform(0.35, 0.70), 3))
        price_drift_pct = float(np.round(np.random.uniform(0.0, 0.05), 3))
        is_micro = int(np.random.choice([0, 1], p=[0.5, 0.5]))
        charge_count = int(np.random.randint(4, 7))
        days_first = int(np.random.randint(50, 91))
        rows.append({
            "amount_zscore": amount_zscore,
            "cadence_regularity": cadence_regularity,
            "price_drift_pct": price_drift_pct,
            "is_micro_charge": is_micro,
            "charge_count_90d": charge_count,
            "days_since_first_seen": days_first,
            "is_trial_conversion_pattern": 0,
            "is_essential_pos": 0,
            "has_rule_flag": 1,
            "label_is_leak": 1
        })

    # 6. Leaks: Trial Conversion Traps (Coursera $1 auth followed by full sub) - 25 rows
    for _ in range(25):
        amount_zscore = float(np.round(np.random.uniform(0.2, 1.8), 3))
        cadence_regularity = float(np.round(np.random.uniform(0.40, 0.78), 3))
        price_drift_pct = float(np.round(np.random.uniform(2.0, 10.0), 3))
        is_micro = 0
        charge_count = int(np.random.choice([2, 3]))
        days_first = int(np.random.randint(20, 60))
        rows.append({
            "amount_zscore": amount_zscore,
            "cadence_regularity": cadence_regularity,
            "price_drift_pct": price_drift_pct,
            "is_micro_charge": is_micro,
            "charge_count_90d": charge_count,
            "days_since_first_seen": days_first,
            "is_trial_conversion_pattern": 1,
            "is_essential_pos": 0,
            "has_rule_flag": 1,
            "label_is_leak": 1
        })

    # 7. Leaks: Idle Infrastructure & Surprise Domain Renewals (Pinecone $70, WeWork $375, Namecheap $65) - 30 rows
    for _ in range(30):
        amount_zscore = float(np.round(np.random.uniform(0.6, 3.5), 3))
        cadence_regularity = float(np.round(np.random.uniform(0.85, 1.00), 3))
        price_drift_pct = float(np.round(np.random.uniform(0.0, 0.04), 3))
        is_micro = 0
        charge_count = int(np.random.choice([1, 2, 3]))
        days_first = int(np.random.randint(30, 91))
        rows.append({
            "amount_zscore": amount_zscore,
            "cadence_regularity": cadence_regularity,
            "price_drift_pct": price_drift_pct,
            "is_micro_charge": is_micro,
            "charge_count_90d": charge_count,
            "days_since_first_seen": days_first,
            "is_trial_conversion_pattern": 0,
            "is_essential_pos": 0,
            "has_rule_flag": 1,
            "label_is_leak": 1
        })

    df = pd.DataFrame(rows)
    assert len(df) == 350, f"Expected 350 rows, got {len(df)}"
    return df

def generate_persona_dev() -> pd.DataFrame:
    """
    Persona 1: Indie Dev SaaS Bleed (exactly 180 rows over 90 days).
    Starting Balance: $9,450.00
    Specific leaks:
      - POS DEB STRIPE*RENDER-SRV (month 1: $19.00, month 2: $19.00, month 3: $29.00)
      - ACH WEB PINECONE*IO-VEC ($70.00/mo idle vector DB)
      - PAYPAL *NAMECHEAP-RNW (unexpected $64.98 domain auto-renewal)
      - GITHUB*COPILOT-PRO (billed twice in month 2: $10.00 on day 35, $10.00 on day 42)
      - OPENAI *API-USAGE (creeping usage: $18.50, $47.20, $94.80)
    Plus normal SaaS (AWS, Cloudflare, Spotify) and living expenses.
    """
    base_date = datetime(2026, 7, 27)
    tx_list = []

    # 1. POS DEB STRIPE*RENDER-SRV (3 charges: 19.00, 19.00, 29.00)
    tx_list.append((base_date + timedelta(days=2), "POS DEB STRIPE*RENDER-SRV", 19.00))
    tx_list.append((base_date + timedelta(days=32), "POS DEB STRIPE*RENDER-SRV", 19.00))
    tx_list.append((base_date + timedelta(days=62), "POS DEB STRIPE*RENDER-SRV", 29.00))

    # 2. ACH WEB PINECONE*IO-VEC (3 charges: 70.00, 70.00, 70.00)
    tx_list.append((base_date + timedelta(days=5), "ACH WEB PINECONE*IO-VEC", 70.00))
    tx_list.append((base_date + timedelta(days=35), "ACH WEB PINECONE*IO-VEC", 70.00))
    tx_list.append((base_date + timedelta(days=65), "ACH WEB PINECONE*IO-VEC", 70.00))

    # 3. PAYPAL *NAMECHEAP-RNW (1 unexpected domain auto-renew)
    tx_list.append((base_date + timedelta(days=48), "PAYPAL *NAMECHEAP-RNW 88291", 64.98))

    # 4. GITHUB*COPILOT-PRO (duplicate in month 2)
    tx_list.append((base_date + timedelta(days=10), "GITHUB*COPILOT-PRO SUBSCRIPTION", 10.00))
    tx_list.append((base_date + timedelta(days=40), "GITHUB*COPILOT-PRO SUBSCRIPTION", 10.00))
    tx_list.append((base_date + timedelta(days=47), "GITHUB*COPILOT-PRO SUBSCRIPTION", 10.00)) # Duplicate!
    tx_list.append((base_date + timedelta(days=70), "GITHUB*COPILOT-PRO SUBSCRIPTION", 10.00))

    # 5. OPENAI *API-USAGE (creeping usage)
    tx_list.append((base_date + timedelta(days=8), "OPENAI *API-USAGE RECURRING", 18.50))
    tx_list.append((base_date + timedelta(days=38), "OPENAI *API-USAGE RECURRING", 47.20))
    tx_list.append((base_date + timedelta(days=68), "OPENAI *API-USAGE RECURRING", 94.80))

    # 6. Legitimate recurring utilities / tools
    # AWS Cloud
    tx_list.append((base_date + timedelta(days=3), "AMZN WEB SERVICES AWS.AMAZON.CO", 44.20))
    tx_list.append((base_date + timedelta(days=33), "AMZN WEB SERVICES AWS.AMAZON.CO", 45.10))
    tx_list.append((base_date + timedelta(days=63), "AMZN WEB SERVICES AWS.AMAZON.CO", 43.80))

    # Cloudflare Pro
    tx_list.append((base_date + timedelta(days=12), "CLOUDFLARE INC*BILLING", 20.00))
    tx_list.append((base_date + timedelta(days=42), "CLOUDFLARE INC*BILLING", 20.00))
    tx_list.append((base_date + timedelta(days=72), "CLOUDFLARE INC*BILLING", 20.00))

    # Spotify Premium
    tx_list.append((base_date + timedelta(days=15), "SPOTIFY USA MONTHLY SUB", 11.99))
    tx_list.append((base_date + timedelta(days=45), "SPOTIFY USA MONTHLY SUB", 11.99))
    tx_list.append((base_date + timedelta(days=75), "SPOTIFY USA MONTHLY SUB", 11.99))

    # Monthly Payroll / Client Retainer Deposits (Inflows)
    tx_list.append((base_date + timedelta(days=1), "ACH CREDIT CLIENT ACME RETAINER", -4800.00))
    tx_list.append((base_date + timedelta(days=31), "ACH CREDIT CLIENT ACME RETAINER", -4800.00))
    tx_list.append((base_date + timedelta(days=61), "ACH CREDIT CLIENT ACME RETAINER", -4800.00))

    # Monthly Rent
    tx_list.append((base_date + timedelta(days=1), "ACH ELECTRONIC DEBIT APARTMENT RENT", 1950.00))
    tx_list.append((base_date + timedelta(days=31), "ACH ELECTRONIC DEBIT APARTMENT RENT", 1950.00))
    tx_list.append((base_date + timedelta(days=61), "ACH ELECTRONIC DEBIT APARTMENT RENT", 1950.00))

    # Monthly Electricity / Internet
    tx_list.append((base_date + timedelta(days=14), "CON EDISON POWER & GAS", 85.40))
    tx_list.append((base_date + timedelta(days=44), "CON EDISON POWER & GAS", 92.10))
    tx_list.append((base_date + timedelta(days=74), "CON EDISON POWER & GAS", 88.30))

    tx_list.append((base_date + timedelta(days=18), "VERIZON FIOS INTERNET 1GBPS", 79.99))
    tx_list.append((base_date + timedelta(days=48), "VERIZON FIOS INTERNET 1GBPS", 79.99))
    tx_list.append((base_date + timedelta(days=78), "VERIZON FIOS INTERNET 1GBPS", 79.99))

    # Fill the remaining slots up to 180 rows with realistic day-to-day living transactions
    living_merchants = [
        ("WHOLE FOODS MKT #10492", 35.0, 110.0),
        ("TRADER JOE'S #541 SAN FRANCISCO", 22.0, 75.0),
        ("BLUE BOTTLE COFFEE HAYES", 5.75, 8.50),
        ("STARBUCKS STORE #08842", 4.95, 7.25),
        ("PHILZ COFFEE MISSION", 5.25, 7.50),
        ("CHIPOTLE 1928 ONLINE ORDER", 14.50, 19.80),
        ("SWEETGREEN SOMA FAST CASUAL", 16.20, 21.50),
        ("UBER *TRIP RIDE SAN FRANCISCO", 12.40, 38.00),
        ("SFMTA CLIPPER CARD RELOAD", 20.00, 40.00),
        ("CVS PHARMACY #09321", 8.50, 32.00),
        ("TARGET STORES #1820", 18.00, 68.00),
        ("WALGREENS STORE 03411", 6.20, 24.50),
        ("DOORDASH*TACOS EL GORDO", 24.00, 42.00)
    ]

    needed = 180 - len(tx_list)
    # Spread evenly across the 90-day window
    sampled_days = np.random.choice(range(0, 90), size=needed, replace=True)
    sampled_days.sort()

    for day in sampled_days:
        m_name, low, high = living_merchants[np.random.randint(0, len(living_merchants))]
        amt = float(np.round(np.random.uniform(low, high), 2))
        tx_list.append((base_date + timedelta(days=int(day)), m_name, amt))

    # Sort chronologically
    tx_list.sort(key=lambda x: x[0])

    # Build DataFrame & calculate running balance
    curr_balance = 9450.00
    records = []
    for dt, desc, amt in tx_list:
        curr_balance = round(curr_balance - amt, 2)
        records.append({
            "date": dt.strftime("%Y-%m-%d"),
            "raw_description": desc,
            "amount": amt,
            "currency": "USD",
            "balance_after": curr_balance
        })

    df = pd.DataFrame(records)
    assert len(df) == 180, f"Expected 180 rows, got {len(df)}"
    return df

def generate_persona_student() -> pd.DataFrame:
    """
    Persona 2: Student Trial & Micro-Sub Creep (exactly 160 rows over 90 days).
    Starting Balance: $1,420.00
    Specific 4 student leaks:
      1. Coursera Plus (TRIAL_CONVERSION: $1.00 auth followed 7 days later by $59.00/mo)
      2. Xbox Game Pass (PRICE_HIKE: $14.99 -> $19.99/mo)
      3. Chegg Study (PRICE_HIKE: $15.95 -> $21.95/mo homework subscription creep)
      4. Uber One (DUPLICATE_SAME_MONTH: billed $9.99 twice within 3 days in same month)
    Plus clean utilities/passes, small stipend inflows, student housing, dining, coffee.
    """
    base_date = datetime(2026, 7, 27)
    tx_list = []

    # 1. Trial Conversion Trap: Coursera Plus ($1 temp auth -> $59.00/mo)
    tx_list.append((base_date + timedelta(days=10), "TEMP AUTH COURSERA*PLUS ONLINE", 1.00))
    tx_list.append((base_date + timedelta(days=17), "COURSERA*PLUS MONTHLY SUBSCR", 59.00)) # Trial converted!
    tx_list.append((base_date + timedelta(days=47), "COURSERA*PLUS MONTHLY SUBSCR", 59.00))
    tx_list.append((base_date + timedelta(days=77), "COURSERA*PLUS MONTHLY SUBSCR", 59.00))

    # 2. Price Hike: Xbox Game Pass ($14.99 -> $19.99/mo)
    tx_list.append((base_date + timedelta(days=6), "MSFT *XBOX GAME PASS ULTIMATE", 14.99))
    tx_list.append((base_date + timedelta(days=36), "MSFT *XBOX GAME PASS ULTIMATE", 14.99))
    tx_list.append((base_date + timedelta(days=66), "MSFT *XBOX GAME PASS ULTIMATE", 19.99)) # +33.4% price hike!

    # 3. Price Hike: Chegg Study ($15.95 -> $21.95/mo)
    tx_list.append((base_date + timedelta(days=8), "CHEGG*STUDY HOMEWORK HELP", 15.95))
    tx_list.append((base_date + timedelta(days=38), "CHEGG*STUDY HOMEWORK HELP", 15.95))
    tx_list.append((base_date + timedelta(days=68), "CHEGG*STUDY HOMEWORK HELP", 21.95)) # +37.6% price hike!

    # 4. Duplicate Billing: Uber One (billed twice in month 1)
    tx_list.append((base_date + timedelta(days=12), "UBER*ONE MONTHLY MEMBERSHIP", 9.99))
    tx_list.append((base_date + timedelta(days=15), "UBER*ONE MONTHLY MEMBERSHIP", 9.99)) # Duplicate in same month!
    tx_list.append((base_date + timedelta(days=42), "UBER*ONE MONTHLY MEMBERSHIP", 9.99))
    tx_list.append((base_date + timedelta(days=72), "UBER*ONE MONTHLY MEMBERSHIP", 9.99))

    # Clean Subscriptions (Discord Nitro, Spotify, DoorDash DashPass)
    for offset in [14, 44, 74]:
        tx_list.append((base_date + timedelta(days=offset), "DISCORD*NITRO MONTHLY 107", 9.99))
    for offset in [16, 46, 76]:
        tx_list.append((base_date + timedelta(days=offset), "SPOTIFY USA MONTHLY PREMIUM", 11.99))
    for offset in [5, 35, 65]:
        tx_list.append((base_date + timedelta(days=offset), "DOORDASH*DASHPASS SUBSCR", 9.99))

    # Student Inflows (TA Stipend, Family Support & Lab Tutoring)
    tx_list.append((base_date + timedelta(days=1), "DIR DEP UNIV ACADEMIC STIPEND", -1150.00))
    tx_list.append((base_date + timedelta(days=31), "DIR DEP UNIV ACADEMIC STIPEND", -1150.00))
    tx_list.append((base_date + timedelta(days=61), "DIR DEP UNIV ACADEMIC STIPEND", -1150.00))

    tx_list.append((base_date + timedelta(days=15), "ZELLE INFLOW FROM MOM SUPPORT", -200.00))
    tx_list.append((base_date + timedelta(days=45), "ZELLE INFLOW FROM MOM SUPPORT", -200.00))
    tx_list.append((base_date + timedelta(days=75), "ZELLE INFLOW FROM MOM SUPPORT", -200.00))

    tx_list.append((base_date + timedelta(days=20), "DIR DEP CAMPUS TUTORING LAB", -350.00))
    tx_list.append((base_date + timedelta(days=50), "DIR DEP CAMPUS TUTORING LAB", -350.00))
    tx_list.append((base_date + timedelta(days=80), "DIR DEP CAMPUS TUTORING LAB", -350.00))

    # Student Living Expenses
    # Dorm housing / rent contribution
    tx_list.append((base_date + timedelta(days=2), "CAMPUS HOUSING HOUSING DEBIT", 650.00))
    tx_list.append((base_date + timedelta(days=32), "CAMPUS HOUSING HOUSING DEBIT", 650.00))
    tx_list.append((base_date + timedelta(days=62), "CAMPUS HOUSING HOUSING DEBIT", 650.00))

    # Student living merchants
    student_merchants = [
        ("CAMPUS DINING HALL BEATY", 8.50, 14.00),
        ("CHIPOTLE ONLINE STORE #291", 10.25, 15.50),
        ("TRADER JOES #382 GROCERIES", 18.00, 45.00),
        ("BOBA GUYS BERKELEY TEA", 5.50, 7.80),
        ("STARBUCKS CAMPUS UNION", 4.25, 6.75),
        ("CAMPUS BOOKSTORE TEXTBOOKS", 24.00, 85.00),
        ("SUBWAY SANDWICH SHOP", 7.50, 11.20),
        ("SPEED QUEEN LAUNDROMAT DORM", 4.00, 8.00),
        ("CVS CONVENIENCE CAMPUS", 5.00, 18.00),
        ("DOMINOS PIZZA ONLINE ORDER", 14.00, 26.00)
    ]

    needed = 160 - len(tx_list)
    sampled_days = np.random.choice(range(0, 90), size=needed, replace=True)
    sampled_days.sort()

    for day in sampled_days:
        m_name, low, high = student_merchants[np.random.randint(0, len(student_merchants))]
        amt = float(np.round(np.random.uniform(low, high), 2))
        tx_list.append((base_date + timedelta(days=int(day)), m_name, amt))

    tx_list.sort(key=lambda x: x[0])

    curr_balance = 1420.00
    records = []
    for dt, desc, amt in tx_list:
        curr_balance = round(curr_balance - amt, 2)
        records.append({
            "date": dt.strftime("%Y-%m-%d"),
            "raw_description": desc,
            "amount": amt,
            "currency": "USD",
            "balance_after": curr_balance
        })

    df = pd.DataFrame(records)
    assert len(df) == 160, f"Expected 160 rows, got {len(df)}"
    return df

def generate_persona_freelancer() -> pd.DataFrame:
    """
    Persona 3: Freelancer Lumpy Cashflow (exactly 200 rows over 90 days).
    Starting Balance: $16,800.00
    Specific leaks:
      - FIGMA*ORG-SEAT: month 1: $15.00, month 2: $15.00, month 3: $45.00 (price hike!)
      - ADOBE*CREATIVE-CLD: $59.99/mo recurring
      - NOTION*PLUS-AI: month 1: $10.00, month 2: $20.00 (AI add-on creep), month 3: $20.00
      - Duplicate cloud storage: GOOGLE*STORAGE 2TB $9.99/mo AND DROPBOX*PLUS $11.99/mo
    Plus lumpy client invoices (+$6500, +$8200, +$4300) and general freelance expenses.
    """
    base_date = datetime(2026, 7, 27)
    tx_list = []

    # 1. FIGMA*ORG-SEAT (Price hike: $15 -> $45)
    tx_list.append((base_date + timedelta(days=4), "FIGMA*ORG-SEAT LICENSE INV-9921", 15.00))
    tx_list.append((base_date + timedelta(days=34), "FIGMA*ORG-SEAT LICENSE INV-9921", 15.00))
    tx_list.append((base_date + timedelta(days=64), "FIGMA*ORG-SEAT LICENSE INV-9921", 45.00)) # Tripled!

    # 2. ADOBE*CREATIVE-CLD (High cost recurring: $59.99)
    tx_list.append((base_date + timedelta(days=7), "ADOBE*CREATIVE-CLD SUBSCRIPTION", 59.99))
    tx_list.append((base_date + timedelta(days=37), "ADOBE*CREATIVE-CLD SUBSCRIPTION", 59.99))
    tx_list.append((base_date + timedelta(days=67), "ADOBE*CREATIVE-CLD SUBSCRIPTION", 59.99))

    # 3. NOTION*PLUS-AI (Creeping AI add-on: $10 -> $20)
    tx_list.append((base_date + timedelta(days=11), "NOTION*PLUS-AI WORKSPACE SUB", 10.00))
    tx_list.append((base_date + timedelta(days=41), "NOTION*PLUS-AI WORKSPACE SUB", 20.00))
    tx_list.append((base_date + timedelta(days=71), "NOTION*PLUS-AI WORKSPACE SUB", 20.00))

    # 4. Duplicate cloud storage: Google One & Dropbox
    for offset in [13, 43, 73]:
        tx_list.append((base_date + timedelta(days=offset), "GOOGLE*STORAGE 2TB GSUITE", 9.99))
    for offset in [16, 46, 76]:
        tx_list.append((base_date + timedelta(days=offset), "DROPBOX*PLUS 2TB BACKUP", 11.99))

    # 5. Other design & collaboration tools
    for offset in [9, 39, 69]:
        tx_list.append((base_date + timedelta(days=offset), "WEBFLOW*HOSTING CMS WORKSPACE", 29.00))
    for offset in [18, 48, 78]:
        tx_list.append((base_date + timedelta(days=offset), "LOOM*ENTERPRISE RECORDER", 12.50))
    for offset in [20, 50, 80]:
        tx_list.append((base_date + timedelta(days=offset), "ZOOM*PRO-ANN VIDEO CONF", 15.99))

    # Irregular high client invoices & retainers (Lumpy Inflows)
    tx_list.append((base_date + timedelta(days=8), "ACH CREDIT CLIENT ACME CORP INV-201", -6500.00))
    tx_list.append((base_date + timedelta(days=22), "DIRECT DEP CLIENT RETAINER MONTHLY", -3800.00))
    tx_list.append((base_date + timedelta(days=38), "WIRE INFLOW FINTECH LABS DESIGN SPR", -8200.00))
    tx_list.append((base_date + timedelta(days=54), "DIRECT DEP CLIENT RETAINER MONTHLY", -3800.00))
    tx_list.append((base_date + timedelta(days=72), "STRIPE PAYOUT CLIENT STUDIO MOBILE", -5200.00))
    tx_list.append((base_date + timedelta(days=84), "DIRECT DEP CLIENT RETAINER MONTHLY", -3800.00))

    # Major business & studio costs
    for offset in [1, 31, 61]:
        tx_list.append((base_date + timedelta(days=offset), "WEWORK COWORKING DEDICATED DESK", 375.00))
        tx_list.append((base_date + timedelta(days=offset), "RESIDENTIAL STUDIO LEASE RENT", 2400.00))

    # Estimated quarterly taxes
    tx_list.append((base_date + timedelta(days=50), "US TREASURY EFTPS ESTIMATED TAX", 3100.00))

    # Freelancer lifestyle & client entertainment
    freelance_merchants = [
        ("DELTA AIR LINES FLIGHT JFK-SFO", 180.00, 320.00),
        ("AIRBNB RESERVATION CLIENT ONSITE", 120.00, 220.00),
        ("UBER *TRIP PREMIUM NYC", 18.00, 42.00),
        ("SOHO HOUSE CLIENT DINNER", 45.00, 110.00),
        ("APPLE STORE FIFTH AVE ACCESSORY", 29.00, 69.00),
        ("WHOLE FOODS MKT COLUMBUS CIRCLE", 35.00, 85.00),
        ("EQUINOX FITNESS MEMBERSHIP", 110.00, 180.00),
        ("BLUE BOTTLE COFFEE ROCKEFELLER", 5.50, 8.50),
        ("TAXI CAB SERVICE NYC METRO", 12.00, 26.00),
        ("AMAZON.COM STUDIO SUPPLIES", 18.00, 52.00)
    ]

    needed = 200 - len(tx_list)
    sampled_days = np.random.choice(range(0, 90), size=needed, replace=True)
    sampled_days.sort()

    for day in sampled_days:
        m_name, low, high = freelance_merchants[np.random.randint(0, len(freelance_merchants))]
        amt = float(np.round(np.random.uniform(low, high), 2))
        tx_list.append((base_date + timedelta(days=int(day)), m_name, amt))

    tx_list.sort(key=lambda x: x[0])

    curr_balance = 16800.00
    records = []
    for dt, desc, amt in tx_list:
        curr_balance = round(curr_balance - amt, 2)
        records.append({
            "date": dt.strftime("%Y-%m-%d"),
            "raw_description": desc,
            "amount": amt,
            "currency": "USD",
            "balance_after": curr_balance
        })

    df = pd.DataFrame(records)
    assert len(df) == 200, f"Expected 200 rows, got {len(df)}"
    return df

def main():
    print("Generating LeakLens datasets...")
    
    # 1. seed_training.csv (350 rows)
    df_seed = generate_seed_training_data()
    seed_path = DATA_DIR / "seed_training.csv"
    df_seed.to_csv(seed_path, index=False)
    print(f"✓ Created {seed_path} ({len(df_seed)} rows)")

    # 2. persona_dev.csv (180 rows)
    df_dev = generate_persona_dev()
    dev_path = DATA_DIR / "persona_dev.csv"
    df_dev.to_csv(dev_path, index=False)
    print(f"✓ Created {dev_path} ({len(df_dev)} rows)")

    # 3. persona_student.csv (160 rows)
    df_student = generate_persona_student()
    student_path = DATA_DIR / "persona_student.csv"
    df_student.to_csv(student_path, index=False)
    print(f"✓ Created {student_path} ({len(df_student)} rows)")

    # 4. persona_freelancer.csv (200 rows)
    df_freelancer = generate_persona_freelancer()
    freelancer_path = DATA_DIR / "persona_freelancer.csv"
    df_freelancer.to_csv(freelancer_path, index=False)
    print(f"✓ Created {freelancer_path} ({len(df_freelancer)} rows)")

    print("All 4 datasets generated successfully.")

if __name__ == "__main__":
    main()
