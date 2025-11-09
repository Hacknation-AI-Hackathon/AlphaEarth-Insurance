import axios from 'axios';
import { initializeEarthEngine } from './earthEngineService.js';

// Python Earth Engine Service URL
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

/**
 * Initialize Earth Engine if not already initialized
 * This checks if the Python service is running
 */
async function ensureInitialized() {
  try {
    await initializeEarthEngine();
  } catch (error) {
    console.error('Earth Engine initialization error:', error);
    throw error;
  }
}

// All Earth Engine operations are now handled by the Python service
// This service acts as a proxy to the Python service

/**
 * Process claim request
 * Now delegates to Python service for all Earth Engine operations
 * @param {Object} config - Claim processing configuration
 * @returns {Promise<Object>} - Claim processing result
 */
export async function processClaim(config) {
  console.log('🔧 [SERVICE] Initializing Earth Engine service...');
  await ensureInitialized();
  console.log('✅ [SERVICE] Earth Engine service initialized');

  console.log('📄 [SERVICE] Processing claim via Python service...');
  console.log('   Python Service URL:', PYTHON_SERVICE_URL);
  console.log('   Request Config:');
  console.log('     - AOI:', config.preprocessing?.aoi);
  console.log('     - Pre-event:', config.preprocessing?.pre);
  console.log('     - Post-event:', config.preprocessing?.post);
  console.log('     - Satellite:', config.preprocessing?.satellite);
  console.log('     - Max cloud:', config.preprocessing?.max_cloud);
  console.log('     - Hazard:', config.hazard);
  console.log('     - Claim options:', config.claim);
  console.log('   Full config JSON:', JSON.stringify(config, null, 2));

  try {
    const serviceCallStartTime = Date.now();
    console.log('🌐 [SERVICE] Calling Python service endpoint:', `${PYTHON_SERVICE_URL}/process-claim`);
    console.log('   Timeout:', '600000ms (10 minutes)');
    
    // Call Python service's process-claim endpoint
    const response = await axios.post(
      `${PYTHON_SERVICE_URL}/process-claim`,
      config,
      {
        timeout: 600000, // 10 minutes timeout for claim processing
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const serviceCallDuration = ((Date.now() - serviceCallStartTime) / 1000).toFixed(2);
    console.log('✅ [SERVICE] Python service responded');
    console.log('   Response status:', response.status);
    console.log('   Response duration:', serviceCallDuration, 'seconds');
    console.log('   Response headers:', JSON.stringify(response.headers, null, 2));
    console.log('   Response data keys:', Object.keys(response.data || {}));
    console.log('   Response success:', response.data?.success);

    if (!response.data.success) {
      console.error('❌ [SERVICE] Python service returned error');
      console.error('   Error:', response.data.error);
      throw new Error(response.data.error || 'Claim processing failed');
    }

    // Transform Python service response to match expected format
    const pythonResponse = response.data;
    console.log('🔄 [SERVICE] Transforming Python service response...');
    console.log('   Python response structure:', {
      hasPreprocessing: !!pythonResponse.preprocessing,
      hasHazard: !!pythonResponse.hazard,
      hasValidation: !!pythonResponse.validation,
      hasClaim: !!pythonResponse.claim,
      hasSummary: !!pythonResponse.summary,
      keys: Object.keys(pythonResponse)
    });
    
    if (pythonResponse.preprocessing) {
      console.log('   Preprocessing data:', {
        hasPre: !!pythonResponse.preprocessing.pre,
        hasPost: !!pythonResponse.preprocessing.post
      });
    }
    
    if (pythonResponse.hazard) {
      console.log('   Hazard data:', {
        hazard: pythonResponse.hazard.hazard,
        damage_pct: pythonResponse.hazard.damage_pct,
        severity: pythonResponse.hazard.severity
      });
    }
    
    if (pythonResponse.validation) {
      console.log('   Validation data:', {
        hasConfidence: !!pythonResponse.validation.confidence,
        cross_sensor: pythonResponse.validation.cross_sensor,
        meteorology: pythonResponse.validation.meteorology,
        spatial_coherence: pythonResponse.validation.spatial_coherence
      });
    }
    
    if (pythonResponse.claim) {
      console.log('   Claim data:', {
        approved: pythonResponse.claim.approved,
        damage_pct: pythonResponse.claim.damage_pct,
        confidence: pythonResponse.claim.confidence
      });
    }
    
    // Build response in the format expected by the frontend
    const result = {
      preprocessing: pythonResponse.preprocessing,
      hazard: pythonResponse.hazard,
      validation: pythonResponse.validation,
      claim: pythonResponse.claim,
      summary: pythonResponse.summary || null,
      ranked_hazards: pythonResponse.ranked_hazards || [{
        hazard: pythonResponse.hazard?.hazard || 'flood',
        fused_score: pythonResponse.claim?.confidence || 0.5,
        confidence_label: pythonResponse.validation?.confidence?.label || 'medium'
      }]
    };

    console.log('✅ [SERVICE] Response transformation completed');
    console.log('   Result structure:', {
      hasPreprocessing: !!result.preprocessing,
      hasHazard: !!result.hazard,
      hasValidation: !!result.validation,
      hasClaim: !!result.claim,
      hasSummary: !!result.summary,
      rankedHazardsCount: result.ranked_hazards?.length || 0
    });
    console.log('   Full result JSON (first 1000 chars):', JSON.stringify(result).substring(0, 1000));
    console.log('   About to return result from processClaim()...');
    console.log('   Result type:', typeof result);
    console.log('   Result is an object?', typeof result === 'object' && result !== null);
    
    // Ensure we actually return the result
    const returnValue = result;
    console.log('   ✅ Returning result from processClaim()');
    return returnValue;

  } catch (error) {
    console.error('❌ [SERVICE] Claim processing failed');
    console.error('   Error type:', error.constructor.name);
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.request) {
      console.error('   Request was made but no response received');
      console.error('   Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      });
    }
    
    console.error('   Error stack:', error.stack);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   Connection refused - Python service is not running');
      throw new Error(
        `Earth Engine Python service is not running.\n\n` +
        `Please start the Python service:\n` +
        `1. cd backend/python-service\n` +
        `2. pip install -r requirements.txt\n` +
        `3. earthengine authenticate\n` +
        `4. python earth_engine_service.py\n\n` +
        `The service should run on ${PYTHON_SERVICE_URL}`
      );
    }
    
    if (error.code === 'ETIMEDOUT') {
      console.error('   Request timed out after 10 minutes');
      throw new Error('Request timed out. The processing is taking longer than expected.');
    }
    
    if (error.response?.data?.error) {
      console.error('   Python service error:', error.response.data.error);
      throw new Error(error.response.data.error);
    }
    
    throw error;
  }
}

