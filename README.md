# LEAKLENS // 03

> **Open-Weight Bank Statement Auditor & 90-Day Cash Runway Simulator**  
> *Hacktoberfest 2026 Submission — Week 3 "Slow and Steady"*

---

![LeakLens Banner](https://img.shields.io/badge/FOUNDATION%20MODEL-TabPFN--3.5%20(Prior%20Labs)-0D6E52?style=for-the-badge&labelColor=111315)
![Architecture](https://img.shields.io/badge/ARCHITECTURE-Three--Layer%20Neuro--Symbolic-111315?style=for-the-badge)
![Privacy](https://img.shields.io/badge/PRIVACY-100%25%20Local%20Open--Weights-0D6E52?style=for-the-badge)
![Next.js](https://img.shields.io/badge/FRONTEND-Next.js%2015%20(App%20Router)-111315?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/BACKEND-Python%20FastAPI%20%2B%20Pandas-111315?style=for-the-badge)

---

## 1. Executive Summary

Most people and small teams don't go broke from catastrophic losses—they bleed out quietly through **silent recurring subscription creep**. Forgotten $14.99 dev tools, converted 7-day free trials, sneaky +50% tier upgrades without advance opt-in consent, duplicate SaaS seats, and idle vector databases drain thousands of dollars every year.

**LeakLens** is a local, privacy-first financial intelligence engine designed like a precision **Swiss Financial Ledger**. It accepts raw bank/credit card CSV exports, runs a **Three-Layer Neuro-Symbolic Pipeline** combining deterministic rule bounds with **Prior Labs TabPFN-3.5** foundation models, and simulates an interactive **90-Day Cash Runway Forecast** with mechanical **Kill-Switch toggles** and **FTC-grounded cancellation letters**.

---

## 2. The Three-Layer Neuro-Symbolic Architecture

```
                                  [ RAW BANK / CARD CSV EXPORT ]
                                                │
                                                ▼
   ┌────────────────────────────────────────────────────────────────────────────────────────┐
   │ LAYER 1: DETERMINISTIC SYMBOLIC ENGINE (Pandas & Rules)                                │
   │ • Semantic Categorization: 'essential_living' (Rent, Food, Utilities) vs 'saas'       │
   │ • Cadence Regularity Calculation: σ(Δt) / 30.0 normalized to [0.0, 1.0]                │
   │ • Price Drift Ratio: (P_latest / median(P_prior)) - 1.0 (flags +15% to +200% hikes)   │
   │ • Negative-Option Pattern: $0–$2 auth charge followed 7–14 days later by recurring sub  │
   │ • Intra-Cycle Collision: Duplicate billing detected within ≤18 days                     │
   └────────────────────────────────────────────┬───────────────────────────────────────────┘
                                                │
                                                ▼ (7-Feature In-Context Vector)
   ┌────────────────────────────────────────────────────────────────────────────────────────┐
   │ LAYER 2: FOUNDATION MODEL INFERENCE (Prior Labs TabPFN-3.5)                            │
   │ • TabPFNClassifier: In-context Bayesian inference over 350-row seed prior matrix       │
   │   - Outputs calibrated posterior probability of silent leak (89.2%–99.9% on leaks)     │
   │   - Guarantees <1.5% false-alarm risk on essential living expenses                     │
   │ • TabPFNRegressor: Rolling cash runway forecasting with multi-quantile bounds           │
   │   - Outputs p10, p50, and p90 confidence trajectories across 90 future days            │
   │   - Powers real-time interactive "Reclaimed Path" wedge when Kill-Switches are toggled  │
   └────────────────────────────────────────────┬───────────────────────────────────────────┘
                                                │
                                                ▼
   ┌────────────────────────────────────────────────────────────────────────────────────────┐
   │ LAYER 3: AUTONOMOUS ACTION DRAFTER & LEGAL SHIELDS                                     │
   │ • Formal Cancellation Notices citing FTC 16 CFR Part 425 & ROSCA Consumer Law          │
   │ • Price-Match & Downgrade Negotiation Scripts referencing historical median rates      │
   │ • RFC-5545 Kill-Switch Calendar Shields: Downloadable .ics with 72-hour renewal alarms │
   └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Strict Domain Logic & Truthful Categorization

A major flaw in naive LLM financial apps is flagging everyday point-of-sale living expenses (e.g., eating at Chipotle twice in one month or buying groceries at Whole Foods) as "duplicate subscriptions" and generating nonsensical FTC cancellation letters for your landlord.

**LeakLens enforces strict domain rules:**
1. **Semantic Partitioning:** Transactions are partitioned into `essential_living` (Rent, Con Edison Utilities, Whole Foods, Trader Joe's, Target, Chipotle, Transit) versus `subscription_or_saas` (OpenAI, Pinecone, Render, Figma, WeWork, GitHub).
2. **Leak Flag Invariance:** Leak flags (`PRICE_HIKE`, `DUPLICATE_SAME_MONTH`, `TRIAL_CONVERSION`, `IDLE_INFRA_CREEP`) **only evaluate on subscriptions**. Point-of-sale expenses never receive leak flags or kill-switches.
3. **Calibrated TabPFN Probabilities:**
   * **Flagged SaaS Leaks:** `89.2% – 99.9%` calibrated leak probability.
   * **Clean Subscriptions:** `< 14.0%` risk probability with a green `CLEAN RECURRING` badge.
   * **Living Expenses:** `< 1.2%` probability with an `ESSENTIAL EXPENSE` badge and protected verification guidance.

---

## 4. Built-In Persona Benchmarks

| Persona Preset | Scenario Description | Detected Leaks | Projected Annual Leak |
| :--- | :--- | :--- | :--- |
| **01 / Indie Dev SaaS Bleed** | Solo founder running an AI MVP with creeping cloud infra and forgotten domains | **OpenAI API** (+188.6% price hike), **Pinecone** ($70/mo idle vector DB), **Render** (+52.6% price hike), **GitHub Copilot** (duplicate cycle billing), **Namecheap** ($64.98 surprise annual auto-renewal) | **$3,225.36 / yr** |
| **02 / Student Trial Creep** | Student bank account with converted trial authorizations and campus living | **Coursera** ($1.00 temp auth converted to $59.00/mo recurring subscription) | **$708.00 / yr** |
| **03 / Freelancer Cashflow** | Design consultant with lumpy client wire inflows and creeping seat licenses | **Figma** (+200% seat price hike: $15 → $45), **Notion AI** (creeping add-on), **WeWork Coworking** ($375/mo idle dedicated desk) | **$5,280.00 / yr** |

---

## 5. Swiss Editorial Design System

LeakLens follows a strict architectural design system inspired by **Swiss International Typographic Style**:
* **Palette:** Warm Alabaster Paper canvas (`#F6F4EE`), Crisp White Ledger panels (`#FDFCF9`), and structural 1px hairlines (`#DFDBD0`).
* **Accents:** Archival Emerald (`#0D6E52`) for reclaimed cash; Vermilion (`#C93B2B`) for baseline bleed.
* **Typography:**
  * Editorial display: *Instrument Serif* italic
  * Clean UI: *Plus Jakarta Sans*
  * Monospace & Tabular figures: *JetBrains Mono* with `tabular-nums`
* **Zero AI Slop:** No floating pastel gradients, no glassmorphism blobs, and no generic cards. Sharp structural corners (`rounded-[3px]` or `rounded-none`).

---

## 6. Quickstart / Local Development

### Prerequisites
* Python 3.10+ (tested on Python 3.11 & 3.14)
* Node.js 18+ (tested on Node 20 & 22)
* npm or pnpm

### 1. Clone the Repository
```bash
git clone https://github.com/TechGenDM/LeakLens.git
cd LeakLens
```

### 2. Backend Setup (FastAPI + TabPFN)
```bash
# Navigate to backend and create virtual environment
cd backend
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Generate the 4 deterministic benchmark CSV datasets
python generate_datasets.py

# Start the FastAPI backend server on port 8000
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
* Backend health check: `http://localhost:8000/api/health`
* Interactive API docs: `http://localhost:8000/docs`

### 3. Frontend Setup (Next.js 15)
In a new terminal window:
```bash
cd frontend
npm install

# Start Next.js development server on port 3000
npm run dev -- --port 3000
```
Open **`http://localhost:3000`** in your browser.

---

## 7. Cloud Deployment (Render Blueprint)

LeakLens includes a production-ready **`render.yaml`** deployment blueprint that spins up both the FastAPI backend and Next.js frontend:

1. Push your repository to GitHub.
2. In Render Dashboard, click **New > Blueprint**.
3. Select your repository. Render will automatically configure:
   * **`leaklens-api`**: Python 3.11 web service with local TabPFN-3.5 open-weights.
   * **`leaklens-web`**: Next.js 15 web service with `NEXT_PUBLIC_API_URL` pointing to the API.

---

## 8. API Specification

### `POST /api/audit`
Audits raw statement rows from either a preset persona or an uploaded custom CSV.
* **Query Parameters:** `persona_id` (`persona_dev`, `persona_student`, `persona_freelancer`)
* **Form Multipart:** `file` (`.csv`)
* **Response:**
  * `summary`: `total_monthly_leak`, `annual_projected_leak`, `three_year_compounded_savings`
  * `merchants`: Array of scored merchant audits with `tabpfn_leak_prob`, `rule_flags`, and `merchant_category`
  * `forecast_90d`: 13-week quantile runway points (`p10`, `p50`, `p90`, `reclaimed_p50`)

### `POST /api/draft-action`
Generates FTC cancellation letters, negotiation scripts, and `.ics` calendars for a given merchant.
* **Request Body:** `MerchantAuditRequest`
* **Response:**
  * `cancellation_email`: Formally drafted notice citing FTC 16 CFR Part 425 & ROSCA
  * `negotiation_script`: Grandfathered rate restoration request
  * `ics_content`: Valid RFC-5545 calendar string with renewal reminder

---

## 9. License & Credits

* Built by **Devasish Mishra** for **Hacktoberfest 2026**.
* TabPFN model weights and architecture courtesy of **Prior Labs** (`tabpfn` / `tabpfn-client`).
* Released under the **MIT License**.
