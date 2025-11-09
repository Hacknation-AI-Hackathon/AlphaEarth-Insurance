# AlphaEarth Backend Setup Guide

## Overview
This backend provides disaster tracking, risk analysis, satellite imagery, and AI-powered insights for the AlphaEarth Insurance platform.

## Required API Keys

### 1. Satellite Imagery (NASA GIBS + Sentinel-2) - NO SETUP REQUIRED
**Purpose:** Satellite imagery for disaster impact assessment

**Available Sources:**
- **NASA MODIS/VIIRS** - Daily global coverage at 250-375m resolution (FREE, no authentication)
- **Sentinel-2 Cloudless** - Annual 10m resolution mosaic (FREE, no authentication)
- **Google Satellite** - High-resolution imagery (Optional, requires API key)
- **NASA FIRMS Thermal** - Active fire detection (FREE, no authentication)

**Setup Steps:**
- None! Works immediately out of the box
- Optionally add Google Maps API key for highest resolution imagery

**Cost:** Free

### 2. Anthropic Claude API
**Purpose:** AI-powered executive summaries, risk explanations, and action recommendations

**Setup Steps:**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key and add to `.env` as `ANTHROPIC_API_KEY`

**Cost:** Pay-as-you-go (first $5 free credits for new accounts)
- Claude Sonnet 4: ~$3 per million input tokens, ~$15 per million output tokens

### 3. NASA FIRMS API (Optional - for real-time wildfire data)
**Purpose:** Active wildfire detection from satellite data

**Setup Steps:**
1. Go to [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/api/area/)
2. Request a MAP KEY (free)
3. Check your email for the API key
4. Add to `.env` as `NASA_FIRMS_API_KEY`

**Cost:** Free

**Note:** Currently using mock wildfire data. This is optional for production wildfire tracking.

### 4. Google Maps API (for Frontend)
**Purpose:** Interactive map visualization

**Setup Steps:**
1. Go to [Google Cloud Console - APIs](https://console.cloud.google.com/apis/credentials?project=favorable-iris-465710-g1)
2. Click "Create Credentials" → "API Key"
3. Restrict the key to "Maps JavaScript API" and "Geocoding API"
4. Add to `.env` as `GOOGLE_MAPS_API_KEY`

**Cost:** Free tier includes $200/month credit
- First 28,000 map loads per month are free

### 5. NOAA API (Already Configured)
**Purpose:** Hurricane and tropical storm tracking

The `.env` already includes a working NOAA API key: `wtssKnGKcGfsTxGMkYXGUKECDcUFfLIb`

**Cost:** Free

## Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add your API keys
nano .env

# Test Earth Engine connection
node test-earth-engine.js

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

## Testing Earth Engine Connection

After adding your service account key, run:

```bash
node test-earth-engine.js
```

You should see:
```
✅ Authentication successful!
✅ Earth Engine initialized!
✅ Successfully queried Earth Engine data!
🎉 All tests passed! Earth Engine is ready to use.
```

## API Endpoints

### Disasters
- `GET /api/disasters` - Get all active disasters (hurricanes + wildfires)
- `GET /api/disasters/hurricanes` - Get active hurricanes from NOAA
- `GET /api/disasters/wildfires` - Get active wildfires

### Risk Analysis
- `POST /api/risk/analyze` - Analyze disaster impact on property portfolio
- `GET /api/risk/portfolio-summary/:disasterId` - Get portfolio risk summary

### Properties
- `GET /api/properties` - Get insured properties
- `POST /api/properties` - Add new property

### AI Analysis
- `POST /api/analysis/executive-summary` - Generate AI executive summary
- `POST /api/analysis/property-risk` - Explain individual property risk
- `POST /api/analysis/recommendations` - Get action recommendations

## Environment Variables

```bash
PORT=5001                                    # Server port
NODE_ENV=development                         # Environment

# API Keys
ANTHROPIC_API_KEY=sk-ant-...                # Claude AI key
NOAA_API_KEY=wtssKnGKcGfsTxGMkYXGUKECDcUFfLIb  # NOAA (already set)
NASA_FIRMS_API_KEY=your_key_here            # NASA wildfire key (optional)
GOOGLE_MAPS_API_KEY=AIza...                 # Google Maps key

# Google Earth Engine
GOOGLE_SERVICE_ACCOUNT_EMAIL=earth-engine-backend@favorable-iris-465710-g1.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY_PATH=./config/google-earth-engine-key.json
EARTH_ENGINE_PROJECT=favorable-iris-465710-g1

# CORS
CORS_ORIGIN=http://localhost:8081           # Frontend URL

# Cache
CACHE_TTL_SECONDS=300                       # 5 minutes
```

## Technology Stack

- **Express.js** - Web framework
- **Google Earth Engine** - Satellite data and geospatial analysis
- **Anthropic Claude AI** - Natural language insights
- **NOAA API** - Hurricane tracking
- **NASA FIRMS** - Wildfire detection
- **Turf.js** - Geospatial calculations
- **Axios** - HTTP client
- **Node-cache** - In-memory caching

## Troubleshooting

### Earth Engine Authentication Fails
- Verify service account email matches in `.env`
- Ensure JSON key file exists at `config/google-earth-engine-key.json`
- Check that service account has Earth Engine permissions in Google Cloud Console

### CORS Errors
- Verify `CORS_ORIGIN` matches your frontend URL
- Frontend default: `http://localhost:8081`

### API Rate Limits
- NOAA: Cached for 5 minutes to avoid rate limits
- Claude AI: Monitor usage in Anthropic Console
- Earth Engine: 20,000 requests/day free tier

## Next Steps

1. Complete the service account setup (see section 1)
2. Add your Anthropic API key
3. Optionally add Google Maps and NASA FIRMS keys
4. Run `node test-earth-engine.js` to verify setup
5. Start the server with `npm run dev`
6. Connect your frontend to `http://localhost:5001`
