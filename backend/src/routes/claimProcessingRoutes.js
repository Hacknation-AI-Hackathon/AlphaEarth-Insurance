import express from 'express';
import { processClaim } from '../services/claimProcessingService.js';

const router = express.Router();

/**
 * POST /api/claim_processing_basic
 * Process damage claims from satellite imagery
 * 
 * Request body:
 * {
 *   preprocessing: {
 *     aoi: [minLon, minLat, maxLon, maxLat],
 *     pre: { start: "YYYY-MM-DD", end: "YYYY-MM-DD" },
 *     post: { start: "YYYY-MM-DD", end: "YYYY-MM-DD" },
 *     satellite?: "sentinel2" | "landsat8" | "landsat9" | "modis",
 *     max_cloud?: number,
 *     reducer?: "median" | "mosaic"
 *   },
 *   hazard?: {
 *     hazard?: "flood" | "wildfire" | "roof",
 *     scale?: number
 *   },
 *   claim?: {
 *     include_summary?: boolean,
 *     include_tiles?: boolean
 *   }
 * }
 */
router.post('/basic', async (req, res, next) => {
  try {
    const config = req.body;

    // Validate required fields
    if (!config.preprocessing) {
      return res.status(400).json({
        success: false,
        error: 'preprocessing configuration is required'
      });
    }

    if (!config.preprocessing.aoi || !Array.isArray(config.preprocessing.aoi) || config.preprocessing.aoi.length !== 4) {
      return res.status(400).json({
        success: false,
        error: 'preprocessing.aoi must be an array of 4 numbers [minLon, minLat, maxLon, maxLat]'
      });
    }

    if (!config.preprocessing.pre || !config.preprocessing.pre.start || !config.preprocessing.pre.end) {
      return res.status(400).json({
        success: false,
        error: 'preprocessing.pre must have start and end dates (YYYY-MM-DD)'
      });
    }

    if (!config.preprocessing.post || !config.preprocessing.post.start || !config.preprocessing.post.end) {
      return res.status(400).json({
        success: false,
        error: 'preprocessing.post must have start and end dates (YYYY-MM-DD)'
      });
    }

    // Validate date order
    if (config.preprocessing.pre.end < config.preprocessing.pre.start) {
      return res.status(400).json({
        success: false,
        error: 'preprocessing.pre.end must be after preprocessing.pre.start'
      });
    }

    if (config.preprocessing.post.end < config.preprocessing.post.start) {
      return res.status(400).json({
        success: false,
        error: 'preprocessing.post.end must be after preprocessing.post.start'
      });
    }

    console.log(`Processing claim request:`, {
      aoi: config.preprocessing.aoi,
      hazard: config.hazard?.hazard || 'auto-detect',
      timestamp: new Date().toISOString()
    });

    const result = await processClaim(config);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Claim processing error:', error);
    next(error);
  }
});

export default router;

