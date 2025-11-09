import { ee } from './earthEngineService.js';

/**
 * Select the first available band from a list of candidates
 * @param {ee.Image} image - Earth Engine image
 * @param {Array<string>} candidates - List of band names to try
 * @returns {ee.Image} - Selected band
 */
function selectFirstAvailable(image, candidates) {
  const bandNames = image.bandNames().getInfo() || [];
  
  for (const band of candidates) {
    if (bandNames.includes(band)) {
      return image.select(band);
    }
  }
  
  throw new Error(
    `None of the requested bands ${candidates.join(', ')} exist in image. Available bands: ${bandNames.join(', ')}`
  );
}

/**
 * Compute NDWI (Normalized Difference Water Index)
 * NDWI = (Green - NIR) / (Green + NIR)
 * @param {ee.Image} image - Earth Engine image
 * @returns {ee.Image} - NDWI band
 */
export function computeNDWI(image) {
  const bandNames = image.bandNames().getInfo() || [];
  
  let greenBand, nirBand;
  if (bandNames.includes('B3') && bandNames.includes('B8')) {
    greenBand = 'B3';
    nirBand = 'B8';
  } else if (bandNames.includes('SR_B3') && bandNames.includes('SR_B5')) {
    greenBand = 'SR_B3';
    nirBand = 'SR_B5';
  } else if (bandNames.includes('sur_refl_b04') && bandNames.includes('sur_refl_b02')) {
    greenBand = 'sur_refl_b04';
    nirBand = 'sur_refl_b02';
  } else {
    throw new Error(`Could not find required bands for NDWI. Available bands: ${bandNames.join(', ')}`);
  }
  
  return image.normalizedDifference([greenBand, nirBand]).rename('NDWI');
}

/**
 * Compute NBR (Normalized Burn Ratio)
 * NBR = (NIR - SWIR2) / (NIR + SWIR2)
 * @param {ee.Image} image - Earth Engine image
 * @returns {ee.Image} - NBR band
 */
export function computeNBR(image) {
  const bandNames = image.bandNames().getInfo() || [];
  
  let nirBand, swir2Band;
  if (bandNames.includes('B8') && bandNames.includes('B12')) {
    nirBand = 'B8';
    swir2Band = 'B12';
  } else if (bandNames.includes('SR_B5') && bandNames.includes('SR_B7')) {
    nirBand = 'SR_B5';
    swir2Band = 'SR_B7';
  } else if (bandNames.includes('sur_refl_b02') && bandNames.includes('sur_refl_b07')) {
    nirBand = 'sur_refl_b02';
    swir2Band = 'sur_refl_b07';
  } else {
    throw new Error(`Could not find required bands for NBR. Available bands: ${bandNames.join(', ')}`);
  }
  
  return image.normalizedDifference([nirBand, swir2Band]).rename('NBR');
}

/**
 * Compute MNDWI (Modified Normalized Difference Water Index)
 * MNDWI = (Green - SWIR1) / (Green + SWIR1)
 * @param {ee.Image} image - Earth Engine image
 * @returns {ee.Image} - MNDWI band
 */
export function computeMNDWI(image) {
  const bandNames = image.bandNames().getInfo() || [];
  
  let greenBand, swir1Band;
  if (bandNames.includes('B3') && bandNames.includes('B11')) {
    greenBand = 'B3';
    swir1Band = 'B11';
  } else if (bandNames.includes('SR_B3') && bandNames.includes('SR_B6')) {
    greenBand = 'SR_B3';
    swir1Band = 'SR_B6';
  } else if (bandNames.includes('sur_refl_b04') && bandNames.includes('sur_refl_b06')) {
    greenBand = 'sur_refl_b04';
    swir1Band = 'sur_refl_b06';
  } else {
    throw new Error(`Could not find required bands for MNDWI. Available bands: ${bandNames.join(', ')}`);
  }
  
  return image.normalizedDifference([greenBand, swir1Band]).rename('MNDWI');
}

/**
 * Compute delta (difference) between pre and post images
 * @param {ee.Image} preImg - Pre-event image
 * @param {ee.Image} postImg - Post-event image
 * @param {string} bandName - Name of the band to compute delta for
 * @returns {ee.Image} - Delta band
 */
export function computeDelta(preImg, postImg, bandName) {
  const preBand = preImg.select(bandName);
  const postBand = postImg.select(bandName);
  return postBand.subtract(preBand).rename(`delta_${bandName}`);
}

/**
 * Compute automatic threshold using Otsu's method
 * @param {ee.Image} image - Single-band image
 * @param {string} method - Threshold method (currently only 'otsu')
 * @param {number} scale - Nominal scale in meters
 * @param {ee.Geometry} geometry - Geometry to compute over
 * @returns {Promise<ee.Image>} - Binary mask
 */
export async function autoThreshold(image, method = 'otsu', scale = 30, geometry = null) {
  if (method.toLowerCase() !== 'otsu') {
    throw new Error("Currently only 'otsu' method is supported.");
  }

  const bandNames = image.bandNames().getInfo() || [];
  if (bandNames.length === 0) {
    throw new Error('auto_threshold requires an image with at least one band.');
  }

  const band = bandNames[0];
  const geom = geometry || image.geometry();

  // Compute histogram
  const histDict = await image
    .select(band)
    .reduceRegion({
      reducer: ee.Reducer.histogram({ maxBuckets: 256 }),
      geometry: geom,
      scale: scale,
      bestEffort: true
    })
    .get(band);

  if (!histDict) {
    throw new Error('Histogram computation failed; ensure the image has valid data over the geometry.');
  }

  const histInfo = histDict.getInfo ? histDict.getInfo() : histDict;
  const histogram = histInfo.histogram || [];
  const bins = histInfo.bucketMeans || [];

  if (!histogram || !bins || histogram.length === 0) {
    throw new Error('Histogram data is empty; cannot compute threshold.');
  }

  const total = histogram.reduce((sum, count) => sum + count, 0);
  if (total === 0) {
    throw new Error('Histogram has zero total counts; cannot compute threshold.');
  }

  // Compute Otsu threshold
  const totalMean = bins.reduce((sum, bin, i) => sum + bin * histogram[i], 0) / total;
  let weightBg = 0;
  let sumBg = 0;
  let maxBetween = -1;
  let thresholdValue = bins[0];

  for (let i = 0; i < bins.length; i++) {
    const binValue = bins[i];
    const count = histogram[i];
    
    weightBg += count;
    if (weightBg === 0) continue;

    const weightFg = total - weightBg;
    if (weightFg === 0) break;

    sumBg += binValue * count;
    const meanBg = sumBg / weightBg;
    const meanFg = (totalMean * total - sumBg) / weightFg;
    const between = weightBg * weightFg * Math.pow(meanBg - meanFg, 2);

    if (between > maxBetween) {
      maxBetween = between;
      thresholdValue = binValue;
    }
  }

  // Create binary mask
  return image.gt(ee.Number(thresholdValue)).rename(`${band}_mask`);
}

/**
 * Compute RGB delta between pre and post images
 * @param {ee.Image} preImg - Pre-event image
 * @param {ee.Image} postImg - Post-event image
 * @returns {ee.Image} - RGB delta band
 */
export function computeRGBDelta(preImg, postImg) {
  const preBands = preImg.bandNames().getInfo() || [];
  const postBands = postImg.bandNames().getInfo() || [];
  
  let rgbBands;
  if (['B4', 'B3', 'B2'].every(b => preBands.includes(b))) {
    rgbBands = ['B4', 'B3', 'B2'];
  } else if (['SR_B4', 'SR_B3', 'SR_B2'].every(b => preBands.includes(b))) {
    rgbBands = ['SR_B4', 'SR_B3', 'SR_B2'];
  } else if (['sur_refl_b01', 'sur_refl_b04', 'sur_refl_b03'].every(b => preBands.includes(b))) {
    rgbBands = ['sur_refl_b01', 'sur_refl_b04', 'sur_refl_b03'];
  } else {
    throw new Error('Could not resolve RGB bands for the provided imagery.');
  }

  const preRgb = preImg.select(rgbBands);
  const postRgb = postImg.select(rgbBands);
  const diff = postRgb.subtract(preRgb).abs();
  return diff.reduce(ee.Reducer.mean()).rename('RGB_DELTA');
}

