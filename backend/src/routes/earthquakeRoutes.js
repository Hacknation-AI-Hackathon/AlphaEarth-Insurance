import express from 'express';
import earthquakeService from '../services/earthquakeService.js';

const router = express.Router();

/**
 * GET /api/earthquakes/active
 * Get active earthquakes (4.5+ magnitude, past week by default)
 */
router.get('/active', async (req, res, next) => {
  try {
    const { magnitude = 4.5, timeframe = 'week' } = req.query;
    const earthquakes = await earthquakeService.getActiveEarthquakes(
      parseFloat(magnitude),
      timeframe
    );

    res.json({
      success: true,
      count: earthquakes.length,
      data: earthquakes,
      metadata: {
        usingMockData: earthquakeService.usingMockEarthquakes,
        magnitude: parseFloat(magnitude),
        timeframe
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/earthquakes/significant
 * Get significant earthquakes (any magnitude)
 */
router.get('/significant', async (req, res, next) => {
  try {
    const earthquakes = await earthquakeService.getSignificantEarthquakes();

    res.json({
      success: true,
      count: earthquakes.length,
      data: earthquakes
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/earthquakes/:earthquakeId/impact
 * Get earthquake impact zone
 */
router.get('/:earthquakeId/impact', async (req, res, next) => {
  try {
    const { earthquakeId } = req.params;
    const { magnitude = 4.5, timeframe = 'week' } = req.query;

    // Get earthquakes and find the specific one
    const earthquakes = await earthquakeService.getActiveEarthquakes(
      parseFloat(magnitude),
      timeframe
    );

    const earthquake = earthquakes.find(eq => eq.id === earthquakeId);

    if (!earthquake) {
      return res.status(404).json({
        success: false,
        error: 'Earthquake not found'
      });
    }

    const impactZone = earthquakeService.getEarthquakeImpactZone(
      earthquake.magnitude,
      earthquake.depth,
      earthquake.coordinates.lat,
      earthquake.coordinates.lon
    );

    res.json({
      success: true,
      data: {
        earthquake,
        impactZone
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
