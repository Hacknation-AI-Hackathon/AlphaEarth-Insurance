import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

class EarthquakeService {
  constructor() {
    this.usgsBaseUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0';
  }

  /**
   * Get active earthquakes from USGS - REAL-TIME
   */
  async getActiveEarthquakes(minMagnitude = 4.5, timeframe = 'week') {
    const cacheKey = `earthquakes_${minMagnitude}_${timeframe}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    this.usingMockEarthquakes = false;

    try {
      console.log(`Fetching real-time earthquake data from USGS (${minMagnitude}+ magnitude, ${timeframe})...`);

      // Determine which feed to use based on magnitude
      let feedUrl;
      if (minMagnitude >= 4.5) {
        feedUrl = `${this.usgsBaseUrl}/summary/4.5_${timeframe}.geojson`;
      } else if (minMagnitude >= 2.5) {
        feedUrl = `${this.usgsBaseUrl}/summary/2.5_${timeframe}.geojson`;
      } else {
        feedUrl = `${this.usgsBaseUrl}/summary/all_${timeframe}.geojson`;
      }

      const response = await axios.get(feedUrl, { timeout: 10000 });

      if (!response.data || !response.data.features || response.data.features.length === 0) {
        console.log('No earthquakes found, using mock data for demo');
        this.usingMockEarthquakes = true;
        return this.getMockEarthquakes();
      }

      const earthquakes = response.data.features.map(quake => ({
        id: quake.id,
        name: quake.properties.title,
        type: 'earthquake',
        status: this.getEarthquakeStatus(quake.properties.mag),
        location: quake.properties.place,
        coordinates: {
          lat: quake.geometry.coordinates[1],
          lon: quake.geometry.coordinates[0],
          depth: quake.geometry.coordinates[2]
        },
        magnitude: quake.properties.mag,
        depth: quake.geometry.coordinates[2],
        time: new Date(quake.properties.time).toISOString(),
        tsunami: quake.properties.tsunami === 1,
        alert: quake.properties.alert || 'green',
        significance: quake.properties.sig,
        felt: quake.properties.felt || 0,
        cdi: quake.properties.cdi, // Community intensity
        mmi: quake.properties.mmi, // Modified Mercalli Intensity
        url: quake.properties.url,
        lastUpdated: new Date(quake.properties.updated).toISOString()
      }));

      // Filter earthquakes within US boundaries (for insurance focus)
      const usEarthquakes = earthquakes.filter(eq => {
        // Exclude if location explicitly mentions non-US countries
        const location = eq.location.toLowerCase();
        const excludeKeywords = ['mexico', ', mx', 'canada', 'japan', 'china', 'russia', 'chile', 'peru',
                                  'indonesia', 'philippines', 'new zealand', 'fiji', 'tonga',
                                  'vanuatu', 'solomon islands', 'papua new guinea', 'b.c.,'];

        if (excludeKeywords.some(keyword => location.includes(keyword))) {
          return false;
        }

        return this.isWithinUSBoundaries(eq.coordinates.lat, eq.coordinates.lon);
      });

      console.log(`Found ${earthquakes.length} earthquakes (${usEarthquakes.length} within US boundaries)`);

      const result = usEarthquakes;
      cache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error fetching earthquakes from USGS:', error.message);
      console.log('Using mock earthquake data for demo');
      this.usingMockEarthquakes = true;
      return this.getMockEarthquakes();
    }
  }

  /**
   * Get significant earthquakes (any magnitude)
   */
  async getSignificantEarthquakes() {
    const cacheKey = 'earthquakes_significant';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      console.log('Fetching significant earthquakes from USGS...');

      const response = await axios.get(
        `${this.usgsBaseUrl}/summary/significant_week.geojson`,
        { timeout: 10000 }
      );

      if (!response.data || !response.data.features || response.data.features.length === 0) {
        return [];
      }

      const earthquakes = response.data.features.map(quake => ({
        id: quake.id,
        name: quake.properties.title,
        type: 'earthquake',
        status: 'significant',
        location: quake.properties.place,
        coordinates: {
          lat: quake.geometry.coordinates[1],
          lon: quake.geometry.coordinates[0],
          depth: quake.geometry.coordinates[2]
        },
        magnitude: quake.properties.mag,
        depth: quake.geometry.coordinates[2],
        time: new Date(quake.properties.time).toISOString(),
        tsunami: quake.properties.tsunami === 1,
        alert: quake.properties.alert || 'green',
        significance: quake.properties.sig,
        url: quake.properties.url,
        lastUpdated: new Date(quake.properties.updated).toISOString()
      }));

      cache.set(cacheKey, earthquakes);
      return earthquakes;

    } catch (error) {
      console.error('Error fetching significant earthquakes:', error.message);
      return [];
    }
  }

  /**
   * Get earthquake impact zone (simplified radius based on magnitude)
   */
  getEarthquakeImpactZone(magnitude, depth, lat, lon) {
    // Simplified impact radius calculation
    // Real implementation would use USGS ShakeMap data
    let radius;

    if (magnitude >= 7.0) {
      radius = 300; // ~300 miles
    } else if (magnitude >= 6.0) {
      radius = 150;
    } else if (magnitude >= 5.0) {
      radius = 75;
    } else {
      radius = 30;
    }

    // Adjust for depth (deeper = less surface impact)
    if (depth > 100) {
      radius *= 0.5;
    } else if (depth > 50) {
      radius *= 0.7;
    }

    return {
      center: { lat, lon },
      radiusMiles: radius,
      impactZones: {
        severe: { radius: radius * 0.2, description: 'Severe shaking, major damage' },
        strong: { radius: radius * 0.4, description: 'Strong shaking, moderate damage' },
        moderate: { radius: radius * 0.6, description: 'Moderate shaking, light damage' },
        light: { radius: radius * 1.0, description: 'Light shaking, minimal damage' }
      }
    };
  }

  /**
   * Determine earthquake status from magnitude
   */
  getEarthquakeStatus(magnitude) {
    if (magnitude >= 7.0) return 'major';
    if (magnitude >= 6.0) return 'strong';
    if (magnitude >= 5.0) return 'moderate';
    if (magnitude >= 4.0) return 'light';
    return 'minor';
  }

  /**
   * Check if coordinates are within US boundaries
   */
  isWithinUSBoundaries(lat, lon) {
    // Contiguous United States
    if (lat >= 24.5 && lat <= 49.4 && lon >= -125 && lon <= -66) {
      return true;
    }

    // Alaska
    if (lat >= 51 && lat <= 71.5 && lon >= -180 && lon <= -130) {
      return true;
    }

    // Hawaii
    if (lat >= 18.9 && lat <= 28.5 && lon >= -178 && lon <= -154) {
      return true;
    }

    // Puerto Rico and US Virgin Islands
    if (lat >= 17.5 && lat <= 18.6 && lon >= -67.5 && lon <= -64.5) {
      return true;
    }

    // Guam and Northern Mariana Islands
    if (lat >= 13 && lat <= 20.5 && lon >= 144 && lon <= 146) {
      return true;
    }

    // American Samoa
    if (lat >= -14.7 && lat <= -11 && lon >= -171 && lon <= -168) {
      return true;
    }

    return false;
  }

  /**
   * Mock earthquake data (fallback)
   */
  getMockEarthquakes() {
    return [
      {
        id: 'mock-eq-1',
        name: 'M 5.2 - Southern California',
        type: 'earthquake',
        status: 'moderate',
        location: '15 km SE of Ridgecrest, California',
        coordinates: { lat: 35.5273, lon: -117.5586, depth: 8.2 },
        magnitude: 5.2,
        depth: 8.2,
        time: new Date(Date.now() - 2 * 3600000).toISOString(),
        tsunami: false,
        alert: 'yellow',
        significance: 456,
        felt: 1234,
        url: 'https://earthquake.usgs.gov',
        lastUpdated: new Date().toISOString()
      }
    ];
  }
}

export default new EarthquakeService();
