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
    // All major US commercial airports (100+ airports)
    this.airports = [
      // Top 30 Busiest
      { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', lat: 33.6407, lon: -84.4277, city: 'Atlanta, GA' },
      { code: 'DFW', name: 'Dallas/Fort Worth International', lat: 32.8998, lon: -97.0403, city: 'Dallas, TX' },
      { code: 'DEN', name: 'Denver International', lat: 39.8561, lon: -104.6737, city: 'Denver, CO' },
      { code: 'ORD', name: 'Chicago O\'Hare International', lat: 41.9742, lon: -87.9073, city: 'Chicago, IL' },
      { code: 'LAX', name: 'Los Angeles International', lat: 33.9416, lon: -118.4085, city: 'Los Angeles, CA' },
      { code: 'JFK', name: 'John F. Kennedy International', lat: 40.6413, lon: -73.7781, city: 'New York, NY' },
      { code: 'LAS', name: 'Harry Reid International', lat: 36.0840, lon: -115.1537, city: 'Las Vegas, NV' },
      { code: 'MCO', name: 'Orlando International', lat: 28.4312, lon: -81.3081, city: 'Orlando, FL' },
      { code: 'MIA', name: 'Miami International', lat: 25.7959, lon: -80.2870, city: 'Miami, FL' },
      { code: 'CLT', name: 'Charlotte Douglas International', lat: 35.2144, lon: -80.9473, city: 'Charlotte, NC' },
      { code: 'SEA', name: 'Seattle-Tacoma International', lat: 47.4502, lon: -122.3088, city: 'Seattle, WA' },
      { code: 'PHX', name: 'Phoenix Sky Harbor International', lat: 33.4352, lon: -112.0101, city: 'Phoenix, AZ' },
      { code: 'EWR', name: 'Newark Liberty International', lat: 40.6895, lon: -74.1745, city: 'Newark, NJ' },
      { code: 'SFO', name: 'San Francisco International', lat: 37.6213, lon: -122.3790, city: 'San Francisco, CA' },
      { code: 'IAH', name: 'George Bush Intercontinental', lat: 29.9902, lon: -95.3368, city: 'Houston, TX' },
      { code: 'BOS', name: 'Boston Logan International', lat: 42.3656, lon: -71.0096, city: 'Boston, MA' },
      { code: 'FLL', name: 'Fort Lauderdale-Hollywood International', lat: 26.0742, lon: -80.1506, city: 'Fort Lauderdale, FL' },
      { code: 'MSP', name: 'Minneapolis-St Paul International', lat: 44.8848, lon: -93.2223, city: 'Minneapolis, MN' },
      { code: 'LGA', name: 'LaGuardia', lat: 40.7769, lon: -73.8740, city: 'New York, NY' },
      { code: 'DTW', name: 'Detroit Metropolitan Wayne County', lat: 42.2162, lon: -83.3554, city: 'Detroit, MI' },
      { code: 'PHL', name: 'Philadelphia International', lat: 39.8744, lon: -75.2424, city: 'Philadelphia, PA' },
      { code: 'SLC', name: 'Salt Lake City International', lat: 40.7899, lon: -111.9791, city: 'Salt Lake City, UT' },
      { code: 'DCA', name: 'Ronald Reagan Washington National', lat: 38.8521, lon: -77.0377, city: 'Washington, DC' },
      { code: 'SAN', name: 'San Diego International', lat: 32.7338, lon: -117.1933, city: 'San Diego, CA' },
      { code: 'IAD', name: 'Washington Dulles International', lat: 38.9531, lon: -77.4565, city: 'Dulles, VA' },
      { code: 'TPA', name: 'Tampa International', lat: 27.9755, lon: -82.5332, city: 'Tampa, FL' },
      { code: 'PDX', name: 'Portland International', lat: 45.5898, lon: -122.5951, city: 'Portland, OR' },
      { code: 'HNL', name: 'Daniel K. Inouye International', lat: 21.3187, lon: -157.9225, city: 'Honolulu, HI' },
      { code: 'BWI', name: 'Baltimore/Washington International', lat: 39.1774, lon: -76.6684, city: 'Baltimore, MD' },
      { code: 'AUS', name: 'Austin-Bergstrom International', lat: 30.1945, lon: -97.6699, city: 'Austin, TX' },

      // Major Regional Hubs (31-70)
      { code: 'MDW', name: 'Chicago Midway International', lat: 41.7868, lon: -87.7522, city: 'Chicago, IL' },
      { code: 'BNA', name: 'Nashville International', lat: 36.1245, lon: -86.6782, city: 'Nashville, TN' },
      { code: 'DAL', name: 'Dallas Love Field', lat: 32.8470, lon: -96.8517, city: 'Dallas, TX' },
      { code: 'HOU', name: 'William P. Hobby', lat: 29.6454, lon: -95.2789, city: 'Houston, TX' },
      { code: 'OAK', name: 'Oakland International', lat: 37.7213, lon: -122.2208, city: 'Oakland, CA' },
      { code: 'SNA', name: 'John Wayne Airport', lat: 33.6762, lon: -117.8679, city: 'Santa Ana, CA' },
      { code: 'MCI', name: 'Kansas City International', lat: 39.2976, lon: -94.7139, city: 'Kansas City, MO' },
      { code: 'RDU', name: 'Raleigh-Durham International', lat: 35.8776, lon: -78.7875, city: 'Raleigh, NC' },
      { code: 'SJC', name: 'Norman Y. Mineta San Jose International', lat: 37.3639, lon: -121.9289, city: 'San Jose, CA' },
      { code: 'SMF', name: 'Sacramento International', lat: 38.6954, lon: -121.5901, city: 'Sacramento, CA' },
      { code: 'SJU', name: 'Luis Muñoz Marín International', lat: 18.4394, lon: -66.0018, city: 'San Juan, PR' },
      { code: 'RSW', name: 'Southwest Florida International', lat: 26.5362, lon: -81.7552, city: 'Fort Myers, FL' },
      { code: 'SAT', name: 'San Antonio International', lat: 29.5337, lon: -98.4698, city: 'San Antonio, TX' },
      { code: 'PIT', name: 'Pittsburgh International', lat: 40.4915, lon: -80.2329, city: 'Pittsburgh, PA' },
      { code: 'CMH', name: 'John Glenn Columbus International', lat: 39.9980, lon: -82.8919, city: 'Columbus, OH' },
      { code: 'IND', name: 'Indianapolis International', lat: 39.7173, lon: -86.2944, city: 'Indianapolis, IN' },
      { code: 'CLE', name: 'Cleveland Hopkins International', lat: 41.4117, lon: -81.8498, city: 'Cleveland, OH' },
      { code: 'CVG', name: 'Cincinnati/Northern Kentucky International', lat: 39.0488, lon: -84.6678, city: 'Cincinnati, OH' },
      { code: 'STL', name: 'St. Louis Lambert International', lat: 38.7487, lon: -90.3700, city: 'St. Louis, MO' },
      { code: 'PBI', name: 'Palm Beach International', lat: 26.6832, lon: -80.0956, city: 'West Palm Beach, FL' },
      { code: 'RNO', name: 'Reno-Tahoe International', lat: 39.4991, lon: -119.7681, city: 'Reno, NV' },
      { code: 'BUF', name: 'Buffalo Niagara International', lat: 42.9405, lon: -78.7322, city: 'Buffalo, NY' },
      { code: 'ONT', name: 'Ontario International', lat: 34.0560, lon: -117.6012, city: 'Ontario, CA' },
      { code: 'BDL', name: 'Bradley International', lat: 41.9389, lon: -72.6832, city: 'Hartford, CT' },
      { code: 'ABQ', name: 'Albuquerque International Sunport', lat: 35.0402, lon: -106.6092, city: 'Albuquerque, NM' },
      { code: 'BUR', name: 'Hollywood Burbank', lat: 34.2007, lon: -118.3585, city: 'Burbank, CA' },
      { code: 'ANC', name: 'Ted Stevens Anchorage International', lat: 61.1743, lon: -149.9962, city: 'Anchorage, AK' },
      { code: 'OGG', name: 'Kahului Airport', lat: 20.8986, lon: -156.4306, city: 'Kahului, HI' },
      { code: 'JAX', name: 'Jacksonville International', lat: 30.4941, lon: -81.6879, city: 'Jacksonville, FL' },
      { code: 'MKE', name: 'Milwaukee Mitchell International', lat: 42.9472, lon: -87.8966, city: 'Milwaukee, WI' },
      { code: 'OMA', name: 'Eppley Airfield', lat: 41.3032, lon: -95.8941, city: 'Omaha, NE' },
      { code: 'TUS', name: 'Tucson International', lat: 32.1161, lon: -110.9411, city: 'Tucson, AZ' },
      { code: 'ELP', name: 'El Paso International', lat: 31.8072, lon: -106.3778, city: 'El Paso, TX' },
      { code: 'BOI', name: 'Boise Airport', lat: 43.5644, lon: -116.2228, city: 'Boise, ID' },
      { code: 'OKC', name: 'Will Rogers World', lat: 35.3931, lon: -97.6007, city: 'Oklahoma City, OK' },
      { code: 'MEM', name: 'Memphis International', lat: 35.0424, lon: -89.9767, city: 'Memphis, TN' },
      { code: 'TUL', name: 'Tulsa International', lat: 36.1984, lon: -95.8881, city: 'Tulsa, OK' },
      { code: 'LGB', name: 'Long Beach Airport', lat: 33.8177, lon: -118.1516, city: 'Long Beach, CA' },
      { code: 'PVD', name: 'T.F. Green Airport', lat: 41.7240, lon: -71.4281, city: 'Providence, RI' },
      { code: 'RIC', name: 'Richmond International', lat: 37.5052, lon: -77.3197, city: 'Richmond, VA' },

      // Additional Major Airports (71-110)
      { code: 'ROC', name: 'Greater Rochester International', lat: 43.1189, lon: -77.6724, city: 'Rochester, NY' },
      { code: 'SYR', name: 'Syracuse Hancock International', lat: 43.1112, lon: -76.1063, city: 'Syracuse, NY' },
      { code: 'ALB', name: 'Albany International', lat: 42.7483, lon: -73.8017, city: 'Albany, NY' },
      { code: 'GRR', name: 'Gerald R. Ford International', lat: 42.8808, lon: -85.5228, city: 'Grand Rapids, MI' },
      { code: 'DSM', name: 'Des Moines International', lat: 41.5340, lon: -93.6631, city: 'Des Moines, IA' },
      { code: 'MSY', name: 'Louis Armstrong New Orleans International', lat: 29.9934, lon: -90.2580, city: 'New Orleans, LA' },
      { code: 'GSO', name: 'Piedmont Triad International', lat: 36.0978, lon: -79.9373, city: 'Greensboro, NC' },
      { code: 'CHS', name: 'Charleston International', lat: 32.8986, lon: -80.0405, city: 'Charleston, SC' },
      { code: 'SAV', name: 'Savannah/Hilton Head International', lat: 32.1276, lon: -81.2021, city: 'Savannah, GA' },
      { code: 'GSP', name: 'Greenville-Spartanburg International', lat: 34.8957, lon: -82.2189, city: 'Greenville, SC' },
      { code: 'CAE', name: 'Columbia Metropolitan', lat: 33.9388, lon: -81.1195, city: 'Columbia, SC' },
      { code: 'PNS', name: 'Pensacola International', lat: 30.4734, lon: -87.1866, city: 'Pensacola, FL' },
      { code: 'DAY', name: 'James M. Cox Dayton International', lat: 39.9024, lon: -84.2194, city: 'Dayton, OH' },
      { code: 'LEX', name: 'Blue Grass Airport', lat: 38.0365, lon: -84.6059, city: 'Lexington, KY' },
      { code: 'LIT', name: 'Bill and Hillary Clinton National', lat: 34.7294, lon: -92.2243, city: 'Little Rock, AR' },
      { code: 'ICT', name: 'Wichita Dwight D. Eisenhower National', lat: 37.6499, lon: -97.4331, city: 'Wichita, KS' },
      { code: 'COS', name: 'Colorado Springs Airport', lat: 38.8058, lon: -104.7004, city: 'Colorado Springs, CO' },
      { code: 'FAT', name: 'Fresno Yosemite International', lat: 36.7762, lon: -119.7181, city: 'Fresno, CA' },
      { code: 'BZN', name: 'Bozeman Yellowstone International', lat: 45.7769, lon: -111.1603, city: 'Bozeman, MT' },
      { code: 'MSN', name: 'Dane County Regional', lat: 43.1399, lon: -89.3375, city: 'Madison, WI' },
      { code: 'GEG', name: 'Spokane International', lat: 47.6199, lon: -117.5339, city: 'Spokane, WA' },
      { code: 'PSP', name: 'Palm Springs International', lat: 33.8297, lon: -116.5067, city: 'Palm Springs, CA' },
      { code: 'FAI', name: 'Fairbanks International', lat: 64.8151, lon: -147.8561, city: 'Fairbanks, AK' },
      { code: 'SDF', name: 'Louisville Muhammad Ali International', lat: 38.1744, lon: -85.7360, city: 'Louisville, KY' },
      { code: 'MHT', name: 'Manchester-Boston Regional', lat: 42.9326, lon: -71.4357, city: 'Manchester, NH' },
      { code: 'BHM', name: 'Birmingham-Shuttlesworth International', lat: 33.5629, lon: -86.7535, city: 'Birmingham, AL' },
      { code: 'HSV', name: 'Huntsville International', lat: 34.6372, lon: -86.7751, city: 'Huntsville, AL' },
      { code: 'MOB', name: 'Mobile Regional', lat: 30.6912, lon: -88.2428, city: 'Mobile, AL' },
      { code: 'SRQ', name: 'Sarasota-Bradenton International', lat: 27.3954, lon: -82.5544, city: 'Sarasota, FL' },
      { code: 'PFN', name: 'Panama City-Bay County International', lat: 30.2121, lon: -85.6828, city: 'Panama City, FL' },
      { code: 'TLH', name: 'Tallahassee International', lat: 30.3965, lon: -84.3503, city: 'Tallahassee, FL' },
      { code: 'GNV', name: 'Gainesville Regional', lat: 29.6900, lon: -82.2718, city: 'Gainesville, FL' },
      { code: 'MLB', name: 'Melbourne Orlando International', lat: 28.1028, lon: -80.6450, city: 'Melbourne, FL' },
      { code: 'MYR', name: 'Myrtle Beach International', lat: 33.6797, lon: -78.9283, city: 'Myrtle Beach, SC' },
      { code: 'ILM', name: 'Wilmington International', lat: 34.2706, lon: -77.9026, city: 'Wilmington, NC' },
      { code: 'ORF', name: 'Norfolk International', lat: 36.8946, lon: -76.2012, city: 'Norfolk, VA' },
      { code: 'PHF', name: 'Newport News/Williamsburg International', lat: 37.1319, lon: -76.4930, city: 'Newport News, VA' },
      { code: 'CHO', name: 'Charlottesville-Albemarle', lat: 38.1386, lon: -78.4529, city: 'Charlottesville, VA' },
      { code: 'TYS', name: 'McGhee Tyson', lat: 35.8111, lon: -83.9940, city: 'Knoxville, TN' },
    ];

    console.log('✈️  Flight Delay Detection Service initialized');
    console.log(`   📍 Monitoring ${this.airports.length} airports across the USA`);
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
