"""
Deterministic Pandas Rules Layer for LeakLens.
Normalizes messy bank strings, groups merchant charges, extracts deterministic tags,
classifies merchant category (essential_living vs subscription_or_saas),
and builds the 7 numerical features for TabPFN inference.
"""

import re
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd

# Canonical dictionary for high-precision recognition of common SaaS & services
KNOWN_MERCHANT_MAP = {
    "RENDER": ("Render", "subscription_or_saas"),
    "PINECONE": ("Pinecone", "subscription_or_saas"),
    "NAMECHEAP": ("Namecheap", "subscription_or_saas"),
    "GITHUB": ("GitHub Copilot", "subscription_or_saas"),
    "COPILOT": ("GitHub Copilot", "subscription_or_saas"),
    "OPENAI": ("OpenAI API", "subscription_or_saas"),
    "AMZN WEB SERVICES": ("AWS Cloud", "subscription_or_saas"),
    "AWS": ("AWS Cloud", "subscription_or_saas"),
    "CLOUDFLARE": ("Cloudflare", "subscription_or_saas"),
    "SPOTIFY": ("Spotify", "subscription_or_saas"),
    "COURSERA": ("Coursera", "subscription_or_saas"),
    "XBOX": ("Xbox Game Pass", "subscription_or_saas"),
    "DISCORD": ("Discord Nitro", "subscription_or_saas"),
    "APPLE STORE": ("Apple Store (Hardware)", "essential_living"),
    "APPLE RETAIL": ("Apple Store (Hardware)", "essential_living"),
    "ICLOUD": ("Apple iCloud+", "subscription_or_saas"),
    "APPLE MUSIC": ("Apple Music", "subscription_or_saas"),
    "APPLE.COM/BILL": ("Apple Music", "subscription_or_saas"),
    "APPLE": ("Apple Services", "subscription_or_saas"),
    "DOORDASH*DASHPASS": ("DoorDash DashPass", "subscription_or_saas"),
    "UBER*EATS": ("Uber Eats Pass", "subscription_or_saas"),
    "FIGMA": ("Figma", "subscription_or_saas"),
    "ADOBE": ("Adobe Creative Cloud", "subscription_or_saas"),
    "NOTION": ("Notion AI", "subscription_or_saas"),
    "GOOGLE*STORAGE": ("Google Storage", "subscription_or_saas"),
    "DROPBOX": ("Dropbox", "subscription_or_saas"),
    "WEBFLOW": ("Webflow", "subscription_or_saas"),
    "LOOM": ("Loom", "subscription_or_saas"),
    "ZOOM": ("Zoom", "subscription_or_saas"),
    "NETFLIX": ("Netflix", "subscription_or_saas"),
    "SLACK": ("Slack", "subscription_or_saas"),
    "VERIZON": ("Verizon Internet", "subscription_or_saas"),
    "WEWORK": ("WeWork Coworking", "subscription_or_saas"),
    # Essential Living / Point-of-Sale
    "CON EDISON": ("Con Edison Utilities", "essential_living"),
    "APARTMENT RENT": ("Apartment Rent", "essential_living"),
    "CAMPUS HOUSING": ("Campus Housing", "essential_living"),
    "RESIDENTIAL STUDIO": ("Studio Lease", "essential_living"),
    "WHOLE FOODS": ("Whole Foods Market", "essential_living"),
    "TRADER JOE": ("Trader Joe's", "essential_living"),
    "CHIPOTLE": ("Chipotle", "essential_living"),
    "SWEETGREEN": ("Sweetgreen", "essential_living"),
    "BLUE BOTTLE": ("Blue Bottle Coffee", "essential_living"),
    "STARBUCKS": ("Starbucks", "essential_living"),
    "PHILZ": ("Philz Coffee", "essential_living"),
    "BOBA GUYS": ("Boba Guys", "essential_living"),
    "SUBWAY": ("Subway", "essential_living"),
    "DOMINOS": ("Domino's Pizza", "essential_living"),
    "CVS": ("CVS Pharmacy", "essential_living"),
    "WALGREENS": ("Walgreens", "essential_living"),
    "TARGET": ("Target", "essential_living"),
    "UBER *TRIP": ("Uber Trip", "essential_living"),
    "SFMTA": ("SFMTA Clipper", "essential_living"),
    "DELTA AIR": ("Delta Air Lines", "essential_living"),
    "AIRBNB": ("Airbnb", "essential_living"),
    "TREASURY": ("US Treasury Tax", "essential_living"),
    "LAUNDROMAT": ("Laundromat", "essential_living"),
    "CAMPUS DINING": ("Campus Dining Hall", "essential_living"),
    "CAMPUS BOOKSTORE": ("Campus Bookstore", "essential_living"),
    "DOORDASH*TACOS": ("DoorDash Delivery", "essential_living"),
}

# Essential living keywords to prevent false subscription classification
ESSENTIAL_KEYWORDS = [
    "RENT", "HOUSING", "LEASE", "UTILITIES", "ELECTRIC", "POWER", "GAS",
    "GROCERY", "GROCERIES", "MARKET", "FOODS", "CAFE", "COFFEE", "TEA",
    "PHARMACY", "CLINIC", "HEALTH", "RESTAURANT", "DINING", "PIZZA",
    "BURGER", "TACOS", "BAKERY", "TRANSIT", "CLIPPER", "METRO", "TAXI",
    "AIRLINES", "AIRBNB", "HOTEL", "TAX", "LAUNDRY", "LAUNDROMAT", "BOOKSTORE"
]

def clean_and_categorize_merchant(raw_desc: str) -> Tuple[str, str]:
    """
    Normalizes a messy bank description into canonical merchant name and merchant_category:
    - 'essential_living': food, coffee, groceries, rent, utilities, pharmacy, transit.
    - 'subscription_or_saas': software, cloud, APIs, domains, streaming, delivery passes.
    """
    if not isinstance(raw_desc, str) or not raw_desc.strip():
        return "Unknown Merchant", "essential_living"

    text = raw_desc.strip().upper()

    # 1. Check known merchant dictionary first
    for key, (canonical, category) in KNOWN_MERCHANT_MAP.items():
        if key in text:
            return canonical, category

    # 2. Check essential living keywords
    for keyword in ESSENTIAL_KEYWORDS:
        if keyword in text:
            cleaned = clean_merchant_string(text)
            return cleaned, "essential_living"

    # 3. Clean string
    cleaned = clean_merchant_string(text)

    # 4. Check for SaaS / subscription indicators
    saas_indicators = [
        "API", "CLOUD", "HOSTING", "SOFTWARE", "SAAS", "WORKSPACE", "LICENSE",
        "GITHUB", "GITLAB", "VEC", "DATABASE", "PASS", "PRO", "PLUS", "AUTH",
        "DOMAINS", "RNW", "RENEWAL", "SUBSCRIPTION"
    ]
    if any(ind in text for ind in saas_indicators):
        return cleaned, "subscription_or_saas"

    # Default to essential_living for unknown retail/POS purchases
    return cleaned, "essential_living"

def clean_merchant_string(text: str) -> str:
    """Helper to strip prefixes, store IDs, and noise."""
    # Strip payment rail prefixes
    text = re.sub(
        r"^(POS\s+DEB|POS\s+PURCH|ACH\s+WEB|ACH\s+DEBIT|ACH\s+ELECTRONIC\s+DEBIT|PAYPAL\s*\*|TEMP\s+AUTH|CHECKCARD|DEBIT\s+CARD\s+PURCHASE|DIR\s+DEP|WIRE\s+INFLOW)\s*",
        "",
        text,
        flags=re.IGNORECASE
    )
    # Strip processor markers
    text = re.sub(r"^(STRIPE\*|SQ\s*\*|AMZN\*|TST\*|MSFT\s*\*)\s*", "", text, flags=re.IGNORECASE)
    # Strip store IDs & invoices
    text = re.sub(r"#\d+", "", text)
    text = re.sub(r"INV-?\w+", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\b\d{4,}\b", "", text)

    # Strip noise words
    noise_words = [
        r"\bSUBSCRIPTION\b", r"\bSUBSCR\b", r"\bMONTHLY\b", r"\bRECURRING\b",
        r"\bONLINE\s+ORDER\b", r"\bONLINE\b", r"\bBILLING\b", r"\bPREMIUM\b",
        r"\bSTORE\b", r"\bFAST\s+CASUAL\b", r"\bWORKSPACE\b", r"\bLICENSE\b",
        r"\bGSUITE\b", r"\bBACKUP\b"
    ]
    for pattern in noise_words:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)

    # Clean delimiters
    text = re.sub(r"[\*_\-/\\]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text.title() if text else "Unknown Merchant"

def clean_merchant_name(raw_desc: str) -> str:
    """Backward-compatible clean merchant name helper."""
    name, _ = clean_and_categorize_merchant(raw_desc)
    return name

def analyze_transactions(df: pd.DataFrame) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Pure Pandas deterministic analyzer for LeakLens.
    Groups transactions by merchant, categorizes them, and enforces strict rule separation:
    - LEAK FLAGS (PRICE_HIKE, DUPLICATE_SAME_MONTH, TRIAL_CONVERSION, IDLE_INFRA_CREEP, ANNUAL_SURPRISE_RENEWAL)
      ONLY apply to 'subscription_or_saas' merchants!
    - 'essential_living' merchants are never flagged as subscription leaks.
    """
    df_clean = df.copy()

    # Ensure required columns exist
    if "date" not in df_clean.columns or "raw_description" not in df_clean.columns or "amount" not in df_clean.columns:
        raise ValueError("CSV must contain 'date', 'raw_description', and 'amount' columns")

    df_clean["date"] = pd.to_datetime(df_clean["date"])
    df_clean["amount"] = pd.to_numeric(df_clean["amount"], errors="coerce").fillna(0.0)
    df_clean = df_clean.sort_values(by="date", ascending=True)

    # Filter for expense transactions (amount > 0)
    expense_mask = df_clean["amount"] > 0
    expenses_df = df_clean[expense_mask].copy()

    if expenses_df.empty:
        return [], {"total_expenses": 0.0, "total_charges": 0, "rows_processed": len(df_clean)}

    # Global amount stats for amount_zscore
    global_mean_amt = float(expenses_df["amount"].mean())
    global_std_amt = float(expenses_df["amount"].std())
    if global_std_amt == 0.0 or np.isnan(global_std_amt):
        global_std_amt = 1.0

    # Categorize and clean merchants
    cleaned_tuples = expenses_df["raw_description"].apply(clean_and_categorize_merchant)
    expenses_df["merchant_clean"] = [t[0] for t in cleaned_tuples]
    expenses_df["merchant_category"] = [t[1] for t in cleaned_tuples]

    latest_statement_date = expenses_df["date"].max()
    merchant_results = []

    for merchant_name, m_group in expenses_df.groupby("merchant_clean", sort=False):
        m_group = m_group.sort_values(by="date", ascending=True)
        tx_count = len(m_group)
        amounts = m_group["amount"].tolist()
        dates = m_group["date"].tolist()
        raw_descs = m_group["raw_description"].tolist()
        category = m_group["merchant_category"].iloc[0]

        # Financial metrics
        latest_amount = float(amounts[-1])
        monthly_cost = latest_amount
        total_spent_90d = float(np.round(sum(amounts), 2))
        avg_tx_amount = float(np.round(np.mean(amounts), 2))

        # Cadence intervals (in days)
        if tx_count >= 2:
            intervals = [(dates[i] - dates[i-1]).days for i in range(1, tx_count)]
            cadence_days = float(np.round(np.median(intervals), 1))
            target_cadence = 30.0 if cadence_days >= 15 else 7.0
            deviations = [abs(d - target_cadence) / target_cadence for d in intervals]
            avg_deviation = float(np.mean(deviations))
            cadence_regularity = float(np.round(max(0.0, min(1.0, 1.0 - avg_deviation)), 3))
        else:
            cadence_days = 0.0
            cadence_regularity = 0.0

        # Price drift
        if tx_count >= 2:
            historical_median = float(np.median(amounts[:-1]))
            if historical_median > 0:
                price_change_pct = float(np.round((latest_amount - historical_median) / historical_median, 3))
            else:
                price_change_pct = 0.0
        else:
            historical_median = latest_amount
            price_change_pct = 0.0

        # Deterministic rule flags
        rule_flags = []

        # STRICT RULE: Only evaluate leak flags if category is 'subscription_or_saas'
        if category == "subscription_or_saas":
            # 1. RECURRING_SUB
            if tx_count >= 2 and cadence_regularity >= 0.70:
                rule_flags.append("RECURRING_SUB")

            # 2. PRICE_HIKE (Requires recurring cadence)
            if tx_count >= 2 and cadence_regularity >= 0.60 and price_change_pct >= 0.15:
                rule_flags.append("PRICE_HIKE")

            # 3. DUPLICATE_SAME_MONTH (Billed twice in short window)
            has_duplicate = False
            if tx_count >= 2:
                for i in range(1, tx_count):
                    diff_days = (dates[i] - dates[i-1]).days
                    amt_diff = abs(amounts[i] - amounts[i-1])
                    if 1 <= diff_days <= 18 and amt_diff <= 0.10:
                        has_duplicate = True
                        break
            if has_duplicate:
                rule_flags.append("DUPLICATE_SAME_MONTH")

            # 4. TRIAL_CONVERSION ($1 auth followed by full charge)
            is_trial_conversion = False
            for i in range(tx_count - 1):
                if amounts[i] <= 2.50:
                    diff_days = (dates[i+1] - dates[i]).days
                    if 5 <= diff_days <= 18 and amounts[i+1] >= 15.0:
                        is_trial_conversion = True
                        break
            for desc in raw_descs:
                if "TEMP AUTH" in desc.upper() or "TRIAL" in desc.upper():
                    if tx_count >= 2 and latest_amount >= 15.0:
                        is_trial_conversion = True
                        break
            if is_trial_conversion:
                rule_flags.append("TRIAL_CONVERSION")

            # 5. IDLE_INFRA_CREEP (Flat high-cost recurring dev infra like Pinecone $70, or unused coworking desk like WeWork $375)
            is_idle_infra = False
            if merchant_name in ["Pinecone", "Render", "WeWork Coworking"] or any("PINECONE" in d.upper() or "VEC" in d.upper() or "WEWORK" in d.upper() for d in raw_descs):
                if tx_count >= 2 and monthly_cost >= 50.0 and abs(price_change_pct) <= 0.05:
                    is_idle_infra = True
            if is_idle_infra:
                rule_flags.append("IDLE_INFRA_CREEP")

            # 6. ANNUAL_SURPRISE_RENEWAL (Unexpected domain auto-renewals like Namecheap $64.98)
            is_annual_renewal = False
            if merchant_name == "Namecheap" or any("NAMECHEAP" in d.upper() or "RNW" in d.upper() for d in raw_descs):
                if latest_amount >= 25.0:
                    is_annual_renewal = True
            if is_annual_renewal:
                rule_flags.append("ANNUAL_SURPRISE_RENEWAL")

        # For annual surprise renewals (e.g. Namecheap $64.98), amortize monthly_cost to latest_amount / 12 ($5.42/mo)
        # so that total_monthly_leak * 12 equals the actual annual charge rather than 12x overcharging!
        if "ANNUAL_SURPRISE_RENEWAL" in rule_flags:
            monthly_cost = float(np.round(latest_amount / 12.0, 2))

        # TabPFN 7 Feature Vector
        amount_zscore = float(np.round((latest_amount - global_mean_amt) / global_std_amt, 3))
        is_micro_charge = 1 if latest_amount < 15.0 else 0
        charge_count_90d = tx_count
        first_date = dates[0]
        days_since_first_seen = int((latest_statement_date - first_date).days)
        is_trial_conversion_pattern = 1 if "TRIAL_CONVERSION" in rule_flags else 0

        # Next predicted date
        if cadence_days >= 7:
            next_date = dates[-1] + timedelta(days=int(round(cadence_days)))
        else:
            next_date = dates[-1] + timedelta(days=30)
        next_predicted_date = next_date.strftime("%Y-%m-%d")

        tx_history = [
            {
                "date": d.strftime("%Y-%m-%d"),
                "amount": float(a),
                "raw_description": r
            }
            for d, a, r in zip(dates, amounts, raw_descs)
        ]

        merchant_results.append({
            "merchant_name": merchant_name,
            "merchant_clean": merchant_name,
            "merchant_category": category, # 'essential_living' or 'subscription_or_saas'
            "raw_description_sample": raw_descs[-1],
            "monthly_cost": monthly_cost,
            "avg_tx_amount": avg_tx_amount,
            "total_spent_90d": total_spent_90d,
            "tx_count": tx_count,
            "cadence_days": cadence_days,
            "cadence_regularity": cadence_regularity,
            "price_change_pct": price_change_pct,
            "historical_median": historical_median,
            "rule_flags": rule_flags,
            "next_predicted_date": next_predicted_date,
            "tx_history": tx_history,
            "tabpfn_features": {
                "amount_zscore": amount_zscore,
                "cadence_regularity": cadence_regularity,
                "price_drift_pct": max(0.0, price_change_pct),
                "is_micro_charge": is_micro_charge,
                "charge_count_90d": charge_count_90d,
                "days_since_first_seen": days_since_first_seen,
                "is_trial_conversion_pattern": is_trial_conversion_pattern
            }
        })

    # Sort merchants: Leaks first, then subscriptions, then living expenses
    def sort_key(m):
        has_leak_flag = any(f in m["rule_flags"] for f in ["PRICE_HIKE", "DUPLICATE_SAME_MONTH", "TRIAL_CONVERSION", "IDLE_INFRA_CREEP", "ANNUAL_SURPRISE_RENEWAL"])
        is_sub = m["merchant_category"] == "subscription_or_saas"
        return (has_leak_flag, is_sub, m["monthly_cost"])

    merchant_results.sort(key=sort_key, reverse=True)

    summary = {
        "rows_processed": len(df_clean),
        "total_merchants": len(merchant_results),
        "total_expense_volume": float(np.round(expenses_df["amount"].sum(), 2)),
        "global_mean_amount": float(np.round(global_mean_amt, 2)),
        "date_range": {
            "start": df_clean["date"].min().strftime("%Y-%m-%d"),
            "end": df_clean["date"].max().strftime("%Y-%m-%d")
        }
    }

    return merchant_results, summary
