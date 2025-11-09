import express from 'express';
import { processClaim } from '../services/claimProcessingService.js';
import { summarizeClaimDecision } from '../services/summarizationService.js';

// Log that this route file is being loaded
console.log('📋 [ROUTES] claimProcessingRoutes.js loaded');
console.log('   Route will be available at: POST /api/claim_processing/basic');

const router = express.Router();

/**
 * POST /api/claim_processing/basic
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
  // Force immediate flush of console output
  process.stdout.write('');
  
  const requestStartTime = Date.now();
  
  try {
    console.log('='.repeat(80));
    console.log('📥 [CLAIM PROCESSING] Received new claim processing request');
    console.log('   Timestamp:', new Date().toISOString());
    console.log('   Method:', req.method);
    console.log('   Path:', req.path);
    console.log('   URL:', req.url);
    console.log('   Request Body:', JSON.stringify(req.body, null, 2));
    console.log('   Request Body type:', typeof req.body);
    console.log('   Request Body keys:', req.body ? Object.keys(req.body) : 'N/A');
    console.log('-'.repeat(80));
    
    // Force flush
    await new Promise(resolve => setImmediate(resolve));
    
    const config = req.body;

    // Validate required fields
    console.log('🔍 [VALIDATION] Validating request configuration...');
    
    if (!config.preprocessing) {
      console.error('❌ [VALIDATION] Missing preprocessing configuration');
      return res.status(400).json({
        success: false,
        error: 'preprocessing configuration is required'
      });
    }

    if (!config.preprocessing.aoi || !Array.isArray(config.preprocessing.aoi) || config.preprocessing.aoi.length !== 4) {
      console.error('❌ [VALIDATION] Invalid AOI:', config.preprocessing.aoi);
      return res.status(400).json({
        success: false,
        error: 'preprocessing.aoi must be an array of 4 numbers [minLon, minLat, maxLon, maxLat]'
      });
    }

    if (!config.preprocessing.pre || !config.preprocessing.pre.start || !config.preprocessing.pre.end) {
      console.error('❌ [VALIDATION] Invalid pre-event dates:', config.preprocessing.pre);
      return res.status(400).json({
        success: false,
        error: 'preprocessing.pre must have start and end dates (YYYY-MM-DD)'
      });
    }

    if (!config.preprocessing.post || !config.preprocessing.post.start || !config.preprocessing.post.end) {
      console.error('❌ [VALIDATION] Invalid post-event dates:', config.preprocessing.post);
      return res.status(400).json({
        success: false,
        error: 'preprocessing.post must have start and end dates (YYYY-MM-DD)'
      });
    }

    // Validate date order
    if (config.preprocessing.pre.end < config.preprocessing.pre.start) {
      console.error('❌ [VALIDATION] Pre-event end date is before start date');
      return res.status(400).json({
        success: false,
        error: 'preprocessing.pre.end must be after preprocessing.pre.start'
      });
    }

    if (config.preprocessing.post.end < config.preprocessing.post.start) {
      console.error('❌ [VALIDATION] Post-event end date is before start date');
      return res.status(400).json({
        success: false,
        error: 'preprocessing.post.end must be after preprocessing.post.start'
      });
    }

    console.log('✅ [VALIDATION] Request validation passed');
    console.log('   AOI:', config.preprocessing.aoi);
    console.log('   Pre-event period:', config.preprocessing.pre.start, 'to', config.preprocessing.pre.end);
    console.log('   Post-event period:', config.preprocessing.post.start, 'to', config.preprocessing.post.end);
    console.log('   Hazard type:', config.hazard?.hazard || 'auto-detect');
    console.log('   Satellite:', config.preprocessing.satellite || 'sentinel2');
    console.log('   Max cloud cover:', config.preprocessing.max_cloud || 30);
    console.log('-'.repeat(80));

    console.log('🚀 [PROCESSING] Starting claim processing...');
    console.log('   About to call processClaim()...');
    const processingStartTime = Date.now();
    
    let result;
    try {
      console.log('   Calling processClaim(config)...');
      result = await processClaim(config);
      console.log('   ✅ processClaim() returned successfully');
      console.log('   Result type:', typeof result);
      console.log('   Result is null/undefined?', result === null || result === undefined);
      console.log('   Result keys:', result ? Object.keys(result) : 'N/A');
    } catch (processError) {
      console.error('   ❌ ERROR in processClaim() call:');
      console.error('   Error:', processError);
      console.error('   Error message:', processError.message);
      console.error('   Error stack:', processError.stack);
      throw processError;
    }
    
    const processingDuration = ((Date.now() - processingStartTime) / 1000).toFixed(2);
    console.log('✅ [PROCESSING] Claim processing completed');
    console.log('   Processing duration:', processingDuration, 'seconds');
    console.log('   About to log result structure...');
    console.log('   Result:', result);
    
    if (!result) {
      console.error('   ❌ RESULT IS NULL OR UNDEFINED!');
      throw new Error('processClaim returned null or undefined');
    }
    
    // Log result structure
    console.log('   ═══════════════════════════════════════════════════════');
    console.log('   📊 RESULT STRUCTURE ANALYSIS:');
    console.log('   ═══════════════════════════════════════════════════════');
    console.log('   hasPreprocessing:', !!result.preprocessing);
    console.log('   hasHazard:', !!result.hazard);
    console.log('   hasValidation:', !!result.validation);
    console.log('   hasClaim:', !!result.claim);
    console.log('   hasSummary:', !!result.summary);
    console.log('   rankedHazardsCount:', result.ranked_hazards?.length || 0);
    console.log('   ═══════════════════════════════════════════════════════');
    
    const resultStructure = {
      hasPreprocessing: !!result.preprocessing,
      hasHazard: !!result.hazard,
      hasValidation: !!result.validation,
      hasClaim: !!result.claim,
      hasSummary: !!result.summary,
      rankedHazardsCount: result.ranked_hazards?.length || 0
    };
    console.log('   Result structure object:', JSON.stringify(resultStructure, null, 2));
    console.log('   ✅ Result structure logged successfully');
    
    if (result.hazard) {
      console.log('   Hazard detection:', {
        type: result.hazard.hazard,
        damage_pct: result.hazard.damage_pct,
        severity: result.hazard.severity
      });
    }
    
    if (result.validation?.confidence) {
      console.log('   Validation confidence:', {
        score: result.validation.confidence.confidence_score,
        label: result.validation.confidence.label
      });
    }
    
    if (result.claim) {
      console.log('   Claim decision:', {
        approved: result.claim.approved,
        confidence: result.claim.confidence,
        damage_pct: result.claim.damage_pct
      });
    }
    
    console.log('-'.repeat(80));
    console.log('📤 [RESPONSE] Preparing response to client...');
    
    // AI Summary Generation (if enabled)
    const summaryRequested = config.claim?.include_summary !== false;
    if (summaryRequested && result.claim) {
      console.log('🧠 [AI SUMMARY] Ensuring summary is present...');
      if (result.summary) {
        console.log('   ✅ Summary already provided by upstream service');
      } else {
        try {
          console.log('   🔄 Generating summary via summarizationService...');
          result.summary = await summarizeClaimDecision(result.claim);
          console.log('   ✅ AI summary generated successfully');
        } catch (summaryError) {
          console.error('   ❌ Failed to generate AI summary:', summaryError.message);
          console.error('   Stack:', summaryError.stack);
        }
      }

      if (result.summary) {
        console.log('   📝 AI Summary:', result.summary);
      } else {
        console.log('   ⚠️  AI summary unavailable; proceeding without summary');
      }
    } else if (!summaryRequested) {
      console.log('🧠 [AI SUMMARY] Summary generation disabled via config');
    } else {
      console.log('🧠 [AI SUMMARY] Summary generation skipped (no claim data)');
    }
    
    const response = {
      success: true,
      ...result
    };
    
    const totalDuration = ((Date.now() - requestStartTime) / 1000).toFixed(2);
    console.log('✅ [RESPONSE] Sending response to client');
    console.log('   Total request duration:', totalDuration, 'seconds');
    console.log('   Response size:', JSON.stringify(response).length, 'bytes');
    console.log('='.repeat(80));
    
    res.json(response);
  } catch (error) {
    const totalDuration = ((Date.now() - requestStartTime) / 1000).toFixed(2);
    console.error('❌ [ERROR] Claim processing failed - CAUGHT IN CATCH BLOCK');
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error type:', error.constructor.name);
    console.error('   Error stack:', error.stack);
    console.error('   Total request duration:', totalDuration, 'seconds');
    
    if (error.response) {
      console.error('   Error response status:', error.response.status);
      console.error('   Error response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.request) {
      console.error('   Error request:', error.request);
    }
    
    console.error('='.repeat(80));
    next(error);
  }
});

export default router;