import express from 'express';
import severeWeatherService from '../services/severeWeatherService.js';

const router = express.Router();

/**
 * GET /api/severe-weather/active
 * Get all active severe weather alerts
 */
router.get('/active', async (req, res, next) => {
  try {
    const { states } = req.query;

    const filters = {};
    if (states) {
      filters.states = states.split(',').map(s => s.trim().toUpperCase());
    }

    const alerts = await severeWeatherService.getActiveSevereWeatherAlerts(filters);

    res.json({
      success: true,
      count: alerts.length,
      data: alerts,
      metadata: {
        usingMockData: severeWeatherService.usingMockSevereWeather,
        filters
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/severe-weather/tornadoes
 * Get active tornado warnings and watches
 */
router.get('/tornadoes', async (req, res, next) => {
  try {
    const tornadoes = await severeWeatherService.getTornadoWarnings();

    res.json({
      success: true,
      count: tornadoes.length,
      data: tornadoes
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/severe-weather/floods
 * Get active flood warnings
 */
router.get('/floods', async (req, res, next) => {
  try {
    const floods = await severeWeatherService.getFloodWarnings();

    res.json({
      success: true,
      count: floods.length,
      data: floods
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/severe-weather/by-state/:stateCodes
 * Get severe weather alerts by state(s)
 */
router.get('/by-state/:stateCodes', async (req, res, next) => {
  try {
    const { stateCodes } = req.params;
    const states = stateCodes.split(',').map(s => s.trim().toUpperCase());

    const alerts = await severeWeatherService.getAlertsByState(states);

    res.json({
      success: true,
      count: alerts.length,
      data: alerts,
      metadata: {
        states
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
