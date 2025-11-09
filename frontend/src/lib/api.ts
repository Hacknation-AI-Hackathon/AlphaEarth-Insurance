// Frontend/src/lib/api.ts
// Complete API client for AlphaEarth backend

// API base URL - defaults to /api for same-domain requests
// On Vercel, set VITE_API_URL to the full domain or use relative path
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Remove trailing slash to avoid double slashes
    return envUrl.replace(/\/+$/, '');
  }
  // Default to relative path for same-domain API calls
  return "/api";
};

const API_BASE_URL = getApiBaseUrl();

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  service: string;
}

export interface PreprocessingWindow {
  start: string;
  end: string;
}

export interface PreprocessingSchema {
  aoi: [number, number, number, number];
  pre: PreprocessingWindow;
  post: PreprocessingWindow;
  satellite?: "sentinel2" | "landsat8" | "landsat9" | "modis";
  max_cloud?: number;
  reducer?: "median" | "mosaic";
}

export interface HazardDetectionSchema {
  hazard?: "flood" | "wildfire" | "roof";
  scale?: number;
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

export interface ClaimProcessingResponse {
  preprocessing: any;
  hazard: {
    damage_pct?: number;
    [key: string]: any;
  };
  validation: {
    cross_sensor: number;
    meteorology: number;
    spatial_coherence: number;
    confidence: {
      confidence_score: number;
      label: string;
    };
    [key: string]: any;
  };
  claim: any;
  summary?: string;
  ranked_hazards?: Array<{
    hazard: string;
    fused_score: number;
    confidence_label: string;
  }>;
}

export interface FlightDelayRequest {
  origin_code: string;
  origin_coords: [number, number];
  departure_date: string;
  dest_code?: string;
  dest_coords?: [number, number];
  departure_time?: string;
  flight_duration_hours?: number;
  departure_airport?: string;
  arrival_airport?: string;
  scheduled_departure?: string;
  carrier?: string;
  flight_number?: string;
}

export interface FlightDelayResponse {
  delay_probability: number;
  expected_delay_minutes: number;
  risk_factors: any;
  payout_eligible: boolean;
  payout_amount: number;
  should_payout: boolean;
  severity: string;
  delay_reason: string;
  weather: {
    origin: {
      precipitation_mm: number;
      wind_speed_mph: number;
      has_storm: boolean;
    };
    destination?: {
      precipitation_mm: number;
      wind_speed_mph: number;
      has_storm: boolean;
    };
    route?: {
      route_precipitation_mm: number;
      has_storm_along_route: boolean;
    };
  };
  congestion: {
    origin: number;
    destination?: number;
  };
}

// ============================================
// API CLIENT CLASS
// ============================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMinutes: number = 5
  ): Promise<T> {
    // Ensure proper URL construction - avoid double slashes
    const base = this.baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${base}${path}`;
    
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
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      console.log(`📥 API Response: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;
        
        if (response.status === 502 || response.status === 503) {
          errorMessage = "Backend is unavailable. Please ensure the server is running on port 5000.";
          const error = new Error(errorMessage);
          (error as any).status = response.status;
          throw error;
        }
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
        } catch {
          // Couldn't parse error JSON
        }
        
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
      }
      
      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeoutMinutes} minutes`);
      }
      
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError')
      )) {
        throw new Error("Network error: Unable to connect to the server.");
      }
      
      throw error;
    }
  }

  // ============================================
  // HEALTH & STATUS
  // ============================================

  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      // Use /api/health endpoint explicitly to match backend route
      return await this.request<HealthCheckResponse>("/health", {}, 1); // 1 minute timeout
    } catch (error) {
      console.error("Health check failed:", error);
      // Provide more detailed error message
      const errorMessage = error instanceof Error ? error.message : "Backend is unavailable";
      throw new Error(`Health check failed: ${errorMessage}`);
    }
  }

  // ============================================
  // DISASTERS
  // ============================================

  async getActiveDisasters() {
    return await this.request<any>("/disasters/active");
  }

  async getHurricanes() {
    return await this.request<any>("/disasters/hurricanes");
  }

  async getHurricaneById(hurricaneId: string) {
    return await this.request<any>(`/disasters/hurricanes/${hurricaneId}`);
  }

  async getWildfires() {
    return await this.request<any>("/disasters/wildfires");
  }

  async getWildfireById(wildfireId: string) {
    return await this.request<any>(`/disasters/wildfires/${wildfireId}`);
  }

  // ============================================
  // EARTHQUAKES
  // ============================================

  async getActiveEarthquakes(params?: { magnitude?: number; timeframe?: string }) {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return await this.request<any>(`/earthquakes/active${queryString}`);
  }

  async getSignificantEarthquakes() {
    return await this.request<any>("/earthquakes/significant");
  }

  // ============================================
  // SEVERE WEATHER
  // ============================================

  async getActiveSevereWeather() {
    return await this.request<any>("/severe-weather/active");
  }

  async getTornadoWarnings() {
    return await this.request<any>("/severe-weather/tornadoes");
  }

  async getFloodWarnings() {
    return await this.request<any>("/severe-weather/floods");
  }

  async getAlertsByState(states: string[]) {
    return await this.request<any>(`/severe-weather/by-state/${states.join(',')}`);
  }

  // ============================================
  // ANALYSIS
  // ============================================

  async analyzeHurricane(stormId: string, region: string, numProperties: number) {
    return await this.request<any>("/analysis/hurricane", {
      method: "POST",
      body: JSON.stringify({ stormId, region, numProperties }),
    }, 3);
  }

  async analyzeWildfire(fireId: string, region: string, numProperties: number) {
    return await this.request<any>("/analysis/wildfire", {
      method: "POST",
      body: JSON.stringify({ fireId, region, numProperties }),
    }, 3);
  }

  async analyzeEarthquake(earthquakeId: string, region: string = 'california', radius: number = 100) {
    return await this.request<any>("/analysis/earthquake", {
      method: "POST",
      body: JSON.stringify({ earthquakeId, region, radius }),
    }, 3);
  }

  async analyzeSevereWeather(alertId: string, region: string = 'southeast', radius: number = 75) {
    return await this.request<any>("/analysis/severe-weather", {
      method: "POST",
      body: JSON.stringify({ alertId, region, radius }),
    }, 3);
  }

  async analyzeScenario(data: {
    disasterType: string;
    disasterId: string;
    scenarioModifier: string;
    region: string;
  }) {
    return await this.request<any>("/analysis/scenario", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async calculatePropertyRisk(data: {
    propertyId: string;
    riskAssessment: any;
  }) {
    return await this.request<any>("/analysis/property-risk", {
      method: "POST",
      body: JSON.stringify(data),
    }, 1);
  }

  // ============================================
  // PROPERTIES
  // ============================================

  async getPropertyPortfolio(params?: { region?: string; count?: number }) {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return await this.request<any>(`/properties/portfolio${queryString}`);
  }

  async getPropertiesInRegion(lat: number, lon: number, radius: number) {
    return await this.request<any>(`/properties/region?lat=${lat}&lon=${lon}&radius=${radius}`, {}, 3);
  }

  async getHighValueProperties(params?: { minValue?: number; threshold?: number; region?: string }) {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return await this.request<any>(`/properties/high-value${queryString}`, {}, 2);
  }

  async getCoastalProperties(params?: { maxDistance?: number; region?: string }) {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return await this.request<any>(`/properties/coastal${queryString}`, {}, 2);
  }

  // ============================================
  // RISK ASSESSMENT
  // ============================================

  async runMonteCarloSimulation(data: {
    riskAssessments: Array<{
      propertyId: string;
      coverageAmount: number;
      damageProbability: number;
    }>;
    numSimulations: number;
  }) {
    return await this.request<any>("/risk/monte-carlo", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPortfolioMetrics(data: {
    riskAssessments: Array<{
      propertyId: string;
      coverageAmount: number;
      damageProbability: number;
      expectedLoss: number;
      riskTier: string;
    }>;
  }) {
    return await this.request<any>("/risk/portfolio-metrics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ============================================
  // SATELLITE IMAGERY
  // ============================================

  async getImagery(data: {
    aoi: [number, number, number, number];
    date: string;
    source: string;
  }) {
    return await this.request<any>("/imagery/get", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getPrePostImagery(data: {
    aoi: [number, number, number, number];
    disasterDate: string;
    preDays: number;
    postDays: number;
    source: string;
  }) {
    return await this.request<any>("/imagery/pre-post", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getDisasterImpactImagery(data: {
    disasterType: string;
    coordinates: { lat: number; lon: number };
    disasterDate: string;
    source: string;
  }) {
    return await this.request<any>("/imagery/disaster-impact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAvailableImageryDates(days: number = 30) {
    return await this.request<any>(`/imagery/available-dates?days=${days}`);
  }

  async getImagerySources() {
    return await this.request<any>("/imagery/sources");
  }

  // ============================================
  // PARAMETRIC INSURANCE
  // ============================================

  async getParametricPolicies() {
    return await this.request<any>("/parametric/policies");
  }

  async getParametricPolicyById(policyId: string) {
    return await this.request<any>(`/parametric/policies/${policyId}`);
  }

  async createParametricPolicy(data: {
    propertyId: string;
    holder: { name: string; email: string };
    location: { lat: number; lon: number; address: string };
    coverage: { amount: number; currency: string; type: string };
    triggers: Array<{
      type: string;
      threshold: number;
      payout: number;
      description: string;
    }>;
  }) {
    return await this.request<any>("/parametric/policies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async evaluatePolicy(policyId: string) {
    return await this.request<any>(`/parametric/evaluate/${policyId}`, {
      method: "POST",
      body: JSON.stringify({
        eventContext: {
          eventName: "Manual Trigger Evaluation",
          timestamp: new Date().toISOString(),
        }
      }),
    }, 3);
  }

  async getPendingParametricPayouts() {
    return await this.request<any>("/parametric/payouts/pending");
  }

  async getProcessedParametricPayouts() {
    return await this.request<any>("/parametric/payouts/processed");
  }

  async getParametricPayoutById(payoutId: string) {
    return await this.request<any>(`/parametric/payouts/${payoutId}`);
  }

  async approveParametricPayout(payoutId: string, adminEmail: string, adminPassword: string) {
    return await this.request<any>(`/parametric/payouts/${payoutId}/approve`, {
      method: "POST",
      body: JSON.stringify({ adminEmail, adminPassword }),
    });
  }

  async rejectParametricPayout(payoutId: string, adminEmail: string, adminPassword: string, reason: string) {
    return await this.request<any>(`/parametric/payouts/${payoutId}/reject`, {
      method: "POST",
      body: JSON.stringify({ adminEmail, adminPassword, reason }),
    });
  }

  async getParametricStatistics() {
    return await this.request<any>("/parametric/statistics");
  }

  async createTestPolicy() {
    return await this.request<any>("/parametric/create-test-policy", {
      method: "POST",
    });
  }

  // ============================================
  // FLIGHT INSURANCE
  // ============================================

  async getAirportDelays() {
    return await this.request<any>("/flight/delays", {}, 2);
  }

  async getAirportDelayByCode(airportCode: string) {
    return await this.request<any>(`/flight/delays/${airportCode}`);
  }

  async getFlightPolicies() {
    return await this.request<any>("/flight/policies");
  }

  async getFlightPolicyById(policyId: string) {
    return await this.request<any>(`/flight/policies/${policyId}`);
  }

  async createFlightPolicy(data: {
    holder: { name: string; email: string; confirmationNumber: string };
    flight: {
      number: string;
      airline: string;
      from: string;
      to: string;
      departureTime: string;
    };
    coverage: { amount: number; currency: string; type: string };
    triggers: Array<{
      type: string;
      threshold: number;
      payout: number;
      description: string;
    }>;
  }) {
    return await this.request<any>("/flight/policies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async evaluateAllFlightPolicies() {
    return await this.request<any>("/flight/evaluate", {
      method: "POST",
    });
  }

  async evaluateFlightPolicy(policyId: string) {
    return await this.request<any>(`/flight/evaluate/${policyId}`, {
      method: "POST",
    });
  }

  async getPendingFlightPayouts() {
    return await this.request<any>("/flight/payouts/pending");
  }

  async getProcessedFlightPayouts() {
    return await this.request<any>("/flight/payouts/processed");
  }

  async getFlightPayoutById(payoutId: string) {
    return await this.request<any>(`/flight/payouts/${payoutId}`);
  }

  async approveFlightPayout(payoutId: string, adminEmail: string, adminPassword: string) {
    return await this.request<any>(`/flight/payouts/${payoutId}/approve`, {
      method: "POST",
      body: JSON.stringify({ adminEmail, adminPassword }),
    });
  }

  async rejectFlightPayout(payoutId: string, adminEmail: string, adminPassword: string, reason: string) {
    return await this.request<any>(`/flight/payouts/${payoutId}/reject`, {
      method: "POST",
      body: JSON.stringify({ adminEmail, adminPassword, reason }),
    });
  }

  async getFlightStatistics() {
    return await this.request<any>("/flight/statistics");
  }

  // ============================================
  // CLAIM PROCESSING (EXISTING)
  // ============================================

  async processClaim(request: ClaimProcessingRequest): Promise<ClaimProcessingResponse> {
    console.log("📄 Starting claim processing request...");
    
    try {
      const startTime = Date.now();
      const result = await this.request<ClaimProcessingResponse>("/claim_processing/basic", {
        method: "POST",
        body: JSON.stringify(request),
      }, 60);
      
      const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
      console.log(`✅ Claim processing completed in ${duration} minutes`);
      
      return result;
    } catch (error) {
      console.error("❌ Claim processing failed:", error);
      throw error;
    }
  }

  async analyzeFlightDelay(request: FlightDelayRequest): Promise<FlightDelayResponse> {
    return await this.request<FlightDelayResponse>("/flight/analyze", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // ============================================
  // DEMO / LOCATION ASSESSMENT
  // ============================================

  async assessLocation(data: {
    lat?: number;
    lon?: number;
    location?: string;
  }) {
    return await this.request<any>("/demo/assess", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getDemoLocations() {
    return await this.request<any>("/demo/locations");
  }

  // ============================================
  // DASHBOARD STATISTICS
  // ============================================

  async getDashboardStatistics() {
    return await this.request<any>("/dashboard/statistics");
  }
}

// Export singleton instance
export const apiClient = new ApiClient();