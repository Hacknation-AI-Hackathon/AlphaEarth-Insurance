import { ee, toGeometry } from './earthEngineService.js';

/**
 * Mask clouds for Sentinel-2 SR using SCL band
 * @param {ee.Image} img - Sentinel-2 image
 * @returns {ee.Image} - Cloud-masked and scaled image
 */
function maskS2SRSCL(img) {
  const scl = img.select('SCL');
  const mask = scl
    .neq(3)   // cloud shadow
    .and(scl.neq(7))   // unclassified
    .and(scl.neq(8))   // cloud medium prob
    .and(scl.neq(9))   // cloud high prob
    .and(scl.neq(10))  // thin cirrus
    .and(scl.neq(11)); // snow/ice
  
  const scaled = img.divide(10000);
  return scaled.updateMask(mask);
}

/**
 * Mask clouds for Landsat Collection 2 Level-2
 * @param {ee.Image} img - Landsat image
 * @returns {ee.Image} - Cloud-masked and scaled image
 */
function maskLandsatL2(img) {
  const qa = img.select('QA_PIXEL');
  const dilated = qa.bitwiseAnd(1 << 1).neq(0);
  const cirrus = qa.bitwiseAnd(1 << 2).neq(0);
  const cloud = qa.bitwiseAnd(1 << 3).neq(0);
  const shadow = qa.bitwiseAnd(1 << 4).neq(0);
  const snow = qa.bitwiseAnd(1 << 5).neq(0);
  const mask = dilated.or(cirrus).or(cloud).or(shadow).or(snow).not();

  // Get all bands and filter SR bands
  const allBands = img.bandNames();
  const srBands = ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'];
  
  // Select SR bands and scale them
  const sr = img.select(srBands).divide(10000);
  
  // Select non-SR bands
  const otherBands = allBands.removeAll(ee.List(srBands));
  const others = img.select(otherBands);
  
  // Combine scaled SR bands with other bands
  const scaled = sr.addBands(others, null, true);
  
  return scaled.updateMask(mask);
}

/**
 * Scale MODIS surface reflectance
 * @param {ee.Image} img - MODIS image
 * @returns {ee.Image} - Scaled image
 */
function scaleModisSR(img) {
  const srBands = ['sur_refl_b01', 'sur_refl_b02', 'sur_refl_b03', 'sur_refl_b04'];
  const sr = img.select(srBands).multiply(0.0001);
  const otherBands = img.bandNames().removeAll(srBands);
  const others = img.select(otherBands);
  return sr.addBands(others, null, true);
}

/**
 * Get satellite imagery for a given AOI and date range
 * @param {Object} params
 * @param {Array|Object} params.aoi - AOI geometry
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {string} params.satellite - Satellite type: 'sentinel2', 'landsat8', 'landsat9', 'modis'
 * @param {number} params.maxCloud - Maximum cloud percentage (0-100)
 * @param {string} params.reducer - Reducer: 'median' or 'mosaic'
 * @returns {Promise<Object>} - Imagery result with image, dataset, vis_params, and url_template
 */
export async function getImagery(params) {
  const {
    aoi,
    startDate,
    endDate,
    satellite = 'sentinel2',
    maxCloud = 30,
    reducer = 'median'
  } = params;

  const geom = toGeometry(aoi);
  const sat = satellite.toLowerCase();

  let dataset, collection, defaultBands, defaultMin, defaultMax;

  if (sat === 'sentinel2') {
    dataset = 'COPERNICUS/S2_SR_HARMONIZED';
    collection = ee.ImageCollection(dataset)
      .filterBounds(geom)
      .filterDate(startDate, endDate)
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', maxCloud))
      .map(maskS2SRSCL);
    defaultBands = ['B4', 'B3', 'B2']; // RGB
    defaultMin = 0.02;
    defaultMax = 0.3;
  } else if (sat === 'landsat8') {
    dataset = 'LANDSAT/LC08/C02/T1_L2';
    collection = ee.ImageCollection(dataset)
      .filterBounds(geom)
      .filterDate(startDate, endDate)
      .map(maskLandsatL2);
    defaultBands = ['SR_B4', 'SR_B3', 'SR_B2']; // RGB
    defaultMin = 0.02;
    defaultMax = 0.3;
  } else if (sat === 'landsat9') {
    dataset = 'LANDSAT/LC09/C02/T1_L2';
    collection = ee.ImageCollection(dataset)
      .filterBounds(geom)
      .filterDate(startDate, endDate)
      .map(maskLandsatL2);
    defaultBands = ['SR_B4', 'SR_B3', 'SR_B2'];
    defaultMin = 0.02;
    defaultMax = 0.3;
  } else if (sat === 'modis') {
    dataset = 'MODIS/061/MOD09GA';
    collection = ee.ImageCollection(dataset)
      .filterBounds(geom)
      .filterDate(startDate, endDate)
      .map(scaleModisSR);
    defaultBands = ['sur_refl_b01', 'sur_refl_b04', 'sur_refl_b03'];
    defaultMin = 0.02;
    defaultMax = 0.3;
  } else {
    throw new Error("Unsupported satellite. Use 'sentinel2', 'landsat8', 'landsat9', or 'modis'.");
  }

  // Reduce to a single image
  let image;
  if (reducer === 'median') {
    image = collection.median().clip(geom);
  } else if (reducer === 'mosaic') {
    image = collection.mosaic().clip(geom);
  } else {
    throw new Error("Unsupported reducer. Use 'median' or 'mosaic'.");
  }

  // Check if image has bands
  const bands = image.bandNames().getInfo() || [];
  if (bands.length === 0) {
    throw new Error(
      `No usable imagery found for date range ${startDate} to ${endDate}. ` +
      `Try expanding the date range or increasing max_cloud.`
    );
  }

  // Visualization parameters
  const visParams = {
    bands: defaultBands,
    min: defaultMin,
    max: defaultMax
  };

  // Server-side visualization and tile URL template
  // Note: Earth Engine tile URL generation in Node.js
  const visImg = image.visualize(visParams);
  
  // Get map ID for tile URL generation
  // In Node.js Earth Engine API, we need to use ee.data.getMapId
  let urlTemplate;
  try {
    // Try to get map ID synchronously (works for server-side)
    const mapId = visImg.getMapId(visParams);
    urlTemplate = mapId.urlFormat || mapId.tile_fetcher?.url_format;
  } catch (error) {
    // Fallback: Generate a placeholder URL that will be replaced by Earth Engine client
    console.warn('Could not generate tile URL template:', error.message);
    urlTemplate = null; // Frontend will need to request tiles differently
  }

  return {
    image: image,
    dataset: dataset,
    vis_params: visParams,
    url_template: urlTemplate
  };
}

