# Earth Engine Python Service

This Python service handles all Google Earth Engine operations using Python (which supports proper authentication via `earthengine authenticate`).

## Setup

### 1. Install Python Dependencies

```bash
cd backend/python-service
pip install -r requirements.txt
```

### 2. Authenticate Earth Engine

```bash
earthengine authenticate
```

This will open a browser window for you to authenticate with your Google account.

### 3. Start the Service

```bash
python earth_engine_service.py
```

The service will start on port 5001 by default (configurable via `PYTHON_SERVICE_PORT` environment variable).

## API Endpoints

### GET /health
Health check endpoint that verifies Earth Engine is initialized.

### POST /get-imagery
Get satellite imagery for an AOI and date range.

**Request:**
```json
{
  "aoi": [minLon, minLat, maxLon, maxLat],
  "startDate": "2022-08-01",
  "endDate": "2022-09-07",
  "satellite": "sentinel2",
  "maxCloud": 30,
  "reducer": "median"
}
```

**Response:**
```json
{
  "success": true,
  "image": {
    "bands": ["B4", "B3", "B2"],
    "dataset": "COPERNICUS/S2_SR_HARMONIZED"
  },
  "vis_params": {
    "bands": ["B4", "B3", "B2"],
    "min": 0.02,
    "max": 0.3
  },
  "url_template": "https://earthengine.googleapis.com/map/...",
  "map_id": {
    "mapid": "...",
    "token": "..."
  }
}
```

### POST /detect-hazard
Detect hazard (flood, wildfire, roof damage).

### POST /validate
Validate claim using cross-sensor, meteorology, and spatial coherence checks.

## Integration with Node.js Backend

The Node.js backend will call this Python service via HTTP requests. Update the Node.js services to make HTTP calls to `http://localhost:5001` instead of using the Earth Engine Node.js client directly.

## Environment Variables

- `PYTHON_SERVICE_PORT`: Port to run the service on (default: 5001)
- `GEE_SERVICE_ACCOUNT`: Service account email (optional)
- `GEE_KEY_PATH`: Path to service account key file (optional)

## Notes

- The Python service uses `earthengine authenticate` which is the standard way to authenticate with Earth Engine
- This avoids the Node.js authentication issues
- The service runs as a separate process and communicates with Node.js via HTTP

