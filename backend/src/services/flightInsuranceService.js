import flightDelayService from './flightDelayService.js';

/**
 * Flight Delay Insurance Service
 * Manages micro-insurance policies for flight delays with automatic payouts
 */
class FlightInsuranceService {
  constructor() {
    this.policies = new Map();
    this.pendingPayouts = new Map();
    this.processedPayouts = new Map();
    this.payoutIdCounter = 1;

    console.log('✈️  Flight Delay Insurance Service initialized');

    // Initialize with demo policies
    this.createDemoPolicies();
  }

  /**
   * Create demo flight insurance policies
   */
  createDemoPolicies() {
    const demoPolicies = [
      {
        id: 'FLIGHT-POLICY-001',
        holder: {
          name: 'John Smith',
          email: 'john.smith@example.com',
          confirmationNumber: 'ABC123'
        },
        flight: {
          number: 'AA1234',
          airline: 'American Airlines',
          from: 'JFK',
          to: 'LAX',
          departureTime: '2025-11-09T10:00:00Z'
        },
        coverage: {
          amount: 500,
          currency: 'USD',
          type: 'Flight Delay Micro-Insurance'
        },
        triggers: [
          {
            type: 'delay',
            threshold: 30, // 30 minutes
            payout: 50,
            description: '30+ minute delay'
          },
          {
            type: 'delay',
            threshold: 60, // 1 hour
            payout: 150,
            description: '1+ hour delay'
          },
          {
            type: 'delay',
            threshold: 120, // 2 hours
            payout: 300,
            description: '2+ hour delay'
          },
          {
            type: 'delay',
            threshold: 180, // 3 hours
            payout: 500,
            description: '3+ hour delay'
          }
        ],
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'FLIGHT-POLICY-002',
        holder: {
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          confirmationNumber: 'DEF456'
        },
        flight: {
          number: 'DL567',
          airline: 'Delta',
          from: 'ATL',
          to: 'SFO',
          departureTime: '2025-11-09T14:30:00Z'
        },
        coverage: {
          amount: 400,
          currency: 'USD',
          type: 'Flight Delay Micro-Insurance'
        },
        triggers: [
          {
            type: 'delay',
            threshold: 45,
            payout: 100,
            description: '45+ minute delay'
          },
          {
            type: 'delay',
            threshold: 90,
            payout: 250,
            description: '90+ minute delay'
          },
          {
            type: 'delay',
            threshold: 180,
            payout: 400,
            description: '3+ hour delay'
          }
        ],
        active: true,
        createdAt: new Date().toISOString()
      }
    ];

    demoPolicies.forEach(policy => {
      this.policies.set(policy.id, policy);
    });

    console.log(`   ✓ Created ${demoPolicies.length} demo flight insurance policies`);
  }

  /**
   * Create a new flight insurance policy
   */
  createPolicy(policyData) {
    const policy = {
      id: `FLIGHT-POLICY-${Date.now()}`,
      ...policyData,
      active: true,
      createdAt: new Date().toISOString()
    };

    this.policies.set(policy.id, policy);
    return policy;
  }

  /**
   * Get all policies
   */
  getAllPolicies() {
    return Array.from(this.policies.values());
  }

  /**
   * Get policy by ID
   */
  getPolicy(policyId) {
    return this.policies.get(policyId);
  }

  /**
   * Evaluate all active policies against current airport delays
   */
  async evaluateAllPolicies() {
    console.log('\n✈️  Evaluating all active flight insurance policies...');

    const policies = Array.from(this.policies.values()).filter(p => p.active);
    const airportDelays = await flightDelayService.getAllAirportDelays();

    const results = {
      evaluatedAt: new Date().toISOString(),
      policiesEvaluated: policies.length,
      triggersActivated: 0,
      payoutsCreated: 0,
      policies: []
    };

    for (const policy of policies) {
      const policyResult = await this.evaluatePolicy(policy, airportDelays);
      results.policies.push(policyResult);

      if (policyResult.triggered) {
        results.triggersActivated++;
        results.payoutsCreated += policyResult.payoutsCreated;
      }
    }

    console.log(`\n   📊 Evaluation complete:`);
    console.log(`   - Policies evaluated: ${results.policiesEvaluated}`);
    console.log(`   - Triggers activated: ${results.triggersActivated}`);
    console.log(`   - Payouts created: ${results.payoutsCreated}\n`);

    return results;
  }

  /**
   * Evaluate a single policy
   */
  async evaluatePolicy(policy, airportDelaysData = null) {
    console.log(`\n   🔍 Evaluating policy ${policy.id} for flight ${policy.flight.number}`);

    // Get delay for departure airport
    let airportDelays = airportDelaysData;
    if (!airportDelays) {
      airportDelays = await flightDelayService.getAllAirportDelays();
    }

    const departureAirport = airportDelays.airports.find(
      a => a.airport.code === policy.flight.from
    );

    if (!departureAirport) {
      console.log(`   ⚠️  No delay data for ${policy.flight.from}`);
      return {
        policyId: policy.id,
        triggered: false,
        reason: 'No delay data available'
      };
    }

    const delayMinutes = departureAirport.delayMinutes;
    console.log(`   🕐 Current delay at ${policy.flight.from}: ${delayMinutes} minutes`);
    console.log(`   📍 Reason: ${departureAirport.delayReason}`);

    // Check which triggers are activated
    const activatedTriggers = policy.triggers.filter(
      trigger => delayMinutes >= trigger.threshold
    ).sort((a, b) => b.payout - a.payout); // Highest payout first

    const result = {
      policyId: policy.id,
      flight: policy.flight,
      delayMinutes,
      delayReason: departureAirport.delayReason,
      triggered: activatedTriggers.length > 0,
      activatedTriggers,
      payoutsCreated: 0
    };

    if (activatedTriggers.length > 0) {
      // Take the highest payout trigger only
      const topTrigger = activatedTriggers[0];

      console.log(`   ⚠️  TRIGGER ACTIVATED: ${topTrigger.description}`);
      console.log(`   💰 Payout amount: $${topTrigger.payout}`);

      // Create payout
      const payout = await this.createPendingPayout(
        policy,
        topTrigger,
        {
          delayMinutes,
          delayReason: departureAirport.delayReason,
          delayCategory: departureAirport.delayCategory,
          weather: departureAirport.weather,
          alerts: departureAirport.alerts,
          airport: departureAirport.airport
        }
      );

      result.payout = payout;
      result.payoutsCreated = 1;
    } else {
      console.log(`   ✓ No triggers activated (delay below thresholds)`);
    }

    return result;
  }

  /**
   * Create a pending payout
   */
  async createPendingPayout(policy, trigger, delayData) {
    const payoutId = `FLIGHT-PAYOUT-${this.payoutIdCounter++}`;

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
        delayData,
        evaluatedAt: new Date().toISOString()
      },
      holder: policy.holder,
      flight: policy.flight,
      createdAt: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null
    };

    this.pendingPayouts.set(payoutId, payout);

    console.log(`   💰 Created pending payout: ${payoutId}`);
    console.log(`   💵 Amount: ${payout.currency} ${payout.amount}`);

    return payout;
  }

  /**
   * Get all pending payouts
   */
  getPendingPayouts() {
    return Array.from(this.pendingPayouts.values());
  }

  /**
   * Get all processed payouts
   */
  getProcessedPayouts() {
    return Array.from(this.processedPayouts.values());
  }

  /**
   * Get payout by ID
   */
  getPayout(payoutId) {
    return this.pendingPayouts.get(payoutId) || this.processedPayouts.get(payoutId);
  }

  /**
   * Approve a payout
   */
  async approvePayout(payoutId, adminCredentials) {
    const payout = this.pendingPayouts.get(payoutId);

    if (!payout) {
      throw new Error('Payout not found or already processed');
    }

    payout.status = 'approved';
    payout.approvedBy = adminCredentials.email;
    payout.approvedAt = new Date().toISOString();

    this.pendingPayouts.delete(payoutId);
    this.processedPayouts.set(payoutId, payout);

    console.log(`\n✅ FLIGHT PAYOUT APPROVED`);
    console.log(`   ID: ${payoutId}`);
    console.log(`   Flight: ${payout.flight.number} (${payout.flight.from} → ${payout.flight.to})`);
    console.log(`   Amount: ${payout.currency} ${payout.amount}`);
    console.log(`   Approved by: ${adminCredentials.email}\n`);

    return payout;
  }

  /**
   * Reject a payout
   */
  async rejectPayout(payoutId, reason, adminCredentials) {
    const payout = this.pendingPayouts.get(payoutId);

    if (!payout) {
      throw new Error('Payout not found or already processed');
    }

    payout.status = 'rejected';
    payout.rejectedBy = adminCredentials.email;
    payout.rejectedAt = new Date().toISOString();
    payout.rejectionReason = reason;

    this.pendingPayouts.delete(payoutId);
    this.processedPayouts.set(payoutId, payout);

    console.log(`\n❌ FLIGHT PAYOUT REJECTED`);
    console.log(`   ID: ${payoutId}`);
    console.log(`   Rejected by: ${adminCredentials.email}`);
    console.log(`   Reason: ${reason}\n`);

    return payout;
  }

  /**
   * Get statistics
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

export default new FlightInsuranceService();
