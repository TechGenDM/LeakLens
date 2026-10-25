# LeakLens — Technical Architecture & API Contract

## 1. Repository Structure
```text
leaklens/
├── backend/                  # Python 3.11 + FastAPI + TabPFN-3.5
│   ├── main.py               # FastAPI app & CORS config
│   ├── generate_datasets.py  # Deterministic dataset generation script
│   ├── pipeline/
│   │   ├── rules.py          # Deterministic Pandas rules (intervals, duplicates, price drift)
│   │   ├── tabpfn_engine.py  # TabPFNClassifier (risk score) + TabPFNRegressor (90d forecast)
│   │   └── drafter.py        # Open-weight LLM cancellation email & .ics generator
│   ├── data/
│   │   ├── seed_training.csv # 350 labeled transaction patterns for TabPFN in-context fit
│   │   ├── persona_dev.csv
│   │   ├── persona_student.csv
│   │   └── persona_freelancer.csv
│   └── requirements.txt
├── frontend/                 # Next.js 15 (App Router) + TypeScript + Tailwind + Framer Motion
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   ├── LedgerHeader.tsx
│   │   │   ├── CsvDeconstructView.tsx
│   │   │   ├── AuditLedgerTable.tsx
│   │   │   ├── RunwayForecastChart.tsx
│   │   │   └── ActionStudioDrawer.tsx
│   │   └── types/audit.ts
└── render.yaml               # Blueprint for 1-click Render deployment
```

## 2. API Endpoints Contract

### `GET /api/health`
**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1792900000.0,
  "execution_mode": "Local Private Runtime (Offline Open-Weights)",
  "tabpfn_mode": "local",
  "tabpfn_classifier_ready": true,
  "datasets_available": ["persona_dev", "persona_student", "persona_freelancer"]
}
```

### `GET /api/personas`
**Response:**
```json
{
  "personas": [
    {
      "id": "persona_dev",
      "title": "01 / Indie Dev SaaS Bleed",
      "tagline": "Creeping cloud tiers, duplicate API keys, and forgotten domain renewals.",
      "row_count": 180,
      "default_starting_balance": 9450.00,
      "description": "...",
      "filename": "persona_dev.csv"
    }
  ]
}
```

### `POST /api/audit`
**Request:**
- Query Parameter: `?persona_id=persona_dev` (or `persona_student`, `persona_freelancer`), OR
- Multipart Form-Data: `file=@statement.csv`

**Response:**
```json
{
  "source": "persona_dev",
  "execution_mode": "Local Private Runtime (Offline Open-Weights)",
  "rows_processed": 180,
  "inference_ms": 929.25,
  "total_latency_ms": 945.10,
  "summary": {
    "total_monthly_leak": 203.80,
    "annual_projected_leak": 2445.60,
    "three_year_compounded_savings": 8206.27,
    "flagged_merchants_count": 5,
    "clean_merchants_count": 19,
    "total_merchants_count": 24,
    "total_expense_volume": 10368.92,
    "date_range": {
      "start": "2026-07-27",
      "end": "2026-10-24"
    }
  },
  "merchants": [
    {
      "merchant_name": "Render",
      "merchant_clean": "Render",
      "raw_description_sample": "POS DEB STRIPE*RENDER-SRV",
      "monthly_cost": 29.00,
      "total_spent_90d": 67.00,
      "tx_count": 3,
      "cadence_days": 30.0,
      "cadence_regularity": 1.0,
      "price_change_pct": 0.526,
      "historical_median": 19.00,
      "rule_flags": ["RECURRING_SUB", "PRICE_HIKE"],
      "tabpfn_leak_prob": 0.999,
      "is_leak": true,
      "next_predicted_date": "2026-11-24",
      "tx_history": [
        { "date": "2026-07-29", "amount": 19.00, "raw_description": "POS DEB STRIPE*RENDER-SRV" },
        { "date": "2026-08-28", "amount": 19.00, "raw_description": "POS DEB STRIPE*RENDER-SRV" },
        { "date": "2026-09-27", "amount": 29.00, "raw_description": "POS DEB STRIPE*RENDER-SRV" }
      ],
      "tabpfn_features": {
        "amount_zscore": -0.198,
        "cadence_regularity": 1.0,
        "price_drift_pct": 0.526,
        "is_micro_charge": 0,
        "charge_count_90d": 3,
        "days_since_first_seen": 60,
        "is_trial_conversion_pattern": 0
      }
    }
  ],
  "forecast_90d": [
    {
      "week": 1,
      "day_offset": 7,
      "date": "2026-10-31",
      "p10": 13450.66,
      "p50": 13692.85,
      "p90": 15459.27,
      "reclaimed_p50": 13740.40,
      "cumulative_saved": 47.55
    }
  ]
}
```

### `POST /api/draft-action`
**Request Body:**
```json
{
  "merchant_name": "Render",
  "monthly_cost": 29.00,
  "price_change_pct": 0.526,
  "historical_median": 19.00,
  "rule_flags": ["RECURRING_SUB", "PRICE_HIKE"],
  "raw_description_sample": "POS DEB STRIPE*RENDER-SRV",
  "next_predicted_date": "2026-11-24",
  "tx_history": [...]
}
```
**Response:**
```json
{
  "cancellation_email": "Subject: Formal Cancellation Notice...",
  "negotiation_script": "Subject: Account Review...",
  "ics_content": "BEGIN:VCALENDAR\n...",
  "model_used": "groq/llama-3.3-70b-versatile"
}
```

## 3. The 7 TabPFN-3.5 Feature Columns
1. `amount_zscore` (float): normalized charge size relative to the entire statement.
2. `cadence_regularity` (float, 0.0 to 1.0): 1.0 represents exact 30-day (or 7-day) intervals.
3. `price_drift_pct` (float): percentage increase of latest charge over historical median.
4. `is_micro_charge` (int: 0 or 1): charges under $15.00.
5. `charge_count_90d` (int): total number of charges in the 90-day statement.
6. `days_since_first_seen` (int): days elapsed between first transaction and latest statement date.
7. `is_trial_conversion_pattern` (int: 0 or 1): $0–$2 authorization followed 5–18 days later by full subscription charge.
