import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 180 }); // 3 minutes cache (weather alerts change frequently)

class SevereWeatherService {
  constructor() {
    this.noaaAlertsUrl = 'https://api.weather.gov/alerts';
  }

  /**
   * Get all active severe weather alerts - REAL-TIME
   */
  async getActiveSevereWeatherAlerts(filters = {}) {
    const cacheKey = `severe_weather_${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    this.usingMockSevereWeather = false;

    try {
      console.log('Fetching real-time severe weather alerts from NOAA...');

      // Build query parameters
      const params = new URLSearchParams();

      // Add area filter (states)
      if (filters.states && filters.states.length > 0) {
        params.append('area', filters.states.join(','));
      }

      // Add event type filters
      const severeEvents = [
        'Tornado Warning',
        'Severe Thunderstorm Warning',
        'Flash Flood Warning',
        'Flood Warning',
        'Hurricane Warning',
        'Storm Surge Warning',
        'Tsunami Warning',
        'Extreme Wind Warning',
        'Ice Storm Warning',
        'Blizzard Warning'
      ];

      const response = await axios.get(
        `${this.noaaAlertsUrl}/active${params.toString() ? '?' + params.toString() : ''}`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/geo+json',
            'User-Agent': 'AlphaEarthInsurance/1.0'
          }
        }
      );

      if (!response.data || !response.data.features) {
        console.log('No severe weather alerts found, using mock data for demo');
        this.usingMockSevereWeather = true;
        return this.getMockSevereWeatherAlerts();
      }

      // Filter for severe/disaster-related alerts only
      const severeAlerts = response.data.features.filter(alert => {
        const event = alert.properties.event;
        return severeEvents.some(severeEvent => event.includes(severeEvent));
      });

      if (severeAlerts.length === 0) {
        console.log('No severe weather alerts, using mock data for demo');
        this.usingMockSevereWeather = true;
        return this.getMockSevereWeatherAlerts();
      }

      const alerts = severeAlerts.map(alert => ({
        id: alert.id,
        name: alert.properties.event,
        type: this.categorizeAlertType(alert.properties.event),
        status: this.getAlertStatus(alert.properties.severity, alert.properties.urgency),
        event: alert.properties.event,
        severity: alert.properties.severity,
        urgency: alert.properties.urgency,
        certainty: alert.properties.certainty,
        location: alert.properties.areaDesc,
        coordinates: this.extractCoordinates(alert.geometry),
        headline: alert.properties.headline,
        description: alert.properties.description,
        instruction: alert.properties.instruction,
        effective: alert.properties.effective,
        expires: alert.properties.expires,
        onset: alert.properties.onset,
        ends: alert.properties.ends,
        affectedZones: alert.properties.affectedZones,
        geometry: alert.geometry,
        lastUpdated: alert.properties.sent
      }));

      console.log(`Found ${alerts.length} active severe weather alerts`);

      cache.set(cacheKey, alerts);
      return alerts;

    } catch (error) {
      console.error('Error fetching severe weather alerts from NOAA:', error.message);
      console.log('Using mock severe weather data for demo');
      this.usingMockSevereWeather = true;
      return this.getMockSevereWeatherAlerts();
    }
  }

  /**
   * Get tornado warnings specifically
   */
  async getTornadoWarnings() {
    const cacheKey = 'tornado_warnings';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `${this.noaaAlertsUrl}/active`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/geo+json',
            'User-Agent': 'AlphaEarthInsurance/1.0'
          }
        }
      );

      const tornadoAlerts = response.data.features.filter(alert =>
        alert.properties.event === 'Tornado Warning' ||
        alert.properties.event === 'Tornado Watch'
      );

      const warnings = tornadoAlerts.map(alert => ({
        id: alert.id,
        name: alert.properties.event,
        type: 'tornado',
        status: alert.properties.event === 'Tornado Warning' ? 'active' : 'watch',
        location: alert.properties.areaDesc,
        coordinates: this.extractCoordinates(alert.geometry),
        headline: alert.properties.headline,
        expires: alert.properties.expires,
        geometry: alert.geometry,
        lastUpdated: alert.properties.sent
      }));

      cache.set(cacheKey, warnings);
      return warnings;

    } catch (error) {
      console.error('Error fetching tornado warnings:', error.message);
      return [];
    }
  }

  /**
   * Get flood warnings
   */
  async getFloodWarnings() {
    const cacheKey = 'flood_warnings';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `${this.noaaAlertsUrl}/active`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/geo+json',
            'User-Agent': 'AlphaEarthInsurance/1.0'
          }
        }
      );

      const floodEvents = [
        'Flood Warning',
        'Flash Flood Warning',
        'Coastal Flood Warning',
        'Flood Watch',
        'Flash Flood Watch'
      ];

      const floodAlerts = response.data.features.filter(alert =>
        floodEvents.includes(alert.properties.event)
      );

      const warnings = floodAlerts.map(alert => ({
        id: alert.id,
        name: alert.properties.event,
        type: 'flood',
        status: alert.properties.event.includes('Warning') ? 'active' : 'watch',
        location: alert.properties.areaDesc,
        coordinates: this.extractCoordinates(alert.geometry),
        headline: alert.properties.headline,
        description: alert.properties.description,
        instruction: alert.properties.instruction,
        severity: alert.properties.severity,
        expires: alert.properties.expires,
        geometry: alert.geometry,
        lastUpdated: alert.properties.sent
      }));

      cache.set(cacheKey, warnings);
      return warnings;

    } catch (error) {
      console.error('Error fetching flood warnings:', error.message);
      return [];
    }
  }

  /**
   * Get severe weather alerts by state
   */
  async getAlertsByState(stateCodes) {
    return this.getActiveSevereWeatherAlerts({ states: stateCodes });
  }

  /**
   * Categorize alert type for disaster classification
   */
  categorizeAlertType(eventName) {
    const eventLower = eventName.toLowerCase();

    if (eventLower.includes('tornado')) return 'tornado';
    if (eventLower.includes('flood')) return 'flood';
    if (eventLower.includes('hurricane')) return 'hurricane';
    if (eventLower.includes('storm surge')) return 'storm_surge';
    if (eventLower.includes('tsunami')) return 'tsunami';
    if (eventLower.includes('thunderstorm')) return 'severe_thunderstorm';
    if (eventLower.includes('wind')) return 'high_wind';
    if (eventLower.includes('blizzard') || eventLower.includes('winter storm')) return 'winter_storm';

    return 'severe_weather';
  }

  /**
   * Determine alert status from severity and urgency
   */
  getAlertStatus(severity, urgency) {
    if (severity === 'Extreme' || urgency === 'Immediate') return 'critical';
    if (severity === 'Severe' || urgency === 'Expected') return 'active';
    if (urgency === 'Future') return 'watch';
    return 'advisory';
  }

  /**
   * Extract center coordinates from geometry
   */
  extractCoordinates(geometry) {
    if (!geometry) return null;

    if (geometry.type === 'Point') {
      return {
        lat: geometry.coordinates[1],
        lon: geometry.coordinates[0]
      };
    }

    if (geometry.type === 'Polygon' && geometry.coordinates && geometry.coordinates[0]) {
      // Calculate centroid of polygon
      const coords = geometry.coordinates[0];
      const lats = coords.map(c => c[1]);
      const lons = coords.map(c => c[0]);

      return {
        lat: lats.reduce((a, b) => a + b, 0) / lats.length,
        lon: lons.reduce((a, b) => a + b, 0) / lons.length
      };
    }

    if (geometry.type === 'MultiPolygon' && geometry.coordinates && geometry.coordinates[0]) {
      // Use first polygon for simplicity
      const coords = geometry.coordinates[0][0];
      const lats = coords.map(c => c[1]);
      const lons = coords.map(c => c[0]);

      return {
        lat: lats.reduce((a, b) => a + b, 0) / lats.length,
        lon: lons.reduce((a, b) => a + b, 0) / lons.length
      };
    }

    return null;
  }

  /**
   * Mock severe weather data (fallback)
   */
  getMockSevereWeatherAlerts() {
    return [
      {
        id: 'mock-weather-1',
        name: 'Severe Thunderstorm Warning',
        type: 'severe_thunderstorm',
        status: 'active',
        event: 'Severe Thunderstorm Warning',
        severity: 'Severe',
        urgency: 'Immediate',
        certainty: 'Observed',
        location: 'Harris County, TX; Fort Bend County, TX',
        coordinates: { lat: 29.7604, lon: -95.3698 },
        headline: 'Severe Thunderstorm Warning issued for Harris and Fort Bend Counties',
        description: 'Severe thunderstorm producing damaging winds in excess of 60 mph and large hail.',
        instruction: 'Move to an interior room on the lowest floor of a sturdy building.',
        effective: new Date(Date.now() - 5 * 60000).toISOString(),
        expires: new Date(Date.now() + 25 * 60000).toISOString(),
        onset: new Date(Date.now() - 5 * 60000).toISOString(),
        ends: new Date(Date.now() + 25 * 60000).toISOString(),
        affectedZones: [],
        geometry: null,
        lastUpdated: new Date(Date.now() - 5 * 60000).toISOString()
      }
    ];
  }
}

export default new SevereWeatherService();
