import satelliteWindService from './satelliteWindService.js';
import floodDetectionService from './floodDetectionService.js';

/**
 * Parametric Insurance Service
 * Manages trigger-based insurance policies with multi-source satellite verification
 * and admin approval workflow for payouts
 * Supports both wind speed and water level (flood) triggers
 */
class ParametricInsuranceService {
  constructor() {
    // In-memory storage (in production, use a database)
    this.policies = new Map();
    this.pendingPayouts = new Map();
    this.processedPayouts = new Map();
    this.payoutIdCounter = 1;

    console.log('💼 Parametric Insurance Service initialized');

    // Initialize with demo policy
    this.createDemoPolicy();
  }

  /**
   * Create a demo policy for testing
   */
  createDemoPolicy() {
    const demoPolicy = {
      id: 'POLICY-DEMO-001',
      propertyId: 'PROP-FL-001',
      holder: {
        name: 'Miami Beach Resort',
        email: 'insurance@miamibeachresort.com'
      },
      location: {
        lat: 25.7907,
        lon: -80.1300,
        address: 'Miami Beach, FL'
      },
      coverage: {
        amount: 500000,
        currency: 'USD',
        type: 'Hurricane Wind Damage'
      },
      triggers: [
        {
          type: 'wind_speed',
          threshold: 119, // km/h (Category 1 hurricane = 74+ mph = 119+ km/h)
          payout: 100000, // 20% of coverage
          description: 'Category 1 Hurricane winds'
        },
        {
          type: 'wind_speed',
          threshold: 154, // Category 2 hurricane
          payout: 250000, // 50% of coverage
          description: 'Category 2 Hurricane winds'
        },
        {
          type: 'wind_speed',
          threshold: 178, // Category 3 hurricane
          payout: 500000, // 100% of coverage
          description: 'Category 3+ Hurricane winds'
        }
      ],
      active: true,
      createdAt: new Date().toISOString()
    };

    this.policies.set(demoPolicy.id, demoPolicy);
    console.log(`   ✓ Created demo policy: ${demoPolicy.id}`);

    // Create a flood/water level demo policy
    const floodPolicy = {
      id: 'POLICY-FLOOD-001',
      propertyId: 'PROP-LA-001',
      holder: {
        name: 'New Orleans Riverside Property',
        email: 'property@neworleans.com'
      },
      location: {
        lat: 29.9511,
        lon: -90.0715,
        address: 'New Orleans, LA'
      },
      coverage: {
        amount: 750000,
        currency: 'USD',
        type: 'Flood Damage'
      },
      triggers: [
        {
          type: 'flood',
          threshold: 'moderate', // Risk level threshold
          payout: 150000,
          description: 'Moderate flood risk'
        },
        {
          type: 'flood',
          threshold: 'severe',
          payout: 400000,
          description: 'Severe flood risk'
        },
        {
          type: 'flood',
          threshold: 'critical',
          payout: 750000,
          description: 'Critical flood risk'
        }
      ],
      active: true,
      createdAt: new Date().toISOString()
    };

    this.policies.set(floodPolicy.id, floodPolicy);
    console.log(`   ✓ Created flood demo policy: ${floodPolicy.id}`);
  }

  /**
   * Create a test policy with LOW thresholds for testing the approval workflow
   * This will trigger with normal wind conditions
   */
  createTestPolicy() {
    const testPolicy = {
      id: 'POLICY-TEST-001',
      propertyId: 'PROP-FL-TEST',
      holder: {
        name: 'Test Property LLC',
        email: 'test@example.com'
      },
      location: {
        lat: 25.7907,
        lon: -80.1300,
        address: 'Miami Beach, FL (Test)'
      },
      coverage: {
        amount: 100000,
        currency: 'USD',
        type: 'Wind Damage Testing Policy'
      },
      triggers: [
        {
          type: 'wind_speed',
          threshold: 5, // Very low threshold - will trigger with ANY wind
          payout: 10000,
          description: 'TEST: Light breeze (5+ km/h)'
        },
        {
          type: 'wind_speed',
          threshold: 15, // Moderate wind
          payout: 25000,
          description: 'TEST: Moderate wind (15+ km/h)'
        },
        {
          type: 'wind_speed',
          threshold: 30, // Strong wind
          payout: 50000,
          description: 'TEST: Strong wind (30+ km/h)'
        }
      ],
      active: true,
      createdAt: new Date().toISOString()
    };

    this.policies.set(testPolicy.id, testPolicy);
    console.log(`   ✓ Created test policy: ${testPolicy.id} (LOW thresholds for testing)`);
    return testPolicy;
  }

  /**
   * Create a new parametric insurance policy
   */
  createPolicy(policyData) {
    const policy = {
      id: `POLICY-${Date.now()}`,
      ...policyData,
      active: true,
      createdAt: new Date().toISOString()
    };

    this.policies.set(policy.id, policy);
    return policy;
  }

  /**
   * Get all active policies
   */
  getAllPolicies() {
    return Array.from(this.policies.values());
  }

  /**
   * Get a specific policy by ID
   */
  getPolicy(policyId) {
    return this.policies.get(policyId);
  }

  /**
   * Evaluate triggers for a policy using multi-source satellite data
   * This is the core function that integrates satelliteWindService
   */
  async evaluateTriggers(policyId, eventContext = {}) {
    const policy = this.policies.get(policyId);

    if (!policy || !policy.active) {
      throw new Error('Policy not found or inactive');
    }

    console.log(`\n🔍 Evaluating triggers for policy: ${policyId}`);
    console.log(`   Location: ${policy.location.address}`);
    console.log(`   Coordinates: (${policy.location.lat}, ${policy.location.lon})`);

    const results = {
      policyId,
      evaluatedAt: new Date().toISOString(),
      triggersEvaluated: [],
      triggersActivated: [],
      pendingPayouts: []
    };

    // Evaluate each trigger
    for (const trigger of policy.triggers) {
      if (trigger.type === 'wind_speed') {
        try {
          // Get multi-source wind measurement
          console.log(`\n   📊 Checking trigger: ${trigger.description} (threshold: ${trigger.threshold} km/h)`);

          const windData = await satelliteWindService.getWindSpeed(
            policy.location.lat,
            policy.location.lon,
            new Date()
          );

          const evaluation = {
            trigger,
            windData,
            activated: false,
            reason: null
          };

          if (windData.consensus) {
            const actualWindSpeed = windData.consensus.windSpeed;
            const confidence = windData.consensus.confidence;

            console.log(`   💨 Measured wind: ${actualWindSpeed.toFixed(1)} km/h (confidence: ${confidence})`);
            console.log(`   🎯 Threshold: ${trigger.threshold} km/h`);

            // Trigger activated if wind speed exceeds threshold
            if (actualWindSpeed >= trigger.threshold) {
              evaluation.activated = true;
              evaluation.reason = `Wind speed ${actualWindSpeed.toFixed(1)} km/h exceeds threshold ${trigger.threshold} km/h`;

              console.log(`   ⚠️  TRIGGER ACTIVATED: ${evaluation.reason}`);

              // Create pending payout
              const payout = await this.createPendingPayout(
                policy,
                trigger,
                windData,
                eventContext
              );

              results.triggersActivated.push(evaluation);
              results.pendingPayouts.push(payout);
            } else {
              evaluation.reason = `Wind speed ${actualWindSpeed.toFixed(1)} km/h below threshold ${trigger.threshold} km/h`;
              console.log(`   ✓ Threshold not met`);
            }
          } else {
            evaluation.reason = 'No wind data available from sources';
            console.log(`   ⚠️  No consensus wind data available`);
          }

          results.triggersEvaluated.push(evaluation);

        } catch (error) {
          console.log(`   ✗ Error evaluating wind trigger: ${error.message}`);
          results.triggersEvaluated.push({
            trigger,
            error: error.message,
            activated: false
          });
        }
      } else if (trigger.type === 'flood') {
        try {
          // Get flood risk assessment
          console.log(`\n   📊 Checking trigger: ${trigger.description} (threshold: ${trigger.threshold} risk)`);

          const floodData = await floodDetectionService.getFloodRisk(
            policy.location.lat,
            policy.location.lon,
            new Date()
          );

          const evaluation = {
            trigger,
            floodData,
            activated: false,
            reason: null
          };

          if (floodData.assessment) {
            const riskLevel = floodData.assessment.riskLevel;
            const confidence = floodData.assessment.confidence;

            console.log(`   🌊 Flood risk: ${riskLevel.toUpperCase()} (confidence: ${confidence})`);
            console.log(`   🎯 Threshold: ${trigger.threshold.toUpperCase()} risk`);

            // Determine if trigger activates based on risk level hierarchy
            const riskHierarchy = ['low', 'minor', 'moderate', 'severe', 'critical'];
            const currentRiskIndex = riskHierarchy.indexOf(riskLevel);
            const thresholdIndex = riskHierarchy.indexOf(trigger.threshold);

            // Trigger activated if current risk meets or exceeds threshold
            if (currentRiskIndex >= thresholdIndex) {
              evaluation.activated = true;
              evaluation.reason = `Flood risk ${riskLevel} meets/exceeds threshold ${trigger.threshold}`;

              console.log(`   ⚠️  TRIGGER ACTIVATED: ${evaluation.reason}`);

              // Create pending payout
              const payout = await this.createPendingPayout(
                policy,
                trigger,
                floodData,
                eventContext
              );

              results.triggersActivated.push(evaluation);
              results.pendingPayouts.push(payout);
            } else {
              evaluation.reason = `Flood risk ${riskLevel} below threshold ${trigger.threshold}`;
              console.log(`   ✓ Threshold not met`);
            }
          } else {
            evaluation.reason = 'No flood data available from sources';
            console.log(`   ⚠️  No flood assessment available`);
          }

          results.triggersEvaluated.push(evaluation);

        } catch (error) {
          console.log(`   ✗ Error evaluating flood trigger: ${error.message}`);
          results.triggersEvaluated.push({
            trigger,
            error: error.message,
            activated: false
          });
        }
      }
    }

    console.log(`\n   📋 Evaluation complete:`);
    console.log(`   - Triggers evaluated: ${results.triggersEvaluated.length}`);
    console.log(`   - Triggers activated: ${results.triggersActivated.length}`);
    console.log(`   - Pending payouts: ${results.pendingPayouts.length}\n`);

    return results;
  }

  /**
   * Create a pending payout (requires admin approval)
   */
  async createPendingPayout(policy, trigger, windData, eventContext) {
    const payoutId = `PAYOUT-${this.payoutIdCounter++}`;

    const payout = {
      id: payoutId,
      policyId: policy.id,
      status: 'pending',
      amount: trigger.payout,
      currency: policy.coverage.currency,
      trigger: {
        type: trigger.type,
        threshold: trigger.threshold,
        description: trigger.description
      },
      evidence: {
        windData: {
          consensus: windData.consensus,
          sources: windData.sources.map(s => ({
            source: s.source,
            windSpeed: s.windSpeed,
            confidence: s.confidence,
            method: s.method,
            timestamp: s.timestamp
          })),
          timestamp: windData.timestamp
        },
        eventContext
      },
      holder: policy.holder,
      location: policy.location,
      createdAt: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null
    };

    this.pendingPayouts.set(payoutId, payout);

    console.log(`   💰 Created pending payout: ${payoutId}`);
    console.log(`   💵 Amount: ${payout.currency} ${payout.amount.toLocaleString()}`);
    console.log(`   👤 Holder: ${payout.holder.name}`);

    return payout;
  }

  /**
   * Get all pending payouts (awaiting admin approval)
   */
  getPendingPayouts() {
    return Array.from(this.pendingPayouts.values());
  }

  /**
   * Get all processed payouts (approved or rejected)
   */
  getProcessedPayouts() {
    return Array.from(this.processedPayouts.values());
  }

  /**
   * Get a specific payout by ID
   */
  getPayout(payoutId) {
    return this.pendingPayouts.get(payoutId) || this.processedPayouts.get(payoutId);
  }

  /**
   * Admin approves a payout
   */
  async approvePayout(payoutId, adminCredentials) {
    const payout = this.pendingPayouts.get(payoutId);

    if (!payout) {
      throw new Error('Payout not found or already processed');
    }

    if (payout.status !== 'pending') {
      throw new Error('Payout is not in pending state');
    }

    // Update payout status
    payout.status = 'approved';
    payout.approvedBy = adminCredentials.email;
    payout.approvedAt = new Date().toISOString();

    // Move from pending to processed
    this.pendingPayouts.delete(payoutId);
    this.processedPayouts.set(payoutId, payout);

    console.log(`\n✅ PAYOUT APPROVED`);
    console.log(`   ID: ${payoutId}`);
    console.log(`   Amount: ${payout.currency} ${payout.amount.toLocaleString()}`);
    console.log(`   Approved by: ${adminCredentials.email}`);
    console.log(`   Holder: ${payout.holder.name} (${payout.holder.email})\n`);

    return payout;
  }

  /**
   * Admin rejects a payout
   */
  async rejectPayout(payoutId, reason, adminCredentials) {
    const payout = this.pendingPayouts.get(payoutId);

    if (!payout) {
      throw new Error('Payout not found or already processed');
    }

    if (payout.status !== 'pending') {
      throw new Error('Payout is not in pending state');
    }

    // Update payout status
    payout.status = 'rejected';
    payout.rejectedBy = adminCredentials.email;
    payout.rejectedAt = new Date().toISOString();
    payout.rejectionReason = reason;

    // Move from pending to processed
    this.pendingPayouts.delete(payoutId);
    this.processedPayouts.set(payoutId, payout);

    console.log(`\n❌ PAYOUT REJECTED`);
    console.log(`   ID: ${payoutId}`);
    console.log(`   Amount: ${payout.currency} ${payout.amount.toLocaleString()}`);
    console.log(`   Rejected by: ${adminCredentials.email}`);
    console.log(`   Reason: ${reason}\n`);

    return payout;
  }

  /**
   * Get summary statistics
   */
  getStatistics() {
    const policies = Array.from(this.policies.values());
    const pending = Array.from(this.pendingPayouts.values());
    const processed = Array.from(this.processedPayouts.values());
    const approved = processed.filter(p => p.status === 'approved');
    const rejected = processed.filter(p => p.status === 'rejected');

    return {
      policies: {
        total: policies.length,
        active: policies.filter(p => p.active).length,
        inactive: policies.filter(p => !p.active).length
      },
      payouts: {
        pending: {
          count: pending.length,
          totalAmount: pending.reduce((sum, p) => sum + p.amount, 0)
        },
        approved: {
          count: approved.length,
          totalAmount: approved.reduce((sum, p) => sum + p.amount, 0)
        },
        rejected: {
          count: rejected.length,
          totalAmount: rejected.reduce((sum, p) => sum + p.amount, 0)
        }
      }
    };
  }
}

export default new ParametricInsuranceService();
