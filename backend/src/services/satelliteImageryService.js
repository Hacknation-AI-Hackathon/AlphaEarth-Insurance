import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

/**
 * Satellite Imagery Service using public data sources
 * No authentication required - uses NASA GIBS and other public satellite tile servers
 */
class SatelliteImageryService {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  /**
   * Get satellite imagery tile URLs for different data sources
   * @param {Object} params
   * @param {Array} params.aoi - [minLon, minLat, maxLon, maxLat]
   * @param {string} params.date - 'YYYY-MM-DD'
   * @param {string} params.source - 'nasa_modis' | 'nasa_viirs' | 'google_satellite' | 'sentinel2_cloudless'
   */
  getImageryTiles(params) {
    const {
      aoi,
      date,
      source = 'nasa_modis'
    } = params;

    const [minLon, minLat, maxLon, maxLat] = aoi;
    const center = {
      lat: (minLat + maxLat) / 2,
      lon: (minLon + maxLon) / 2
    };

    let tileUrl, attribution, name, description;

    switch (source) {
      case 'nasa_modis':
        // NASA GIBS - MODIS Terra True Color (daily, global, 250m)
        // Free, no API key required
        tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
        attribution = 'NASA EOSDIS GIBS';
        name = 'MODIS True Color';
        description = 'Daily true color imagery from MODIS Terra (250m resolution)';
        break;

      case 'nasa_viirs':
        // NASA GIBS - VIIRS True Color (daily, global, 375m)
        tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
        attribution = 'NASA EOSDIS GIBS';
        name = 'VIIRS True Color';
        description = 'Daily true color imagery from VIIRS (375m resolution)';
        break;

      case 'google_satellite':
        // Google Maps Satellite
        if (!this.googleMapsApiKey || this.googleMapsApiKey === 'your_google_maps_api_key_here') {
          throw new Error('Google Maps API key not configured. Add GOOGLE_MAPS_API_KEY to .env');
        }
        tileUrl = `https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=${this.googleMapsApiKey}`;
        attribution = 'Google';
        name = 'Google Satellite';
        description = 'High-resolution satellite imagery from Google Maps';
        break;

      case 'sentinel2_cloudless':
        // Sentinel-2 Cloudless (annual mosaic, no auth required)
        // Provided by EOX
        const year = date.split('-')[0];
        tileUrl = `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-${year}_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg`;
        attribution = 'Sentinel-2 cloudless by EOX';
        name = 'Sentinel-2 Cloudless';
        description = `Cloud-free Sentinel-2 mosaic for ${year} (10m resolution)`;
        break;

      case 'nasa_firms_thermal':
        // NASA GIBS - MODIS Thermal Anomalies (for fire detection)
        tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Thermal_Anomalies_All/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`;
        attribution = 'NASA FIRMS';
        name = 'Thermal Anomalies';
        description = 'Active fire detection from MODIS thermal bands';
        break;

      default:
        throw new Error(`Unsupported imagery source: ${source}`);
    }

    return {
      tileUrl,
      attribution,
      name,
      description,
      date,
      aoi: {
        bounds: aoi,
        center
      },
      source
    };
  }

  /**
   * Get pre and post disaster imagery comparison
   * @param {Object} params
   * @param {Array} params.aoi - [minLon, minLat, maxLon, maxLat]
   * @param {string} params.disasterDate - 'YYYY-MM-DD'
   * @param {number} params.preDays - Days before disaster
   * @param {number} params.postDays - Days after disaster
   * @param {string} params.source - Imagery source
   */
  getPrePostImagery(params) {
    const {
      aoi,
      disasterDate,
      preDays = 7,
      postDays = 7,
      source = 'nasa_modis'
    } = params;

    const disasterDateObj = new Date(disasterDate);

    // Pre-disaster date
    const preDate = new Date(disasterDateObj);
    preDate.setDate(preDate.getDate() - preDays);

    // Post-disaster date
    const postDate = new Date(disasterDateObj);
    postDate.setDate(postDate.getDate() + postDays);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const preImagery = this.getImageryTiles({
      aoi,
      date: formatDate(preDate),
      source
    });

    const postImagery = this.getImageryTiles({
      aoi,
      date: formatDate(postDate),
      source
    });

    return {
      pre: {
        ...preImagery,
        label: `Pre-disaster (${formatDate(preDate)})`
      },
      post: {
        ...postImagery,
        label: `Post-disaster (${formatDate(postDate)})`
      },
      disasterDate,
      comparison: {
        preDays,
        postDays,
        totalDays: preDays + postDays
      }
    };
  }

  /**
   * Get disaster impact imagery with automatic AOI
   * @param {Object} params
   * @param {string} params.disasterType - 'hurricane' | 'wildfire'
   * @param {Object} params.coordinates - { lat, lon }
   * @param {string} params.disasterDate - 'YYYY-MM-DD'
   * @param {string} params.source - Imagery source
   */
  getDisasterImpactImagery(params) {
    const {
      disasterType,
      coordinates,
      disasterDate,
      source = 'nasa_modis'
    } = params;

    // Generate AOI based on disaster type
    let bufferDegrees;
    if (disasterType === 'hurricane') {
      bufferDegrees = 2.0;  // ~220 km radius
    } else if (disasterType === 'wildfire') {
      bufferDegrees = 0.5;  // ~55 km radius
    } else {
      bufferDegrees = 1.0;  // default
    }

    const aoi = [
      coordinates.lon - bufferDegrees,
      coordinates.lat - bufferDegrees,
      coordinates.lon + bufferDegrees,
      coordinates.lat + bufferDegrees
    ];

    // For thermal anomalies (fires), add fire detection layer
    const imagery = this.getPrePostImagery({
      aoi,
      disasterDate,
      preDays: disasterType === 'wildfire' ? 14 : 7,
      postDays: 7,
      source
    });

    // Add thermal layer for fire detection
    if (disasterType === 'wildfire') {
      const thermalLayer = this.getImageryTiles({
        aoi,
        date: disasterDate,
        source: 'nasa_firms_thermal'
      });

      imagery.thermalLayer = thermalLayer;
    }

    return {
      ...imagery,
      disasterType,
      epicenter: coordinates,
      aoi: {
        bounds: aoi,
        bufferDegrees
      }
    };
  }

  /**
   * Get available imagery dates for a location
   * NASA GIBS has daily coverage, but we'll return recent dates
   */
  getAvailableDates(daysBack = 30) {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < daysBack; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }

  /**
   * Get multiple imagery sources for comparison
   * @param {Object} params
   * @param {Array} params.aoi - [minLon, minLat, maxLon, maxLat]
   * @param {string} params.date - 'YYYY-MM-DD'
   */
  getMultiSourceImagery(params) {
    const { aoi, date } = params;

    const sources = [
      'nasa_modis',
      'nasa_viirs',
      'sentinel2_cloudless'
    ];

    // Add Google Satellite if API key is configured
    if (this.googleMapsApiKey && this.googleMapsApiKey !== 'your_google_maps_api_key_here') {
      sources.push('google_satellite');
    }

    const imagery = sources.map(source => {
      try {
        return this.getImageryTiles({ aoi, date, source });
      } catch (error) {
        return {
          source,
          error: error.message
        };
      }
    });

    return {
      date,
      aoi,
      layers: imagery.filter(img => !img.error),
      unavailable: imagery.filter(img => img.error)
    };
  }

  /**
   * Get wildfire thermal detection overlay
   * @param {Object} params
   * @param {Array} params.aoi - [minLon, minLat, maxLon, maxLat]
   * @param {string} params.date - 'YYYY-MM-DD'
   */
  getFireDetectionLayer(params) {
    const { aoi, date } = params;

    return this.getImageryTiles({
      aoi,
      date,
      source: 'nasa_firms_thermal'
    });
  }
}

export default new SatelliteImageryService();
