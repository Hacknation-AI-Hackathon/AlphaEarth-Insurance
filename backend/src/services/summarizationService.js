import Anthropic from '@anthropic-ai/sdk';

/**
 * Build prompt for claim decision summarization
 * @param {Object} claimOutput - Claim decision output
 * @returns {string} - Prompt text
 */
function buildPrompt(claimOutput) {
  return `You are an AI insurance assistant. Summarize this claim decision in plain English
for an insurance report. Make it concise but informative and explicitly mention that
the system compared the Google Earth Engine (GEE) severity with validation confidence
via risk fusion before deciding.

Hazard Type: ${claimOutput.hazard || 'Unknown'}
Damage Percentage: ${claimOutput.damage_pct || 'N/A'}%
Severity: ${claimOutput.severity || 'Unknown'}
Validation Confidence: ${claimOutput.confidence_label || 'Unknown'} (${claimOutput.confidence_score || 'N/A'})
Fused Score: ${claimOutput.fused_score || 'N/A'}
Fused Label: ${claimOutput.fused_label || 'Unknown'}
Decision: ${claimOutput.claim_status || 'Unknown'}
Reason: ${claimOutput.reason || 'No reason provided'}

Write a 3-5 sentence summary explaining what happened, how the GEE severity and validation confidence
were fused, what the resulting risk level means, and why this decision was made.`;
}

/**
 * Summarize claim decision using Anthropic Claude AI
 * Falls back to template summary if API is unavailable
 * 
 * @param {Object} claimOutput - Claim decision output
 * @returns {Promise<string>} - Summary text
 */
export async function summarizeClaimDecision(claimOutput) {
  // Use Anthropic Claude for AI summary generation
  if (process.env.ANTHROPIC_API_KEY && 
      process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
    try {
      console.log('🧠 [SUMMARIZATION] Generating AI summary with Anthropic Claude...');
      
      const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });

      const prompt = buildPrompt(claimOutput);
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const summary = response.content[0].text.trim();
      console.log('   ✅ Anthropic Claude summarization successful');
      console.log('   📝 Summary:', summary);
      return summary;
    } catch (error) {
      console.error('   ❌ Anthropic summarization failed:', error.message);
      console.error('   Error details:', error);
      // Fall through to fallback
    }
  } else {
    console.log('   ⚠️  Anthropic API key not configured');
  }

  // Fallback: Generate a basic summary
  console.log('🧠 [SUMMARIZATION] Using fallback template summary');
  return generateFallbackSummary(claimOutput);
}

/**
 * Generate fallback summary when AI is unavailable
 * @param {Object} claimOutput - Claim decision output
 * @returns {string} - Fallback summary
 */
function generateFallbackSummary(claimOutput) {
  const hazard = claimOutput.hazard || 'hazard';
  const damagePct = claimOutput.damage_pct || 0;
  const severity = claimOutput.severity || 'unknown';
  const confidenceLabel = claimOutput.confidence_label || 'Unknown';
  const confidenceScore = claimOutput.confidence_score || 0;
  const fusedScore = claimOutput.fused_score || 0;
  const fusedLabel = claimOutput.fused_label || 'Unknown';
  const decision = claimOutput.claim_status || 'Unknown';

  return (
    `Analysis detected ${severity} ${hazard} damage affecting approximately ${damagePct.toFixed(1)}% of the area. ` +
    `Google Earth Engine severity assessment was combined with validation confidence (${confidenceLabel}, ${confidenceScore.toFixed(2)}) ` +
    `through risk fusion, resulting in a ${fusedLabel} risk score (${fusedScore.toFixed(2)}). ` +
    `Based on this analysis, the claim has been ${decision.toLowerCase()}. ` +
    `${claimOutput.reason || 'Standard claim processing procedures were followed.'}`
  );
}