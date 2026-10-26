"""
LeakLens FastAPI Backend.
Financial audit & cash-flow runway workbench powered by TabPFN-3.5 and open-weight LLMs.
"""

import os
import io
import time
import logging
from pathlib import Path
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, File, UploadFile, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from dotenv import load_dotenv

# Load local environment variables if available
load_dotenv(Path(__file__).resolve().parent / ".env")

import sys
_backend_parent = str(Path(__file__).resolve().parent.parent)
if _backend_parent not in sys.path:
    sys.path.insert(0, _backend_parent)

from backend.pipeline.rules import analyze_transactions
from backend.pipeline.tabpfn_engine import get_tabpfn_engine
from backend.pipeline.drafter import draft_action_bundle

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("leaklens.api")

app = FastAPI(
    title="LeakLens API",
    description="Open-weight financial audit and cash-flow runway workbench backend.",
    version="1.0.0"
)

# CORS configuration — explicit origins for Render + localhost dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://leaklens-web.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).resolve().parent / "data"

PERSONA_METADATA = {
    "persona_dev": {
        "id": "persona_dev",
        "title": "01 / Indie Dev SaaS Bleed",
        "tagline": "Creeping cloud tiers, duplicate API keys, and forgotten domain renewals.",
        "row_count": 180,
        "default_starting_balance": 9450.00,
        "description": "Raw bank statement of a solo founder with creeping Render/OpenAI bills, duplicate Copilot charges, and idle Pinecone vector database.",
        "filename": "persona_dev.csv"
    },
    "persona_student": {
        "id": "persona_student",
        "title": "02 / Student Trial & UPI Creep",
        "tagline": "Converted 7-day trials, micro-subscriptions, and duplicate streaming plans.",
        "row_count": 160,
        "default_starting_balance": 1420.00,
        "description": "Student checking account featuring a 7-day Coursera trial conversion, Xbox Game Pass, duplicate Apple/Spotify streaming, and campus micro-charges.",
        "filename": "persona_student.csv"
    },
    "persona_freelancer": {
        "id": "persona_freelancer",
        "title": "03 / Freelancer Lumpy Cashflow",
        "tagline": "Irregular high client invoices mixed with heavy recurring software overhead.",
        "row_count": 200,
        "default_starting_balance": 16800.00,
        "description": "Freelance designer experiencing $15->$45 Figma seat price hike, Notion AI creep, duplicate Dropbox/Google storage, and lumpy client wire inflows.",
        "filename": "persona_freelancer.csv"
    }
}

class MerchantAuditRequest(BaseModel):
    merchant_name: str
    monthly_cost: float
    price_change_pct: Optional[float] = 0.0
    historical_median: Optional[float] = None
    rule_flags: Optional[List[str]] = []
    raw_description_sample: Optional[str] = ""
    next_predicted_date: Optional[str] = ""
    tx_history: Optional[List[Dict[str, Any]]] = []
    merchant_category: Optional[str] = "subscription_or_saas"

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing LeakLens predictive models...")
    # Preload TabPFN engine
    try:
        engine = get_tabpfn_engine()
        logger.info(f"LeakLens TabPFN engine ready in {engine.mode} mode.")
    except Exception as e:
        logger.error(f"TabPFN engine startup warning: {e}")

@app.get("/api/health")
async def health_check():
    """Health check reporting system status, mode, and dataset presence."""
    engine = get_tabpfn_engine()
    if engine.mode == "cloud_sandbox":
        execution_mode = "Render Cloud Sandbox (TabPFN-3.5 Prior Engine)"
    elif engine.mode == "local":
        execution_mode = "Local Private Runtime (Offline Open-Weights)"
    else:
        execution_mode = "Prior Labs Cloud API"
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "execution_mode": execution_mode,
        "tabpfn_mode": engine.mode,
        "tabpfn_classifier_ready": engine.classifier_fitted,
        "datasets_available": [k for k in PERSONA_METADATA.keys() if (DATA_DIR / PERSONA_METADATA[k]["filename"]).exists()]
    }

@app.get("/api/personas")
async def list_personas():
    """Returns metadata for the 3 synthetic persona presets."""
    return {
        "personas": list(PERSONA_METADATA.values())
    }

@app.post("/api/audit")
async def run_audit(
    persona_id: Optional[str] = Query(None, description="Preset persona id: persona_dev, persona_student, persona_freelancer"),
    file: Optional[UploadFile] = File(None, description="Custom bank statement CSV file")
):
    """
    Main audit endpoint.
    Accepts either persona_id OR an uploaded CSV file.
    Runs deterministic rules, TabPFN leak risk classifier, and 90-day cash runway regressor.
    """
    t_start = time.perf_counter()

    # 1. Load DataFrame
    df: Optional[pd.DataFrame] = None
    source_name = "custom_upload"

    if persona_id:
        if persona_id not in PERSONA_METADATA:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid persona_id: '{persona_id}'. Valid choices: {list(PERSONA_METADATA.keys())}"
            )
        csv_file = DATA_DIR / PERSONA_METADATA[persona_id]["filename"]
        if not csv_file.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Persona file {csv_file.name} not found. Please run generate_datasets.py."
            )
        df = pd.read_csv(csv_file)
        source_name = persona_id
    elif file:
        try:
            content = await file.read()
            df = pd.read_csv(io.BytesIO(content))
            source_name = file.filename or "uploaded_statement.csv"
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse uploaded CSV file: {str(e)}"
            )
    else:
        # Default to persona_dev if neither specified
        csv_file = DATA_DIR / "persona_dev.csv"
        if csv_file.exists():
            df = pd.read_csv(csv_file)
            source_name = "persona_dev"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either 'persona_id' query param or 'file' CSV upload must be provided."
            )

    # 2. Deterministic Analysis
    try:
        merchants, summary = analyze_transactions(df)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Deterministic rule analysis failed: {str(e)}"
        )

    # 3. TabPFN Classifier (Leak Probability)
    engine = get_tabpfn_engine()
    scored_merchants, clf_ms = engine.predict_leak_risks(merchants)

    # Calculate leak savings totals
    leaks = [m for m in scored_merchants if m.get("is_leak", False)]
    total_monthly_leak = round(sum(m["monthly_cost"] for m in leaks), 2)
    annual_projected_leak = round(total_monthly_leak * 12, 2)
    
    # 3-Year compounded savings odometer (assuming 7% annual yield)
    # Formula: monthly_contrib * (((1 + r/12)^(36) - 1) / (r/12))
    r_monthly = 0.07 / 12.0
    three_year_compounded = round(total_monthly_leak * (((1 + r_monthly)**36 - 1) / r_monthly), 2)

    # 4. TabPFN Regressor (90-Day Runway Forecast)
    forecast_points, reg_ms = engine.forecast_cash_runway(df, monthly_leak_savings=total_monthly_leak)

    total_pipeline_ms = round((time.perf_counter() - t_start) * 1000, 2)
    if engine.mode == "cloud_sandbox":
        execution_mode = "Render Cloud Sandbox (TabPFN-3.5 Prior Engine)"
    elif engine.mode == "local":
        execution_mode = "Local Private Runtime (Offline Open-Weights)"
    else:
        execution_mode = "Prior Labs Cloud API"

    return {
        "source": source_name,
        "execution_mode": execution_mode,
        "rows_processed": summary["rows_processed"],
        "inference_ms": round(clf_ms + reg_ms, 2),
        "total_latency_ms": total_pipeline_ms,
        "summary": {
            "total_monthly_leak": total_monthly_leak,
            "annual_projected_leak": annual_projected_leak,
            "three_year_compounded_savings": three_year_compounded,
            "flagged_merchants_count": len(leaks),
            "clean_merchants_count": len(scored_merchants) - len(leaks),
            "total_merchants_count": len(scored_merchants),
            "total_expense_volume": summary["total_expense_volume"],
            "date_range": summary["date_range"]
        },
        "merchants": scored_merchants,
        "forecast_90d": forecast_points
    }

@app.post("/api/draft-action")
async def draft_action(payload: MerchantAuditRequest):
    """
    Action agent endpoint.
    Generates ready-to-send cancellation email, price-match negotiation script,
    and valid RFC-5545 .ics calendar kill-switch string.
    """
    try:
        merchant_dict = payload.model_dump()
        result = await draft_action_bundle(merchant_dict)
        return result
    except Exception as e:
        logger.error(f"Action drafting failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate action bundle: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
