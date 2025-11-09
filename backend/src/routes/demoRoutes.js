import express from 'express';
import riskService from '../services/riskService.js';

const router = express.Router();

/**
 * POST /api/demo/assess
 * Assess risk for a location (by coordinates or location name)
 */
router.post('/assess', (req, res, next) => {
  try {
    const { lat, lon, location } = req.body;

    // If location name is provided, try to geocode it
    let latitude = lat;
    let longitude = lon;

    if (location && !lat && !lon) {
      // Simple location lookup for common cities
      const locationCoords = geocodeLocation(location);
      if (!locationCoords) {
        return res.status(400).json({
          success: false,
          error: 'Location not found. Please provide coordinates (lat, lon) or a known city name.'
        });
      }
      latitude = locationCoords.lat;
      longitude = locationCoords.lon;
    }

    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    // Get risk assessment
    const riskAssessment = riskService.assessLocationRisk(latitude, longitude);
    
    // Get location info
    const locationInfo = riskService.getLocationInfo(latitude, longitude);

    res.json({
      success: true,
      data: {
        location: {
          name: locationInfo.name,
          lat: latitude,
          lon: longitude,
          population: locationInfo.population,
          description: locationInfo.description
        },
        risks: {
          flood: riskAssessment.flood,
          wildfire: riskAssessment.wildfire,
          storm: riskAssessment.storm,
          overall: riskAssessment.overall
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/demo/locations
 * Get list of available demo locations
 */
router.get('/locations', (req, res, next) => {
  try {
    const locations = [
      { 
        name: "San Francisco, CA", 
        lat: 37.7749, 
        lon: -122.4194, 
        description: "Coastal city with moderate climate risks",
        population: "873,965"
      },
      { 
        name: "Miami, FL", 
        lat: 25.7617, 
        lon: -80.1918, 
        description: "High flood and storm risk coastal area",
        population: "442,241"
      },
      { 
        name: "Houston, TX", 
        lat: 29.7604, 
        lon: -95.3698, 
        description: "Urban area with significant flood risk",
        population: "2,304,580"
      },
      {
        name: "New York, NY",
        lat: 40.7128,
        lon: -74.0060,
        description: "Coastal metropolitan area with storm risk",
        population: "8,336,817"
      },
      {
        name: "Los Angeles, CA",
        lat: 34.0522,
        lon: -118.2437,
        description: "Coastal city with wildfire and earthquake risk",
        population: "3,898,747"
      },
      {
        name: "Chicago, IL",
        lat: 41.8781,
        lon: -87.6298,
        description: "Midwestern city with severe weather risk",
        population: "2,746,388"
      }
    ];

    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Simple geocoding function for common locations
 * In production, this would use a proper geocoding API
 */
function geocodeLocation(locationName) {
  const normalizedName = locationName.toLowerCase().trim();
  
  const locations = {
    'san francisco': { lat: 37.7749, lon: -122.4194 },
    'san francisco, ca': { lat: 37.7749, lon: -122.4194 },
    'sf': { lat: 37.7749, lon: -122.4194 },
    'miami': { lat: 25.7617, lon: -80.1918 },
    'miami, fl': { lat: 25.7617, lon: -80.1918 },
    'houston': { lat: 29.7604, lon: -95.3698 },
    'houston, tx': { lat: 29.7604, lon: -95.3698 },
    'new york': { lat: 40.7128, lon: -74.0060 },
    'new york, ny': { lat: 40.7128, lon: -74.0060 },
    'nyc': { lat: 40.7128, lon: -74.0060 },
    'los angeles': { lat: 34.0522, lon: -118.2437 },
    'los angeles, ca': { lat: 34.0522, lon: -118.2437 },
    'la': { lat: 34.0522, lon: -118.2437 },
    'chicago': { lat: 41.8781, lon: -87.6298 },
    'chicago, il': { lat: 41.8781, lon: -87.6298 },
    'phoenix': { lat: 33.4484, lon: -112.0740 },
    'phoenix, az': { lat: 33.4484, lon: -112.0740 },
    'philadelphia': { lat: 39.9526, lon: -75.1652 },
    'philadelphia, pa': { lat: 39.9526, lon: -75.1652 },
  };

  return locations[normalizedName] || null;
}

export default router;

