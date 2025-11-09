import ee from '@google/earthengine';

let isInitialized = false;

/**
 * Initialize Google Earth Engine
 * Requires GEE_PROJECT environment variable or service account authentication
 */
export function initializeEarthEngine() {
  if (isInitialized) {
    return;
  }

  try {
    const project = process.env.GEE_PROJECT;
    if (project) {
      ee.initialize({ project });
    } else {
      ee.initialize();
    }
    isInitialized = true;
    console.log('✅ Google Earth Engine initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Earth Engine:', error.message);
    throw new Error(
      'Earth Engine initialization failed. Run `earthengine authenticate` or set GEE_PROJECT in .env'
    );
  }
}

/**
 * Convert AOI to Earth Engine Geometry
 * @param {Array|Object} aoi - [minLon, minLat, maxLon, maxLat] or GeoJSON geometry
 * @returns {ee.Geometry}
 */
export function toGeometry(aoi) {
  if (aoi instanceof ee.Geometry) {
    return aoi;
  }
  
  if (Array.isArray(aoi) && aoi.length === 4) {
    // Bounding box [minLon, minLat, maxLon, maxLat]
    return ee.Geometry.Rectangle(aoi);
  }
  
  if (typeof aoi === 'object' && aoi.type) {
    // GeoJSON geometry
    return ee.Geometry(aoi);
  }
  
  throw new Error('Unsupported AOI type. Use [minLon, minLat, maxLon, maxLat] or GeoJSON geometry.');
}

export { ee };

