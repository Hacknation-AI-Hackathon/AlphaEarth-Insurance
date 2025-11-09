import express from 'express';
import parametricInsuranceService from '../services/parametricInsuranceService.js';

const router = express.Router();

/**
 * GET /api/parametric/policies
 * Get all parametric insurance policies
 */
router.get('/policies', async (req, res) => {
  try {
    const policies = parametricInsuranceService.getAllPolicies();
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
 * GET /api/parametric/policies/:policyId
 * Get a specific policy by ID
 */
router.get('/policies/:policyId', async (req, res) => {
  try {
    const policy = parametricInsuranceService.getPolicy(req.params.policyId);

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
 * POST /api/parametric/policies
 * Create a new parametric insurance policy
 */
router.post('/policies', async (req, res) => {
  try {
    const policy = parametricInsuranceService.createPolicy(req.body);
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
 * POST /api/parametric/evaluate/:policyId
 * Evaluate triggers for a policy using multi-source satellite data
 * Supports both wind speed triggers (satelliteWindService) and flood triggers (floodDetectionService)
 * for comprehensive parametric insurance coverage
 */
router.post('/evaluate/:policyId', async (req, res) => {
  try {
    const { policyId } = req.params;
    const eventContext = req.body.eventContext || {};

    const results = await parametricInsuranceService.evaluateTriggers(
      policyId,
      eventContext
    );

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error evaluating triggers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/parametric/payouts/pending
 * Get all pending payouts awaiting admin approval
 */
router.get('/payouts/pending', async (req, res) => {
  try {
    const payouts = parametricInsuranceService.getPendingPayouts();
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
 * GET /api/parametric/payouts/processed
 * Get all processed payouts (approved or rejected)
 */
router.get('/payouts/processed', async (req, res) => {
  try {
    const payouts = parametricInsuranceService.getProcessedPayouts();
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
 * GET /api/parametric/payouts/:payoutId
 * Get a specific payout by ID
 */
router.get('/payouts/:payoutId', async (req, res) => {
  try {
    const payout = parametricInsuranceService.getPayout(req.params.payoutId);

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
 * POST /api/parametric/payouts/:payoutId/approve
 * Admin approves a pending payout
 *
 * Body:
 * {
 *   "adminEmail": "admin@example.com",
 *   "adminPassword": "password"
 * }
 */
router.post('/payouts/:payoutId/approve', async (req, res) => {
  try {
    const { payoutId } = req.params;
    const { adminEmail, adminPassword } = req.body;

    // Simplified admin validation (in production, use proper auth)
    if (!adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        error: 'Admin credentials required'
      });
    }

    const adminCredentials = {
      email: adminEmail,
      // In production, validate password against secure hash
    };

    const payout = await parametricInsuranceService.approvePayout(
      payoutId,
      adminCredentials
    );

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
 * POST /api/parametric/payouts/:payoutId/reject
 * Admin rejects a pending payout
 *
 * Body:
 * {
 *   "adminEmail": "admin@example.com",
 *   "adminPassword": "password",
 *   "reason": "Insufficient evidence"
 * }
 */
router.post('/payouts/:payoutId/reject', async (req, res) => {
  try {
    const { payoutId } = req.params;
    const { adminEmail, adminPassword, reason } = req.body;

    // Simplified admin validation (in production, use proper auth)
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

    const adminCredentials = {
      email: adminEmail,
      // In production, validate password against secure hash
    };

    const payout = await parametricInsuranceService.rejectPayout(
      payoutId,
      reason,
      adminCredentials
    );

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
 * GET /api/parametric/statistics
 * Get summary statistics for parametric insurance system
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = parametricInsuranceService.getStatistics();
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

/**
 * POST /api/parametric/create-test-policy
 * Create a test policy with LOW thresholds that will trigger immediately
 * This allows testing the approval workflow without waiting for a hurricane
 */
router.post('/create-test-policy', async (req, res) => {
  try {
    const testPolicy = parametricInsuranceService.createTestPolicy();
    res.json({
      success: true,
      message: 'Test policy created with low wind thresholds',
      policy: testPolicy
    });
  } catch (error) {
    console.error('Error creating test policy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
