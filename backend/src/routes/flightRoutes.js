import express from 'express';
import flightDelayService from '../services/flightDelayService.js';
import flightInsuranceService from '../services/flightInsuranceService.js';

const router = express.Router();

/**
 * GET /api/flight/delays
 * Get real-time delay predictions for all airports
 */
router.get('/delays', async (req, res) => {
  try {
    const delays = await flightDelayService.getAllAirportDelays();
    res.json({
      success: true,
      data: delays
    });
  } catch (error) {
    console.error('Error fetching airport delays:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/flight/delays/:airportCode
 * Get delay prediction for a specific airport
 */
router.get('/delays/:airportCode', async (req, res) => {
  try {
    const { airportCode } = req.params;
    const airport = flightDelayService.airports.find(
      a => a.code === airportCode.toUpperCase()
    );

    if (!airport) {
      return res.status(404).json({
        success: false,
        error: 'Airport not found'
      });
    }

    const delay = await flightDelayService.getAirportDelay(airport);
    res.json({
      success: true,
      data: delay
    });
  } catch (error) {
    console.error('Error fetching airport delay:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/flight/policies
 * Get all flight insurance policies
 */
router.get('/policies', async (req, res) => {
  try {
    const policies = flightInsuranceService.getAllPolicies();
    res.json({
      success: true,
      count: policies.length,
      policies
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/flight/policies/:policyId
 * Get a specific policy
 */
router.get('/policies/:policyId', async (req, res) => {
  try {
    const policy = flightInsuranceService.getPolicy(req.params.policyId);

    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }

    res.json({
      success: true,
      policy
    });
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/flight/policies
 * Create a new flight insurance policy
 */
router.post('/policies', async (req, res) => {
  try {
    const policy = flightInsuranceService.createPolicy(req.body);
    res.status(201).json({
      success: true,
      policy
    });
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/flight/evaluate
 * Evaluate all active policies against current delays
 */
router.post('/evaluate', async (req, res) => {
  try {
    const results = await flightInsuranceService.evaluateAllPolicies();
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error evaluating policies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/flight/evaluate/:policyId
 * Evaluate a specific policy
 */
router.post('/evaluate/:policyId', async (req, res) => {
  try {
    const policy = flightInsuranceService.getPolicy(req.params.policyId);

    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }

    const result = await flightInsuranceService.evaluatePolicy(policy);
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error evaluating policy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/flight/payouts/pending
 * Get all pending payouts
 */
router.get('/payouts/pending', async (req, res) => {
  try {
    const payouts = flightInsuranceService.getPendingPayouts();
    res.json({
      success: true,
      count: payouts.length,
      payouts
    });
  } catch (error) {
    console.error('Error fetching pending payouts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/flight/payouts/processed
 * Get all processed payouts
 */
router.get('/payouts/processed', async (req, res) => {
  try {
    const payouts = flightInsuranceService.getProcessedPayouts();
    res.json({
      success: true,
      count: payouts.length,
      payouts
    });
  } catch (error) {
    console.error('Error fetching processed payouts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/flight/payouts/:payoutId
 * Get a specific payout
 */
router.get('/payouts/:payoutId', async (req, res) => {
  try {
    const payout = flightInsuranceService.getPayout(req.params.payoutId);

    if (!payout) {
      return res.status(404).json({
        success: false,
        error: 'Payout not found'
      });
    }

    res.json({
      success: true,
      payout
    });
  } catch (error) {
    console.error('Error fetching payout:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/flight/payouts/:payoutId/approve
 * Approve a pending payout
 */
router.post('/payouts/:payoutId/approve', async (req, res) => {
  try {
    const { payoutId } = req.params;
    const { adminEmail, adminPassword } = req.body;

    if (!adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        error: 'Admin credentials required'
      });
    }

    const adminCredentials = { email: adminEmail };
    const payout = await flightInsuranceService.approvePayout(payoutId, adminCredentials);

    res.json({
      success: true,
      message: 'Payout approved successfully',
      payout
    });
  } catch (error) {
    console.error('Error approving payout:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/flight/payouts/:payoutId/reject
 * Reject a pending payout
 */
router.post('/payouts/:payoutId/reject', async (req, res) => {
  try {
    const { payoutId } = req.params;
    const { adminEmail, adminPassword, reason } = req.body;

    if (!adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        error: 'Admin credentials required'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason required'
      });
    }

    const adminCredentials = { email: adminEmail };
    const payout = await flightInsuranceService.rejectPayout(payoutId, reason, adminCredentials);

    res.json({
      success: true,
      message: 'Payout rejected successfully',
      payout
    });
  } catch (error) {
    console.error('Error rejecting payout:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/flight/statistics
 * Get system statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = flightInsuranceService.getStatistics();
    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
