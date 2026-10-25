# LeakLens — Product Requirements Document (Source of Truth)

## 1. Core Value Proposition
LeakLens is an open-weight financial audit & cash-flow runway workbench built for Hacktoberfest Week 3 ("Slow and Steady"). Users drop a messy bank/card/UPI transaction CSV (or select a 1-click synthetic persona) and immediately see:
1. Grouped recurring charges, duplicate billings, and silent price hikes (Deterministic Pandas Rules).
2. Calibrated leak-risk probabilities on ambiguous gray-zone charges (`TabPFNClassifier`).
3. A 90-day cash-flow runway forecast with 10th–90th percentile uncertainty bands (`TabPFNRegressor`) that dynamically updates as users toggle off unwanted subscriptions.
4. Ready-to-send cancellation/price-match emails and `.ics` trial-kill reminders drafted by an open-weight LLM.

## 2. Strict Scope Guardrails (DO NOT BUILD)
- NO user authentication, login screens, or sign-up modals.
- NO database (PostgreSQL/MongoDB). All state lives in memory/session and `localStorage`.
- NO multi-page marketing website. The landing view IS the live interactive workbench.
- NO fake or hardcoded latency/probability numbers. Every metric displayed in the UI must come from the live Python FastAPI response.
- NO false privacy claims on the cloud demo. Clearly label the execution mode as either `Render Cloud Sandbox (Synthetic Data)` or `Local Private Runtime (Offline Open-Weights)`.

## 3. Core User Journey (Single-Screen Workbench)
1. **Top Ledger Bar:**
   - Brand mark + 3 instant Persona Preset buttons:
     - `01 / Indie Dev SaaS Bleed` (180 rows: crept cloud bills, duplicate API tiers, forgotten domains)
     - `02 / Student Trial & UPI Creep` (160 rows: converted 7-day trials, micro-subscriptions, delivery passes)
     - `03 / Freelancer Lumpy Cashflow` (200 rows: irregular client payouts + heavy recurring software overhead)
   - Custom CSV Upload trigger (`Drag .csv or click`).
   - Live Telemetry Pill: displays real `execution_mode`, `rows_processed`, and `inference_ms`.
2. **Main Split Workbench (12-Column Swiss Grid):**
   - **Left 7 Columns — The Audit Ledger:**
     - Filter tabs: `All Flagged Leaks`, `Price Hikes`, `Duplicate Charges`, `Gray-Zone Trials`, `Clean Transactions`.
     - Animated merchant rows showing: Merchant Name, Raw CSV String sample, Cadence Dots, Monthly Cost, Deterministic Rule Badge, TabPFN Risk Score Badge, and a tactile **Kill-Switch Toggle**.
   - **Right 5 Columns — 90-Day Runway Simulator & Action Drawer:**
     - **Top Panel:** Interactive SVG/Recharts 90-day balance forecast (`TabPFNRegressor` baseline + 10%-90% quantile band vs. green "Reclaimed Path" when switches are toggled).
     - **Middle Panel:** Annualized & 3-Year Compounded Savings Odometer.
     - **Bottom/Slide Panel:** Inspection & Cancellation Studio for the currently selected merchant (Generates copy-ready cancellation email + `.ics` reminder download).