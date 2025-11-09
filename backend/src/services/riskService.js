import * as turf from '@turf/turf';

class RiskAssessmentService {
  /**
   * Calculate hurricane risk for properties
   */
  assessHurricaneRisk(properties, hurricaneData) {
    const results = properties.map(property => {
      const propPoint = turf.point([property.longitude, property.latitude]);
      const hurricaneCenter = turf.point([
        hurricaneData.center.lon,
        hurricaneData.center.lat
      ]);

      // Calculate distance in miles
      const distanceMiles = turf.distance(propPoint, hurricaneCenter, { units: 'miles' });

      // Check if in cone of uncertainty
      const inCone = hurricaneData.coneOfUncertainty ? 
        turf.booleanPointInPolygon(propPoint, hurricaneData.coneOfUncertainty) : 
        false;

      // Determine wind category based on distance
      const windCategory = this.getWindCategory(distanceMiles, hurricaneData.windRadii);

      // Calculate damage probability
      const damageProbability = this.calculateHurricaneDamage(
        windCategory,
        inCone,
        property.elevation || 10,
        property.constructionYear || 2000,
        distanceMiles,
        property.propertyType
      );

      // Calculate expected loss
      const expectedLoss = property.coverageAmount * damageProbability;

      // Determine risk tier
      const riskTier = this.getRiskTier(damageProbability);

      return {
        propertyId: property.propertyId,
        address: property.address,
        coordinates: {
          lat: property.latitude,
          lon: property.longitude
        },
        propertyValue: property.propertyValue,
        coverageAmount: property.coverageAmount,
        propertyType: property.propertyType,
        distanceMiles: parseFloat(distanceMiles.toFixed(2)),
        inCone,
        windCategory,
        damageProbability: parseFloat(damageProbability.toFixed(4)),
        expectedLoss: parseFloat(expectedLoss.toFixed(2)),
        riskTier
      };
    });

    return results;
  }

  /**
   * Calculate wildfire risk for properties
   */
  assessWildfireRisk(properties, wildfireData) {
    const results = properties.map(property => {
      const propPoint = turf.point([property.longitude, property.latitude]);
      
      // Calculate distance from fire perimeter
      const fireCenter = turf.point([
        wildfireData.center.lon,
        wildfireData.center.lat
      ]);
      const distanceMiles = turf.distance(propPoint, fireCenter, { units: 'miles' });

      // Check if downwind
      const isDownwind = this.isDownwind(
        property.latitude,
        property.longitude,
        wildfireData.center.lat,
        wildfireData.center.lon,
        wildfireData.windDirection
      );

      // Calculate damage probability
      let damageProbability = 0;
      let riskLevel = 'low';

      if (distanceMiles < 0.5) {
        damageProbability = 0.90;
        riskLevel = 'critical';
      } else if (distanceMiles < 2 && isDownwind) {
        damageProbability = 0.60;
        riskLevel = 'high';
      } else if (distanceMiles < 5) {
        damageProbability = 0.30;
        riskLevel = 'moderate';
      } else {
        damageProbability = 0.05;
        riskLevel = 'low';
      }

      // Adjust for property characteristics
      if (property.propertyType === 'residential' && property.constructionYear < 1990) {
        damageProbability *= 1.2;
      }

      damageProbability = Math.min(damageProbability, 0.95);

      const expectedLoss = property.coverageAmount * damageProbability;

      return {
        propertyId: property.propertyId,
        address: property.address,
        coordinates: {
          lat: property.latitude,
          lon: property.longitude
        },
        propertyValue: property.propertyValue,
        coverageAmount: property.coverageAmount,
        propertyType: property.propertyType,
        distanceMiles: parseFloat(distanceMiles.toFixed(2)),
        isDownwind,
        damageProbability: parseFloat(damageProbability.toFixed(4)),
        expectedLoss: parseFloat(expectedLoss.toFixed(2)),
        riskTier: riskLevel
      };
    });

    return results;
  }

  /**
   * Determine wind category based on distance
   */
  getWindCategory(distanceMiles, windRadii) {
    if (distanceMiles <= windRadii.cat_5) return 'cat_5';
    if (distanceMiles <= windRadii.cat_4) return 'cat_4';
    if (distanceMiles <= windRadii.cat_3) return 'cat_3';
    if (distanceMiles <= windRadii.cat_2) return 'cat_2';
    if (distanceMiles <= windRadii.cat_1) return 'cat_1';
    if (distanceMiles <= windRadii.tropical_storm) return 'tropical_storm';
    return 'none';
  }

  /**
   * Calculate hurricane damage probability
   */
  calculateHurricaneDamage(windCategory, inCone, elevation, constructionYear, distance, propertyType) {
    const windDamage = {
      cat_5: 0.85,
      cat_4: 0.65,
      cat_3: 0.45,
      cat_2: 0.30,
      cat_1: 0.20,
      tropical_storm: 0.10,
      none: 0.02
    };

    let baseProbability = windDamage[windCategory] || 0;

    // Cone of uncertainty adjustment
    if (inCone) {
      baseProbability *= 1.5;
    }

    // Elevation (flood risk)
    if (elevation < 10) {
      baseProbability += 0.25;
    } else if (elevation < 20) {
      baseProbability += 0.10;
    }

    // Building age
    if (constructionYear < 1990) {
      baseProbability *= 1.2;
    } else if (constructionYear < 2000) {
      baseProbability *= 1.1;
    }

    // Property type
    if (propertyType === 'commercial') {
      baseProbability *= 0.9; // Better construction
    } else if (propertyType === 'mobile_home') {
      baseProbability *= 1.4; // More vulnerable
    }

    // Cap at 95%
    return Math.min(baseProbability, 0.95);
  }

  /**
   * Check if property is downwind from fire
   */
  isDownwind(propLat, propLon, fireLat, fireLon, windDirection) {
    // Calculate bearing from fire to property
    const from = turf.point([fireLon, fireLat]);
    const to = turf.point([propLon, propLat]);
    const bearing = turf.bearing(from, to);

    // Normalize bearing to 0-360
    const normalizedBearing = (bearing + 360) % 360;
    
    // Wind direction is where wind is coming FROM
    // Check if property is in downwind cone (±45 degrees)
    const windTo = (windDirection + 180) % 360;
    const difference = Math.abs(normalizedBearing - windTo);
    
    return difference <= 45 || difference >= 315;
  }

  /**
   * Determine risk tier from probability
   */
  getRiskTier(probability) {
    if (probability >= 0.60) return 'critical';
    if (probability >= 0.30) return 'high';
    if (probability >= 0.10) return 'moderate';
    return 'low';
  }

  /**
   * Calculate portfolio metrics
   */
  calculatePortfolioMetrics(riskAssessments) {
    const totalProperties = riskAssessments.length;
    const propertiesAtRisk = riskAssessments.filter(
      p => p.damageProbability > 0.1
    ).length;

    const totalInsuredValue = riskAssessments.reduce(
      (sum, p) => sum + p.coverageAmount, 0
    );

    const expectedLoss = riskAssessments.reduce(
      (sum, p) => sum + p.expectedLoss, 0
    );

    // Calculate percentile losses
    const sortedLosses = riskAssessments
      .map(p => p.expectedLoss)
      .sort((a, b) => a - b);

    const percentile50Index = Math.floor(sortedLosses.length * 0.50);
    const percentile90Index = Math.floor(sortedLosses.length * 0.90);
    const percentile99Index = Math.floor(sortedLosses.length * 0.99);

    return {
      totalProperties,
      propertiesAtRisk,
      totalInsuredValue: parseFloat(totalInsuredValue.toFixed(2)),
      expectedLoss: parseFloat(expectedLoss.toFixed(2)),
      percentile50Loss: parseFloat((sortedLosses[percentile50Index] || 0).toFixed(2)),
      percentile90Loss: parseFloat((sortedLosses[percentile90Index] || 0).toFixed(2)),
      percentile99Loss: parseFloat((sortedLosses[percentile99Index] || 0).toFixed(2))
    };
  }

  /**
   * Calculate risk distribution
   */
  calculateRiskDistribution(riskAssessments) {
    const distribution = {
      critical: { count: 0, loss: 0 },
      high: { count: 0, loss: 0 },
      moderate: { count: 0, loss: 0 },
      low: { count: 0, loss: 0 }
    };

    riskAssessments.forEach(assessment => {
      const tier = assessment.riskTier;
      if (distribution[tier]) {
        distribution[tier].count++;
        distribution[tier].loss += assessment.expectedLoss;
      }
    });

    // Round loss values
    Object.keys(distribution).forEach(tier => {
      distribution[tier].loss = parseFloat(distribution[tier].loss.toFixed(2));
    });

    return distribution;
  }

  /**
   * Run Monte Carlo simulation
   */
  runMonteCarloSimulation(riskAssessments, numSimulations = 1000) {
    const simulatedLosses = [];

    for (let i = 0; i < numSimulations; i++) {
      let totalLoss = 0;
      
      riskAssessments.forEach(property => {
        // Random outcome based on damage probability
        const outcome = Math.random() < property.damageProbability;
        if (outcome) {
          // Random loss between 50% and 100% of coverage
          const lossPercentage = 0.5 + (Math.random() * 0.5);
          totalLoss += property.coverageAmount * lossPercentage;
        }
      });

      simulatedLosses.push(totalLoss);
    }

    simulatedLosses.sort((a, b) => a - b);

    const mean = simulatedLosses.reduce((a, b) => a + b, 0) / numSimulations;
    const median = simulatedLosses[Math.floor(numSimulations * 0.5)];
    const loss95 = simulatedLosses[Math.floor(numSimulations * 0.95)];
    const loss99 = simulatedLosses[Math.floor(numSimulations * 0.99)];

    // Calculate standard deviation
    const variance = simulatedLosses.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0
    ) / numSimulations;
    const stdDev = Math.sqrt(variance);

    return {
      meanLoss: parseFloat(mean.toFixed(2)),
      medianLoss: parseFloat(median.toFixed(2)),
      lossStd: parseFloat(stdDev.toFixed(2)),
      loss95Percentile: parseFloat(loss95.toFixed(2)),
      loss99Percentile: parseFloat(loss99.toFixed(2)),
      numSimulations
    };
  }

  /**
   * Calculate earthquake risk for properties
   */
  assessEarthquakeRisk(properties, earthquakeData) {
    const results = properties.map(property => {
      const propPoint = turf.point([property.longitude, property.latitude]);
      const epicenter = turf.point([
        earthquakeData.coordinates.lon,
        earthquakeData.coordinates.lat
      ]);

      // Calculate distance in miles
      const distanceMiles = turf.distance(propPoint, epicenter, { units: 'miles' });

      // Calculate damage probability based on magnitude, distance, and depth
      const damageProbability = this.calculateEarthquakeDamage(
        earthquakeData.magnitude,
        distanceMiles,
        earthquakeData.depth,
        property.constructionYear || 2000,
        property.propertyType
      );

      // Calculate expected loss
      const expectedLoss = property.coverageAmount * damageProbability;

      // Determine risk tier
      const riskTier = this.getRiskTier(damageProbability);

      return {
        propertyId: property.propertyId,
        address: property.address,
        coordinates: {
          lat: property.latitude,
          lon: property.longitude
        },
        propertyValue: property.propertyValue,
        coverageAmount: property.coverageAmount,
        propertyType: property.propertyType,
        distanceMiles: parseFloat(distanceMiles.toFixed(2)),
        magnitude: earthquakeData.magnitude,
        depth: earthquakeData.depth,
        damageProbability: parseFloat(damageProbability.toFixed(4)),
        expectedLoss: parseFloat(expectedLoss.toFixed(2)),
        riskTier
      };
    });

    return results;
  }

  /**
   * Calculate earthquake damage probability
   */
  calculateEarthquakeDamage(magnitude, distanceMiles, depth, constructionYear, propertyType) {
    let baseProbability = 0;

    // Magnitude-based base probability
    if (magnitude >= 7.0) {
      baseProbability = 0.80;
    } else if (magnitude >= 6.0) {
      baseProbability = 0.50;
    } else if (magnitude >= 5.0) {
      baseProbability = 0.25;
    } else if (magnitude >= 4.0) {
      baseProbability = 0.10;
    } else {
      baseProbability = 0.02;
    }

    // Distance decay (exponential)
    const distanceFactor = Math.exp(-distanceMiles / 50);
    let probability = baseProbability * distanceFactor;

    // Depth adjustment (deeper = less surface impact)
    if (depth > 100) {
      probability *= 0.5;
    } else if (depth > 50) {
      probability *= 0.7;
    }

    // Building age vulnerability
    if (constructionYear < 1980) {
      probability *= 1.5; // Pre-modern building codes
    } else if (constructionYear < 2000) {
      probability *= 1.2;
    }

    // Property type
    if (propertyType === 'commercial') {
      probability *= 1.1; // Higher occupancy risk
    }

    return Math.min(probability, 0.95);
  }

  /**
   * Calculate severe weather risk for properties
   */
  assessSevereWeatherRisk(properties, weatherAlert) {
    const results = properties.map(property => {
      let damageProbability = 0;
      let distanceMiles = null;

      // Calculate distance if geometry is available
      if (weatherAlert.geometry && weatherAlert.coordinates) {
        const propPoint = turf.point([property.longitude, property.latitude]);
        const alertCenter = turf.point([
          weatherAlert.coordinates.lon,
          weatherAlert.coordinates.lat
        ]);
        distanceMiles = turf.distance(propPoint, alertCenter, { units: 'miles' });

        // Check if property is inside alert polygon
        let inAlertZone = false;
        if (weatherAlert.geometry.type === 'Polygon') {
          inAlertZone = turf.booleanPointInPolygon(propPoint, weatherAlert.geometry);
        } else if (weatherAlert.geometry.type === 'MultiPolygon') {
          inAlertZone = turf.booleanPointInPolygon(propPoint, weatherAlert.geometry);
        }

        if (inAlertZone) {
          distanceMiles = 0;
        }
      }

      // Calculate damage based on event type and severity
      damageProbability = this.calculateSevereWeatherDamage(
        weatherAlert.type,
        weatherAlert.severity,
        weatherAlert.urgency,
        distanceMiles,
        property.constructionYear || 2000,
        property.propertyType
      );

      // Calculate expected loss
      const expectedLoss = property.coverageAmount * damageProbability;

      // Determine risk tier
      const riskTier = this.getRiskTier(damageProbability);

      return {
        propertyId: property.propertyId,
        address: property.address,
        coordinates: {
          lat: property.latitude,
          lon: property.longitude
        },
        propertyValue: property.propertyValue,
        coverageAmount: property.coverageAmount,
        propertyType: property.propertyType,
        distanceMiles: distanceMiles !== null ? parseFloat(distanceMiles.toFixed(2)) : null,
        alertType: weatherAlert.type,
        severity: weatherAlert.severity,
        damageProbability: parseFloat(damageProbability.toFixed(4)),
        expectedLoss: parseFloat(expectedLoss.toFixed(2)),
        riskTier
      };
    });

    return results;
  }

  /**
   * Calculate severe weather damage probability
   */
  calculateSevereWeatherDamage(alertType, severity, urgency, distanceMiles, constructionYear, propertyType) {
    let baseProbability = 0;

    // Base probability by alert type
    switch (alertType) {
      case 'tornado':
        baseProbability = 0.70;
        break;
      case 'severe_thunderstorm':
        baseProbability = 0.35;
        break;
      case 'flood':
      case 'flash_flood':
        baseProbability = 0.60;
        break;
      case 'hurricane':
        baseProbability = 0.75;
        break;
      case 'storm_surge':
        baseProbability = 0.80;
        break;
      case 'high_wind':
        baseProbability = 0.40;
        break;
      case 'winter_storm':
        baseProbability = 0.25;
        break;
      default:
        baseProbability = 0.20;
    }

    // Severity multiplier
    if (severity === 'Extreme') {
      baseProbability *= 1.5;
    } else if (severity === 'Severe') {
      baseProbability *= 1.2;
    } else if (severity === 'Moderate') {
      baseProbability *= 1.0;
    }

    // Urgency multiplier
    if (urgency === 'Immediate') {
      baseProbability *= 1.3;
    } else if (urgency === 'Expected') {
      baseProbability *= 1.1;
    }

    // Distance decay (if available)
    if (distanceMiles !== null) {
      if (distanceMiles === 0) {
        // Inside alert zone
        baseProbability *= 1.2;
      } else if (distanceMiles < 10) {
        baseProbability *= 0.8;
      } else if (distanceMiles < 25) {
        baseProbability *= 0.5;
      } else {
        baseProbability *= 0.2;
      }
    }

    // Building age vulnerability
    if (constructionYear < 1980) {
      baseProbability *= 1.3;
    } else if (constructionYear < 2000) {
      baseProbability *= 1.1;
    }

    // Property type
    if (propertyType === 'manufactured_home') {
      baseProbability *= 1.5; // More vulnerable to wind
    }

    return Math.min(baseProbability, 0.95);
  }
}

export default new RiskAssessmentService();