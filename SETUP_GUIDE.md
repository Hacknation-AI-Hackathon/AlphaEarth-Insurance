# 🌍 AlphaEarth Insurance Platform - Complete Setup Guide

This guide will help you set up and run all components of the AlphaEarth Insurance platform.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Installation Steps](#installation-steps)
4. [Google Earth Engine Authentication](#google-earth-engine-authentication)
5. [Running the Platform](#running-the-platform)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before starting, ensure you have the following installed:

### Required Software

- **Python 3.9+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm 9+** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

### Required Accounts

- **Google Earth Engine** - [Sign up](https://earthengine.google.com/signup/)
- **Anthropic API Key** - [Get key](https://console.anthropic.com/)

### Verify Installation

```bash
# Check Python
python --version  # or python3 --version on Mac/Linux

# Check Node.js
node --version

# Check npm
npm --version
```

---

## 📁 Project Structure

```
alphaearth/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Node.js backend (Port 5000)
│   ├── src/
│   ├── package.json
│   └── .env.example
├── backend/python-service/   # Python backend (Port 5001)
│   ├── earth_engine_service.py
│   ├── requirements.txt
│   └── .env.example
├── api-gateway/             # API Gateway (Port 3000) - Optional
│   ├── server.js
│   └── package.json
├── start-all.ps1           # Windows start script
└── start-all.sh            # Mac/Linux start script
```

---

## 📦 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/alphaearth.git
cd alphaearth
```

### 2. Install Python Backend Dependencies

```bash
cd backend/python-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

cd ../..
```

### 3. Install Node.js Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Install API Gateway Dependencies (if you have one)

```bash
cd api-gateway
npm install
cd ..
```

### 5. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## 🔑 Google Earth Engine Authentication

The Python backend requires Google Earth Engine authentication.

### Option 1: Interactive Authentication (Recommended)

```bash
# Install Earth Engine CLI
pip install earthengine-api

# Authenticate
earthengine authenticate
```

This will:
1. Open your browser
2. Ask you to sign in with your Google account
3. Grant access to Earth Engine
4. Save credentials locally

### Option 2: Service Account (Production)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Earth Engine API
4. Create a Service Account
5. Download the JSON key file
6. Save it as `backend/python-service/gee-key.json`

### Verify Authentication

```bash
# In backend/python-service directory with venv activated
python -c "import ee; ee.Initialize(); print('✅ Earth Engine authenticated!')"
```

---

## 🚀 Running the Platform

### Quick Start (All Services)

#### Windows:

```powershell
# Make sure you're in the project root directory
.\start-all.ps1
```

#### Mac/Linux:

```bash
# Make the script executable (first time only)
chmod +x start-all.sh

# Run the script
./start-all.sh
```

The script will:
- ✅ Verify all prerequisites
- ✅ Check Earth Engine authentication
- ✅ Install missing dependencies
- ✅ Start all services in the correct order
- ✅ Monitor all processes
- ✅ Provide service URLs and process IDs

### Manual Start (Individual Services)

If you prefer to start services individually:

#### 1. Python Backend (Port 5001)

```bash
cd backend/python-service
source venv/bin/activate  # or venv\Scripts\activate on Windows
python earth_engine_service.py
```

#### 2. Node.js Backend (Port 5000)

```bash
cd backend
npm start
```

#### 3. API Gateway (Port 3000) - Optional

```bash
cd api-gateway
npm start
```

#### 4. Frontend (Port 8080)

```bash
cd frontend
npm run dev
```

### Access the Application

Once all services are running:

- **Frontend**: http://localhost:8080
- **API Gateway**: http://localhost:3000 (if using)
- **Node Backend**: http://localhost:5000
- **Python Backend**: http://localhost:5001

---

## 🔧 Environment Variables

### Python Backend `.env`

Create `backend/python-service/.env`:

```env
# Server Configuration
PORT=5001
HOST=0.0.0.0
DEBUG=True

# Google Earth Engine (if using service account)
GOOGLE_EARTH_ENGINE_KEY=gee-key.json
GEE_PROJECT_ID=your-project-id

# Processing Configuration
MAX_IMAGE_PROCESSING_TIME=1800
ASYNC_TIMEOUT=30
```

### Node.js Backend `.env`

Create `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Python Service URL
PYTHON_SERVICE_URL=http://localhost:5001

# External APIs
ANTHROPIC_API_KEY=your_anthropic_api_key
NOAA_API_KEY=your_noaa_api_key
NASA_FIRMS_KEY=your_nasa_firms_key

# CORS
CORS_ORIGIN=http://localhost:8080
```

### API Gateway `.env`

Create `api-gateway/.env`:

```env
# Gateway Configuration
PORT=3000
NODE_ENV=development

# Backend URLs
PYTHON_BACKEND_URL=http://localhost:8000
NODE_BACKEND_URL=http://localhost:5000

# CORS
CORS_ORIGIN=http://localhost:8080

# Timeout
REQUEST_TIMEOUT=30000
```

### Frontend `.env`

Create `frontend/.env`:

```env
VITE_API_GATEWAY_URL=http://localhost:3000
VITE_APP_NAME=AlphaEarth
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Earth Engine not authenticated"

**Solution:**
```bash
earthengine authenticate
```

#### 2. "Port already in use"

**Solution:**
```bash
# Windows - Kill process on port
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Mac/Linux - Kill process on port
lsof -ti:5001 | xargs kill -9
```

#### 3. "Python service not responding"

**Solution:**
- Verify Python service is running on port 5001
- Check logs in `logs/python-backend.log`
- Restart Python service
- Verify Earth Engine authentication

#### 4. "CORS errors in browser"

**Solution:**
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Restart backend services
- Clear browser cache

#### 5. "Module not found" errors

**Solution:**
```bash
# Python
cd backend/python-service
source venv/bin/activate
pip install -r requirements.txt

# Node.js
cd backend
npm install

cd ../frontend
npm install
```

#### 6. "Cannot find module 'axios'" or similar

**Solution:**
Ensure you're in the correct directory and run:
```bash
npm install
```

### Viewing Logs

#### Using Unified Script:

The start script creates logs in the `logs/` directory:
- `logs/python-backend.log`
- `logs/node-backend.log`
- `logs/api-gateway.log`
- `logs/frontend.log`

View logs:
```bash
# Real-time log monitoring
tail -f logs/python-backend.log

# View all logs
cat logs/python-backend.log
```

#### Manual Process Logs:

When running services manually, logs appear in the terminal where you started the service.

### Stopping Services

#### Using Unified Script:

Press `Ctrl+C` in the terminal where the script is running.

**Windows:**
```powershell
Get-Job | Stop-Job
Get-Job | Remove-Job
```

**Mac/Linux:**
The script automatically cleans up on exit.

#### Manual:

Press `Ctrl+C` in each terminal where a service is running.

---

## 📚 Additional Resources

- [Google Earth Engine Documentation](https://developers.google.com/earth-engine)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

## 🎉 Success!

If all services are running, you should see:

```
========================================
   ✅ All Services Running!          
========================================

🔗 Service URLs:
   Frontend:       http://localhost:8080
   API Gateway:    http://localhost:3000
   Node Backend:   http://localhost:5000
   Python Backend: http://localhost:5001
```

Navigate to http://localhost:8080 to use the AlphaEarth Insurance platform!

---

## 💡 Tips

1. **Always activate the Python virtual environment** before running Python commands
2. **Keep all services running** for full functionality
3. **Check logs** if something isn't working
4. **Restart services** if you change environment variables
5. **Use the unified start script** for convenience

Happy coding! 🚀