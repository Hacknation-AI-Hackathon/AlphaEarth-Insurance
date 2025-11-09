/**
 * Realistic Property Generation Service
 * Generates insurance portfolios based on actual US demographics and location data
 */

class RealisticPropertyService {
  constructor() {
    // US Region definitions with demographic data
    this.regions = {
      // States and territories
      'California': { density: 251, avgHome: 550000, buildingAge: 1975, residentialPct: 0.65, commercialPct: 0.25 },
      'Texas': { density: 108, avgHome: 240000, buildingAge: 1985, residentialPct: 0.70, commercialPct: 0.22 },
      'Florida': { density: 384, avgHome: 280000, buildingAge: 1980, residentialPct: 0.68, commercialPct: 0.24 },
      'New York': { density: 421, avgHome: 450000, buildingAge: 1960, residentialPct: 0.60, commercialPct: 0.30 },
      'Alaska': { density: 1.3, avgHome: 320000, buildingAge: 1978, residentialPct: 0.75, commercialPct: 0.15 },
      'Hawaii': { density: 221, avgHome: 680000, buildingAge: 1975, residentialPct: 0.70, commercialPct: 0.20 },
      'Puerto Rico': { density: 885, avgHome: 180000, buildingAge: 1985, residentialPct: 0.80, commercialPct: 0.15 },
      'Guam': { density: 775, avgHome: 320000, buildingAge: 1980, residentialPct: 0.75, commercialPct: 0.18 },
      'South Carolina': { density: 167, avgHome: 195000, buildingAge: 1982, residentialPct: 0.72, commercialPct: 0.20 },
      'Georgia': { density: 184, avgHome: 220000, buildingAge: 1983, residentialPct: 0.71, commercialPct: 0.21 },
      'Nevada': { density: 28, avgHome: 310000, buildingAge: 1988, residentialPct: 0.65, commercialPct: 0.25 },
      'Oregon': { density: 43, avgHome: 380000, buildingAge: 1977, residentialPct: 0.68, commercialPct: 0.22 },
      'Washington': { density: 113, avgHome: 420000, buildingAge: 1978, residentialPct: 0.67, commercialPct: 0.23 },
      'Louisiana': { density: 107, avgHome: 175000, buildingAge: 1970, residentialPct: 0.73, commercialPct: 0.19 },
      'New Mexico': { density: 17, avgHome: 215000, buildingAge: 1980, residentialPct: 0.74, commercialPct: 0.18 },

      // Default for other areas
      'Default': { density: 100, avgHome: 250000, buildingAge: 1980, residentialPct: 0.70, commercialPct: 0.22 }
    };

    // Property type distributions
    this.propertyTypes = {
      residential: ['single_family', 'townhouse', 'condo', 'apartment', 'manufactured_home'],
      commercial: ['office', 'retail', 'industrial', 'mixed_use']
    };
  }

  /**
   * Generate realistic property portfolio for a disaster location
   */
  generatePropertiesForLocation(lat, lon, radiusMiles, options = {}) {
    const {
      minProperties = 500,
      maxProperties = 5000,
      insurancePenetration = 0.75 // 75% of properties are insured
    } = options;

    // Identify the region
    const region = this.identifyRegion(lat, lon);
    const regionData = this.regions[region] || this.regions['Default'];

    console.log(`Generating properties for ${region} region (${lat.toFixed(2)}, ${lon.toFixed(2)})`);

    // Calculate number of properties based on density and area
    const areaSqMiles = Math.PI * radiusMiles * radiusMiles;
    const totalPopulation = areaSqMiles * regionData.density;
    const totalHouseholds = Math.floor(totalPopulation / 2.5); // Avg 2.5 people per household

    // Calculate insured properties
    let numProperties = Math.floor(totalHouseholds * insurancePenetration);
    numProperties = Math.max(minProperties, Math.min(maxProperties, numProperties));

    console.log(`  Area: ${areaSqMiles.toFixed(1)} sq mi, Population density: ${regionData.density}/sq mi`);
    console.log(`  Estimated ${totalHouseholds.toLocaleString()} households, ${numProperties.toLocaleString()} insured`);

    // Generate properties distributed around the location
    const properties = [];
    for (let i = 0; i < numProperties; i++) {
      properties.push(this.generateProperty(i + 1, lat, lon, radiusMiles, region, regionData));
    }

    return properties;
  }

  /**
   * Generate a single realistic property
   */
  generateProperty(id, centerLat, centerLon, radiusMiles, region, regionData) {
    // Random location within radius
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.sqrt(Math.random()) * radiusMiles / 69; // Convert miles to degrees (approx)

    const latitude = centerLat + (distance * Math.cos(angle));
    const longitude = centerLon + (distance * Math.sin(angle));

    // Determine property type
    const isResidential = Math.random() < regionData.residentialPct;
    const propertyType = this.selectPropertyType(isResidential);

    // Generate realistic property value
    const propertyValue = this.generatePropertyValue(regionData.avgHome, propertyType, region);

    // Generate coverage amount (typically 80-100% of property value)
    const coveragePercent = 0.8 + (Math.random() * 0.2);
    const coverageAmount = propertyValue * coveragePercent;

    // Generate construction year
    const constructionYear = this.generateConstructionYear(regionData.buildingAge);

    // Generate address
    const address = this.generateAddress(id, region);

    return {
      propertyId: `${region.replace(/\s+/g, '')}-${id}`,
      address,
      latitude: parseFloat(latitude.toFixed(6)),
      longitude: parseFloat(longitude.toFixed(6)),
      propertyType,
      propertyValue: Math.round(propertyValue),
      coverageAmount: Math.round(coverageAmount),
      constructionYear,
      elevation: this.generateElevation(region),
      occupancy: isResidential ? 'owner_occupied' : 'commercial',
      stories: this.generateStories(propertyType),
      squareFeet: this.generateSquareFeet(propertyType, propertyValue)
    };
  }

  /**
   * Identify region from coordinates
   */
  identifyRegion(lat, lon) {
    // Guam and Pacific territories
    if (lat >= 13 && lat <= 20.5 && lon >= 144 && lon <= 146) {
      return 'Guam';
    }

    // Hawaii
    if (lat >= 18.9 && lat <= 28.5 && lon >= -178 && lon <= -154) {
      return 'Hawaii';
    }

    // Alaska
    if (lat >= 51 && lat <= 71.5 && lon >= -180 && lon <= -130) {
      return 'Alaska';
    }

    // Puerto Rico
    if (lat >= 17.5 && lat <= 18.6 && lon >= -67.5 && lon <= -64.5) {
      return 'Puerto Rico';
    }

    // Contiguous US - detailed state identification
    if (lat >= 32 && lat <= 42 && lon >= -124.5 && lon <= -114) {
      return 'California';
    }

    if (lat >= 25.8 && lat <= 31 && lon >= -106.6 && lon <= -93.5) {
      return 'Texas';
    }

    if (lat >= 24.5 && lat <= 31 && lon >= -87.6 && lon <= -80) {
      return 'Florida';
    }

    if (lat >= 32 && lat <= 35.2 && lon >= -83.4 && lon <= -78.5) {
      return 'South Carolina';
    }

    if (lat >= 30.4 && lat <= 35 && lon >= -85.6 && lon <= -80.8) {
      return 'Georgia';
    }

    if (lat >= 35 && lat <= 42 && lon >= -120 && lon <= -116.5) {
      return 'Nevada';
    }

    if (lat >= 42 && lat <= 46.3 && lon >= -124.6 && lon <= -116.5) {
      return 'Oregon';
    }

    if (lat >= 45.5 && lat <= 49 && lon >= -124.8 && lon <= -116.9) {
      return 'Washington';
    }

    if (lat >= 29 && lat <= 33 && lon >= -94 && lon <= -88.8) {
      return 'Louisiana';
    }

    if (lat >= 31.3 && lat <= 37 && lon >= -109 && lon <= -103) {
      return 'New Mexico';
    }

    // Default for other areas
    return 'Default';
  }

  /**
   * Select property type based on distribution
   */
  selectPropertyType(isResidential) {
    if (isResidential) {
      const types = this.propertyTypes.residential;
      const weights = [0.60, 0.15, 0.12, 0.08, 0.05]; // Distribution
      return this.weightedRandom(types, weights);
    } else {
      const types = this.propertyTypes.commercial;
      const weights = [0.35, 0.30, 0.25, 0.10];
      return this.weightedRandom(types, weights);
    }
  }

  /**
   * Generate realistic property value
   */
  generatePropertyValue(avgValue, propertyType, region) {
    let baseValue = avgValue;

    // Adjust for property type
    const typeMultipliers = {
      'single_family': 1.0,
      'townhouse': 0.75,
      'condo': 0.65,
      'apartment': 0.55,
      'manufactured_home': 0.35,
      'office': 2.5,
      'retail': 1.8,
      'industrial': 2.0,
      'mixed_use': 2.2
    };

    baseValue *= (typeMultipliers[propertyType] || 1.0);

    // Add variance (log-normal distribution for realistic spread)
    const logValue = Math.log(baseValue);
    const variance = 0.4; // 40% standard deviation
    const randomLogValue = logValue + (this.randomNormal() * variance);
    const value = Math.exp(randomLogValue);

    // Ensure minimum values
    return Math.max(value, 50000);
  }

  /**
   * Generate construction year
   */
  generateConstructionYear(avgYear) {
    // Normal distribution around average year
    const variance = 15;
    const year = Math.round(avgYear + (this.randomNormal() * variance));
    return Math.max(1900, Math.min(2024, year));
  }

  /**
   * Generate address
   */
  generateAddress(id, region) {
    const streetNames = [
      'Main', 'Oak', 'Maple', 'Cedar', 'Elm', 'Washington', 'Lincoln', 'Jefferson',
      'Park', 'Lake', 'Hill', 'River', 'Ocean', 'Bay', 'Beach', 'Mountain'
    ];
    const streetTypes = ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Rd', 'Way', 'Ct'];

    const number = 100 + (id * 7) % 9900;
    const street = streetNames[id % streetNames.length];
    const type = streetTypes[id % streetTypes.length];

    return `${number} ${street} ${type}`;
  }

  /**
   * Generate elevation (feet above sea level)
   */
  generateElevation(region) {
    const elevationRanges = {
      'Florida': [0, 50],
      'Louisiana': [0, 30],
      'California': [0, 500],
      'Hawaii': [0, 200],
      'Guam': [0, 100],
      'Alaska': [0, 300],
      'Default': [0, 200]
    };

    const range = elevationRanges[region] || elevationRanges['Default'];
    return Math.floor(range[0] + Math.random() * (range[1] - range[0]));
  }

  /**
   * Generate number of stories
   */
  generateStories(propertyType) {
    const storyRanges = {
      'single_family': [1, 2],
      'townhouse': [2, 3],
      'condo': [1, 1],
      'apartment': [2, 4],
      'manufactured_home': [1, 1],
      'office': [2, 8],
      'retail': [1, 2],
      'industrial': [1, 3],
      'mixed_use': [3, 6]
    };

    const range = storyRanges[propertyType] || [1, 2];
    return Math.floor(range[0] + Math.random() * (range[1] - range[0] + 1));
  }

  /**
   * Generate square footage
   */
  generateSquareFeet(propertyType, propertyValue) {
    // Approximate based on property value and type
    const costPerSqFt = {
      'single_family': 150,
      'townhouse': 140,
      'condo': 180,
      'apartment': 160,
      'manufactured_home': 80,
      'office': 200,
      'retail': 180,
      'industrial': 120,
      'mixed_use': 220
    };

    const costPer = costPerSqFt[propertyType] || 150;
    const baseSqFt = propertyValue / costPer;

    // Add variance
    return Math.round(baseSqFt * (0.8 + Math.random() * 0.4));
  }

  /**
   * Weighted random selection
   */
  weightedRandom(items, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;

    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }

  /**
   * Generate random number from normal distribution (Box-Muller transform)
   */
  randomNormal() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}

export default new RealisticPropertyService();
