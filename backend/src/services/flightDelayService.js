import axios from 'axios';
import NodeCache from 'node-cache';
import severeWeatherService from './severeWeatherService.js';

const cache = new NodeCache({ stdTTL: 180 }); // 3 minute cache

/**
 * Flight Delay Detection Service
 * Predicts and detects flight delays using atmospheric data, weather, and congestion
 */
class FlightDelayService {
  constructor() {
    // Major US airports with coordinates
    this.airports = [
      { code: 'ATL', name: 'Hartsfield-Jackson Atlanta', lat: 33.6407, lon: -84.4277, city: 'Atlanta, GA' },
      { code: 'DFW', name: 'Dallas/Fort Worth', lat: 32.8998, lon: -97.0403, city: 'Dallas, TX' },
      { code: 'DEN', name: 'Denver International', lat: 39.8561, lon: -104.6737, city: 'Denver, CO' },
      { code: 'ORD', name: 'Chicago O\'Hare', lat: 41.9742, lon: -87.9073, city: 'Chicago, IL' },
      { code: 'LAX', name: 'Los Angeles International', lat: 33.9416, lon: -118.4085, city: 'Los Angeles, CA' },
      { code: 'JFK', name: 'John F. Kennedy International', lat: 40.6413, lon: -73.7781, city: 'New York, NY' },
      { code: 'MIA', name: 'Miami International', lat: 25.7959, lon: -80.2870, city: 'Miami, FL' },
      { code: 'SFO', name: 'San Francisco International', lat: 37.6213, lon: -122.3790, city: 'San Francisco, CA' },
      { code: 'SEA', name: 'Seattle-Tacoma International', lat: 47.4502, lon: -122.3088, city: 'Seattle, WA' },
      { code: 'BOS', name: 'Boston Logan International', lat: 42.3656, lon: -71.0096, city: 'Boston, MA' },
      { code: 'MCO', name: 'Orlando International', lat: 28.4312, lon: -81.3081, city: 'Orlando, FL' },
      { code: 'PHX', name: 'Phoenix Sky Harbor', lat: 33.4352, lon: -112.0101, city: 'Phoenix, AZ' },
    ];

    console.log('✈️  Flight Delay Detection Service initialized');
    console.log(`   📍 Monitoring ${this.airports.length} major airports`);
  }

  /**
   * Get real-time delay predictions for all airports
   */
  async getAllAirportDelays() {
    const cacheKey = 'all_airport_delays';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    console.log('\n✈️  Analyzing delays across all airports...');

    const delays = await Promise.all(
      this.airports.map(airport => this.getAirportDelay(airport))
    );

    const results = {
      timestamp: new Date().toISOString(),
      airports: delays,
      summary: {
        total: delays.length,
        delayed: delays.filter(d => d.delayMinutes > 15).length,
        severe: delays.filter(d => d.delayMinutes > 60).length,
        avgDelay: delays.reduce((sum, d) => sum + d.delayMinutes, 0) / delays.length
      }
    };

    cache.set(cacheKey, results);
    return results;
  }

  /**
   * Get delay prediction for a specific airport
   */
  async getAirportDelay(airport) {
    try {
      // Get weather conditions
      const weather = await this.getWeatherConditions(airport.lat, airport.lon);

      // Get severe weather alerts
      const alerts = await this.getSevereWeatherAlerts(airport.lat, airport.lon);

      // Calculate delay based on multiple factors
      const delayFactors = this.calculateDelayFactors(weather, alerts, airport);

      const delayMinutes = Math.round(delayFactors.totalDelay);
      const delayReason = this.getDelayReason(delayFactors);
      const delayCategory = this.getDelayCategory(delayMinutes);

      return {
        airport: {
          code: airport.code,
          name: airport.name,
          city: airport.city,
          lat: airport.lat,
          lon: airport.lon
        },
        delayMinutes,
        delayCategory,
        delayReason,
        factors: delayFactors,
        weather: {
          condition: weather.condition,
          temperature: weather.temperature,
          windSpeed: weather.windSpeed,
          visibility: weather.visibility,
          precipitation: weather.precipitation
        },
        alerts: alerts.length > 0 ? alerts : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error getting delay for ${airport.code}:`, error.message);
      return {
        airport: {
          code: airport.code,
          name: airport.name,
          city: airport.city,
          lat: airport.lat,
          lon: airport.lon
        },
        delayMinutes: 0,
        delayCategory: 'on-time',
        delayReason: 'Unable to fetch data',
        error: error.message
      };
    }
  }

  /**
   * Get weather conditions for airport location
   */
  async getWeatherConditions(lat, lon) {
    try {
      const response = await axios.get(
        'https://api.open-meteo.com/v1/forecast',
        {
          params: {
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,precipitation,wind_speed_10m,visibility,weather_code',
            temperature_unit: 'fahrenheit',
            wind_speed_unit: 'mph'
          },
          timeout: 10000
        }
      );

      const current = response.data.current;

      return {
        temperature: current.temperature_2m,
        precipitation: current.precipitation || 0,
        windSpeed: current.wind_speed_10m,
        visibility: current.visibility / 1000, // Convert to km
        weatherCode: current.weather_code,
        condition: this.getWeatherCondition(current.weather_code)
      };
    } catch (error) {
      return {
        temperature: 70,
        precipitation: 0,
        windSpeed: 5,
        visibility: 10,
        weatherCode: 0,
        condition: 'Clear'
      };
    }
  }

  /**
   * Get severe weather alerts near airport
   */
  async getSevereWeatherAlerts(lat, lon) {
    try {
      const alerts = await severeWeatherService.getActiveAlerts();

      // Filter alerts within 50 miles of airport
      return alerts.filter(alert => {
        if (!alert.geometry?.coordinates) return false;

        const alertLat = alert.geometry.coordinates[1];
        const alertLon = alert.geometry.coordinates[0];
        const distance = this.calculateDistance(lat, lon, alertLat, alertLon);

        return distance < 80; // 50 miles ~= 80 km
      }).map(alert => ({
        event: alert.properties.event,
        severity: alert.properties.severity,
        headline: alert.properties.headline
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Calculate delay factors based on weather and conditions
   */
  calculateDelayFactors(weather, alerts, airport) {
    let totalDelay = 0;
    const factors = {
      weather: 0,
      wind: 0,
      visibility: 0,
      precipitation: 0,
      severeWeather: 0,
      congestion: 0
    };

    // Wind delays (critical for takeoff/landing)
    if (weather.windSpeed > 40) {
      factors.wind = 60; // Severe wind delays
    } else if (weather.windSpeed > 25) {
      factors.wind = 30; // Moderate wind delays
    } else if (weather.windSpeed > 15) {
      factors.wind = 10; // Minor wind delays
    }

    // Visibility delays (fog, smoke, etc.)
    if (weather.visibility < 1) {
      factors.visibility = 90; // Severe visibility issues
    } else if (weather.visibility < 3) {
      factors.visibility = 45; // Moderate visibility issues
    } else if (weather.visibility < 5) {
      factors.visibility = 15; // Minor visibility issues
    }

    // Precipitation delays (rain, snow, ice)
    if (weather.precipitation > 10) {
      factors.precipitation = 45; // Heavy precipitation
    } else if (weather.precipitation > 5) {
      factors.precipitation = 25; // Moderate precipitation
    } else if (weather.precipitation > 1) {
      factors.precipitation = 10; // Light precipitation
    }

    // Severe weather alerts
    if (alerts.length > 0) {
      const hasExtremeAlert = alerts.some(a => a.severity === 'Extreme');
      const hasSevereAlert = alerts.some(a => a.severity === 'Severe');

      if (hasExtremeAlert) {
        factors.severeWeather = 120; // Extreme weather = major delays
      } else if (hasSevereAlert) {
        factors.severeWeather = 60; // Severe weather = significant delays
      } else {
        factors.severeWeather = 20; // Moderate alerts
      }
    }

    // Airport-specific congestion (simulated based on size)
    const congestionAirports = ['ATL', 'ORD', 'LAX', 'DFW', 'JFK'];
    if (congestionAirports.includes(airport.code)) {
      // Add time-based congestion (peak hours)
      const hour = new Date().getHours();
      const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
      factors.congestion = isPeakHour ? 20 : 10;
    }

    // Calculate total delay
    totalDelay = Object.values(factors).reduce((sum, val) => sum + val, 0);

    // Cap maximum delay at 180 minutes
    totalDelay = Math.min(totalDelay, 180);

    return {
      ...factors,
      totalDelay
    };
  }

  /**
   * Get primary delay reason
   */
  getDelayReason(factors) {
    const reasons = [];

    if (factors.severeWeather > 0) reasons.push('Severe Weather Alert');
    if (factors.wind > 30) reasons.push('High Winds');
    if (factors.visibility > 30) reasons.push('Low Visibility');
    if (factors.precipitation > 20) reasons.push('Heavy Precipitation');
    if (factors.congestion > 0) reasons.push('Airport Congestion');

    if (reasons.length === 0) return 'Normal Operations';
    return reasons.join(', ');
  }

  /**
   * Get delay category
   */
  getDelayCategory(minutes) {
    if (minutes < 15) return 'on-time';
    if (minutes < 30) return 'minor';
    if (minutes < 60) return 'moderate';
    if (minutes < 120) return 'severe';
    return 'critical';
  }

  /**
   * Get weather condition from code
   */
  getWeatherCondition(code) {
    const conditions = {
      0: 'Clear',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light Drizzle',
      53: 'Drizzle',
      55: 'Heavy Drizzle',
      61: 'Light Rain',
      63: 'Rain',
      65: 'Heavy Rain',
      71: 'Light Snow',
      73: 'Snow',
      75: 'Heavy Snow',
      77: 'Snow Grains',
      80: 'Light Showers',
      81: 'Showers',
      82: 'Heavy Showers',
      85: 'Light Snow Showers',
      86: 'Snow Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Hail',
      99: 'Severe Thunderstorm'
    };
    return conditions[code] || 'Unknown';
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * Math.PI / 180;
  }
}

export default new FlightDelayService();
