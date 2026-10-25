"""
Open-Weight Action Agent for LeakLens.
Generates legally-worded cancellation emails, price-match negotiation scripts,
and RFC-5545 .ics kill-switch calendar reminders.
Supports Groq (llama-3.3-70b-versatile), local Ollama (qwen2.5/llama3), or offline template engine.
"""

import os
import uuid
import json
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import httpx
from dotenv import load_dotenv

# Load backend/.env
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_PATH)

logger = logging.getLogger("leaklens.drafter")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
OLLAMA_DEFAULT_URL = "http://localhost:11434/v1/chat/completions"

def generate_ics_reminder(merchant_name: str, monthly_cost: float, next_predicted_date_str: str) -> str:
    """
    Generates a valid RFC-5545 .ics calendar string set 3 days before next_predicted_date.
    """
    safe_cost = float(monthly_cost or 0.0)
    try:
        next_dt = datetime.strptime(next_predicted_date_str, "%Y-%m-%d")
        reminder_dt = next_dt - timedelta(days=3)
    except Exception:
        reminder_dt = datetime.utcnow() + timedelta(days=27)

    dtstamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    dtstart = reminder_dt.strftime("%Y%m%d")
    event_uid = f"leaklens-{uuid.uuid4().hex[:12]}@leaklens.dev"

    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LeakLens//Subscription Kill-Switch Workbench//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:{event_uid}
DTSTAMP:{dtstamp}
DTSTART;VALUE=DATE:{dtstart}
SUMMARY:Kill-Switch Reminder: Cancel {merchant_name}
DESCRIPTION:LeakLens detected {merchant_name} renewal scheduled around {next_predicted_date_str} (${safe_cost:.2f}/mo). Cancel today to prevent unwanted charge.
STATUS:CONFIRMED
TRANSP:TRANSPARENT
BEGIN:VALARM
TRIGGER:-PT9H
ACTION:DISPLAY
DESCRIPTION:Reminder to cancel {merchant_name}
END:VALARM
END:VEVENT
END:VCALENDAR"""
    return ics_content

def build_template_cancellation_email(merchant: Dict[str, Any]) -> str:
    """
    High-precision deterministic template for Cancellation & Refund Request.
    Cites FTC 16 CFR Part 425 & ROSCA (Restore Online Shoppers' Confidence Act).
    """
    category = merchant.get("merchant_category") or "subscription_or_saas"
    if category == "essential_living":
        return "VERIFIED ESSENTIAL / POINT-OF-SALE EXPENSE\n\nNo cancellation letter generated. This merchant is classified as an essential living expense (rent, utilities, groceries, dining, or transit). LeakLens does not apply recurring subscription kill-switches to living expenses."

    m_name = merchant.get("merchant_name") or "Vendor"
    cost = float(merchant.get("monthly_cost") or 0.0)
    raw_drift = merchant.get("price_change_pct")
    drift = float(raw_drift) if raw_drift is not None else 0.0
    flags = merchant.get("rule_flags") or []
    raw_desc = merchant.get("raw_description_sample") or ""
    history = merchant.get("tx_history") or []

    tx_summary_lines = "\n".join([
        f"- {tx.get('date', 'N/A')}: ${float(tx.get('amount') or 0.0):.2f} (Descriptor: {tx.get('raw_description', '')})"
        for tx in history[-4:]
    ])

    hike_clause = ""
    if "PRICE_HIKE" in flags and drift > 0:
        hike_clause = f"\nFurthermore, my billing record reveals an unauthorized price increase of +{drift*100:.1f}% without explicit advance opt-in consent. Under FTC negative-option regulations (16 CFR Part 425), material term alterations require clear affirmative consent."

    dup_clause = ""
    if "DUPLICATE_SAME_MONTH" in flags:
        dup_clause = "\nAdditionally, our statement indicates duplicate billing occurred within the same 30-day billing cycle, indicating a billing processing discrepancy that warrants an immediate refund."

    infra_clause = ""
    if "IDLE_INFRA_CREEP" in flags:
        infra_clause = "\nThis infrastructure subscription tier has been identified as inactive/idle. We request an immediate service de-provisioning and confirmation of zero lingering provisioned resource charges."

    renewal_clause = ""
    if "ANNUAL_SURPRISE_RENEWAL" in flags:
        renewal_clause = "\nThis charge reflects an automatic renewal processed without timely advance notice. Under consumer autorenewal regulations, we request immediate cancellation and a full refund of this recent renewal charge."

    return f"""Subject: Formal Cancellation Notice & Refund Request — Billing Account [{m_name}]

To Customer Support / Billing Department at {m_name},

I am writing to formally request the immediate cancellation of my account and all associated recurring subscriptions for {m_name} (Statement Descriptor: "{raw_desc}").

Account Verification & Transaction Evidence:
{tx_summary_lines}
Current Recurring Charge: ${cost:.2f}/month
{hike_clause}{dup_clause}{infra_clause}{renewal_clause}

In accordance with consumer protection statutes regarding recurring automatic renewal agreements (including the Restore Online Shoppers' Confidence Act and applicable state autorenewal laws), please:
1. Immediately terminate all active recurring billing authorizations effective as of today's date.
2. Issue a full refund for any unauthorized price differentials or duplicate billings identified above.
3. Remove and purge all stored payment credentials associated with my profile.
4. Provide written email confirmation of this cancellation along with the final confirmation/cancellation reference number.

I do not authorize any future recurring debits or retention offers. Please confirm receipt and processing within 2 business days.

Sincerely,
Account Holder
(Billing descriptor on file: {raw_desc})"""

def build_template_negotiation_script(merchant: Dict[str, Any]) -> str:
    """
    High-precision deterministic template for Price-Match & Downgrade Negotiation.
    """
    category = merchant.get("merchant_category") or "subscription_or_saas"
    if category == "essential_living":
        return "VERIFIED ESSENTIAL / POINT-OF-SALE EXPENSE\n\nNo negotiation script applicable. This transaction is a non-subscription point-of-sale living expense."

    m_name = merchant.get("merchant_name") or "Vendor"
    cost = float(merchant.get("monthly_cost") or 0.0)
    raw_drift = merchant.get("price_change_pct")
    drift = float(raw_drift) if raw_drift is not None else 0.0

    raw_hist = merchant.get("historical_median")
    hist_median = float(raw_hist) if (raw_hist is not None and float(raw_hist) > 0) else cost

    return f"""Subject: Account Review & Plan Pricing Inquiry — {m_name}

Hello {m_name} Team,

I have been conducting a quarterly financial audit of my software tools. I noticed my current subscription rate for {m_name} is currently billed at ${cost:.2f}/month (an increase over my previous rate of ${hist_median:.2f}/month).

I value the core features of {m_name}, but given recent budgetary adjustments and competitive alternatives available on the market, I am evaluating whether to migrate or consolidate services.

Before initiating a formal cancellation:
1. Are you able to restore my prior grandfathered rate of ${hist_median:.2f}/month, or apply an annual loyalty discount to keep this plan viable?
2. If not, can you point me toward a legacy or adjusted tier that aligns with my actual usage?

If we cannot align on a cost-effective tier, please consider this inquiry as a request to transition to your free/essential tier at the conclusion of the current billing cycle.

Thank you for your assistance.

Best regards,
Valued Subscriber"""

async def draft_action_bundle(merchant: Dict[str, Any]) -> Dict[str, Any]:
    """
    Drafts cancellation email, negotiation script, and .ics reminder.
    Attempts Groq API (llama-3.3-70b-versatile), then deterministic template fallback.
    """
    category = merchant.get("merchant_category", "subscription_or_saas")
    if category == "essential_living":
        return {
            "cancellation_email": build_template_cancellation_email(merchant),
            "negotiation_script": build_template_negotiation_script(merchant),
            "ics_content": "",
            "model_used": "deterministic/essential-expense"
        }

    m_name = merchant.get("merchant_name", "Merchant")
    cost = float(merchant.get("monthly_cost", 0.0))
    next_date = merchant.get("next_predicted_date", "")
    flags = merchant.get("rule_flags", [])
    raw_desc = merchant.get("raw_description_sample", "")
    drift = float(merchant.get("price_change_pct", 0.0))

    ics_content = generate_ics_reminder(m_name, cost, next_date)

    prompt = f"""You are LeakLens AI, an expert consumer protection advocate and negotiation specialist.
Generate two distinct artifacts for the following merchant subscription:
Merchant: {m_name}
Raw Descriptor: {raw_desc}
Monthly Cost: ${cost:.2f}
Price Change: +{drift*100:.1f}%
Rule Flags: {', '.join(flags)}
Next Predicted Billing Date: {next_date}

Format your response strictly as valid JSON with keys:
"cancellation_email": (formal, sharp, legally-grounded cancellation and refund letter citing FTC rules and exact descriptor)
"negotiation_script": (polite yet firm price-match and loyalty discount negotiation script)
"""

    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key and groq_api_key.strip():
        # Open-weight models supported on Groq
        model_candidates = [
            os.getenv("GROQ_MODEL"),
            "qwen/qwen3.8-27b",
            "llama-3.3-70b-versatile",
            "llama-3.1-70b-versatile",
            "llama-3.1-8b-instant"
        ]
        candidate_models = [m for m in model_candidates if m]

        for model_name in candidate_models:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.post(
                        GROQ_API_URL,
                        headers={
                            "Authorization": f"Bearer {groq_api_key.strip()}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": model_name,
                            "messages": [
                                {"role": "system", "content": "You output valid JSON with keys cancellation_email and negotiation_script."},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.2,
                            "response_format": {"type": "json_object"}
                        }
                    )
                    if res.status_code == 200:
                        data = res.json()
                        content = json.loads(data["choices"][0]["message"]["content"])
                        return {
                            "cancellation_email": content.get("cancellation_email", build_template_cancellation_email(merchant)),
                            "negotiation_script": content.get("negotiation_script", build_template_negotiation_script(merchant)),
                            "ics_content": ics_content,
                            "model_used": f"groq/{model_name}"
                        }
                    elif res.status_code == 404:
                        # Model not available on this endpoint, try next candidate
                        continue
                    else:
                        logger.warning(f"Groq API returned HTTP {res.status_code}: {res.text}")
            except Exception as e:
                logger.warning(f"Groq generation failed with model {model_name}: {e}")

    # Fallback to local Ollama if available
    ollama_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            ollama_res = await client.post(
                f"{ollama_url}/v1/chat/completions",
                json={
                    "model": "qwen2.5:latest",
                    "messages": [
                        {"role": "system", "content": "You output valid JSON with keys cancellation_email and negotiation_script."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.2,
                    "format": "json"
                }
            )
            if ollama_res.status_code == 200:
                data = ollama_res.json()
                content = json.loads(data["choices"][0]["message"]["content"])
                return {
                    "cancellation_email": content.get("cancellation_email", build_template_cancellation_email(merchant)),
                    "negotiation_script": content.get("negotiation_script", build_template_negotiation_script(merchant)),
                    "ics_content": ics_content,
                    "model_used": "ollama/qwen2.5"
                }
    except Exception:
        pass

    # Deterministic ROSCA & FTC Part 425 template fallback
    return {
        "cancellation_email": build_template_cancellation_email(merchant),
        "negotiation_script": build_template_negotiation_script(merchant),
        "ics_content": ics_content,
        "model_used": "open-weight-template-engine (fallback: set GROQ_API_KEY in backend/.env)"
    }
