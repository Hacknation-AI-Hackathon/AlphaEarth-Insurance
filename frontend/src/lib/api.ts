// API client for backend communication

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export interface PreprocessingWindow {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

export interface PreprocessingSchema {
  aoi: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  pre: PreprocessingWindow;
  post: PreprocessingWindow;
  satellite?: "sentinel2" | "landsat8" | "landsat9" | "modis";
  max_cloud?: number; // 0-100
  reducer?: "median" | "mosaic";
}

export interface HazardDetectionSchema {
  hazard?: "flood" | "wildfire" | "roof";
  scale?: number; // Nominal EE reducer scale in meters
}

export interface ClaimDecisionSchema {
  include_summary?: boolean;
  include_tiles?: boolean;
}

export interface ClaimProcessingRequest {
  preprocessing: PreprocessingSchema;
  hazard?: HazardDetectionSchema;
  claim?: ClaimDecisionSchema;
}

export interface Confidence {
  confidence_score: number;
  label: string;
}

export interface Validation {
  cross_sensor: number;
  meteorology: number;
  spatial_coherence: number;
  confidence: Confidence;
  error?: string;
}

export interface HazardResult {
  damage_pct?: number;
  [key: string]: any;
}

export interface ClaimResult {
  fused_score?: number;
  confidence_label?: string;
  [key: string]: any;
}

export interface RankedHazard {
  hazard: string;
  fused_score: number;
  damage_pct?: number;
  confidence_label?: string;
}

export interface Visualization {
  pre_tile: string;
  post_tile: string;
  dataset: string;
  bands: string[];
  aoi: [number, number, number, number];
}

export interface ClaimProcessingResponse {
  hazard: HazardResult;
  validation: Validation;
  claim: ClaimResult;
  ranked_hazards: RankedHazard[];
  summary?: string;
  visualization?: Visualization;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
}

// Flight Delay Types
export interface FlightDelayRequest {
  origin_code: string;
  origin_coords: [number, number]; // [longitude, latitude]
  dest_code: string;
  dest_coords: [number, number]; // [longitude, latitude]
  departure_date: string; // YYYY-MM-DD
  departure_time?: string; // HH:MM
  flight_duration_hours?: number;
}

export interface WeatherData {
  precipitation_mm: number;
  wind_speed_mph: number;
  has_storm: boolean;
  error?: string;
}

export interface RouteWeather {
  route_precipitation_mm: number;
  max_precipitation_mm: number;
  has_storm_along_route: boolean;
  route_length_km?: number;
  error?: string;
}

export interface DelayFactors {
  origin_storm: boolean;
  dest_storm: boolean;
  route_storm: boolean;
  origin_precip: number;
  dest_precip: number;
  origin_wind: number;
  dest_wind: number;
  origin_congestion: number;
  dest_congestion: number;
}

export interface FlightDelayResponse {
  delay_probability: number;
  severity: "low" | "medium" | "high" | "unknown";
  payout_amount: number;
  should_payout: boolean;
  delay_reason: string;
  factors: DelayFactors;
  weather: {
    origin: WeatherData;
    destination: WeatherData;
    route: RouteWeather;
  };
  congestion: {
    origin: number;
    destination: number;
  };
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMinutes: number = 5 // Default timeout for most requests
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Create AbortController for timeout
    // For long-running requests like claim processing, use 45 minutes (buffer for 30 min processing)
    const controller = new AbortController();
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const timeoutId = timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : null;
    
    const config: RequestInit = {
      ...options,
      signal: timeoutMs > 0 ? controller.signal : undefined,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      console.log(`🌐 Making request to: ${url}`, {
        method: options.method || 'GET',
        timeout: timeoutMinutes,
        timestamp: new Date().toISOString(),
      });
      
      const response = await fetch(url, config);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      console.log(`📥 Received response: ${response.status} ${response.statusText}`, {
        ok: response.ok,
        contentType: response.headers.get('content-type'),
        timestamp: new Date().toISOString(),
      });
      
      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        
        // Handle proxy errors that indicate backend is down
        if (response.status === 502 || response.status === 503) {
          errorMessage = "Backend is unavailable. Please ensure the server is running on port 8000.";
          const error = new Error(errorMessage);
          (error as any).status = response.status;
          throw error;
        }
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
          
          // Provide more helpful error messages
          if (response.status === 500) {
            // Check if it's a specific backend error
            if (errorData.detail && typeof errorData.detail === 'string') {
              // If the error contains specific info, use it
              if (errorData.detail.includes('Earth Engine') || errorData.detail.includes('GEE')) {
                errorMessage = "Earth Engine error: " + errorData.detail;
              } else if (errorData.detail.includes('timeout') || errorData.detail.includes('Timeout')) {
                errorMessage = "Processing timeout: The request took too long. Please try with a smaller area or different dates.";
              } else {
                errorMessage = "Server error: " + errorData.detail;
              }
            } else {
              errorMessage = "Server error: The backend is experiencing issues. Please try again in a moment.";
            }
          } else if (response.status === 400) {
            errorMessage = errorData.detail || "Invalid request. Please check your input and try again.";
          } else if (response.status === 404) {
            errorMessage = "Endpoint not found. Please contact support.";
          }
        } catch (parseError) {
          // If JSON parsing fails, use status-based message
          console.error("❌ Failed to parse error response:", parseError);
          if (response.status === 500) {
            errorMessage = "Server error: The backend is experiencing issues. Please try again in a moment.";
          } else if (response.status === 502 || response.status === 503) {
            errorMessage = "Backend is unavailable. Please ensure the server is running on port 8000.";
          }
        }
        
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
      }

      // Parse JSON response with better error handling
      try {
        const jsonData = await response.json();
        console.log(`✅ Successfully parsed response`, {
          keys: Object.keys(jsonData),
          timestamp: new Date().toISOString(),
        });
        return jsonData;
      } catch (parseError) {
        console.error("❌ Failed to parse JSON response:", parseError);
        throw new Error("Failed to parse server response. The response may be malformed or too large.");
      }
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      console.error("❌ Request failed:", error);
      
      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("⏱️ Request timeout after", timeoutMinutes, "minutes");
        throw new Error("Request timeout: The processing is taking longer than expected. Please try again or contact support.");
      }
      
      // Handle network errors (backend is down or unreachable)
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('Network request failed') ||
        error.name === 'TypeError' && error.message.includes('fetch')
      )) {
        console.error("🌐 Network error detected - backend is likely down");
        throw new Error("Network error: Unable to connect to the server. The backend may be down.");
      }
      
      // Handle CORS errors
      if (error instanceof Error && error.message.includes('CORS')) {
        console.error("🚫 CORS error detected");
        throw new Error("CORS error: The server is not allowing requests from this origin. Please contact support.");
      }
      
      // Re-throw known errors
      if (error instanceof Error) {
        throw error;
      }
      
      // Unknown error
      console.error("❓ Unknown error type:", typeof error, error);
      throw new Error("An unknown error occurred");
    }
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    // Health check should be quick - 5 second timeout
    try {
      return await this.request<HealthCheckResponse>("/health", {}, 0.083); // 5 seconds
    } catch (error) {
      // If health check fails, throw a clear error
      // This ensures React Query knows the backend is down
      console.error("Health check failed:", error);
      throw new Error("Backend is unavailable");
    }
  }

  async processClaim(
    request: ClaimProcessingRequest
  ): Promise<ClaimProcessingResponse> {
    // Claim processing can take up to 30 minutes, so set timeout to 60 minutes for safety
    // Log the request for debugging
    console.log("🔄 Starting claim processing request...", {
      aoi: request.preprocessing.aoi,
      hazard: request.hazard?.hazard || "auto-detect",
      timestamp: new Date().toISOString(),
    });
    
    try {
      const startTime = Date.now();
      const result = await this.request<ClaimProcessingResponse>("/claim_processing_basic", {
        method: "POST",
        body: JSON.stringify(request),
      }, 60); // 60 minutes timeout (matching backend and proxy timeouts)
      
      const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
      console.log("✅ Claim processing completed successfully", {
        duration: `${duration} minutes`,
        timestamp: new Date().toISOString(),
        hasHazard: !!result.hazard,
        hasValidation: !!result.validation,
        hasClaim: !!result.claim,
      });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Claim processing failed:", {
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  async analyzeFlightDelay(
    request: FlightDelayRequest
  ): Promise<FlightDelayResponse> {
    // Flight delay analysis should be relatively quick (1-2 minutes)
    console.log("🔄 Starting flight delay analysis...", {
      route: `${request.origin_code} -> ${request.dest_code}`,
      date: request.departure_date,
      timestamp: new Date().toISOString(),
    });
    
    try {
      const startTime = Date.now();
      const result = await this.request<FlightDelayResponse>("/flight_delay_analysis", {
        method: "POST",
        body: JSON.stringify(request),
      }, 5); // 5 minutes timeout
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log("✅ Flight delay analysis completed successfully", {
        duration: `${duration} seconds`,
        delayProbability: result.delay_probability,
        payoutAmount: result.payout_amount,
        timestamp: new Date().toISOString(),
      });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Flight delay analysis failed:", {
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
