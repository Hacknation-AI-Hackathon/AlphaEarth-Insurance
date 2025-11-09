import realisticPropertyService from './realisticPropertyService.js';

class PropertyService {
  /**
   * Generate mock property portfolio
   */
  generateMockPortfolio(region = 'florida', numProperties = 5000) {
    const properties = [];
    const regions = {
      florida: {
        latRange: [25.0, 30.5],
        lonRange: [-87.0, -80.0],
        name: 'Florida'
      },
      california: {
        latRange: [32.5, 42.0],
        lonRange: [-124.5, -114.0],
        name: 'California'
      },
      texas: {
        latRange: [25.8, 36.5],
        lonRange: [-106.6, -93.5],
        name: 'Texas'
      }
    };

    const selectedRegion = regions[region] || regions.florida;
    const propertyTypes = ['residential', 'commercial', 'condo', 'townhouse'];
    const streets = ['Main St', 'Oak Ave', 'Beach Blvd', 'Park Rd', 'Ocean Dr', 'Bay St'];

    for (let i = 1; i <= numProperties; i++) {
      const latitude = this.randomInRange(
        selectedRegion.latRange[0],
        selectedRegion.latRange[1]
      );
      const longitude = this.randomInRange(
        selectedRegion.lonRange[0],
        selectedRegion.lonRange[1]
      );
      const propertyValue = this.randomInRange(200000, 2000000);
      const coverageAmount = propertyValue * this.randomInRange(0.75, 0.95);
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const street = streets[Math.floor(Math.random() * streets.length)];

      properties.push({
        propertyId: `PROP-${String(i).padStart(6, '0')}`,
        address: `${1000 + i} ${street}, ${selectedRegion.name}`,
        latitude: parseFloat(latitude.toFixed(6)),
        longitude: parseFloat(longitude.toFixed(6)),
        propertyValue: parseFloat(propertyValue.toFixed(2)),
        coverageAmount: parseFloat(coverageAmount.toFixed(2)),
        propertyType,
        constructionYear: Math.floor(this.randomInRange(1950, 2024)),
        stories: Math.floor(this.randomInRange(1, 4)),
        elevation: parseFloat(this.randomInRange(5, 50).toFixed(1)),
        squareFeet: Math.floor(this.randomInRange(1200, 5000)),
        roofType: this.randomChoice(['shingle', 'metal', 'tile', 'flat']),
        foundationType: this.randomChoice(['slab', 'pier', 'basement', 'crawlspace'])
      });
    }

    return properties;
  }

  /**
   * Get properties in a specific region
   */
  getPropertiesInRegion(centerLat, centerLon, radiusMiles = 100) {
    // Use realistic property generation based on demographics
    return realisticPropertyService.generatePropertiesForLocation(
      centerLat,
      centerLon,
      radiusMiles,
      {
        minProperties: 500,
        maxProperties: 5000,
        insurancePenetration: 0.75 // 75% of households are insured
      }
    );
  }

  /**
   * Get high-value properties
   */
  getHighValueProperties(properties, threshold = 1000000) {
    return properties.filter(p => p.propertyValue >= threshold);
  }

  /**
   * Get coastal properties (within X miles of coast)
   */
  getCoastalProperties(properties, maxDistanceMiles = 10) {
    // Simplified: check elevation as proxy for coastal proximity
    return properties.filter(p => p.elevation < 20);
  }

  /**
   * Calculate Haversine distance between two points
   */
  haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth radius in miles
    const toRad = (deg) => deg * Math.PI / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }

  /**
   * Random number in range
   */
  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Random choice from array
   */
  randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Get property statistics
   */
  getPortfolioStatistics(properties) {
    const totalValue = properties.reduce((sum, p) => sum + p.propertyValue, 0);
    const totalCoverage = properties.reduce((sum, p) => sum + p.coverageAmount, 0);
    const avgValue = totalValue / properties.length;
    
    const typeDistribution = properties.reduce((acc, p) => {
      acc[p.propertyType] = (acc[p.propertyType] || 0) + 1;
      return acc;
    }, {});

    return {
      totalProperties: properties.length,
      totalValue: parseFloat(totalValue.toFixed(2)),
      totalCoverage: parseFloat(totalCoverage.toFixed(2)),
      averageValue: parseFloat(avgValue.toFixed(2)),
      typeDistribution
    };
  }
}

export default new PropertyService();