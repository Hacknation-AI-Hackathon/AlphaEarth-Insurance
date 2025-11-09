import express from 'express';
import satelliteImageryService from '../services/satelliteImageryService.js';

const router = express.Router();

/**
 * POST /api/imagery/get
 * Get satellite imagery tiles for a specific area and date
 *
 * Body:
 * {
 *   "aoi": [-82.6, 27.8, -82.3, 28.1],  // [minLon, minLat, maxLon, maxLat]
 *   "date": "2024-10-09",
 *   "source": "nasa_modis"  // or "nasa_viirs", "google_satellite", "sentinel2_cloudless"
 * }
 */
router.post('/get', async (req, res) => {
  try {
    const {
      aoi,
      date,
      source = 'nasa_modis'
    } = req.body;

    if (!aoi || !date) {
      return res.status(400).json({
        error: 'Missing required parameters: aoi, date'
      });
    }

    const result = satelliteImageryService.getImageryTiles({
      aoi,
      date,
      source
    });

    res.json({
      success: true,
      imagery: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching imagery:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch imagery',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/imagery/pre-post
 * Get pre and post disaster imagery comparison
 *
 * Body:
 * {
 *   "aoi": [-82.6, 27.8, -82.3, 28.1],
 *   "disasterDate": "2024-10-09",
 *   "preDays": 7,
 *   "postDays": 7,
 *   "source": "nasa_modis"
 * }
 */
router.post('/pre-post', async (req, res) => {
  try {
    const {
      aoi,
      disasterDate,
      preDays = 7,
      postDays = 7,
      source = 'nasa_modis'
    } = req.body;

    if (!aoi || !disasterDate) {
      return res.status(400).json({
        error: 'Missing required parameters: aoi, disasterDate'
      });
    }

    const result = satelliteImageryService.getPrePostImagery({
      aoi,
      disasterDate,
      preDays,
      postDays,
      source
    });

    res.json({
      success: true,
      comparison: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching pre/post imagery:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch pre/post imagery',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/imagery/disaster-impact
 * Get imagery for a specific disaster with automatic AOI detection
 *
 * Body:
 * {
 *   "disasterType": "hurricane",
 *   "coordinates": { "lat": 27.9506, "lon": -82.4572 },
 *   "disasterDate": "2024-10-09",
 *   "source": "nasa_modis"
 * }
 */
router.post('/disaster-impact', async (req, res) => {
  try {
    const {
      disasterType,
      coordinates,
      disasterDate,
      source = 'nasa_modis'
    } = req.body;

    if (!disasterType || !coordinates || !disasterDate) {
      return res.status(400).json({
        error: 'Missing required parameters: disasterType, coordinates, disasterDate'
      });
    }

    const result = satelliteImageryService.getDisasterImpactImagery({
      disasterType,
      coordinates,
      disasterDate,
      source
    });

    res.json({
      success: true,
      disaster: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching disaster impact imagery:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch disaster impact imagery',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/imagery/multi-source
 * Get imagery from multiple sources for comparison
 *
 * Body:
 * {
 *   "aoi": [-82.6, 27.8, -82.3, 28.1],
 *   "date": "2024-10-09"
 * }
 */
router.post('/multi-source', async (req, res) => {
  try {
    const { aoi, date } = req.body;

    if (!aoi || !date) {
      return res.status(400).json({
        error: 'Missing required parameters: aoi, date'
      });
    }

    const result = satelliteImageryService.getMultiSourceImagery({
      aoi,
      date
    });

    res.json({
      success: true,
      imagery: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching multi-source imagery:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch multi-source imagery',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/imagery/fire-detection
 * Get thermal anomaly layer for fire detection
 *
 * Body:
 * {
 *   "aoi": [-121.9, 39.6, -121.7, 39.9],
 *   "date": "2024-07-24"
 * }
 */
router.post('/fire-detection', async (req, res) => {
  try {
    const { aoi, date } = req.body;

    if (!aoi || !date) {
      return res.status(400).json({
        error: 'Missing required parameters: aoi, date'
      });
    }

    const result = satelliteImageryService.getFireDetectionLayer({
      aoi,
      date
    });

    res.json({
      success: true,
      fireLayer: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching fire detection layer:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch fire detection layer',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/imagery/available-dates
 * Get available imagery dates (last 30 days)
 */
router.get('/available-dates', async (req, res) => {
  try {
    const daysBack = parseInt(req.query.days) || 30;

    const dates = satelliteImageryService.getAvailableDates(daysBack);

    res.json({
      success: true,
      dates,
      count: dates.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching available dates:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch available dates',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/imagery/sources
 * Get information about available imagery sources
 */
router.get('/sources', async (req, res) => {
  try {
    const sources = [
      {
        id: 'nasa_modis',
        name: 'NASA MODIS Terra',
        resolution: '250m',
        coverage: 'Daily, Global',
        description: 'True color imagery from MODIS Terra satellite',
        authentication: 'None required',
        free: true,
        recommended: true
      },
      {
        id: 'nasa_viirs',
        name: 'NASA VIIRS',
        resolution: '375m',
        coverage: 'Daily, Global',
        description: 'True color imagery from VIIRS (Suomi NPP)',
        authentication: 'None required',
        free: true,
        recommended: false
      },
      {
        id: 'sentinel2_cloudless',
        name: 'Sentinel-2 Cloudless',
        resolution: '10m',
        coverage: 'Annual mosaic, Global',
        description: 'Cloud-free annual composite from Sentinel-2',
        authentication: 'None required',
        free: true,
        recommended: true
      },
      {
        id: 'google_satellite',
        name: 'Google Satellite',
        resolution: 'Up to 0.5m',
        coverage: 'Global (varied dates)',
        description: 'High-resolution satellite imagery from Google Maps',
        authentication: 'Google Maps API key required',
        free: 'Free tier: $200/month credit',
        recommended: true
      },
      {
        id: 'nasa_firms_thermal',
        name: 'NASA FIRMS Thermal',
        resolution: '1km',
        coverage: 'Daily, Global',
        description: 'Active fire and thermal anomaly detection',
        authentication: 'None required',
        free: true,
        recommended: false
      }
    ];

    res.json({
      success: true,
      sources,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      error: error.message || 'Failed to fetch sources',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/imagery/health
 * Check imagery service health
 */
router.get('/health', async (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Satellite Imagery',
    sources: {
      nasa_gibs: 'available',
      sentinel2_cloudless: 'available',
      google_maps: process.env.GOOGLE_MAPS_API_KEY &&
                   process.env.GOOGLE_MAPS_API_KEY !== 'your_google_maps_api_key_here'
                   ? 'configured' : 'not_configured'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
