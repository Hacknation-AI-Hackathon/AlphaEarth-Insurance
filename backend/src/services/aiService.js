import Anthropic from '@anthropic-ai/sdk';

class AIInsightsService {
  constructor() {
    // Only initialize if API key is configured
    if (process.env.ANTHROPIC_API_KEY &&
        process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
      try {
        this.client = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });
        console.log('✅ Anthropic AI client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Anthropic client:', error.message);
        this.client = null;
      }
    } else {
      console.log('⚠️  Anthropic API key not configured - AI summaries will use fallback text');
      this.client = null;
    }
  }

  /**
   * Generate executive summary for disaster impact
   */
  async generateExecutiveSummary(disasterData, portfolioMetrics, riskDistribution, topRiskProperties) {
    // Use fallback if client not initialized
    if (!this.client) {
      return this.generateFallbackSummary(disasterData, portfolioMetrics, riskDistribution);
    }

    try {
      const prompt = `You are an insurance risk analyst. Generate a concise executive summary for leadership about an ongoing ${disasterData.type} disaster.

Key Data:
- Disaster: ${disasterData.name}
- Location: ${disasterData.location}
- Total properties: ${portfolioMetrics.totalProperties.toLocaleString()}
- Properties at risk: ${portfolioMetrics.propertiesAtRisk.toLocaleString()}
- Expected loss: $${(portfolioMetrics.expectedLoss / 1e6).toFixed(1)}M
- 99th percentile loss: $${(portfolioMetrics.percentile99Loss / 1e6).toFixed(1)}M

Risk Distribution:
Critical: ${riskDistribution.critical.count} properties ($${(riskDistribution.critical.loss / 1e6).toFixed(1)}M)
High: ${riskDistribution.high.count} properties ($${(riskDistribution.high.loss / 1e6).toFixed(1)}M)
Moderate: ${riskDistribution.moderate.count} properties ($${(riskDistribution.moderate.loss / 1e6).toFixed(1)}M)

Top 5 Highest Risk Properties:
${topRiskProperties.map((p, i) => 
  `${i+1}. ${p.address} - Value: $${(p.propertyValue / 1000).toFixed(0)}K, Risk: ${(p.damageProbability * 100).toFixed(0)}%, Expected Loss: $${(p.expectedLoss / 1000).toFixed(0)}K`
).join('\n')}

Provide:
1. 2-sentence situation overview
2. Key financial exposure numbers
3. Immediate action recommendations
4. Claims team preparation guidance

Keep it under 200 words, professional tone.`;

      console.log('🤖 Generating AI executive summary...');
      
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      const summary = message.content[0].text;
      console.log('✅ AI summary generated successfully');
      
      // Parse the summary into structured format
      return this.parseSummaryToStructured(summary, disasterData, portfolioMetrics, riskDistribution);
    } catch (error) {
      console.error('Error generating AI summary:', error.message);
      
      // Return fallback summary if API fails
      return this.generateFallbackSummary(disasterData, portfolioMetrics, riskDistribution);
    }
  }

  /**
   * Generate property-specific risk explanation
   */
  async explainPropertyRisk(propertyData) {
    if (!this.client) {
      return this.generateFallbackPropertyExplanation(propertyData);
    }

    try {
      const prompt = `Explain in 2-3 sentences why this property has ${propertyData.riskTier} disaster risk:

Property Details:
- Location: ${propertyData.address}
- Coordinates: ${propertyData.coordinates.lat.toFixed(4)}, ${propertyData.coordinates.lon.toFixed(4)}
- Value: $${(propertyData.propertyValue / 1000).toFixed(0)}K
- Type: ${propertyData.propertyType}
- Distance from disaster: ${propertyData.distanceMiles.toFixed(1)} miles
- Damage probability: ${(propertyData.damageProbability * 100).toFixed(0)}%

Use simple language for non-technical audience.`;

      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      return message.content[0].text;
    } catch (error) {
      console.error('Error explaining property risk:', error.message);
      return this.generateFallbackPropertyExplanation(propertyData);
    }
  }

  /**
   * Generate action recommendations
   */
  async generateActionRecommendations(disasterData, portfolioMetrics, riskDistribution) {
    if (!this.client) {
      return this.generateFallbackRecommendations(portfolioMetrics, riskDistribution);
    }

    try {
      const prompt = `As an insurance operations expert, provide specific action recommendations for handling ${disasterData.name}.

Current Situation:
- ${portfolioMetrics.propertiesAtRisk.toLocaleString()} properties at risk
- Expected claims: ${riskDistribution.critical.count + riskDistribution.high.count}
- Potential exposure: $${(portfolioMetrics.expectedLoss / 1e6).toFixed(1)}M

Provide:
1. Immediate operational actions (next 24 hours)
2. Claims team staffing recommendations
3. Customer communication strategy
4. Risk mitigation opportunities

Keep it actionable and specific, 150 words max.`;

      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      return message.content[0].text;
    } catch (error) {
      console.error('Error generating recommendations:', error.message);
      return this.generateFallbackRecommendations(portfolioMetrics, riskDistribution);
    }
  }

  /**
   * Parse AI summary text into structured format
   */
  parseSummaryToStructured(summaryText, disasterData, portfolioMetrics, riskDistribution) {
    // Try to extract structured information from the summary
    const lines = summaryText.split('\n').filter(line => line.trim());
    
    // Determine status based on risk distribution
    let status = 'GREEN';
    let statusColor = '#22C55E';
    if (riskDistribution.critical.count > 50 || portfolioMetrics.expectedLoss > 50e6) {
      status = 'RED';
      statusColor = '#EF4444';
    } else if (riskDistribution.critical.count > 10 || portfolioMetrics.expectedLoss > 10e6) {
      status = 'YELLOW';
      statusColor = '#EAB308';
    }
    
    // Extract financial exposure info
    const financialExposure = `Expected loss: $${(portfolioMetrics.expectedLoss / 1e6).toFixed(1)}M. Total properties at risk: ${portfolioMetrics.propertiesAtRisk.toLocaleString()}. Critical risk properties: ${riskDistribution.critical.count}. High risk properties: ${riskDistribution.high.count}.`;
    
    // Use first 2 sentences as situation overview
    const sentences = summaryText.split(/[.!?]+/).filter(s => s.trim());
    const situationOverview = sentences.slice(0, 2).join('. ').trim() + (sentences.length > 0 ? '.' : '') || 
      `${disasterData.name} poses significant risk to our insured portfolio in ${disasterData.location}.`;
    
    return {
      situationOverview,
      financialExposure,
      immediateActions: [
        'Deploy field assessment team within 24 hours for ground-truth validation',
        'Activate emergency claims hotline for policyholders in affected areas',
        'Review and validate loss models - discrepancy analysis required'
      ],
      claimsTeamPreparation: [
        `Expect ${Math.min(riskDistribution.critical.count + riskDistribution.high.count, 100)}-${Math.min(riskDistribution.critical.count + riskDistribution.high.count + 50, 150)} initial claims within 72 hours`,
        'Prioritize inspections for high-value properties',
        'Coordinate with local contractors for rapid damage assessment'
      ],
      status,
      statusColor,
      rawText: summaryText
    };
  }

  /**
   * Fallback summary when AI API is unavailable
   */
  generateFallbackSummary(disasterData, portfolioMetrics, riskDistribution) {
    // Determine status based on risk distribution
    let status = 'GREEN';
    let statusColor = '#22C55E';
    if (riskDistribution.critical.count > 50 || portfolioMetrics.expectedLoss > 50e6) {
      status = 'RED';
      statusColor = '#EF4444';
    } else if (riskDistribution.critical.count > 10 || portfolioMetrics.expectedLoss > 10e6) {
      status = 'YELLOW';
      statusColor = '#EAB308';
    }
    
    const situationOverview = `${disasterData.name} poses significant risk to our insured portfolio in ${disasterData.location}. Current exposure indicates ${portfolioMetrics.propertiesAtRisk.toLocaleString()} properties at risk with expected losses of $${(portfolioMetrics.expectedLoss / 1e6).toFixed(1)}M.`;
    
    const percentile99 = portfolioMetrics.percentile99Loss ? ` 99th percentile loss: $${(portfolioMetrics.percentile99Loss / 1e6).toFixed(1)}M.` : '';
    const financialExposure = `Expected loss: $${(portfolioMetrics.expectedLoss / 1e6).toFixed(1)}M. Total properties at risk: ${portfolioMetrics.propertiesAtRisk.toLocaleString()}. Critical risk properties: ${riskDistribution.critical.count}. High risk properties: ${riskDistribution.high.count}.${percentile99}`;
    
    return {
      situationOverview,
      financialExposure,
      immediateActions: [
        'Deploy field assessment team within 24 hours for ground-truth validation',
        'Activate emergency claims hotline for policyholders in affected areas',
        'Review and validate loss models - discrepancy analysis required'
      ],
      claimsTeamPreparation: [
        `Expect ${Math.min(riskDistribution.critical.count + riskDistribution.high.count, 100)}-${Math.min(riskDistribution.critical.count + riskDistribution.high.count + 50, 150)} initial claims within 72 hours`,
        'Prioritize inspections for high-value properties',
        'Coordinate with local contractors for rapid damage assessment'
      ],
      status,
      statusColor,
      rawText: `${situationOverview} ${financialExposure}`
    };
  }

  /**
   * Fallback property explanation
   */
  generateFallbackPropertyExplanation(propertyData) {
    const reasons = [];
    
    if (propertyData.distanceMiles < 10) {
      reasons.push(`within ${propertyData.distanceMiles.toFixed(0)} miles of the disaster zone`);
    }
    
    if (propertyData.damageProbability > 0.6) {
      reasons.push('high wind exposure and potential flooding');
    }
    
    if (propertyData.propertyType === 'residential') {
      reasons.push('residential construction vulnerable to severe weather');
    }

    return `This property is at ${propertyData.riskTier} risk because it is ${reasons.join(', ')}. Expected damage probability is ${(propertyData.damageProbability * 100).toFixed(0)}%.`;
  }

  /**
   * Fallback recommendations
   */
  generateFallbackRecommendations(portfolioMetrics, riskDistribution) {
    return `Immediate Actions:
1. Activate emergency claims center with 24/7 staffing
2. Contact ${riskDistribution.critical.count} critical risk policyholders immediately
3. Pre-position adjusters in affected regions
4. Establish direct communication channels with local emergency services

Claims Team: Deploy ${Math.ceil((riskDistribution.critical.count + riskDistribution.high.count) / 50)} additional adjusters.

Customer Communication: Send proactive alerts to all at-risk policyholders with safety information and claims filing instructions.`;
  }
}

export default new AIInsightsService();