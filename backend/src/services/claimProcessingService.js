import { initializeEarthEngine, toGeometry } from './earthEngineService.js';
import { getImagery } from './preprocessingService.js';
import { detectHazard } from './hazardDetectionService.js';
import {
  crossSensorCheck,
  meteorologyCheck,
  spatialCoherenceCheck,
  computeEmbeddingChangeScore,
  confidenceScore
} from './validationService.js';
import { decideClaim } from './claimDecisionService.js';
import { summarizeClaimDecision } from './summarizationService.js';

const SUPPORTED_HAZARDS = ['flood', 'wildfire', 'roof'];
const DEFAULT_SCALES = {
  flood: 30,
  wildfire: 30,
  roof: 10
};

/**
 * Initialize Earth Engine if not already initialized
 */
function ensureInitialized() {
  try {
    initializeEarthEngine();
  } catch (error) {
    console.error('Earth Engine initialization error:', error);
    throw error;
  }
}

/**
 * Get imagery pair for pre and post events
 * @param {Object} config - Preprocessing configuration
 * @returns {Promise<Object>} - Imagery pair with pre, post, and geometry
 */
async function getImageryPair(config) {
  const aoiGeom = toGeometry(config.aoi);
  const satellite = config.satellite || 'sentinel2';
  const maxCloud = config.max_cloud !== undefined ? config.max_cloud : 30;
  const reducer = config.reducer || 'median';

  const pre = await getImagery({
    aoi: aoiGeom,
    startDate: config.pre.start,
    endDate: config.pre.end,
    satellite: satellite,
    maxCloud: maxCloud,
    reducer: reducer
  });

  const post = await getImagery({
    aoi: aoiGeom,
    startDate: config.post.start,
    endDate: config.post.end,
    satellite: satellite,
    maxCloud: maxCloud,
    reducer: reducer
  });

  // Verify images have bands
  const preBands = pre.image.bandNames().getInfo() || [];
  const postBands = post.image.bandNames().getInfo() || [];

  if (preBands.length === 0) {
    throw new Error(
      `No usable imagery found for pre-event window (${config.pre.start} to ${config.pre.end}). ` +
      `Try expanding the date range or increasing max_cloud.`
    );
  }

  if (postBands.length === 0) {
    throw new Error(
      `No usable imagery found for post-event window (${config.post.start} to ${config.post.end}). ` +
      `Try expanding the date range or increasing max_cloud.`
    );
  }

  return {
    pre: pre,
    post: post,
    geometry: aoiGeom
  };
}

/**
 * Run hazard detection
 * @param {ee.Image} preImg - Pre-event image
 * @param {ee.Image} postImg - Post-event image
 * @param {string} hazardKey - Hazard type
 * @param {number} scale - Scale in meters
 * @param {ee.Geometry} aoiGeom - Area of interest
 * @returns {Promise<Array>} - [hazard_result, mask]
 */
async function runHazard(preImg, postImg, hazardKey, scale, aoiGeom) {
  const result = await detectHazard(
    hazardKey,
    preImg,
    postImg,
    aoiGeom,
    scale,
    true // returnMask
  );

  // detectHazard returns [result, mask] when returnMask is true
  return Array.isArray(result) ? result : [result, null];
}

/**
 * Run validation checks
 * @param {ee.Geometry} aoiGeom - Area of interest
 * @param {Array} preWindow - Pre-event date window [start, end]
 * @param {Array} postWindow - Post-event date window [start, end]
 * @param {ee.Image} maskImage - Hazard mask image
 * @param {number} scale - Scale in meters
 * @param {string} hazard - Hazard type
 * @param {ee.Image} preImg - Pre-event image
 * @param {ee.Image} postImg - Post-event image
 * @returns {Promise<Object>} - Validation result
 */
async function runValidation(
  aoiGeom,
  preWindow,
  postWindow,
  maskImage,
  scale,
  hazard,
  preImg,
  postImg
) {
  if (!maskImage) {
    return {
      cross_sensor: 0.0,
      meteorology: 0.0,
      spatial_coherence: 0.0,
      confidence: {
        confidence_score: 0.0,
        label: 'Unknown'
      }
    };
  }

  try {
    const cross = await crossSensorCheck(aoiGeom, preWindow[0], postWindow[0], scale);
    const met = await meteorologyCheck(aoiGeom, postWindow, hazard);
    const coherence = await spatialCoherenceCheck(aoiGeom, maskImage, scale);
    const embScore = await computeEmbeddingChangeScore(preImg, postImg, aoiGeom);
    const conf = confidenceScore(cross, met, coherence, embScore);

    return {
      cross_sensor: Math.round(cross * 100) / 100,
      meteorology: Math.round(met * 100) / 100,
      spatial_coherence: Math.round(coherence * 100) / 100,
      embedding_change: Math.round(embScore * 1000) / 1000,
      confidence: conf
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      error: error.message,
      cross_sensor: 0.0,
      meteorology: 0.0,
      spatial_coherence: 0.0,
      confidence: {
        confidence_score: 0.0,
        label: 'Unknown'
      }
    };
  }
}

/**
 * Evaluate a single hazard type
 * @param {string} hazardKey - Hazard type
 * @param {Object} imagery - Imagery pair
 * @param {Array} preDates - Pre-event dates [start, end]
 * @param {Array} postDates - Post-event dates [start, end]
 * @param {number} scaleOverride - Optional scale override
 * @returns {Promise<Object>} - Evaluation result
 */
async function evaluateHazard(hazardKey, imagery, preDates, postDates, scaleOverride = null) {
  const scale = scaleOverride || DEFAULT_SCALES[hazardKey] || 30;
  
  const [hazardResult, mask] = await runHazard(
    imagery.pre.image,
    imagery.post.image,
    hazardKey,
    scale,
    imagery.geometry
  );

  const validation = await runValidation(
    imagery.geometry,
    preDates,
    postDates,
    mask,
    scale,
    hazardKey,
    imagery.pre.image,
    imagery.post.image
  );

  const claimResult = decideClaim(hazardResult, validation);
  const fusedScore = claimResult.fused_score || 0.0;

  return {
    hazard_key: hazardKey,
    scale: scale,
    hazard: hazardResult,
    validation: validation,
    claim: claimResult,
    fused_score: fusedScore
  };
}

/**
 * Process claim request
 * @param {Object} config - Claim processing configuration
 * @returns {Promise<Object>} - Claim processing result
 */
export async function processClaim(config) {
  ensureInitialized();

  const imagery = await getImageryPair(config.preprocessing);
  const preDates = [config.preprocessing.pre.start, config.preprocessing.pre.end];
  const postDates = [config.preprocessing.post.start, config.preprocessing.post.end];
  
  const hazardCfg = config.hazard || {};
  const claimCfg = config.claim || {};

  let candidates;
  let best;

  if (hazardCfg.hazard) {
    // Evaluate specific hazard
    best = await evaluateHazard(
      hazardCfg.hazard,
      imagery,
      preDates,
      postDates,
      hazardCfg.scale
    );
    candidates = [best];
  } else {
    // Evaluate all hazards and pick the best
    const evaluations = await Promise.all(
      SUPPORTED_HAZARDS.map(hazardKey =>
        evaluateHazard(hazardKey, imagery, preDates, postDates, hazardCfg.scale)
      )
    );
    
    candidates = evaluations;
    best = evaluations.reduce((max, candidate) =>
      candidate.fused_score > max.fused_score ? candidate : max
    );
  }

  const hazardResult = best.hazard;
  const validation = best.validation;
  const claimResult = best.claim;

  const response = {
    hazard: hazardResult,
    validation: validation,
    claim: claimResult,
    ranked_hazards: candidates
      .sort((a, b) => b.fused_score - a.fused_score)
      .map(c => ({
        hazard: c.hazard_key,
        fused_score: c.fused_score,
        damage_pct: c.hazard.damage_pct,
        confidence_label: c.claim.confidence_label
      }))
  };

  // Add summary if requested
  if (claimCfg.include_summary !== false) {
    try {
      response.summary = await summarizeClaimDecision(claimResult);
    } catch (error) {
      console.error('Summary generation failed:', error);
      response.summary = 'Summary generation failed. See claim details for information.';
    }
  }

  // Add visualization tiles if requested
  if (claimCfg.include_tiles !== false) {
    response.visualization = {
      pre_tile: imagery.pre.url_template,
      post_tile: imagery.post.url_template,
      dataset: imagery.pre.dataset,
      bands: imagery.pre.vis_params.bands,
      aoi: config.preprocessing.aoi
    };
  }

  return response;
}

