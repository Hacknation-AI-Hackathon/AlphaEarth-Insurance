import express from 'express';
import disasterService from '../services/disasterService.js';

const router = express.Router();

/**
 * GET /api/disasters/active
 * Get all active disasters
 */
router.get('/active', async (req, res, next) => {
  try {
    const disasters = await disasterService.getAllActiveDisasters();
    res.json({
      success: true,
      count: disasters.length,
      data: disasters,
      metadata: {
        usingMockData: disasterService.usingMockHurricanes || disasterService.usingMockWildfires,
        usingMockHurricanes: disasterService.usingMockHurricanes,
        usingMockWildfires: disasterService.usingMockWildfires
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/disasters/hurricanes
 * Get active hurricanes
 */
router.get('/hurricanes', async (req, res, next) => {
  try {
    const hurricanes = await disasterService.getActiveHurricanes();
    res.json({
      success: true,
      count: hurricanes.length,
      data: hurricanes,
      metadata: {
        usingMockData: disasterService.usingMockHurricanes
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/disasters/hurricanes/:stormId
 * Get detailed hurricane forecast
 */
router.get('/hurricanes/:stormId', async (req, res, next) => {
  try {
    const { stormId } = req.params;
    const forecast = await disasterService.getHurricaneForecast(stormId);
    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/disasters/wildfires
 * Get active wildfires
 */
router.get('/wildfires', async (req, res, next) => {
  try {
    const wildfires = await disasterService.getActiveWildfires();
    res.json({
      success: true,
      count: wildfires.length,
      data: wildfires,
      metadata: {
        usingMockData: disasterService.usingMockWildfires
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/disasters/wildfires/:fireId
 * Get wildfire perimeter data
 */
router.get('/wildfires/:fireId', async (req, res, next) => {
  try {
    const { fireId } = req.params;
    const perimeter = await disasterService.getWildfirePerimeter(fireId);
    res.json({
      success: true,
      data: perimeter
    });
  } catch (error) {
    next(error);
  }
});

export default router;