import axios from 'axios';

// Python Earth Engine Service URL
// On Vercel, Python service is at /api/python relative to the same domain
const getPythonServiceUrl = () => {
  if (process.env.PYTHON_SERVICE_URL) {
    return process.env.PYTHON_SERVICE_URL;
  }
  
  // On Vercel, use relative URL to same domain
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/python`;
  }
  
  // Local development
  return 'http://localhost:5001';
};

const PYTHON_SERVICE_URL = getPythonServiceUrl();

let isInitialized = false;
let initializationPromise = null;

/**
 * Initialize Google Earth Engine
 * This now calls the Python service which handles authentication properly
 * 
 * Make sure the Python service is running:
 * 1. cd backend/python-service
 * 2. pip install -r requirements.txt
 * 3. earthengine authenticate
 * 4. python earth_engine_service.py
 */
export async function initializeEarthEngine() {
  if (isInitialized) {
    return;
  }

  // If initialization is already in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // Check if Python service is running
      console.log(`🔍 Checking Python service at ${PYTHON_SERVICE_URL}...`);
      const response = await axios.get(`${PYTHON_SERVICE_URL}/health`, {
        timeout: 5000,
        validateStatus: (status) => status < 500 // Accept 200-499 as valid responses
      });

      if (response.data && response.data.status === 'ok') {
        isInitialized = true;
        console.log('✅ Earth Engine Python service is running');
        console.log(`   Service URL: ${PYTHON_SERVICE_URL}`);
        return;
      } else {
        throw new Error(`Python service health check failed: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.error('❌ Failed to connect to Earth Engine Python service');
      console.error('   Error:', error.message);
      if (error.code) {
        console.error('   Error code:', error.code);
      }
      initializationPromise = null; // Reset so we can try again
      
      // Provide helpful error message
      let errorMessage;
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        errorMessage = `Earth Engine Python service is not running or not accessible.\n\n` +
          `Please start the Python service:\n` +
          `1. cd backend/python-service\n` +
          `2. pip install -r requirements.txt\n` +
          `3. earthengine authenticate\n` +
          `4. python earth_engine_service.py\n\n` +
          `The service should run on ${PYTHON_SERVICE_URL}\n` +
          `You can also run: .\\start_service.ps1\n\n` +
          `After starting, verify it's running by visiting: http://localhost:5001/health`;
      } else if (error.response) {
        errorMessage = `Python service returned error: ${error.response.status} - ${error.response.statusText}\n` +
          `Response: ${JSON.stringify(error.response.data)}`;
      } else {
        errorMessage = `Failed to connect to Earth Engine Python service: ${error.message}\n` +
          `Service URL: ${PYTHON_SERVICE_URL}`;
      }
      
      throw new Error(errorMessage);
    }
  })();

  return initializationPromise;
}

/**
 * Convert AOI to Earth Engine Geometry
 * Now just validates and returns the AOI (geometry conversion happens in Python service)
 * @param {Array|Object} aoi - [minLon, minLat, maxLon, maxLat] or GeoJSON geometry
 * @returns {Object} - AOI object (passed to Python service)
 */
export function toGeometry(aoi) {
  // Just validate the AOI format - actual geometry conversion happens in Python
  if (Array.isArray(aoi) && aoi.length === 4) {
    // Bounding box [minLon, minLat, maxLon, maxLat]
    return aoi;
  }
  
  if (typeof aoi === 'object' && aoi.type) {
    // GeoJSON geometry
    return aoi;
  }
  
  throw new Error('Unsupported AOI type. Use [minLon, minLat, maxLon, maxLat] or GeoJSON geometry.');
}

/**
 * Call Python service to get imagery
 */
export async function getImageryFromPython(params) {
  await initializeEarthEngine();
  
  const response = await axios.post(`${PYTHON_SERVICE_URL}/get-imagery`, {
    aoi: params.aoi,
    startDate: params.startDate,
    endDate: params.endDate,
    satellite: params.satellite || 'sentinel2',
    maxCloud: params.maxCloud || 30,
    reducer: params.reducer || 'median'
  }, {
    timeout: 300000 // 5 minutes timeout for Earth Engine operations
  });

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to get imagery from Python service');
  }

  return response.data;
}

/**
 * Call Python service to detect hazard
 */
export async function detectHazardFromPython(params) {
  await initializeEarthEngine();
  
  const response = await axios.post(`${PYTHON_SERVICE_URL}/detect-hazard`, {
    hazard: params.hazard,
    preImage: params.preImage,
    postImage: params.postImage,
    aoi: params.aoi,
    scale: params.scale || 30
  }, {
    timeout: 300000
  });

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to detect hazard from Python service');
  }

  return response.data.result;
}

/**
 * Call Python service to validate claim
 */
export async function validateFromPython(params) {
  await initializeEarthEngine();
  
  const response = await axios.post(`${PYTHON_SERVICE_URL}/validate`, {
    aoi: params.aoi,
    preDate: params.preDate,
    postDate: params.postDate,
    hazard: params.hazard || 'flood',
    scale: params.scale || 30
  }, {
    timeout: 300000
  });

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to validate from Python service');
  }

  return response.data.validation;
}

// Export a mock 'ee' object for compatibility with existing code
// This allows code that imports { ee } to still work, but they should use the Python service functions instead
export const ee = {
  Geometry: {
    Rectangle: (aoi) => aoi, // Just return the AOI
  },
  // Add other commonly used properties as needed
};

