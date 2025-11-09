# Python Earth Engine Service Setup

## Overview

This project now uses a **Python service** for all Google Earth Engine operations. The Node.js backend calls the Python service via HTTP, which properly handles Earth Engine authentication using `earthengine authenticate`.

## Why Python?

- ✅ `earthengine authenticate` works natively in Python
- ✅ No service account key files needed
- ✅ Standard Earth Engine Python API
- ✅ Better error handling and debugging

## Setup Instructions

### 1. Install Python (if not already installed)

Download and install Python 3.8+ from https://www.python.org/

### 2. Install Earth Engine Python API

```bash
pip install earthengine-api
```

### 3. Authenticate Earth Engine

```bash
earthengine authenticate
```

This will:
- Open a browser window
- Ask you to sign in with your Google account
- Grant Earth Engine API access
- Save credentials locally

### 4. Install Python Service Dependencies

```bash
cd backend/python-service
pip install -r requirements.txt
```

Or use the provided PowerShell script:
```powershell
.\start_service.ps1
```

### 5. Start the Python Service

```bash
python earth_engine_service.py
```

The service will start on port **5001** by default.

You should see:
```
🚀 Earth Engine Python Service starting on port 5001
📡 Make sure Earth Engine is authenticated: earthengine authenticate
 * Running on http://0.0.0.0:5001
✅ Earth Engine initialized with default credentials
```

### 6. Verify the Service is Running

In another terminal, test the health endpoint:

```bash
curl http://localhost:5001/health
```

Or in PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/health"
```

Should return:
```json
{
  "status": "ok",
  "earth_engine": "initialized"
}
```

## Running Both Services

### Terminal 1: Python Earth Engine Service
```bash
cd backend/python-service
python earth_engine_service.py
```

### Terminal 2: Node.js Backend
```bash
cd backend
npm run dev
```

## Environment Variables

You can configure the Python service port:

```bash
# Windows PowerShell
$env:PYTHON_SERVICE_PORT=5001

# Linux/Mac
export PYTHON_SERVICE_PORT=5001
```

Or set it in the Node.js backend `.env`:
```env
PYTHON_SERVICE_URL=http://localhost:5001
```

## Troubleshooting

### Error: "earthengine: command not found"

Install the Earth Engine Python API:
```bash
pip install earthengine-api
```

### Error: "Earth Engine Python service is not running"

1. Check if the Python service is running on port 5001
2. Verify you can access `http://localhost:5001/health`
3. Check the Python service logs for errors
4. Make sure you've run `earthengine authenticate`

### Error: "Earth Engine authentication failed"

1. Run `earthengine authenticate` again
2. Make sure you're signed in with a Google account that has Earth Engine access
3. Check that Earth Engine API is enabled in Google Cloud Console

### Port Already in Use

If port 5001 is already in use, change it:
```bash
export PYTHON_SERVICE_PORT=5002
python earth_engine_service.py
```

Then update Node.js `.env`:
```env
PYTHON_SERVICE_URL=http://localhost:5002
```

## API Endpoints

The Python service exposes these endpoints:

- `GET /health` - Health check
- `POST /get-imagery` - Get satellite imagery
- `POST /detect-hazard` - Detect hazards (flood, wildfire, roof damage)
- `POST /validate` - Validate claims (cross-sensor, meteorology, spatial coherence)

## Architecture

```
Frontend (React)
    ↓ HTTP
Node.js Backend (Express)
    ↓ HTTP
Python Service (Flask)
    ↓ API
Google Earth Engine
```

## Next Steps

1. ✅ Start Python service: `python earth_engine_service.py`
2. ✅ Start Node.js backend: `npm run dev`
3. ✅ Test claim processing in the frontend
4. ✅ Check logs for any errors

## Notes

- The Python service must be running before processing claims
- Both services can run simultaneously
- The Python service handles all Earth Engine operations
- Node.js backend acts as a proxy/coordinator

