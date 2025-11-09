import { ee } from './earthEngineService.js';

/**
 * Cross-sensor check using Sentinel-1 SAR
 * @param {ee.Geometry} aoi - Area of interest
 * @param {string} preDate - Pre-event date (YYYY-MM-DD)
 * @param {string} postDate - Post-event date (YYYY-MM-DD)
 * @param {number} scale - Scale in meters
 * @returns {Promise<number>} - Correlation score (0-100)
 */
export async function crossSensorCheck(aoi, preDate, postDate, scale = 30) {
  try {
    // Sentinel-1 GRD backscatter change (VV polarization)
    const s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
      .filterBounds(aoi)
      .filter(ee.Filter.eq('instrumentMode', 'IW'))
      .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
      .select('VV');

    const preStart = ee.Date(preDate).advance(-6, 'day');
    const preEnd = ee.Date(preDate).advance(1, 'day');
    const postStart = ee.Date(postDate);
    const postEnd = ee.Date(postDate).advance(6, 'day');

    const preColl = s1.filterDate(preStart, preEnd);
    const postColl = s1.filterDate(postStart, postEnd);

    const preSize = await preColl.size().getInfo();
    const postSize = await postColl.size().getInfo();

    if (preSize === 0 || postSize === 0) {
      return 0.0;
    }

    const preS1 = preColl.mean();
    const postS1 = postColl.mean();
    const deltaS1 = postS1.subtract(preS1);

    const meanDelta = await deltaS1
      .reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: aoi,
        scale: scale,
        maxPixels: 1e7,
        bestEffort: true
      })
      .get('VV');

    if (meanDelta === null || meanDelta === undefined) {
      return 0.0;
    }

    const val = typeof meanDelta === 'object' && meanDelta.getInfo 
      ? await meanDelta.getInfo() 
      : meanDelta;
    
    // Negative VV means stronger flood signal
    return Math.max(0, Math.min(100, Math.abs(val) * 100)) || 0;
  } catch (error) {
    console.error('cross_sensor_check failed:', error);
    return 0.0;
  }
}

/**
 * Meteorology check using NASA GPM IMERG
 * @param {ee.Geometry} aoi - Area of interest
 * @param {Array<string>} dateRange - [startDate, endDate]
 * @param {string} hazard - Hazard type: 'flood' or 'wildfire'
 * @param {number} baselineDays - Baseline days (default: 30)
 * @returns {Promise<number>} - Anomaly score (0-100)
 */
export async function meteorologyCheck(aoi, dateRange, hazard = 'flood', baselineDays = 30) {
  try {
    const [eventStartStr, providedEndStr] = dateRange;
    const dataset = 'NASA/GPM_L3/IMERG_V07';
    const precipBand = 'precipitation';

    const eventStart = ee.Date(eventStartStr);
    const eventEnd = eventStart.advance(3, 'day');
    const providedEnd = ee.Date(providedEndStr);
    const finalEventEnd = ee.Date(
      ee.Algorithms.If(
        eventEnd.millis().lt(providedEnd.millis()),
        eventEnd,
        providedEnd
      )
    );

    const eventColl = ee.ImageCollection(dataset)
      .filterDate(eventStart, finalEventEnd)
      .select(precipBand);

    const eventSumImg = eventColl.sum();
    const eventValObj = await eventSumImg
      .reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: aoi,
        scale: 10000,
        bestEffort: true
      })
      .get(precipBand);

    const eventVal = typeof eventValObj === 'object' && eventValObj.getInfo
      ? await eventValObj.getInfo()
      : (eventValObj || 0.0);

    const baselineEnd = eventStart;
    const baselineStart = baselineEnd.advance(-baselineDays, 'day');
    const baselineColl = ee.ImageCollection(dataset)
      .filterDate(baselineStart, baselineEnd)
      .select(precipBand);

    const baselineMeanImg = baselineColl.mean();
    const baseValObj = await baselineMeanImg
      .reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: aoi,
        scale: 10000,
        bestEffort: true
      })
      .get(precipBand);

    const baseVal = typeof baseValObj === 'object' && baseValObj.getInfo
      ? await baseValObj.getInfo()
      : (baseValObj || 0.0);

    if (baseVal <= 0) {
      return (hazard === 'flood' && eventVal > 0) ? 100.0 : 0.0;
    }

    const anomalyRatio = eventVal / baseVal;
    let anomalyScore;

    if (hazard === 'flood') {
      anomalyScore = (anomalyRatio - 1.0) * 100.0;
    } else if (hazard === 'wildfire') {
      anomalyScore = (1.0 - anomalyRatio) * 100.0;
    } else {
      anomalyScore = 0.0;
    }

    return Math.max(0.0, Math.min(100.0, anomalyScore));
  } catch (error) {
    console.error('meteorology_check failed:', error);
    return 0.0;
  }
}

/**
 * Spatial coherence check
 * @param {ee.Geometry} aoi - Area of interest
 * @param {ee.Image} maskImage - Hazard mask image
 * @param {number} scale - Scale in meters
 * @returns {Promise<number>} - Coherence score (0-100)
 */
export async function spatialCoherenceCheck(aoi, maskImage, scale = 30) {
  try {
    if (!maskImage) {
      return 0.0;
    }

    const elevation = ee.Image('USGS/SRTMGL1_003');
    const water = ee.Image('JRC/GSW1_4/GlobalSurfaceWater').select('occurrence');

    // Low elevation or historically wet = likely flood
    const lowAreas = elevation.lt(20);
    const historicalWater = water.gt(50);
    const combined = lowAreas.or(historicalWater);

    const mask = maskImage.select(0).rename('hazard_mask');
    const overlap = combined.and(mask).rename('hazard_overlap');

    const overlapPctObj = await overlap
      .reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: aoi,
        scale: scale,
        maxPixels: 1e7,
        bestEffort: true
      })
      .get('hazard_overlap');

    if (overlapPctObj === null || overlapPctObj === undefined) {
      return 0.0;
    }

    const val = typeof overlapPctObj === 'object' && overlapPctObj.getInfo
      ? await overlapPctObj.getInfo()
      : overlapPctObj;

    return Math.max(0, Math.min(100, (val || 0) * 100));
  } catch (error) {
    console.error('spatial_coherence_check failed:', error);
    return 0.0;
  }
}

/**
 * Compute embedding change score (simplified version)
 * For full implementation, this would use AlphaEarth embeddings
 * @param {ee.Image} preImg - Pre-event image
 * @param {ee.Image} postImg - Post-event image
 * @param {ee.Geometry} aoi - Area of interest
 * @returns {Promise<number>} - Change score (0-1)
 */
export async function computeEmbeddingChangeScore(preImg, postImg, aoi) {
  try {
    // Simplified implementation: use RGB mean difference as proxy
    const preBands = preImg.bandNames().getInfo() || [];
    const postBands = postImg.bandNames().getInfo() || [];
    
    let rgbBands;
    if (['B4', 'B3', 'B2'].every(b => preBands.includes(b) && postBands.includes(b))) {
      rgbBands = ['B4', 'B3', 'B2'];
    } else if (['SR_B4', 'SR_B3', 'SR_B2'].every(b => preBands.includes(b) && postBands.includes(b))) {
      rgbBands = ['SR_B4', 'SR_B3', 'SR_B2'];
    } else if (['sur_refl_b01', 'sur_refl_b04', 'sur_refl_b03'].every(b => preBands.includes(b) && postBands.includes(b))) {
      rgbBands = ['sur_refl_b01', 'sur_refl_b04', 'sur_refl_b03'];
    } else {
      return 0.0;
    }

    const preRgb = preImg.select(rgbBands);
    const postRgb = postImg.select(rgbBands);
    const diff = postRgb.subtract(preRgb).abs();

    const preMean = await preRgb.reduce(ee.Reducer.mean())
      .reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: aoi,
        scale: 30,
        bestEffort: true,
        maxPixels: 1e7
      })
      .values()
      .get(0);

    const postMean = await postRgb.reduce(ee.Reducer.mean())
      .reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: aoi,
        scale: 30,
        bestEffort: true,
        maxPixels: 1e7
      })
      .values()
      .get(0);

    const diffMean = await diff.reduce(ee.Reducer.mean())
      .reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: aoi,
        scale: 30,
        bestEffort: true,
        maxPixels: 1e7
      })
      .values()
      .get(0);

    const preVal = typeof preMean === 'object' && preMean.getInfo ? await preMean.getInfo() : (preMean || 0);
    const postVal = typeof postMean === 'object' && postMean.getInfo ? await postMean.getInfo() : (postMean || 0);
    const diffVal = typeof diffMean === 'object' && diffMean.getInfo ? await diffMean.getInfo() : (diffMean || 0);

    const denom = Math.abs(preVal) + Math.abs(postVal) + 1e-6;
    return Math.min(1.0, Math.abs(diffVal) / denom);
  } catch (error) {
    console.error('computeEmbeddingChangeScore failed:', error);
    return 0.0;
  }
}

/**
 * Compute confidence score from validation components
 * @param {number} crossSensor - Cross-sensor score (0-100)
 * @param {number} meteorology - Meteorology score (0-100)
 * @param {number} coherence - Spatial coherence score (0-100)
 * @param {number} embeddingChange - Embedding change score (0-1, optional)
 * @returns {Object} - Confidence score and label
 */
export function confidenceScore(crossSensor, meteorology, coherence, embeddingChange = null) {
  const weights = [0.2, 0.35, 0.35];
  const components = [crossSensor, meteorology, coherence];
  
  if (embeddingChange !== null && embeddingChange !== undefined) {
    weights.push(0.1);
    components.push(embeddingChange * 100);
  }

  const score = weights.reduce((sum, w, i) => sum + w * (components[i] / 100), 0);
  
  let label;
  if (score < 0.4) {
    label = 'Low';
  } else if (score < 0.7) {
    label = 'Medium';
  } else {
    label = 'High';
  }

  return {
    confidence_score: Math.round(score * 100) / 100,
    label: label
  };
}

