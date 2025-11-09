import { ee } from './earthEngineService.js';
import {
  computeMNDWI,
  computeNBR,
  computeRGBDelta,
  computeDelta,
  autoThreshold
} from './featureExtractionService.js';

/**
 * Detect flood damage using MNDWI
 * @param {ee.Image} preImg - Pre-event image
 * @param {ee.Image} postImg - Post-event image
 * @param {ee.Geometry} aoi - Area of interest
 * @param {number} scale - Scale in meters
 * @param {boolean} returnMask - Whether to return mask
 * @returns {Promise<Object|Array>} - Hazard result or [result, mask]
 */
export async function detectFlood(preImg, postImg, aoi = null, scale = 30, returnMask = false) {
  const preMNDWI = computeMNDWI(preImg);
  const postMNDWI = computeMNDWI(postImg);
  const deltaMNDWI = computeDelta(preMNDWI, postMNDWI, 'MNDWI');
  
  const floodMask = await autoThreshold(deltaMNDWI, 'otsu', scale, aoi);
  const positiveGain = deltaMNDWI.gt(0);
  
  const elevation = ee.Image('USGS/SRTMGL1_003');
  const lowLying = elevation.lt(40);
  const historical = ee.Image('JRC/GSW1_4/GlobalSurfaceWater')
    .select('occurrence')
    .gt(30);
  const hydroContext = lowLying.or(historical);
  
  const refinedMask = floodMask.and(positiveGain).and(hydroContext);
  const geom = aoi || refinedMask.geometry();
  
  // Compute mean of mask (fraction flooded)
  const stats = await refinedMask
    .reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geom,
      scale: scale,
      maxPixels: 1e7,
      bestEffort: true
    })
    .get('MNDWI_mask');
  
  const floodedAreaPct = (stats || 0) * 100;
  
  // Classify severity
  let severity;
  if (floodedAreaPct < 10) {
    severity = 'none';
  } else if (floodedAreaPct < 40) {
    severity = 'moderate';
  } else {
    severity = 'severe';
  }
  
  const result = {
    hazard: 'flood',
    damage_pct: floodedAreaPct,
    severity: severity
  };
  
  return returnMask ? [result, refinedMask] : result;
}

/**
 * Detect wildfire damage using NBR
 * @param {ee.Image} preImg - Pre-event image
 * @param {ee.Image} postImg - Post-event image
 * @param {ee.Geometry} aoi - Area of interest
 * @param {number} scale - Scale in meters
 * @param {boolean} returnMask - Whether to return mask
 * @returns {Promise<Object|Array>} - Hazard result or [result, mask]
 */
export async function detectWildfire(preImg, postImg, aoi = null, scale = 30, returnMask = false) {
  const preNBR = computeNBR(preImg);
  const postNBR = computeNBR(postImg);
  const dnbr = computeDelta(preNBR, postNBR, 'NBR');
  
  // Apply USGS thresholds
  const wildfireMask = dnbr.gt(0.27).rename('NBR_mask');
  const geom = aoi || wildfireMask.geometry();
  
  const stats = await wildfireMask
    .reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geom,
      scale: scale,
      maxPixels: 1e7,
      bestEffort: true
    })
    .get('NBR_mask');
  
  const burnPct = (stats || 0) * 100;
  
  // Classify severity
  let severity;
  if (burnPct < 10) {
    severity = 'none';
  } else if (burnPct < 30) {
    severity = 'low';
  } else if (burnPct < 50) {
    severity = 'moderate';
  } else {
    severity = 'high';
  }
  
  const result = {
    hazard: 'wildfire',
    damage_pct: burnPct,
    severity: severity
  };
  
  return returnMask ? [result, wildfireMask] : result;
}

/**
 * Detect roof damage using RGB delta
 * @param {ee.Image} preImg - Pre-event image
 * @param {ee.Image} postImg - Post-event image
 * @param {ee.Geometry} aoi - Area of interest
 * @param {number} scale - Scale in meters
 * @param {boolean} returnMask - Whether to return mask
 * @returns {Promise<Object|Array>} - Hazard result or [result, mask]
 */
export async function detectRoofDamage(preImg, postImg, aoi = null, scale = 10, returnMask = false) {
  const deltaRGB = computeRGBDelta(preImg, postImg);
  const mask = deltaRGB.gt(0.2);
  const geom = aoi || mask.geometry();
  
  const stats = await mask
    .reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geom,
      scale: scale,
      maxPixels: 1e7,
      bestEffort: true
    })
    .get('RGB_DELTA');
  
  const damagePct = (stats || 0) * 100;
  
  // Classify severity
  let severity;
  if (damagePct < 10) {
    severity = 'none';
  } else if (damagePct < 30) {
    severity = 'low';
  } else if (damagePct < 50) {
    severity = 'moderate';
  } else {
    severity = 'high';
  }
  
  const result = {
    hazard: 'roof',
    damage_pct: damagePct,
    severity: severity
  };
  
  return returnMask ? [result, mask] : result;
}

/**
 * Run hazard detection for a specific hazard type
 * @param {string} hazard - Hazard type: 'flood', 'wildfire', 'roof'
 * @param {ee.Image} preImg - Pre-event image
 * @param {ee.Image} postImg - Post-event image
 * @param {ee.Geometry} aoi - Area of interest
 * @param {number} scale - Scale in meters
 * @param {boolean} returnMask - Whether to return mask
 * @returns {Promise<Object|Array>} - Hazard result or [result, mask]
 */
export async function detectHazard(hazard, preImg, postImg, aoi, scale, returnMask = false) {
  const detectors = {
    flood: detectFlood,
    wildfire: detectWildfire,
    roof: detectRoofDamage
  };

  const detector = detectors[hazard];
  if (!detector) {
    throw new Error(`Unsupported hazard: ${hazard}. Choose from ${Object.keys(detectors).join(', ')}`);
  }

  return await detector(preImg, postImg, aoi, scale, returnMask);
}

