import express from 'express';
import propertyService from '../services/propertyService.js';
import parametricInsuranceService from '../services/parametricInsuranceService.js';
import flightInsuranceService from '../services/flightInsuranceService.js';
import disasterService from '../services/disasterService.js';

const router = express.Router();

/**
 * GET /api/dashboard/statistics
 * Get comprehensive dashboard statistics
 */
router.get('/statistics', async (req, res, next) => {
  try {
    // Get property portfolio statistics
    const properties = propertyService.generateMockPortfolio('florida', 5000);
    const propertyStats = propertyService.getPortfolioStatistics(properties);
    
    // Get active disasters count
    let activeDisastersCount = 0;
    let propertiesAtRisk = 0;
    let totalExposure = propertyStats.totalCoverage || 0;
    let expectedLoss = 0;
    let percentile99Loss = 0;
    
    try {
      const activeDisasters = await disasterService.getAllActiveDisasters();
      activeDisastersCount = Array.isArray(activeDisasters) ? activeDisasters.length : 0;
      
      // If there are active disasters, calculate risk metrics
      if (activeDisastersCount > 0) {
        // For now, estimate properties at risk based on active disasters
        // In a real scenario, this would run risk assessments
        propertiesAtRisk = Math.floor(properties.length * 0.1); // Estimate 10% at risk
        
        // Calculate expected loss (estimate: 1% of total exposure for active disasters)
        expectedLoss = totalExposure * 0.01;
        
        // Calculate 99th percentile loss (estimate: 10x expected loss)
        percentile99Loss = expectedLoss * 10;
      }
    } catch (error) {
      console.error('Error fetching disaster data:', error.message);
      // Continue with default values
    }
    
    // Get parametric insurance statistics
    const parametricStats = parametricInsuranceService.getStatistics();
    
    // Get flight insurance statistics
    const flightStats = flightInsuranceService.getStatistics();
    
    // Calculate total active policies
    const totalActivePolicies = parametricStats.policies.active + flightStats.policies.active;
    
    // Calculate total payouts
    const totalPendingPayouts = parametricStats.payouts.pending.totalAmount + flightStats.payouts.pending.totalAmount;
    const totalApprovedPayouts = parametricStats.payouts.approved.totalAmount + flightStats.payouts.approved.totalAmount;
    const totalRejectedPayouts = parametricStats.payouts.rejected.totalAmount + flightStats.payouts.rejected.totalAmount;
    
    // Calculate total claims (pending + approved + rejected)
    const totalClaims = 
      parametricStats.payouts.pending.count + 
      parametricStats.payouts.approved.count + 
      parametricStats.payouts.rejected.count +
      flightStats.payouts.pending.count + 
      flightStats.payouts.approved.count + 
      flightStats.payouts.rejected.count;
    
    res.json({
      success: true,
      statistics: {
        // Property Portfolio Metrics
        properties: {
          total: propertyStats.totalProperties,
          atRisk: propertiesAtRisk,
          totalValue: propertyStats.totalValue,
          totalExposure: totalExposure,
          averageValue: propertyStats.averageValue
        },
        // Disaster Metrics
        disasters: {
          active: activeDisastersCount,
          expectedLoss: parseFloat(expectedLoss.toFixed(2)),
          percentile99Loss: parseFloat(percentile99Loss.toFixed(2))
        },
        // Policy Metrics
        policies: {
          active: totalActivePolicies,
          parametric: {
            active: parametricStats.policies.active,
            pending: parametricStats.payouts.pending.count,
            approved: parametricStats.payouts.approved.count,
            rejected: parametricStats.payouts.rejected.count
          },
          flight: {
            active: flightStats.policies.active,
            pending: flightStats.payouts.pending.count,
            approved: flightStats.payouts.approved.count,
            rejected: flightStats.payouts.rejected.count
          }
        },
        // Payout Metrics
        payouts: {
          pending: {
            count: parametricStats.payouts.pending.count + flightStats.payouts.pending.count,
            totalAmount: parseFloat(totalPendingPayouts.toFixed(2))
          },
          approved: {
            count: parametricStats.payouts.approved.count + flightStats.payouts.approved.count,
            totalAmount: parseFloat(totalApprovedPayouts.toFixed(2))
          },
          rejected: {
            count: parametricStats.payouts.rejected.count + flightStats.payouts.rejected.count,
            totalAmount: parseFloat(totalRejectedPayouts.toFixed(2))
          }
        },
        // Claims Metrics
        claims: {
          total: totalClaims,
          active: parametricStats.payouts.pending.count + flightStats.payouts.pending.count
        },
        // Risk Assessments (estimate based on properties)
        riskAssessments: {
          total: propertyStats.totalProperties,
          completed: Math.floor(propertyStats.totalProperties * 0.6) // Estimate 60% completed
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    next(error);
  }
});

export default router;

