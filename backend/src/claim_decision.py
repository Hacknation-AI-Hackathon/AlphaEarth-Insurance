"""
Confidence-aware claim decision logic.
Combines hazard damage estimates with validation confidence to decide
whether to auto-approve, send to manual review, or reject a claim.
"""

from typing import Dict, Tuple


def _extract_confidence(validation: Dict | None) -> Tuple[float, str, float, float]:
    if not validation:
        return 0.0, "Unknown", 0.0, 0.0
    conf_block = validation.get("confidence") if isinstance(validation, dict) else None
    if conf_block is None:
        conf_block = validation
    score = float(conf_block.get("confidence_score", 0.0) or 0.0)
    label = conf_block.get("label", "Unknown")
    s1_corr = float(validation.get("cross_sensor", 0.0) or 0.0) / 100.0
    coherence = float(validation.get("spatial_coherence", 0.0) or 0.0) / 100.0
    return score, label, s1_corr, coherence


def fused_score(damage_pct: float, conf: float, s1_corr: float, coherence: float) -> Tuple[float, str]:
    if conf < 0.45:
        return 0.0, "Low"

    if s1_corr >= 0.5 and coherence >= 0.7:
        w_sev, w_conf = 0.6, 0.4
    else:
        w_sev, w_conf = 0.4, 0.6

    sev_score = min(max(damage_pct / 100.0, 0.0), 1.0)
    score = w_sev * sev_score + w_conf * conf
    label = "High" if score >= 0.7 else "Moderate" if score >= 0.4 else "Low"
    return round(score, 2), label


def _fusion_reason(
    hazard: str,
    damage_pct: float,
    severity: str,
    confidence_label: str,
    confidence_score: float,
    fused_label: str,
    fused_score_val: float,
    decision: str,
) -> str:
    return (
        f"Google Earth Engine indicates {severity} {hazard} damage (~{damage_pct:.1f}%), "
        f"while validation confidence is {confidence_label.lower()} ({confidence_score:.2f}). "
        f"Conditional fusion score {fused_score_val:.2f} ({fused_label}) balances severity with corroboration, "
        f"leading to a {decision.lower()} decision."
    )


def decide_claim(hazard_result: Dict, validation: Dict | None = None) -> Dict:
    hazard = hazard_result.get("hazard")
    damage_pct = float(hazard_result.get("damage_pct", 0.0) or 0.0)
    severity = hazard_result.get("severity", "unknown")
    confidence_score, confidence_label, s1_corr, coherence = _extract_confidence(validation or {})

    fused_val, fused_label = fused_score(damage_pct, confidence_score, s1_corr, coherence)
    decision = "Auto-Approve" if fused_val >= 0.7 else "Manual Review" if fused_val >= 0.4 else "Reject"

    reason = _fusion_reason(
        hazard=hazard or "hazard",
        damage_pct=damage_pct,
        severity=severity,
        confidence_label=confidence_label,
        confidence_score=confidence_score,
        fused_label=fused_label,
        fused_score_val=fused_val,
        decision=decision,
    )

    return {
        "hazard": hazard,
        "damage_pct": damage_pct,
        "severity": severity,
        "confidence_score": round(confidence_score, 2),
        "confidence_label": confidence_label,
        "fused_score": fused_val,
        "fused_label": fused_label,
        "claim_status": decision,
        "reason": reason,
    }
