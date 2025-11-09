const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Disaster endpoints
  async getActiveDisasters() {
    return this.request('/disasters/active');
  }

  async getHurricaneForecast(stormId: string) {
    return this.request(`/disasters/hurricanes/${stormId}`);
  }

  async getWildfirePerimeter(fireId: string) {
    return this.request(`/disasters/wildfires/${fireId}`);
  }

  // Analysis endpoints
  async analyzeHurricane(stormId: string, options?: { region?: string; numProperties?: number }) {
    return this.request('/analysis/hurricane', {
      method: 'POST',
      body: JSON.stringify({ stormId, ...options }),
    });
  }

  async analyzeWildfire(fireId: string, options?: { region?: string; numProperties?: number }) {
    return this.request('/analysis/wildfire', {
      method: 'POST',
      body: JSON.stringify({ fireId, ...options }),
    });
  }

  async analyzeEarthquake(earthquakeId: string, options?: { region?: string; radius?: number }) {
    return this.request('/analysis/earthquake', {
      method: 'POST',
      body: JSON.stringify({ earthquakeId, ...options }),
    });
  }

  async analyzeSevereWeather(alertId: string, options?: { region?: string; radius?: number }) {
    return this.request('/analysis/severe-weather', {
      method: 'POST',
      body: JSON.stringify({ alertId, ...options }),
    });
  }

  async runScenarioAnalysis(params: {
    disasterType: 'hurricane' | 'wildfire' | 'earthquake' | 'severe_weather';
    disasterId: string;
    scenarioModifier?: string;
    region?: string;
  }) {
    return this.request('/analysis/scenario', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Property endpoints
  async getPropertyPortfolio(region = 'florida', count = 100) {
    return this.request(`/properties/portfolio?region=${region}&count=${count}`);
  }

  async getPropertiesInRegion(lat: number, lon: number, radius = 100) {
    return this.request(`/properties/region?lat=${lat}&lon=${lon}&radius=${radius}`);
  }

  // Risk endpoints
  async runMonteCarloSimulation(riskAssessments: any[], numSimulations = 1000) {
    return this.request('/risk/monte-carlo', {
      method: 'POST',
      body: JSON.stringify({ riskAssessments, numSimulations }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;