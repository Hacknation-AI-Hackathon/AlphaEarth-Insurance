import os
from typing import Dict

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# ---------------------------------------------------------------------
# Summarizer Module
# Now uses Inception Labs' Mercury model to summarize claim decisions.
# Gemini code is retained but commented for future reference.
# ---------------------------------------------------------------------

# import google.generativeai as genai
# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# def summarize_claim_decision(claim_output: dict) -> str:
#     ...


def _build_prompt(claim_output: Dict) -> str:
    return f"""
You are an AI insurance assistant. Summarize this claim decision in plain English
for an insurance report. Make it concise but informative and explicitly mention that
the system compared the Google Earth Engine (GEE) severity with validation confidence
via risk fusion before deciding.

Hazard Type: {claim_output.get('hazard', 'Unknown')}
Damage Percentage: {claim_output.get('damage_pct', 'N/A')}%
Severity: {claim_output.get('severity', 'Unknown')}
Validation Confidence: {claim_output.get('confidence_label', 'Unknown')} ({claim_output.get('confidence_score', 'N/A')})
Fused Score: {claim_output.get('fused_score', 'N/A')}
Fused Label: {claim_output.get('fused_label', 'Unknown')}
Decision: {claim_output.get('claim_status', 'Unknown')}
Reason: {claim_output.get('reason', 'No reason provided')}

Write a 3-5 sentence summary explaining what happened, how the GEE severity and validation confidence
were fused, what the resulting risk level means, and why this decision was made.
""".strip()


def summarize_claim_decision(claim_output: dict) -> str:
    """
    Generate a natural language summary of the claim decision using Mercury.
    """
    api_key = os.getenv("INCEPTION_API_KEY")
    if not api_key:
        return "Summary generation skipped: INCEPTION_API_KEY is not set."

    client = OpenAI(api_key=api_key, base_url="https://api.inceptionlabs.ai/v1")
    prompt = _build_prompt(claim_output)

    try:
        response = client.chat.completions.create(
            model="mercury",
            messages=[
                {"role": "system", "content": "You generate concise insurance summaries."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=400,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:
        return f"Summary generation failed: {exc}"
