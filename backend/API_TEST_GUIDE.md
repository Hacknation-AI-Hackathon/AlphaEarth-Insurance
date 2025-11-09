# AlphaEarth Backend API Test Guide

## Prerequisites

1. **Install Dependencies**
   ```powershell
   cd backend
   npm install
   ```

2. **Set Up Environment Variables**
   Create `backend/.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:8080
   
   # Google Earth Engine (Required for claim processing)
   GEE_PROJECT=your-gee-project-id
   
   # AI Summarization (Optional)
   ANTHROPIC_API_KEY=your-anthropic-api-key
   # OR
   INCEPTION_API_KEY=your-inception-api-key
   
   # Other API Keys
   NASA_FIRMS_API_KEY=your-nasa-firms-api-key
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

3. **Authenticate Earth Engine** (Required for claim processing)
   ```powershell
   earthengine authenticate
   ```

## Starting the Backend

```powershell
cd backend
npm run dev
```

The backend should start on `http://localhost:5000`

## Testing Methods

### Method 1: Automated Test Script (Recommended)

Run the PowerShell test script:
```powershell
cd backend
.\test-api.ps1
```

This will test all endpoints and generate a summary report.

### Method 2: Manual Testing with PowerShell

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:5000/health"

# Get active disasters
Invoke-RestMethod -Uri "http://localhost:5000/api/disasters/active"

# Test POST endpoint
$body = @{
    stormId = "al092024"
    region = "florida"
    numProperties = 5000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/analysis/hurricane" -Method POST -Body $body -ContentType "application/json"
```

### Method 3: Postman Collection

Import the endpoints into Postman using the list provided. Create a collection with:
- Base URL: `http://localhost:5000/api`
- Environment variables:
  - `base_url`: `http://localhost:5000/api`
  - `admin_email`: `admin@alphaearth.com`
  - `admin_password`: `admin123`

## API Endpoints Overview

### 1. Health Check
- **GET** `/health` - Check backend status

### 2. Disasters
- **GET** `/api/disasters/active` - All active disasters
- **GET** `/api/disasters/hurricanes` - Active hurricanes
- **GET** `/api/disasters/hurricanes/{id}` - Hurricane forecast
- **GET** `/api/disasters/wildfires` - Active wildfires

### 3. Earthquakes
- **GET** `/api/earthquakes/active` - Active earthquakes
- **GET** `/api/earthquakes/significant` - Significant earthquakes

### 4. Severe Weather
- **GET** `/api/severe-weather/active` - Active alerts
- **GET** `/api/severe-weather/tornadoes` - Tornado warnings
- **GET** `/api/severe-weather/floods` - Flood warnings
- **GET** `/api/severe-weather/by-state/{states}` - Alerts by state

### 5. Analysis
- **POST** `/api/analysis/hurricane` - Hurricane analysis
- **POST** `/api/analysis/wildfire` - Wildfire analysis
- **POST** `/api/analysis/earthquake` - Earthquake analysis
- **POST** `/api/analysis/severe-weather` - Severe weather analysis
- **POST** `/api/analysis/scenario` - Scenario analysis
- **POST** `/api/analysis/property-risk` - Property risk explanation

### 6. Properties
- **GET** `/api/properties/portfolio` - Property portfolio
- **GET** `/api/properties/region` - Properties in region
- **GET** `/api/properties/high-value` - High value properties
- **GET** `/api/properties/coastal` - Coastal properties

### 7. Risk Assessment
- **POST** `/api/risk/monte-carlo` - Monte Carlo simulation
- **POST** `/api/risk/portfolio-metrics` - Portfolio metrics

### 8. Satellite Imagery
- **POST** `/api/imagery/get` - Get imagery
- **POST** `/api/imagery/pre-post` - Pre/post disaster imagery
- **POST** `/api/imagery/disaster-impact` - Disaster impact imagery
- **POST** `/api/imagery/multi-source` - Multi-source imagery
- **POST** `/api/imagery/fire-detection` - Fire detection layer
- **GET** `/api/imagery/available-dates` - Available dates
- **GET** `/api/imagery/sources` - Data sources
- **GET** `/api/imagery/health` - Imagery health

### 9. Parametric Insurance
- **GET** `/api/parametric/policies` - All policies
- **GET** `/api/parametric/policies/{id}` - Policy by ID
- **POST** `/api/parametric/policies` - Create policy
- **POST** `/api/parametric/evaluate/{id}` - Evaluate triggers
- **GET** `/api/parametric/payouts/pending` - Pending payouts
- **GET** `/api/parametric/payouts/processed` - Processed payouts
- **GET** `/api/parametric/payouts/{id}` - Payout by ID
- **POST** `/api/parametric/payouts/{id}/approve` - Approve payout
- **POST** `/api/parametric/payouts/{id}/reject` - Reject payout
- **GET** `/api/parametric/statistics` - Statistics

### 10. Flight Insurance
- **GET** `/api/flight/delays` - All airport delays
- **GET** `/api/flight/delays/{code}` - Specific airport delay
- **GET** `/api/flight/policies` - All flight policies
- **GET** `/api/flight/policies/{id}` - Policy by ID
- **POST** `/api/flight/policies` - Create flight policy
- **POST** `/api/flight/evaluate` - Evaluate all policies
- **POST** `/api/flight/evaluate/{id}` - Evaluate single policy
- **GET** `/api/flight/payouts/pending` - Pending payouts
- **GET** `/api/flight/payouts/processed` - Processed payouts
- **GET** `/api/flight/payouts/{id}` - Payout by ID
- **POST** `/api/flight/payouts/{id}/approve` - Approve payout
- **POST** `/api/flight/payouts/{id}/reject` - Reject payout
- **GET** `/api/flight/statistics` - Statistics

### 11. Claim Processing (NEW)
- **POST** `/api/claim_processing/basic` - Process damage claims

**Note:** Claim processing can take 5-30 minutes depending on AOI size and date range.

## Quick Test Workflow

1. **Start Backend**
   ```powershell
   cd backend
   npm run dev
   ```

2. **Test Health Check**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5000/health"
   ```

3. **Run Automated Tests**
   ```powershell
   .\test-api.ps1
   ```

4. **Review Results**
   - Check console output
   - Review `test-results.csv` file

## Troubleshooting

### Backend Not Starting
- Check if port 5000 is available
- Verify `node_modules` are installed: `npm install`
- Check for errors in console

### Endpoints Returning 404
- Verify route is registered in `src/server.js`
- Check route file exists in `src/routes/`
- Verify route path matches expected path

### Endpoints Returning 500
- Check server logs for error details
- Verify environment variables are set
- Check service dependencies are working

### Claim Processing Failing
- Verify Earth Engine is authenticated: `earthengine authenticate`
- Check `GEE_PROJECT` is set in `.env`
- Verify AOI coordinates are valid
- Check date ranges are valid

## Expected Test Results

- ✅ Health Check: Should return 200
- ✅ Disasters: Should return disaster data
- ✅ Earthquakes: Should return earthquake data
- ✅ Severe Weather: Should return weather alerts
- ✅ Analysis: Should return analysis results
- ✅ Properties: Should return property data
- ✅ Risk: Should return risk calculations
- ✅ Imagery: Should return imagery URLs
- ✅ Parametric: Should return policy data
- ✅ Flight: Should return flight data
- ⚠️ Claim Processing: Skip in automated tests (too slow)

## Next Steps

After all tests pass:
1. ✅ Verify all endpoints work correctly
2. ✅ Check response formats match frontend expectations
3. ✅ Test error handling
4. ✅ Verify authentication/authorization (if implemented)
5. ✅ Test with frontend integration

