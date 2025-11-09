import express from 'express';
import riskService from '../services/riskService.js';

const router = express.Router();

/**
 * POST /api/risk/monte-carlo
 * Run Monte Carlo simulation on risk assessments
 */
router.post('/monte-carlo', (req, res, next) => {
  try {
    const { riskAssessments, numSimulations = 1000 } = req.body;

    if (!riskAssessments || !Array.isArray(riskAssessments)) {
      return res.status(400).json({
        success: false,
        error: 'riskAssessments array is required'
      });
    }

    const results = riskService.runMonteCarloSimulation(
      riskAssessments,
      parseInt(numSimulations)
    );

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/risk/portfolio-metrics
 * Calculate portfolio-level metrics
 */
router.post('/portfolio-metrics', (req, res, next) => {
  try {
    const { riskAssessments } = req.body;

    if (!riskAssessments || !Array.isArray(riskAssessments)) {
      return res.status(400).json({
        success: false,
        error: 'riskAssessments array is required'
      });
    }

    const metrics = riskService.calculatePortfolioMetrics(riskAssessments);
    const distribution = riskService.calculateRiskDistribution(riskAssessments);

    res.json({
      success: true,
      data: {
        metrics,
        distribution
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;