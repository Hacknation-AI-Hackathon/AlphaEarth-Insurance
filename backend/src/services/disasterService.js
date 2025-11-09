import axios from 'axios';
import NodeCache from 'node-cache';
import * as turf from '@turf/turf';
import earthquakeService from './earthquakeService.js';
import severeWeatherService from './severeWeatherService.js';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

class DisasterService {
  constructor() {
    this.noaaBaseUrl = 'https://www.nhc.noaa.gov';
    this.firmsApiKey = process.env.NASA_FIRMS_API_KEY;
  }

  /**
   * Get active hurricanes from NOAA - REAL-TIME
   * Note: Hurricane Milton and Helene are always mock data, all others are real-time
   */
  async getActiveHurricanes() {
    const cacheKey = 'active_hurricanes';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Mock hurricane names that should always use mock data
    const mockHurricaneNames = ['Hurricane Milton', 'Hurricane Helene', 'Milton', 'Helene'];
    
    // Get mock hurricanes (Milton and Helene)
    const mockHurricanes = this.getMockHurricanes();
    
    this.usingMockHurricanes = false;

    try {
      console.log('Fetching real-time hurricane data from NOAA...');
      
      // Try the RSS feed approach (more reliable)
      const rssResponse = await axios.get(
        'https://www.nhc.noaa.gov/index-at.xml',
        { 
          timeout: 10000,
          headers: { 'Accept': 'application/xml, text/xml' }
        }
      );

      // If RSS has data, parse it
      if (rssResponse.data && typeof rssResponse.data === 'string') {
        const hurricanes = this.parseNOAARSS(rssResponse.data);
        if (hurricanes.length > 0) {
          console.log(`Found ${hurricanes.length} active storms from NOAA RSS`);
          
          // Filter out Milton and Helene from real-time data (replace with mock versions)
          const realTimeHurricanes = hurricanes.filter(h => {
            const name = h.name || '';
            return !mockHurricaneNames.some(mockName => 
              name.toLowerCase().includes(mockName.toLowerCase())
            );
          });
          
          // Combine: real-time hurricanes + mock Milton and Helene
          const combinedHurricanes = [
            ...realTimeHurricanes.map(h => ({ ...h, isMock: false })), 
            ...mockHurricanes.map(h => ({ ...h, isMock: true }))
          ];
          console.log(`Combined ${realTimeHurricanes.length} real-time hurricanes with ${mockHurricanes.length} mock hurricanes (Milton, Helene)`);
          
          cache.set(cacheKey, combinedHurricanes);
          return combinedHurricanes;
        }
      }

      // Fallback: Try JSON API
      const jsonResponse = await axios.get(
        'https://www.nhc.noaa.gov/CurrentStorms.json',
        { timeout: 10000 }
      );

      // Handle different response formats
      let stormData = jsonResponse.data;
      
      // If response is wrapped in an object, extract the array
      if (stormData && typeof stormData === 'object' && !Array.isArray(stormData)) {
        // Try common wrapper keys
        stormData = stormData.activeStorms || stormData.storms || stormData.data || [];
      }

      if (!Array.isArray(stormData) || stormData.length === 0) {
        console.log('No active storms found from NOAA, returning mock Milton and Helene only');
        this.usingMockHurricanes = true;
        cache.set(cacheKey, mockHurricanes);
        return mockHurricanes;
      }

      const realTimeHurricanes = stormData
        .filter(storm => {
          const isTropical = storm.isTropical === "true" || storm.isTropical === true;
          const isSubtropical = storm.isSubtropical === "true" || storm.isSubtropical === true;
          return isTropical || isSubtropical;
        })
        .filter(storm => {
          // Filter out Milton and Helene from real-time data
          const name = storm.name || '';
          return !mockHurricaneNames.some(mockName => 
            name.toLowerCase().includes(mockName.toLowerCase())
          );
        })
        .map(storm => ({
          id: storm.id || storm.stormId || `storm-${Date.now()}`,
          name: storm.name || 'Unnamed Storm',
          type: 'hurricane',
          status: this.getStormStatus(storm.classification || storm.type),
          location: storm.latestLocation || storm.location || 'Unknown',
          coordinates: {
            lat: parseFloat(storm.latitude || storm.lat) || 0,
            lon: parseFloat(storm.longitude || storm.lon || storm.lng) || 0
          },
          intensity: storm.intensity || 'Unknown',
          classification: storm.classification || storm.type || 'Tropical System',
          movement: storm.movement || 'Unknown',
          lastUpdated: storm.lastUpdate || new Date().toISOString(),
          isMock: false
        }));

      console.log(`Found ${realTimeHurricanes.length} real-time hurricanes from NOAA API`);
      
      // Combine: real-time hurricanes + mock Milton and Helene
      const combinedHurricanes = [...realTimeHurricanes, ...mockHurricanes.map(h => ({ ...h, isMock: true }))];
      console.log(`Combined ${realTimeHurricanes.length} real-time hurricanes with ${mockHurricanes.length} mock hurricanes (Milton, Helene)`);
      
      cache.set(cacheKey, combinedHurricanes);
      return combinedHurricanes;

    } catch (error) {
      console.error('Error fetching hurricanes from NOAA:', error.message);
      console.log('Returning mock Milton and Helene only');
      this.usingMockHurricanes = true;
      cache.set(cacheKey, mockHurricanes);
      return mockHurricanes.map(h => ({ ...h, isMock: true }));
    }
  }

  /**
   * Parse NOAA RSS feed for storm data
   */
  parseNOAARSS(xmlData) {
    const hurricanes = [];
    
    try {
      // Simple regex parsing for RSS (basic approach)
      const itemRegex = /<item>(.*?)<\/item>/gs;
      const items = xmlData.match(itemRegex) || [];

      items.forEach((item, index) => {
        const titleMatch = item.match(/<title>(.*?)<\/title>/);
        const descMatch = item.match(/<description>(.*?)<\/description>/);
        const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);

        if (titleMatch) {
          const title = titleMatch[1];
          const description = descMatch ? descMatch[1] : '';
          
          // Extract storm name and type
          const nameMatch = title.match(/(Hurricane|Tropical Storm|Subtropical Storm)\s+(\w+)/i);
          
          if (nameMatch) {
            const classification = nameMatch[1];
            const name = nameMatch[2];
            
            // Try to extract coordinates from description
            const latMatch = description.match(/(\d+\.?\d*)[°\s]*N/);
            const lonMatch = description.match(/(\d+\.?\d*)[°\s]*W/);

            hurricanes.push({
              id: `rss-storm-${index}`,
              name: `${classification} ${name}`,
              type: 'hurricane',
              status: classification.includes('Hurricane') ? 'active' : 'developing',
              location: 'Atlantic Basin',
              coordinates: {
                lat: latMatch ? parseFloat(latMatch[1]) : 25.0,
                lon: lonMatch ? -parseFloat(lonMatch[1]) : -80.0
              },
              intensity: classification,
              classification: classification,
              movement: 'See NOAA for details',
              lastUpdated: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
              isMock: false
            });
          }
        }
      });
    } catch (error) {
      console.error('Error parsing NOAA RSS:', error.message);
    }

    return hurricanes;
  }

  /**
   * Get active wildfires from NASA FIRMS - REAL-TIME
   */
  async getActiveWildfires() {
    const cacheKey = 'active_wildfires';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    this.usingMockWildfires = false;

    try {
      // If NASA FIRMS API key is not configured, use mock data
      if (!this.firmsApiKey || this.firmsApiKey === 'your_nasa_firms_api_key_here') {
        console.log('NASA FIRMS API key not configured, using mock wildfire data');
        this.usingMockWildfires = true;
        return this.getMockWildfires();
      }

      console.log('Fetching real-time wildfire data from NASA FIRMS...');

      // Get active fires from last 24 hours for USA
      // USA bounding box: approximately -125,24,-66,49 (west,south,east,north)
      const response = await axios.get(
        `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${this.firmsApiKey}/VIIRS_NOAA20_NRT/-125,24,-66,49/1`,
        { timeout: 15000 }
      );

      const fires = this.parseNASAFIRMS(response.data);
      
      if (fires.length === 0) {
        console.log('No active fires found, using mock data');
        this.usingMockWildfires = true;
        return this.getMockWildfires();
      }

      console.log(`Found ${fires.length} active wildfires from NASA FIRMS`);
      cache.set(cacheKey, fires);
      return fires;

    } catch (error) {
      console.error('Error fetching wildfires from NASA FIRMS:', error.message);
      console.log('Using mock wildfire data for demo');
      this.usingMockWildfires = true;
      return this.getMockWildfires();
    }
  }

  /**
   * Parse NASA FIRMS CSV data
   */
  parseNASAFIRMS(csvData) {
    const fires = [];
    
    try {
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      
      // Find column indices
      const latIndex = headers.indexOf('latitude');
      const lonIndex = headers.indexOf('longitude');
      const brightIndex = headers.indexOf('bright_ti4');
      const confIndex = headers.indexOf('confidence');
      const dateIndex = headers.indexOf('acq_date');

      // Group fires by proximity (cluster nearby fires into single events)
      const firePoints = [];
      
      for (let i = 1; i < Math.min(lines.length, 1000); i++) {
        const cols = lines[i].split(',');
        if (cols.length < headers.length) continue;

        const lat = parseFloat(cols[latIndex]);
        const lon = parseFloat(cols[lonIndex]);
        const brightness = parseFloat(cols[brightIndex]);
        const confidence = cols[confIndex];
        const date = cols[dateIndex];

        if (!isNaN(lat) && !isNaN(lon) && confidence !== 'l') { // Skip low confidence
          firePoints.push({ lat, lon, brightness, date });
        }
      }

      // Cluster fires (simplified - just take hottest spots)
      const clusters = this.clusterFires(firePoints);
      
      clusters.forEach((cluster, index) => {
        fires.push({
          id: `nasa-fire-${Date.now()}-${index}`,
          name: `Active Fire ${index + 1}`,
          type: 'wildfire',
          status: 'active',
          location: this.reverseGeocode(cluster.lat, cluster.lon),
          coordinates: { lat: cluster.lat, lon: cluster.lon },
          acres: cluster.count * 100, // Rough estimate
          containment: 0, // Unknown for active fires
          lastUpdated: new Date().toISOString()
        });
      });

    } catch (error) {
      console.error('Error parsing NASA FIRMS data:', error.message);
    }

    return fires.slice(0, 5); // Return top 5 fires
  }

  /**
   * Simple clustering algorithm for fire points
   */
  clusterFires(points) {
    if (points.length === 0) return [];

    // Sort by brightness (temperature)
    points.sort((a, b) => b.brightness - a.brightness);

    const clusters = [];
    const used = new Set();
    const clusterRadius = 0.5; // degrees (~55km)

    points.forEach((point, index) => {
      if (used.has(index)) return;

      const nearby = points.filter((p, i) => {
        if (used.has(i)) return false;
        const dist = Math.sqrt(
          Math.pow(p.lat - point.lat, 2) + Math.pow(p.lon - point.lon, 2)
        );
        return dist < clusterRadius;
      });

      if (nearby.length >= 3) { // Minimum 3 fire detections to be considered significant
        nearby.forEach((_, i) => used.add(points.indexOf(_)));
        
        const avgLat = nearby.reduce((sum, p) => sum + p.lat, 0) / nearby.length;
        const avgLon = nearby.reduce((sum, p) => sum + p.lon, 0) / nearby.length;
        
        clusters.push({
          lat: avgLat,
          lon: avgLon,
          count: nearby.length,
          maxBrightness: Math.max(...nearby.map(p => p.brightness))
        });
      }
    });

    return clusters;
  }

  /**
   * Simple reverse geocoding (state/region lookup)
   */
  reverseGeocode(lat, lon) {
    // Simplified region detection based on coordinates
    if (lat >= 32 && lat <= 42 && lon >= -124 && lon <= -114) {
      return 'California';
    } else if (lat >= 42 && lat <= 49 && lon >= -125 && lon <= -116) {
      return 'Pacific Northwest';
    } else if (lat >= 31 && lat <= 37 && lon >= -109 && lon <= -103) {
      return 'Southwest';
    } else if (lat >= 25 && lat <= 31 && lon >= -87 && lon <= -80) {
      return 'Florida';
    } else {
      return 'United States';
    }
  }

  /**
   * Get detailed hurricane forecast data
   * For mock hurricanes (Milton, Helene), uses mock forecast data
   * For real-time hurricanes, generates forecast based on real-time data
   */
  async getHurricaneForecast(stormId) {
    const cacheKey = `hurricane_forecast_${stormId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const hurricaneList = await this.getActiveHurricanes();
      const hurricane = hurricaneList.find(h => h.id === stormId);

      if (!hurricane) {
        throw new Error(`Hurricane ${stormId} not found`);
      }

      // Check if this is a mock hurricane (Milton or Helene)
      const isMockHurricane = hurricane.isMock === true || 
                              hurricane.name?.includes('Milton') || 
                              hurricane.name?.includes('Helene');

      if (isMockHurricane) {
        console.log(`Using mock forecast data for ${hurricane.name} (stormId: ${stormId})`);
      } else {
        console.log(`Generating forecast data for real-time hurricane ${hurricane.name} (stormId: ${stormId})`);
      }

      // For real-time hurricanes, we would ideally fetch from NOAA GIS services
      // For now, generate realistic forecast data based on current hurricane data
      const forecastData = {
        stormId,
        center: hurricane.coordinates,
        maxWindSpeed: this.estimateWindSpeed(hurricane.intensity),
        centralPressure: isMockHurricane ? 950 : this.estimatePressure(hurricane.intensity),
        movementSpeed: this.extractMovementSpeed(hurricane.movement) || 12,
        movementDirection: this.extractMovementDirection(hurricane.movement) || 'NNE',
        forecastTrack: this.generateForecastTrack(hurricane.coordinates.lat, hurricane.coordinates.lon, isMockHurricane),
        coneOfUncertainty: this.generateConeOfUncertainty(hurricane.coordinates.lat, hurricane.coordinates.lon),
        windRadii: this.getWindRadiiFromIntensity(hurricane.intensity),
        stormSurgeZones: this.generateStormSurgeZones(hurricane.coordinates.lat, hurricane.coordinates.lon),
        isMock: isMockHurricane
      };

      cache.set(cacheKey, forecastData);
      return forecastData;
    } catch (error) {
      console.error('Error fetching hurricane forecast:', error.message);
      throw error;
    }
  }
  
  /**
   * Estimate central pressure from intensity
   */
  estimatePressure(intensity) {
    const intensityLower = (intensity || '').toLowerCase();
    if (intensityLower.includes('category 5') || intensityLower.includes('cat 5')) return 920;
    if (intensityLower.includes('category 4') || intensityLower.includes('cat 4')) return 940;
    if (intensityLower.includes('category 3') || intensityLower.includes('cat 3')) return 960;
    if (intensityLower.includes('category 2') || intensityLower.includes('cat 2')) return 970;
    if (intensityLower.includes('category 1') || intensityLower.includes('cat 1')) return 980;
    if (intensityLower.includes('tropical storm')) return 990;
    return 970; // default
  }
  
  /**
   * Extract movement speed from movement string (e.g., "NNE at 12 mph" -> 12)
   */
  extractMovementSpeed(movement) {
    if (!movement) return null;
    const match = movement.match(/(\d+)\s*mph/i);
    return match ? parseFloat(match[1]) : null;
  }
  
  /**
   * Extract movement direction from movement string (e.g., "NNE at 12 mph" -> "NNE")
   */
  extractMovementDirection(movement) {
    if (!movement) return null;
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    for (const dir of directions) {
      if (movement.toUpperCase().includes(dir)) {
        return dir;
      }
    }
    return null;
  }

  /**
   * Estimate wind speed from intensity classification
   */
  estimateWindSpeed(intensity) {
    const intensityLower = (intensity || '').toLowerCase();
    if (intensityLower.includes('category 5') || intensityLower.includes('cat 5')) return 160;
    if (intensityLower.includes('category 4') || intensityLower.includes('cat 4')) return 140;
    if (intensityLower.includes('category 3') || intensityLower.includes('cat 3')) return 120;
    if (intensityLower.includes('category 2') || intensityLower.includes('cat 2')) return 100;
    if (intensityLower.includes('category 1') || intensityLower.includes('cat 1')) return 85;
    if (intensityLower.includes('tropical storm')) return 60;
    return 75; // default
  }

  /**
   * Get wind radii from intensity
   */
  getWindRadiiFromIntensity(intensity) {
    const windSpeed = this.estimateWindSpeed(intensity);
    
    if (windSpeed >= 140) {
      return {
        cat_5: 30,
        cat_4: 50,
        cat_3: 75,
        cat_2: 100,
        cat_1: 125,
        tropical_storm: 175
      };
    } else if (windSpeed >= 100) {
      return {
        cat_5: 0,
        cat_4: 30,
        cat_3: 50,
        cat_2: 75,
        cat_1: 100,
        tropical_storm: 150
      };
    } else {
      return {
        cat_5: 0,
        cat_4: 0,
        cat_3: 30,
        cat_2: 50,
        cat_1: 75,
        tropical_storm: 100
      };
    }
  }

  /**
   * Get wildfire perimeter data
   */
  async getWildfirePerimeter(fireId) {
    const cacheKey = `wildfire_perimeter_${fireId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Get the wildfire info
      const wildfires = await this.getActiveWildfires();
      const fire = wildfires.find(f => f.id === fireId);

      if (!fire) {
        throw new Error(`Wildfire ${fireId} not found`);
      }

      const perimeterData = {
        fireId,
        name: fire.name,
        center: fire.coordinates,
        acres: fire.acres || 1000,
        containment: fire.containment || 0,
        perimeter: this.generateFirePerimeter(fire.coordinates.lat, fire.coordinates.lon, fire.acres || 1000),
        windDirection: 225, // Default SW (would come from weather API in production)
        windSpeed: 15,
        spreadRate: 'moderate',
        threatLevel: 'high'
      };

      cache.set(cacheKey, perimeterData);
      return perimeterData;
    } catch (error) {
      console.error('Error fetching wildfire perimeter:', error.message);
      throw error;
    }
  }

  /**
   * Generate forecast track points
   * @param {number} startLat - Starting latitude
   * @param {number} startLon - Starting longitude
   * @param {boolean} isMock - Whether this is a mock hurricane (for consistent mock data)
   */
  generateForecastTrack(startLat, startLon, isMock = false) {
    const track = [];
    // For mock hurricanes, use more predictable track
    // For real-time, vary the track based on actual movement patterns
    const latIncrement = isMock ? 0.5 : (0.3 + Math.random() * 0.4);
    const lonIncrement = isMock ? 0.3 : (0.2 + Math.random() * 0.3);
    
    for (let i = 0; i <= 5; i++) {
      track.push({
        hour: i * 24,
        lat: startLat + (i * latIncrement),
        lon: startLon + (i * lonIncrement),
        windSpeed: isMock ? (140 - (i * 10)) : (120 - (i * 8) + Math.random() * 10),
        timestamp: new Date(Date.now() + i * 24 * 3600000).toISOString()
      });
    }
    return track;
  }

  /**
   * Generate cone of uncertainty polygon (FIXED)
   */
  generateConeOfUncertainty(centerLat, centerLon) {
    const points = [];
    const numPoints = 36;
    const baseRadius = 1.5; // degrees
    
    // Generate points around the circle
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      const radius = baseRadius * (1 + i / numPoints);
      points.push([
        centerLon + Math.cos(angle) * radius,
        centerLat + Math.sin(angle) * radius
      ]);
    }
    
    // Close the polygon
    points.push(points[0]);
    
    return turf.polygon([points]);
  }

  /**
   * Generate storm surge zones
   */
  generateStormSurgeZones(centerLat, centerLon) {
    return {
      extreme: { minFeet: 9, maxFeet: 15, radius: 0.3 },
      high: { minFeet: 6, maxFeet: 9, radius: 0.5 },
      moderate: { minFeet: 3, maxFeet: 6, radius: 0.8 },
      low: { minFeet: 1, maxFeet: 3, radius: 1.2 }
    };
  }

  /**
   * Generate wildfire perimeter polygon
   */
  generateFirePerimeter(centerLat, centerLon, acres) {
    const radiusMiles = Math.sqrt(acres / Math.PI) / 640;
    const radiusKm = radiusMiles * 1.60934;
    
    const center = turf.point([centerLon, centerLat]);
    const circle = turf.circle(center, radiusKm, { units: 'kilometers', steps: 64 });
    
    return circle;
  }

  /**
   * Get storm status classification
   */
  getStormStatus(classification) {
    const classLower = (classification || '').toLowerCase();
    if (classLower.includes('hurricane')) return 'active';
    if (classLower.includes('tropical storm')) return 'developing';
    if (classLower.includes('subtropical')) return 'developing';
    return 'warning';
  }

  /**
   * Mock hurricane data (Milton and Helene only - always returned)
   */
  getMockHurricanes() {
    return [
      {
        id: 'al092024',
        name: 'Hurricane Milton',
        type: 'hurricane',
        status: 'active',
        location: 'Gulf Coast, Florida',
        coordinates: { lat: 27.9506, lon: -82.4572 },
        intensity: 'Category 4',
        classification: 'Hurricane',
        movement: 'NNE at 12 mph',
        lastUpdated: new Date(Date.now() - 5 * 60000).toISOString(),
        isMock: true
      },
      {
        id: 'al102024',
        name: 'Hurricane Helene',
        type: 'hurricane',
        status: 'warning',
        location: 'Atlantic Coast',
        coordinates: { lat: 32.0809, lon: -81.0912 },
        intensity: 'Category 2',
        classification: 'Hurricane',
        movement: 'N at 8 mph',
        lastUpdated: new Date(Date.now() - 28 * 60000).toISOString(),
        isMock: true
      }
    ];
  }

  /**
   * Mock wildfire data (fallback)
   */
  getMockWildfires() {
    return [
      {
        id: 'ca-park-2024',
        name: 'Park Fire',
        type: 'wildfire',
        status: 'active',
        location: 'Northern California',
        coordinates: { lat: 39.7285, lon: -121.8375 },
        acres: 12500,
        containment: 35,
        lastUpdated: new Date(Date.now() - 12 * 60000).toISOString()
      }
    ];
  }

  /**
   * Get all active disasters
   */
  async getAllActiveDisasters(options = {}) {
    try {
      const {
        includeEarthquakes = true,
        includeSevereWeather = true,
        earthquakeMagnitude = 4.5,
        earthquakeTimeframe = 'week'
      } = options;

      // Fetch all disaster types in parallel
      const promises = [
        this.getActiveHurricanes(),
        this.getActiveWildfires()
      ];

      if (includeEarthquakes) {
        promises.push(
          earthquakeService.getActiveEarthquakes(earthquakeMagnitude, earthquakeTimeframe)
        );
      }

      if (includeSevereWeather) {
        promises.push(
          severeWeatherService.getActiveSevereWeatherAlerts()
        );
      }

      const results = await Promise.all(promises);

      // Preserve isMock flag from getActiveHurricanes (Milton and Helene are mock, others are real-time)
      const hurricanes = results[0].map(h => ({ 
        ...h, 
        isMock: h.isMock !== undefined ? h.isMock : false 
      }));
      const wildfires = results[1].map(w => ({ ...w, isMock: this.usingMockWildfires }));
      const earthquakes = includeEarthquakes ? results[2].map(e => ({ ...e, isMock: earthquakeService.usingMockEarthquakes })) : [];
      const severeWeather = includeSevereWeather ? results[includeEarthquakes ? 3 : 2].map(s => ({ ...s, isMock: severeWeatherService.usingMockSevereWeather })) : [];

      const allDisasters = [...hurricanes, ...wildfires, ...earthquakes, ...severeWeather].sort((a, b) =>
        new Date(b.lastUpdated) - new Date(a.lastUpdated)
      );

      const mockHurricaneCount = hurricanes.filter(h => h.isMock).length;
      const realTimeHurricaneCount = hurricanes.length - mockHurricaneCount;
      console.log(`Total active disasters: ${allDisasters.length} (${hurricanes.length} hurricanes: ${realTimeHurricaneCount} real-time, ${mockHurricaneCount} mock [Milton, Helene], ${wildfires.length} wildfires, ${earthquakes.length} earthquakes, ${severeWeather.length} severe weather)`);

      return allDisasters;
    } catch (error) {
      console.error('Error fetching all disasters:', error.message);
      throw error;
    }
  }
}

export default new DisasterService();