/**
 * Extract confidence information from validation result
 * @param {Object} validation - Validation result object
 * @returns {Array} - [confidence_score, confidence_label, s1_corr, coherence]
 */
function extractConfidence(validation) {
  if (!validation) {
    return [0.0, 'Unknown', 0.0, 0.0];
  }

  const confBlock = validation.confidence || validation;
  const score = parseFloat(confBlock.confidence_score || 0.0) || 0.0;
  const label = confBlock.label || 'Unknown';
  const s1Corr = (parseFloat(validation.cross_sensor || 0.0) || 0.0) / 100.0;
  const coherence = (parseFloat(validation.spatial_coherence || 0.0) || 0.0) / 100.0;

  return [score, label, s1Corr, coherence];
}

/**
 * Compute fused score from damage percentage and confidence
 * @param {number} damagePct - Damage percentage (0-100)
 * @param {number} conf - Confidence score (0-1)
 * @param {number} s1Corr - Cross-sensor correlation (0-1)
 * @param {number} coherence - Spatial coherence (0-1)
 * @returns {Array} - [fused_score, fused_label]
 */
function fusedScore(damagePct, conf, s1Corr, coherence) {
  if (conf < 0.45) {
    return [0.0, 'Low'];
  }

  let wSev, wConf;
  if (s1Corr >= 0.5 && coherence >= 0.7) {
    wSev = 0.6;
    wConf = 0.4;
  } else {
    wSev = 0.4;
    wConf = 0.6;
  }

  const sevScore = Math.min(Math.max(damagePct / 100.0, 0.0), 1.0);
  const score = wSev * sevScore + wConf * conf;
  
  let label;
  if (score >= 0.7) {
    label = 'High';
  } else if (score >= 0.4) {
    label = 'Moderate';
  } else {
    label = 'Low';
  }

  return [Math.round(score * 100) / 100, label];
}

/**
 * Generate fusion reason text
 * @param {Object} params - Parameters for reason generation
 * @returns {string} - Reason text
 */
function fusionReason(params) {
  const {
    hazard,
    damagePct,
    severity,
    confidenceLabel,
    confidenceScore,
    fusedLabel,
    fusedScoreVal,
    decision
  } = params;

  return (
    `Google Earth Engine indicates ${severity} ${hazard} damage (~${damagePct.toFixed(1)}%), ` +
    `while validation confidence is ${confidenceLabel.toLowerCase()} (${confidenceScore.toFixed(2)}). ` +
    `Conditional fusion score ${fusedScoreVal.toFixed(2)} (${fusedLabel}) balances severity with corroboration, ` +
    `leading to a ${decision.toLowerCase()} decision.`
  );
}

/**
 * Decide claim based on hazard result and validation
 * @param {Object} hazardResult - Hazard detection result
 * @param {Object} validation - Validation result (optional)
 * @returns {Object} - Claim decision result
 */
export function decideClaim(hazardResult, validation = {}) {
  const hazard = hazardResult.hazard || 'hazard';
  const damagePct = parseFloat(hazardResult.damage_pct || 0.0) || 0.0;
  const severity = hazardResult.severity || 'unknown';

  const [confidenceScore, confidenceLabel, s1Corr, coherence] = extractConfidence(validation);
  const [fusedVal, fusedLabel] = fusedScore(damagePct, confidenceScore, s1Corr, coherence);

  let decision;
  if (fusedVal >= 0.7) {
    decision = 'Auto-Approve';
  } else if (fusedVal >= 0.4) {
    decision = 'Manual Review';
  } else {
    decision = 'Reject';
  }

  const reason = fusionReason({
    hazard,
    damagePct,
    severity,
    confidenceLabel,
    confidenceScore,
    fusedLabel,
    fusedScoreVal: fusedVal,
    decision
  });

  return {
    hazard: hazard,
    damage_pct: damagePct,
    severity: severity,
    confidence_score: Math.round(confidenceScore * 100) / 100,
    confidence_label: confidenceLabel,
    fused_score: fusedVal,
    fused_label: fusedLabel,
    claim_status: decision,
    reason: reason
  };
}

