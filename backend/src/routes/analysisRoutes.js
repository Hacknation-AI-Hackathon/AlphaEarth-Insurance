import express from 'express';
import disasterService from '../services/disasterService.js';
import propertyService from '../services/propertyService.js';
import riskService from '../services/riskService.js';
import aiService from '../services/aiService.js';
import earthquakeService from '../services/earthquakeService.js';
import severeWeatherService from '../services/severeWeatherService.js';

const router = express.Router();

/**
 * POST /api/analysis/hurricane
 * Run complete hurricane impact analysis
 */
router.post('/hurricane', async (req, res, next) => {
  try {
    const { stormId, region = 'florida', numProperties = 5000 } = req.body;

    if (!stormId) {
      return res.status(400).json({
        success: false,
        error: 'stormId is required'
      });
    }

    console.log(`Starting hurricane analysis for ${stormId}...`);

    // Step 1: Get hurricane data
    const hurricaneData = await disasterService.getHurricaneForecast(stormId);
    const hurricaneInfo = await disasterService.getActiveHurricanes()
      .then(hurricanes => hurricanes.find(h => h.id === stormId));

    // Step 2: Get property portfolio
    const properties = propertyService.getPropertiesInRegion(
      hurricaneData.center.lat,
      hurricaneData.center.lon,
      150 // 150 mile radius
    );

    console.log(`Analyzing ${properties.length} properties...`);

    // Step 3: Assess risk for each property
    const riskAssessments = riskService.assessHurricaneRisk(properties, hurricaneData);

    // Step 4: Calculate portfolio metrics
    const portfolioMetrics = riskService.calculatePortfolioMetrics(riskAssessments);
    const riskDistribution = riskService.calculateRiskDistribution(riskAssessments);

    // Step 5: Run Monte Carlo simulation
    const monteCarloResults = riskService.runMonteCarloSimulation(riskAssessments, 1000);

    // Step 6: Get top risk properties
    const topRiskProperties = riskAssessments
      .sort((a, b) => b.expectedLoss - a.expectedLoss)
      .slice(0, 10);

    // Step 7: Generate AI insights (optional - can be slow)
    let aiSummary = null;
    try {
      if (process.env.ANTHROPIC_API_KEY) {
        aiSummary = await aiService.generateExecutiveSummary(
          hurricaneInfo,
          portfolioMetrics,
          riskDistribution,
          topRiskProperties.slice(0, 5)
        );
      }
    } catch (error) {
      console.error('AI summary generation failed:', error.message);
    }

    console.log(`Analysis complete. Expected loss: $${(portfolioMetrics.expectedLoss / 1e6).toFixed(1)}M`);

    res.json({
      success: true,
      data: {
        disaster: hurricaneInfo,
        hurricaneData,
        portfolioMetrics,
        riskDistribution,
        monteCarloResults,
        topRiskProperties: topRiskProperties.slice(0, 10),
        aiSummary,
        riskAssessments: riskAssessments.slice(0, 100), // Return first 100 for performance
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/analysis/wildfire
 * Run complete wildfire impact analysis
 */
router.post('/wildfire', async (req, res, next) => {
  try {
    const { fireId, region = 'california', numProperties = 5000 } = req.body;

    if (!fireId) {
      return res.status(400).json({
        success: false,
        error: 'fireId is required'
      });
    }

    console.log(`Starting wildfire analysis for ${fireId}...`);

    // Step 1: Get wildfire data
    const wildfireData = await disasterService.getWildfirePerimeter(fireId);
    const wildfireInfo = await disasterService.getActiveWildfires()
      .then(fires => fires.find(f => f.id === fireId));

    // Step 2: Get property portfolio
    const properties = propertyService.getPropertiesInRegion(
      wildfireData.center.lat,
      wildfireData.center.lon,
      50 // 50 mile radius
    );

    console.log(`Analyzing ${properties.length} properties...`);

    // Step 3: Assess risk for each property
    const riskAssessments = riskService.assessWildfireRisk(properties, wildfireData);

    // Step 4: Calculate portfolio metrics
    const portfolioMetrics = riskService.calculatePortfolioMetrics(riskAssessments);
    const riskDistribution = riskService.calculateRiskDistribution(riskAssessments);

    // Step 5: Run Monte Carlo simulation
    const monteCarloResults = riskService.runMonteCarloSimulation(riskAssessments, 1000);

    // Step 6: Get top risk properties
    const topRiskProperties = riskAssessments
      .sort((a, b) => b.expectedLoss - a.expectedLoss)
      .slice(0, 10);

    // Step 7: Generate AI insights
    let aiSummary = null;
    try {
      if (process.env.ANTHROPIC_API_KEY) {
        aiSummary = await aiService.generateExecutiveSummary(
          wildfireInfo,
          portfolioMetrics,
          riskDistribution,
          topRiskProperties.slice(0, 5)
        );
      }
    } catch (error) {
      console.error('AI summary generation failed:', error.message);
    }

    console.log(`Analysis complete. Expected loss: $${(portfolioMetrics.expectedLoss / 1e6).toFixed(1)}M`);

    res.json({
      success: true,
      data: {
        disaster: wildfireInfo,
        wildfireData,
        portfolioMetrics,
        riskDistribution,
        monteCarloResults,
        topRiskProperties: topRiskProperties.slice(0, 10),
        aiSummary,
        riskAssessments: riskAssessments.slice(0, 100),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/analysis/scenario
 * Run worst-case scenario simulation
 */
router.post('/scenario', async (req, res, next) => {
  try {
    const { 
      disasterType, 
      disasterId, 
      scenarioModifier = 'cat_5',
      region = 'florida' 
    } = req.body;

    if (!disasterType || !disasterId) {
      return res.status(400).json({
        success: false,
        error: 'disasterType and disasterId are required'
      });
    }

    console.log(`Running ${scenarioModifier} scenario for ${disasterId}...`);

    let disasterData, properties, riskAssessments;

    if (disasterType === 'hurricane') {
      disasterData = await disasterService.getHurricaneForecast(disasterId);
      
      // Modify hurricane to worst case (Cat 5)
      disasterData.maxWindSpeed = 160; // mph
      disasterData.windRadii = {
        cat_5: 50,
        cat_4: 75,
        cat_3: 100,
        cat_2: 125,
        cat_1: 150,
        tropical_storm: 200
      };

      properties = propertyService.getPropertiesInRegion(
        disasterData.center.lat,
        disasterData.center.lon,
        200
      );

      riskAssessments = riskService.assessHurricaneRisk(properties, disasterData);
    } else if (disasterType === 'wildfire') {
      disasterData = await disasterService.getWildfirePerimeter(disasterId);
      
      // Modify wildfire to worst case
      disasterData.windSpeed = 35; // mph - extreme fire weather
      disasterData.acres = disasterData.acres * 2; // Double the size

      properties = propertyService.getPropertiesInRegion(
        disasterData.center.lat,
        disasterData.center.lon,
        75
      );

      riskAssessments = riskService.assessWildfireRisk(properties, disasterData);
    }

    const portfolioMetrics = riskService.calculatePortfolioMetrics(riskAssessments);
    const riskDistribution = riskService.calculateRiskDistribution(riskAssessments);
    const monteCarloResults = riskService.runMonteCarloSimulation(riskAssessments, 1000);

    console.log(`Scenario analysis complete. Expected loss: $${(portfolioMetrics.expectedLoss / 1e6).toFixed(1)}M`);

    res.json({
      success: true,
      data: {
        scenarioType: scenarioModifier,
        portfolioMetrics,
        riskDistribution,
        monteCarloResults,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/analysis/property-risk
 * Get detailed risk explanation for specific property
 */
router.post('/property-risk', async (req, res, next) => {
  try {
    const { propertyId, riskAssessment } = req.body;

    if (!propertyId || !riskAssessment) {
      return res.status(400).json({
        success: false,
        error: 'propertyId and riskAssessment are required'
      });
    }

    let explanation = null;
    try {
      if (process.env.ANTHROPIC_API_KEY) {
        explanation = await aiService.explainPropertyRisk(riskAssessment);
      }
    } catch (error) {
      console.error('Property risk explanation failed:', error.message);
    }

    res.json({
      success: true,
      data: {
        propertyId,
        explanation,
        riskAssessment
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/analysis/earthquake
 * Run complete earthquake impact analysis
 */
router.post('/earthquake', async (req, res, next) => {
  try {
    const { earthquakeId, region = 'california', radius = 100 } = req.body;

    if (!earthquakeId) {
      return res.status(400).json({
        success: false,
        error: 'earthquakeId is required'
      });
    }

    console.log(`Starting earthquake analysis for ${earthquakeId}...`);

    // Step 1: Get earthquake data
    const earthquakes = await earthquakeService.getActiveEarthquakes(4.5, 'week');
    const earthquakeInfo = earthquakes.find(eq => eq.id === earthquakeId);

    if (!earthquakeInfo) {
      return res.status(404).json({
        success: false,
        error: 'Earthquake not found'
      });
    }

    // Step 2: Get impact zone
    const impactZone = earthquakeService.getEarthquakeImpactZone(
      earthquakeInfo.magnitude,
      earthquakeInfo.depth,
      earthquakeInfo.coordinates.lat,
      earthquakeInfo.coordinates.lon
    );

    // Step 3: Get property portfolio
    const properties = propertyService.getPropertiesInRegion(
      earthquakeInfo.coordinates.lat,
      earthquakeInfo.coordinates.lon,
      radius
    );

    console.log(`Analyzing ${properties.length} properties...`);

    // Step 4: Assess risk for each property
    const riskAssessments = riskService.assessEarthquakeRisk(properties, earthquakeInfo);

    // Step 5: Calculate portfolio metrics
    const portfolioMetrics = riskService.calculatePortfolioMetrics(riskAssessments);
    const riskDistribution = riskService.calculateRiskDistribution(riskAssessments);

    // Step 6: Run Monte Carlo simulation
    const monteCarloResults = riskService.runMonteCarloSimulation(riskAssessments, 1000);

    // Step 7: Get top risk properties
    const topRiskProperties = riskAssessments
      .sort((a, b) => b.expectedLoss - a.expectedLoss)
      .slice(0, 10);

    // Step 8: Generate AI insights
    let aiSummary = null;
    try {
      if (process.env.ANTHROPIC_API_KEY) {
        aiSummary = await aiService.generateExecutiveSummary(
          earthquakeInfo,
          portfolioMetrics,
          riskDistribution,
          topRiskProperties.slice(0, 5)
        );
      }
    } catch (error) {
      console.error('AI summary generation failed:', error.message);
    }

    console.log(`Analysis complete. Expected loss: $${(portfolioMetrics.expectedLoss / 1e6).toFixed(1)}M`);

    res.json({
      success: true,
      data: {
        disaster: earthquakeInfo,
        impactZone,
        portfolioMetrics,
        riskDistribution,
        monteCarloResults,
        topRiskProperties: topRiskProperties.slice(0, 10),
        aiSummary,
        riskAssessments: riskAssessments.slice(0, 100),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/analysis/severe-weather
 * Run complete severe weather impact analysis
 */
router.post('/severe-weather', async (req, res, next) => {
  try {
    const { alertId, region = 'southeast', radius = 75 } = req.body;

    if (!alertId) {
      return res.status(400).json({
        success: false,
        error: 'alertId is required'
      });
    }

    console.log(`Starting severe weather analysis for ${alertId}...`);

    // Step 1: Get severe weather alert data
    const alerts = await severeWeatherService.getActiveSevereWeatherAlerts();
    const alertInfo = alerts.find(a => a.id === alertId);

    if (!alertInfo) {
      return res.status(404).json({
        success: false,
        error: 'Severe weather alert not found'
      });
    }

    // Step 2: Get property portfolio
    let properties;
    if (alertInfo.coordinates) {
      properties = propertyService.getPropertiesInRegion(
        alertInfo.coordinates.lat,
        alertInfo.coordinates.lon,
        radius
      );
    } else {
      // If no coordinates, use default region
      properties = propertyService.generateMockProperties(1000);
    }

    console.log(`Analyzing ${properties.length} properties...`);

    // Step 3: Assess risk for each property
    const riskAssessments = riskService.assessSevereWeatherRisk(properties, alertInfo);

    // Step 4: Calculate portfolio metrics
    const portfolioMetrics = riskService.calculatePortfolioMetrics(riskAssessments);
    const riskDistribution = riskService.calculateRiskDistribution(riskAssessments);

    // Step 5: Run Monte Carlo simulation
    const monteCarloResults = riskService.runMonteCarloSimulation(riskAssessments, 1000);

    // Step 6: Get top risk properties
    const topRiskProperties = riskAssessments
      .sort((a, b) => b.expectedLoss - a.expectedLoss)
      .slice(0, 10);

    // Step 7: Generate AI insights
    let aiSummary = null;
    try {
      if (process.env.ANTHROPIC_API_KEY) {
        aiSummary = await aiService.generateExecutiveSummary(
          alertInfo,
          portfolioMetrics,
          riskDistribution,
          topRiskProperties.slice(0, 5)
        );
      }
    } catch (error) {
      console.error('AI summary generation failed:', error.message);
    }

    console.log(`Analysis complete. Expected loss: $${(portfolioMetrics.expectedLoss / 1e6).toFixed(1)}M`);

    res.json({
      success: true,
      data: {
        disaster: alertInfo,
        portfolioMetrics,
        riskDistribution,
        monteCarloResults,
        topRiskProperties: topRiskProperties.slice(0, 10),
        aiSummary,
        riskAssessments: riskAssessments.slice(0, 100),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;