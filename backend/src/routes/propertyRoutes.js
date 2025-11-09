import express from 'express';
import propertyService from '../services/propertyService.js';

const router = express.Router();

/**
 * GET /api/properties/portfolio
 * Get mock property portfolio
 */
router.get('/portfolio', (req, res, next) => {
  try {
    const { region = 'florida', count = 100 } = req.query;
    const numProperties = Math.min(parseInt(count) || 100, 10000);

    const properties = propertyService.generateMockPortfolio(region, numProperties);
    const statistics = propertyService.getPortfolioStatistics(properties);

    res.json({
      success: true,
      count: properties.length,
      statistics,
      data: properties
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/properties/region
 * Get properties in specific region
 */
router.get('/region', (req, res, next) => {
  try {
    const { lat, lon, radius = 100 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'lat and lon are required'
      });
    }

    const centerLat = parseFloat(lat);
    const centerLon = parseFloat(lon);
    const radiusMiles = parseFloat(radius);

    const properties = propertyService.getPropertiesInRegion(
      centerLat,
      centerLon,
      radiusMiles
    );

    const statistics = propertyService.getPortfolioStatistics(properties);

    res.json({
      success: true,
      count: properties.length,
      query: { centerLat, centerLon, radiusMiles },
      statistics,
      data: properties
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/properties/high-value
 * Get high-value properties
 */
router.get('/high-value', (req, res, next) => {
  try {
    const { threshold = 1000000, region = 'florida' } = req.query;
    const properties = propertyService.generateMockPortfolio(region, 5000);
    const highValueProperties = propertyService.getHighValueProperties(
      properties,
      parseFloat(threshold)
    );

    res.json({
      success: true,
      count: highValueProperties.length,
      threshold: parseFloat(threshold),
      data: highValueProperties
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/properties/coastal
 * Get coastal properties
 */
router.get('/coastal', (req, res, next) => {
  try {
    const { maxDistance = 10, region = 'florida' } = req.query;
    const properties = propertyService.generateMockPortfolio(region, 5000);
    const coastalProperties = propertyService.getCoastalProperties(
      properties,
      parseFloat(maxDistance)
    );

    res.json({
      success: true,
      count: coastalProperties.length,
      maxDistanceMiles: parseFloat(maxDistance),
      data: coastalProperties
    });
  } catch (error) {
    next(error);
  }
});

export default router;