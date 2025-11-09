# Satellite Imagery API - No Authentication Required

## Overview

This API provides access to satellite imagery from multiple public sources **without requiring authentication** (except optionally for Google Maps). Perfect for disaster impact assessment and insurance risk mapping.

### Key Features
- **No setup required** - Works immediately with NASA GIBS and Sentinel-2 data
- **Free** - All data sources are free to use
- **Daily coverage** - NASA MODIS/VIIRS updated daily
- **Pre/post disaster comparison** - Automatic before/after imagery
- **Fire detection** - Thermal anomaly layer for wildfires
- **Multiple resolutions** - From 10m (Sentinel-2) to 250m (MODIS)

### Data Sources

| Source | Resolution | Coverage | Authentication | Cost |
|--------|-----------|----------|----------------|------|
| NASA MODIS | 250m | Daily, Global | None | Free |
| NASA VIIRS | 375m | Daily, Global | None | Free |
| Sentinel-2 Cloudless | 10m | Annual, Global | None | Free |
| Google Satellite | 0.5-2m | Global | API Key (optional) | Free tier |
| NASA FIRMS Thermal | 1km | Daily, Global | None | Free |

## Quick Start

### 1. Check Service Health

```bash
curl http://localhost:5001/api/imagery/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Satellite Imagery",
  "sources": {
    "nasa_gibs": "available",
    "sentinel2_cloudless": "available",
    "google_maps": "not_configured"
  }
}
```

### 2. Get Imagery for Hurricane Milton

```bash
curl -X POST http://localhost:5001/api/imagery/disaster-impact \
  -H "Content-Type: application/json" \
  -d '{
    "disasterType": "hurricane",
    "coordinates": { "lat": 27.9506, "lon": -82.4572 },
    "disasterDate": "2024-10-09",
    "source": "nasa_modis"
  }'
```

**Response:**
```json
{
  "success": true,
  "disaster": {
    "pre": {
      "tileUrl": "https://gibs.earthdata.nasa.gov/.../2024-10-02/.../{ z}/{y}/{x}.jpg",
      "name": "MODIS True Color",
      "date": "2024-10-02",
      "label": "Pre-disaster (2024-10-02)"
    },
    "post": {
      "tileUrl": "https://gibs.earthdata.nasa.gov/.../2024-10-16/.../{ z}/{y}/{x}.jpg",
      "name": "MODIS True Color",
      "date": "2024-10-16",
      "label": "Post-disaster (2024-10-16)"
    },
    "disasterType": "hurricane",
    "epicenter": { "lat": 27.9506, "lon": -82.4572 },
    "aoi": {
      "bounds": [-84.4572, 25.9506, -80.4572, 29.9506],
      "bufferDegrees": 2.0
    }
  }
}
```

## API Endpoints

### 1. Get Basic Imagery

**POST /api/imagery/get**

Get satellite imagery for a specific area and date.

**Request:**
```json
{
  "aoi": [-82.6, 27.8, -82.3, 28.1],
  "date": "2024-10-09",
  "source": "nasa_modis"
}
```

**Parameters:**
- `aoi`: Array of [minLon, minLat, maxLon, maxLat]
- `date`: Date string 'YYYY-MM-DD'
- `source`: One of:
  - `nasa_modis` - 250m daily (recommended for disasters)
  - `nasa_viirs` - 375m daily
  - `sentinel2_cloudless` - 10m annual mosaic (best resolution)
  - `google_satellite` - Up to 0.5m (requires API key)
  - `nasa_firms_thermal` - Fire detection

---

### 2. Pre/Post Disaster Comparison

**POST /api/imagery/pre-post**

Get before and after imagery for impact assessment.

**Request:**
```json
{
  "aoi": [-82.6, 27.8, -82.3, 28.1],
  "disasterDate": "2024-10-09",
  "preDays": 7,
  "postDays": 7,
  "source": "nasa_modis"
}
```

**Example (Hurricane Milton):**
```bash
curl -X POST http://localhost:5001/api/imagery/pre-post \
  -H "Content-Type: application/json" \
  -d '{
    "aoi": [-82.6, 27.8, -82.3, 28.1],
    "disasterDate": "2024-10-09",
    "preDays": 7,
    "postDays": 7,
    "source": "nasa_modis"
  }'
```

---

### 3. Automatic Disaster Impact

**POST /api/imagery/disaster-impact**

Automatically generates appropriate area of interest based on disaster type.

**Request:**
```json
{
  "disasterType": "hurricane",
  "coordinates": { "lat": 27.9506, "lon": -82.4572 },
  "disasterDate": "2024-10-09",
  "source": "nasa_modis"
}
```

**Disaster Types:**
- `hurricane` - Creates 2° buffer (~220 km radius)
- `wildfire` - Creates 0.5° buffer (~55 km radius)

**Example (Park Fire - Wildfire):**
```bash
curl -X POST http://localhost:5001/api/imagery/disaster-impact \
  -H "Content-Type: application/json" \
  -d '{
    "disasterType": "wildfire",
    "coordinates": { "lat": 39.7285, "lon": -121.8375 },
    "disasterDate": "2024-07-24",
    "source": "nasa_modis"
  }'
```

---

### 4. Fire Detection Layer

**POST /api/imagery/fire-detection**

Get thermal anomaly overlay for active fire detection.

**Request:**
```json
{
  "aoi": [-121.9, 39.6, -121.7, 39.9],
  "date": "2024-07-24"
}
```

**Example:**
```bash
curl -X POST http://localhost:5001/api/imagery/fire-detection \
  -H "Content-Type: application/json" \
  -d '{
    "aoi": [-121.9, 39.6, -121.7, 39.9],
    "date": "2024-07-24"
  }'
```

---

### 5. Multi-Source Comparison

**POST /api/imagery/multi-source**

Get imagery from all available sources for quality comparison.

**Request:**
```json
{
  "aoi": [-82.6, 27.8, -82.3, 28.1],
  "date": "2024-10-09"
}
```

**Response includes:**
- NASA MODIS layer
- NASA VIIRS layer
- Sentinel-2 Cloudless layer
- Google Satellite layer (if configured)

---

### 6. Available Imagery Dates

**GET /api/imagery/available-dates?days=30**

Get list of available imagery dates (NASA GIBS provides daily coverage).

**Example:**
```bash
curl http://localhost:5001/api/imagery/available-dates?days=30
```

---

### 7. List Data Sources

**GET /api/imagery/sources**

Get information about all available imagery sources.

**Example:**
```bash
curl http://localhost:5001/api/imagery/sources
```

---

## Frontend Integration

### Using with Leaflet

```javascript
// Fetch disaster imagery
const response = await fetch('http://localhost:5001/api/imagery/disaster-impact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    disasterType: 'hurricane',
    coordinates: { lat: 27.9506, lon: -82.4572 },
    disasterDate: '2024-10-09',
    source: 'nasa_modis'
  })
});

const data = await response.json();

// Add pre-disaster layer
const preLayer = L.tileLayer(data.disaster.pre.tileUrl, {
  attribution: data.disaster.pre.attribution,
  opacity: 0.7
});

// Add post-disaster layer
const postLayer = L.tileLayer(data.disaster.post.tileUrl, {
  attribution: data.disaster.post.attribution,
  opacity: 0.7
});

// Create layer control
L.control.layers({
  'Pre-disaster': preLayer,
  'Post-disaster': postLayer
}).addTo(map);

// Show pre-disaster by default
preLayer.addTo(map);

// Zoom to disaster area
const bounds = data.disaster.aoi.bounds;
map.fitBounds([
  [bounds[1], bounds[0]], // southwest
  [bounds[3], bounds[2]]  // northeast
]);
```

### Using with Google Maps

```javascript
const response = await fetch('http://localhost:5001/api/imagery/pre-post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    aoi: [-82.6, 27.8, -82.3, 28.1],
    disasterDate: '2024-10-09',
    preDays: 7,
    postDays: 7,
    source: 'nasa_modis'
  })
});

const data = await response.json();

// Create custom map type for pre-disaster imagery
const preImagery = new google.maps.ImageMapType({
  getTileUrl: function(coord, zoom) {
    const url = data.comparison.pre.tileUrl
      .replace('{z}', zoom)
      .replace('{x}', coord.x)
      .replace('{y}', coord.y);
    return url;
  },
  tileSize: new google.maps.Size(256, 256),
  name: 'Pre-disaster',
  maxZoom: 9
});

// Add to map
map.overlayMapTypes.push(preImagery);
```

### Using with React + MapLibre

```jsx
import { useEffect, useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';

function DisasterMap() {
  const [imagery, setImagery] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/imagery/disaster-impact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disasterType: 'hurricane',
        coordinates: { lat: 27.9506, lon: -82.4572 },
        disasterDate: '2024-10-09',
        source: 'nasa_modis'
      })
    })
    .then(res => res.json())
    .then(data => setImagery(data.disaster));
  }, []);

  if (!imagery) return <div>Loading...</div>;

  return (
    <Map
      initialViewState={{
        longitude: imagery.epicenter.lon,
        latitude: imagery.epicenter.lat,
        zoom: 8
      }}
      style={{ width: '100%', height: '600px' }}
    >
      <Source
        id="pre-disaster"
        type="raster"
        tiles={[imagery.pre.tileUrl]}
        tileSize={256}
      >
        <Layer
          id="pre-disaster-layer"
          type="raster"
          paint={{ 'raster-opacity': 0.8 }}
        />
      </Source>
    </Map>
  );
}
```

---

## Real-World Examples

### Example 1: Hurricane Milton Assessment

```bash
# Get full disaster impact with pre/post imagery
curl -X POST http://localhost:5001/api/imagery/disaster-impact \
  -H "Content-Type: application/json" \
  -d '{
    "disasterType": "hurricane",
    "coordinates": { "lat": 27.9506, "lon": -82.4572 },
    "disasterDate": "2024-10-09",
    "source": "nasa_modis"
  }'

# Get high-resolution Sentinel-2 imagery
curl -X POST http://localhost:5001/api/imagery/disaster-impact \
  -H "Content-Type: application/json" \
  -d '{
    "disasterType": "hurricane",
    "coordinates": { "lat": 27.9506, "lon": -82.4572 },
    "disasterDate": "2024-10-09",
    "source": "sentinel2_cloudless"
  }'
```

### Example 2: California Wildfire (Park Fire)

```bash
# Get wildfire impact with thermal detection
curl -X POST http://localhost:5001/api/imagery/disaster-impact \
  -H "Content-Type: application/json" \
  -d '{
    "disasterType": "wildfire",
    "coordinates": { "lat": 39.7285, "lon": -121.8375 },
    "disasterDate": "2024-07-24",
    "source": "nasa_modis"
  }'

# Get active fire detection layer
curl -X POST http://localhost:5001/api/imagery/fire-detection \
  -H "Content-Type: application/json" \
  -d '{
    "aoi": [-121.9, 39.6, -121.7, 39.9],
    "date": "2024-07-24"
  }'
```

### Example 3: Custom Area Analysis

```bash
# Get imagery for specific coordinates
curl -X POST http://localhost:5001/api/imagery/get \
  -H "Content-Type: application/json" \
  -d '{
    "aoi": [-81.0, 32.0, -80.8, 32.2],
    "date": "2024-10-01",
    "source": "sentinel2_cloudless"
  }'

# Compare multiple sources
curl -X POST http://localhost:5001/api/imagery/multi-source \
  -H "Content-Type: application/json" \
  -d '{
    "aoi": [-81.0, 32.0, -80.8, 32.2],
    "date": "2024-10-01"
  }'
```

---

## Choosing the Right Data Source

### For Disaster Assessment (Recommended: NASA MODIS)
- **Daily updates** - See conditions immediately after disaster
- **Global coverage** - Works anywhere
- **250m resolution** - Good balance of detail and coverage
- **Free** - No authentication required

```json
{
  "source": "nasa_modis"
}
```

### For High-Resolution Analysis (Sentinel-2 Cloudless)
- **10m resolution** - Best quality for damage assessment
- **Cloud-free** - Annual mosaic with no clouds
- **Free** - No authentication required
- **Note:** Annual composite, not for real-time disasters

```json
{
  "source": "sentinel2_cloudless"
}
```

### For Maximum Detail (Google Satellite)
- **Up to 0.5m resolution** - Highest detail
- **Varied dates** - Not updated daily
- **Requires API key** - Free tier: $200/month credit

```json
{
  "source": "google_satellite"
}
```

### For Fire Detection (NASA FIRMS Thermal)
- **Active fire detection** - Shows current fires
- **Daily updates** - Real-time monitoring
- **1km resolution** - Thermal anomalies

```json
{
  "source": "nasa_firms_thermal"
}
```

---

## Performance Tips

1. **Use NASA MODIS for daily monitoring** - It's fast and always available
2. **Cache tile URLs** - They're stable for 24 hours
3. **Use appropriate zoom levels** - MODIS works best at zoom 0-9
4. **Combine sources** - Use MODIS for overview, Sentinel-2 for detail
5. **Preload imagery** - Fetch before disaster for faster comparison

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "error": "Error message here",
  "timestamp": "2024-10-09T12:00:00.000Z"
}
```

Common errors:
- Missing parameters (400)
- Invalid date format (500)
- Invalid source (500)
- Google Maps API key required (500)

---

## Next Steps

1. Test the health endpoint: `curl http://localhost:5001/api/imagery/health`
2. Try getting imagery for Hurricane Milton using the disaster-impact endpoint
3. Integrate tile URLs into your frontend map component
4. (Optional) Add Google Maps API key for high-resolution imagery
5. Set up automated disaster monitoring with daily imagery

## Support

- NASA GIBS Documentation: https://wiki.earthdata.nasa.gov/display/GIBS
- Sentinel-2 Cloudless: https://s2maps.eu/
- NASA FIRMS: https://firms.modaps.eosdis.nasa.gov/

No authentication setup required - start using immediately!
