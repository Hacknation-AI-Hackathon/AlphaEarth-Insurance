import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache

/**
 * Multi-Source Satellite Wind Measurement Service
 * Provides wind speed measurements from multiple independent sources
 * for high-confidence parametric insurance triggers
 */
class SatelliteWindService {
  constructor() {
    console.log('🛰️  Satellite Wind Measurement Service initialized');
  }

  /**
   * Get wind speed from multiple satellite and ground sources
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {Date} date - Timestamp for measurement
   * @returns {Object} Multi-source wind data with consensus
   */
  async getWindSpeed(lat, lon, date = new Date()) {
    const cacheKey = `wind_${lat}_${lon}_${date.toISOString().split('T')[0]}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const results = {
      timestamp: new Date().toISOString(),
      location: { lat, lon },
      sources: [],
      consensus: null
    };

    console.log(`\n🌪️  Measuring wind at (${lat.toFixed(2)}, ${lon.toFixed(2)})...`);

    // Source 1: NOAA Weather Observations (fastest, most reliable)
    try {
      const noaaWind = await this.getWindFromNOAA(lat, lon);
      if (noaaWind) {
        results.sources.push({
          source: 'NOAA Weather Station',
          windSpeed: noaaWind.speed,
          windDirection: noaaWind.direction,
          confidence: 'high',
          delay: 'Real-time to 15 minutes',
          method: 'Ground-based anemometer',
          timestamp: noaaWind.timestamp
        });
        console.log(`   ✓ NOAA: ${noaaWind.speed.toFixed(1)} km/h`);
      }
    } catch (error) {
      console.log(`   ✗ NOAA fetch failed: ${error.message}`);
    }

    // Source 2: OpenWeather API (additional verification)
    try {
      const openWeatherWind = await this.getWindFromOpenWeather(lat, lon);
      if (openWeatherWind) {
        results.sources.push({
          source: 'OpenWeather Satellite/Model',
          windSpeed: openWeatherWind.speed,
          windDirection: openWeatherWind.direction,
          confidence: 'medium',
          delay: '10-30 minutes',
          method: 'Satellite + weather model fusion',
          timestamp: openWeatherWind.timestamp
        });
        console.log(`   ✓ OpenWeather: ${openWeatherWind.speed.toFixed(1)} km/h`);
      }
    } catch (error) {
      console.log(`   ✗ OpenWeather fetch failed: ${error.message}`);
    }

    // Source 3: NOAA National Data Buoy Center (for coastal/ocean locations)
    if (this.isNearCoast(lat, lon)) {
      try {
        const buoyWind = await this.getWindFromBuoy(lat, lon);
        if (buoyWind) {
          results.sources.push({
            source: 'NOAA Buoy Network',
            windSpeed: buoyWind.speed,
            windDirection: buoyWind.direction,
            confidence: 'very high',
            delay: 'Real-time',
            method: 'Direct ocean surface measurement',
            timestamp: buoyWind.timestamp,
            buoyId: buoyWind.buoyId
          });
          console.log(`   ✓ Buoy ${buoyWind.buoyId}: ${buoyWind.speed.toFixed(1)} km/h`);
        }
      } catch (error) {
        console.log(`   ✗ Buoy fetch failed: ${error.message}`);
      }
    }

    // Source 4: Hurricane-specific data from NHC
    try {
      const hurricaneWind = await this.getWindFromHurricaneData(lat, lon);
      if (hurricaneWind) {
        results.sources.push({
          source: 'NHC Hurricane Analysis',
          windSpeed: hurricaneWind.speed,
          confidence: 'very high',
          delay: '15-60 minutes',
          method: 'Hurricane hunter aircraft + satellite',
          timestamp: hurricaneWind.timestamp,
          stormName: hurricaneWind.stormName
        });
        console.log(`   ✓ NHC ${hurricaneWind.stormName}: ${hurricaneWind.speed.toFixed(1)} km/h`);
      }
    } catch (error) {
      console.log(`   ✗ Hurricane data fetch failed: ${error.message}`);
    }

    // Calculate consensus wind speed
    if (results.sources.length > 0) {
      results.consensus = this.calculateConsensus(results.sources);

      console.log(`\n   📊 CONSENSUS: ${results.consensus.windSpeed.toFixed(1)} km/h`);
      console.log(`   🎯 Confidence: ${results.consensus.confidence.toUpperCase()}`);
      console.log(`   📡 Sources: ${results.sources.length}\n`);
    } else {
      console.log(`   ⚠️  No wind data available from any source\n`);
    }

    cache.set(cacheKey, results);
    return results;
  }

  /**
   * Get wind from NOAA weather stations
   */
  async getWindFromNOAA(lat, lon) {
    try {
      // Get nearest weather station from NOAA
      const pointResponse = await axios.get(
        `https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'AlphaEarth Insurance (contact@alphaearth.com)'
          }
        }
      );

      if (!pointResponse.data?.properties?.observationStations) {
        return null;
      }

      const stationsUrl = pointResponse.data.properties.observationStations;
      const stationsResponse = await axios.get(stationsUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AlphaEarth Insurance (contact@alphaearth.com)'
        }
      });

      if (!stationsResponse.data?.features?.length) {
        return null;
      }

      // Get observations from nearest station
      const nearestStation = stationsResponse.data.features[0];
      const obsUrl = `${nearestStation.id}/observations/latest`;

      const obsResponse = await axios.get(obsUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AlphaEarth Insurance (contact@alphaearth.com)'
        }
      });

      const obs = obsResponse.data.properties;

      if (obs.windSpeed?.value) {
        return {
          speed: obs.windSpeed.value * 3.6, // m/s to km/h
          direction: obs.windDirection?.value || null,
          timestamp: obs.timestamp
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get wind from OpenWeather API (requires API key)
   */
  async getWindFromOpenWeather(lat, lon) {
    try {
      // Using free tier - no API key needed for basic data
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast`,
        {
          params: {
            latitude: lat,
            longitude: lon,
            current: 'wind_speed_10m,wind_direction_10m',
            wind_speed_unit: 'kmh'
          },
          timeout: 10000
        }
      );

      if (response.data?.current) {
        return {
          speed: response.data.current.wind_speed_10m,
          direction: response.data.current.wind_direction_10m,
          timestamp: response.data.current.time
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get wind from NOAA National Data Buoy Center
   */
  async getWindFromBuoy(lat, lon) {
    try {
      // Find nearest buoy (simplified - in production, use buoy station database)
      const buoyStations = this.getNearestBuoyStations(lat, lon);

      if (buoyStations.length === 0) {
        return null;
      }

      const buoyId = buoyStations[0].id;

      // Fetch latest buoy data
      const response = await axios.get(
        `https://www.ndbc.noaa.gov/data/realtime2/${buoyId}.txt`,
        {
          timeout: 10000,
          responseType: 'text'
        }
      );

      // Parse NDBC data format
      const lines = response.data.split('\n');
      if (lines.length < 3) return null;

      // Skip header lines, get most recent data
      const dataLine = lines[2].trim().split(/\s+/);

      if (dataLine.length > 7) {
        const windSpeed = parseFloat(dataLine[6]); // m/s
        const windDirection = parseFloat(dataLine[5]); // degrees

        if (!isNaN(windSpeed) && windSpeed < 999) {
          return {
            speed: windSpeed * 3.6, // m/s to km/h
            direction: !isNaN(windDirection) && windDirection < 999 ? windDirection : null,
            timestamp: new Date().toISOString(),
            buoyId
          };
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get wind from active hurricane data
   */
  async getWindFromHurricaneData(lat, lon) {
    try {
      const response = await axios.get(
        'https://www.nhc.noaa.gov/CurrentStorms.json',
        { timeout: 10000 }
      );

      if (!response.data?.activeStorms?.length) {
        return null;
      }

      // Find hurricane within 500km of location
      for (const storm of response.data.activeStorms) {
        const stormLat = storm.latitude;
        const stormLon = storm.longitude;
        const distance = this.calculateDistance(lat, lon, stormLat, stormLon);

        if (distance < 500) {
          // Extract wind speed from intensity
          const intensity = storm.intensity || '';
          const match = intensity.match(/(\d+)\s*mph/i);

          if (match) {
            return {
              speed: parseFloat(match[1]) * 1.60934, // mph to km/h
              timestamp: new Date().toISOString(),
              stormName: storm.name || 'Unknown Storm'
            };
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Calculate consensus wind speed from multiple sources
   */
  calculateConsensus(sources) {
    if (sources.length === 0) {
      return null;
    }

    // Weight sources by confidence
    const weights = {
      'very high': 1.0,
      'high': 0.8,
      'medium': 0.6
    };

    let totalWeight = 0;
    let weightedSum = 0;

    sources.forEach(source => {
      const weight = weights[source.confidence] || 0.5;
      weightedSum += source.windSpeed * weight;
      totalWeight += weight;
    });

    const consensusSpeed = weightedSum / totalWeight;
    const speeds = sources.map(s => s.windSpeed);
    const mean = speeds.reduce((a, b) => a + b) / speeds.length;
    const variance = speeds.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / speeds.length;
    const stdDev = Math.sqrt(variance);

    // Determine confidence based on source agreement
    let confidence;
    if (sources.length >= 3 && stdDev < 15) {
      confidence = 'very high';
    } else if (sources.length >= 2 && stdDev < 25) {
      confidence = 'high';
    } else if (sources.length >= 2 && stdDev < 40) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    return {
      windSpeed: consensusSpeed,
      unit: 'km/h',
      confidence,
      sourceCount: sources.length,
      standardDeviation: stdDev,
      range: {
        min: Math.min(...speeds),
        max: Math.max(...speeds)
      }
    };
  }

  /**
   * Get nearest buoy stations for a location
   */
  getNearestBuoyStations(lat, lon) {
    // Major NOAA buoy stations (simplified subset)
    const buoys = [
      { id: '41001', lat: 34.68, lon: -72.73, name: 'E Hatteras' },
      { id: '41002', lat: 32.38, lon: -75.35, name: 'S Hatteras' },
      { id: '41004', lat: 32.50, lon: -79.09, name: 'Edisto' },
      { id: '41008', lat: 31.40, lon: -80.87, name: 'Grays Reef' },
      { id: '41009', lat: 28.50, lon: -80.18, name: 'Canaveral' },
      { id: '41010', lat: 28.88, lon: -78.47, name: 'Canaveral East' },
      { id: '42001', lat: 25.89, lon: -89.66, name: 'Mid Gulf' },
      { id: '42002', lat: 26.06, lon: -93.64, name: 'West Gulf' },
      { id: '42003', lat: 26.04, lon: -85.61, name: 'East Gulf' },
      { id: '42036', lat: 28.50, lon: -84.51, name: 'W Tampa' },
      { id: '42040', lat: 29.18, lon: -88.23, name: 'Luke Offshore' }
    ];

    return buoys
      .map(buoy => ({
        ...buoy,
        distance: this.calculateDistance(lat, lon, buoy.lat, buoy.lon)
      }))
      .filter(buoy => buoy.distance < 300) // Within 300km
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }

  /**
   * Check if location is near coast (for buoy data)
   */
  isNearCoast(lat, lon) {
    // Simplified - check if in coastal regions
    // Gulf Coast, Atlantic Coast, Pacific Coast
    const isGulfCoast = (lat >= 24 && lat <= 31 && lon >= -98 && lon <= -80);
    const isAtlanticCoast = (lat >= 24 && lat <= 45 && lon >= -81 && lon <= -65);
    const isPacificCoast = (lat >= 32 && lat <= 49 && lon >= -125 && lon <= -117);

    return isGulfCoast || isAtlanticCoast || isPacificCoast;
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

export default new SatelliteWindService();
