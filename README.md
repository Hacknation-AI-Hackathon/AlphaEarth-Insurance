# 🌍 AlphaEarth Insurance Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9%2B-blue)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688)](https://fastapi.tiangolo.com/)

> AI-driven insurance intelligence platform automating climate-related insurance workflows through satellite imagery analysis, parametric triggers, and real-time disaster mapping.

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Core Technologies](#-core-technologies)
- [Rule-Based Detection Logic](#-rule-based-detection-logic)
- [Team](#-team)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

AlphaEarth is an advanced AI-driven insurance intelligence platform designed to automate the entire climate-related insurance workflow—from damage detection to claim approval, payout automation, and real-time exposure mapping.

### 🌟 Key Capabilities

| Feature | Description |
|---------|-------------|
| 🛰️ **Automated Damage Claims** | Pre/post-disaster satellite imagery analysis for flood, fire, and structural damage |
| ⚡ **Parametric Climate Insurance** | Real-time environmental monitoring with automatic payout triggers |
| 🗺️ **Disaster Impact Mapping** | Live visualization of insured property exposure during active disasters |
| 🤖 **AI Summarization** | Context-aware insurance reports powered by Anthropic Claude |
| 📊 **Risk Intelligence** | Real-time exposure calculation and financial loss estimation |

### 🎓 What Makes AlphaEarth Different?

- **Rule-Based + AI Hybrid**: Transparent, auditable rule-based logic enhanced with AI anomaly detection
- **Multi-Sensor Integration**: Sentinel-2, Landsat-8/9, MODIS, NOAA, NASA FIRMS
- **Instant Payouts**: Parametric triggers eliminate manual verification delays
- **Real-Time Mapping**: Live disaster tracking with financial exposure calculations

---

## 🏗️ Architecture

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│              React Frontend Dashboard                    │
│      Risk Maps • Claims View • Policy Management         │
└────────────────────┬────────────────────────────────────┘
                     │ REST API (Port 3000)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              API Gateway (Port 3000)                     │
│        Unified Endpoint • Request Routing                │
└───────────┬────────────────────────┬────────────────────┘
            │                        │
            ▼                        ▼
┌──────────────────────┐   ┌──────────────────────────────┐
│  Node.js Backend     │   │  Python FastAPI Backend      │
│     (Port 5000)      │   │      (Port 8000)             │
│                      │   │                              │
│ • Disaster Mapping   │   │ • Satellite Processing       │
│ • Risk Assessment    │   │ • Google Earth Engine        │
│ • Parametric Logic   │   │ • NDWI/NBR/RGB Analysis      │
│ • Payout Engine      │   │ • AlphaEarth Embeddings      │
└──────────┬───────────┘   └─────────┬────────────────────┘
           │                         │
           └────────┬────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              External Data Sources                       │
│  • Google Earth Engine  • NASA FIRMS  • NOAA APIs       │
│  • Anthropic Claude API • Weather Services              │
└─────────────────────────────────────────────────────────┘
```

### 🔄 Data Flow

1. **User Request** → React Frontend
2. **API Call** → API Gateway (Port 3000)
3. **Service Routing** → Python/Node.js backends
4. **Data Retrieval** → External APIs (GEE, NASA, NOAA)
5. **Processing** → Rule-based analysis + AI embeddings
6. **Response** → JSON with damage metrics/decisions
7. **Visualization** → Frontend dashboard updates

---

## 🚀 Features

### 1️⃣ Automated Damage Claims from Satellite Imagery

**Hazard Detection Methods:**

#### 🌊 Flood Detection
- **Algorithm**: Modified NDWI (MNDWI) delta analysis
- **Formula**: `MNDWI = (Green - SWIR) / (Green + SWIR)`
- **Segmentation**: Otsu's automatic thresholding
- **Severity**:
  - None: < 10% flooded area
  - Moderate: 10-40%
  - Severe: > 40%

#### 🔥 Wildfire Detection
- **Algorithm**: Normalized Burn Ratio (NBR) difference
- **Formula**: `NBR = (NIR - SWIR) / (NIR + SWIR)`
- **Threshold**: `dNBR > 0.27`
- **Filters**: Pre-existing vegetation (NDVI > 0.1), exclude water/clouds
- **Severity**:
  - None: < 10%
  - Low: 10-30%
  - Moderate: 30-50%
  - High: > 50%

#### 🏠 Roof Damage Detection
- **Algorithm**: Average absolute RGB difference
- **Requirements**: High urban index (NDBI > 0), cloud-free
- **Severity**: Same as wildfire (10/30/50% thresholds)

**AlphaEarth Embedding-Based Change Detection:**
- 1024-dimensional embeddings for pre/post images
- Normalized change score (0-1)
- Independent cross-check for spectral rules

**Decision Logic:**
```
Fused Score = Weighted(Severity + Confidence + Embedding)

≥ 0.70  → High      (Auto-Approve ✅)
0.40-0.70 → Moderate (Manual Review 👀)
< 0.40  → Low       (Reject ❌)
```

---

### 2️⃣ Parametric Climate Insurance Engine

**How It Works:**

1. **Policy Definition**: Set numeric triggers (e.g., wind > 150 km/h, rainfall > 200mm)
2. **Continuous Monitoring**: Real-time API ingestion from NOAA, NASA, GEE
3. **Threshold Comparison**: Backend evaluates live metrics vs. policy thresholds
4. **Automatic Payout**: When exceeded, instant payout event created
5. **Audit Trail**: Logged with timestamp, data source, metric value

**Monitored Parameters:**
- Wind Speed (NOAA)
- Rainfall Levels (GEE)
- Water Depth (Sentinel-2)
- Fire Intensity (NASA FIRMS)
- Temperature Extremes

**Architecture:**
```
Frontend (Policy View)
    ↓
Node.js Backend (parametricInsuranceService)
    ↓
External APIs (NOAA/GEE/NASA)
    ↓
Payout Workflow Engine
    ↓
Approve/Reject/Hold Decision
```

---

### 3️⃣ Disaster Impact Mapping for Insurers

**Capabilities:**
- Real-time hazard overlay on insured properties
- Risk classification: At Risk / Potential Risk
- Financial exposure calculation
- Color-coded heatmaps

**Workflow:**
1. Active disaster detected
2. Geographic footprint retrieved
3. Overlay with insurer's property map
4. Properties in hazard zone → "At Risk"
5. Properties within 10km buffer → "Potential Risk"
6. Financial exposure = (Intersection Area / Total Area) × Insured Value
7. Frontend displays risk maps + monetary losses

**Architecture:**
```
Frontend (Impact Map)
    ↓
Node.js Backend (riskService)
    ↓
Earth Engine Microservice + NASA FIRMS / NOAA
    ↓
Exposure Simulation Engine
    ↓
Estimated Financial Loss Output
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.9+ ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))
- **Google Earth Engine Account** ([Sign Up](https://earthengine.google.com/signup/))
- **Anthropic API Key** ([Get Key](https://www.anthropic.com/))

### Quick Start
```bash
# Clone the repository
git clone https://github.com/yourusername/alphaearth.git
cd alphaearth

# Install all dependencies
npm run install-all

# Configure environment variables
npm run setup-env

# Start all services
npm run dev
```

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/alphaearth.git
cd alphaearth
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Or using yarn
yarn install
```

### 3. Python Backend Setup
```bash
cd python-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**requirements.txt:**
```txt
fastapi==0.100.0
uvicorn[standard]==0.23.0
earthengine-api==0.1.360
google-auth==2.22.0
numpy==1.24.3
opencv-python==4.8.0
scikit-image==0.21.0
pydantic==2.0.0
python-dotenv==1.0.0
anthropic==0.3.0
```

### 4. Node.js Backend Setup
```bash
cd ../nodejs-backend

# Install dependencies
npm install
```

**package.json dependencies:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.4.0",
    "dotenv": "^16.3.1",
    "@anthropic-ai/sdk": "^0.3.0",
    "turf": "^3.0.14"
  }
}
```

### 5. API Gateway Setup
```bash
cd ../api-gateway

# Install dependencies
npm install
```

**package.json dependencies:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` files in each service directory:

#### Frontend `.env`
```env
VITE_API_GATEWAY_URL=http://localhost:3000
VITE_APP_NAME=AlphaEarth
VITE_ENABLE_ANALYTICS=false
```

#### Python Backend `.env`
```env
# Server Configuration
PORT=8000
HOST=0.0.0.0
DEBUG=True

# Google Earth Engine
GOOGLE_EARTH_ENGINE_KEY=your_gee_service_account_key.json
GEE_PROJECT_ID=your-project-id

# API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key

# Processing Configuration
MAX_IMAGE_PROCESSING_TIME=1800
ASYNC_TIMEOUT=30
```

#### Node.js Backend `.env`
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# External APIs
NOAA_API_KEY=your_noaa_api_key
NASA_FIRMS_KEY=your_nasa_firms_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### API Gateway `.env`
```env
# Gateway Configuration
PORT=3000
NODE_ENV=development

# Backend URLs
PYTHON_BACKEND_URL=http://localhost:8000
NODE_BACKEND_URL=http://localhost:5000

# CORS
CORS_ORIGIN=http://localhost:5173

# Timeout
REQUEST_TIMEOUT=30000
```

### Google Earth Engine Authentication

1. **Create Service Account**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Earth Engine API
   - Create Service Account
   - Download JSON key file

2. **Configure Python Backend**
```bash
   # Copy key file to python-backend directory
   cp path/to/your-key.json python-backend/gee-key.json
   
   # Update .env
   GOOGLE_EARTH_ENGINE_KEY=gee-key.json
```

3. **Initialize Earth Engine**
```python
   # This is handled automatically in the backend
   import ee
   ee.Initialize()
```

---

## 🎮 Running the Application

### Development Mode

#### Option 1: Run All Services (Recommended)
```bash
# From project root
npm run dev:all
```

This will start:
- Frontend (http://localhost:5173)
- API Gateway (http://localhost:3000)
- Python Backend (http://localhost:8000)
- Node.js Backend (http://localhost:5000)

#### Option 2: Run Services Individually

**Terminal 1 - Python Backend:**
```bash
cd python-backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Node.js Backend:**
```bash
cd nodejs-backend
npm run dev
```

**Terminal 3 - API Gateway:**
```bash
cd api-gateway
npm start
```

**Terminal 4 - Frontend:**
```bash
# From project root
npm run dev
```

### Production Mode
```bash
# Build frontend
npm run build

# Start production server
npm run start:prod
```

### Docker Deployment (Optional)
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "5173:5173"
    environment:
      - VITE_API_GATEWAY_URL=http://api-gateway:3000

  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    depends_on:
      - python-backend
      - node-backend

  python-backend:
    build: ./python-backend
    ports:
      - "8000:8000"
    environment:
      - PORT=8000

  node-backend:
    build: ./nodejs-backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
Currently using API keys (future OAuth2 implementation planned)

### Endpoints

#### 1. Claims Processing

**Analyze Damage Claim**
```http
POST /api/claims/analyze
Content-Type: application/json

{
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "dates": {
    "pre_event": "2024-01-01",
    "post_event": "2024-01-15"
  },
  "hazard_type": "flood",  // flood, wildfire, roof_damage
  "policy_id": "POL-12345"
}
```

**Response:**
```json
{
  "claim_id": "CLM-67890",
  "status": "auto_approved",
  "confidence": 0.85,
  "damage_assessment": {
    "flood_severity": "severe",
    "affected_area_percentage": 45.2,
    "embedding_change_score": 0.78
  },
  "decision": {
    "fused_score": 0.82,
    "recommendation": "approve",
    "estimated_payout": 150000
  },
  "imagery": {
    "pre_event_url": "...",
    "post_event_url": "...",
    "difference_map_url": "..."
  }
}
```

#### 2. Parametric Insurance

**List Active Policies**
```http
GET /api/parametric/policies
```

**Response:**
```json
{
  "policies": [
    {
      "policy_id": "PAR-001",
      "coverage_type": "hurricane",
      "triggers": {
        "wind_speed_kmh": 150,
        "rainfall_mm": 200
      },
      "payout_amount": 100000,
      "status": "active"
    }
  ]
}
```

**Evaluate Policy Triggers**
```http
POST /api/parametric/evaluate
Content-Type: application/json

{
  "policy_id": "PAR-001",
  "location": {
    "latitude": 25.7617,
    "longitude": -80.1918
  }
}
```

**Response:**
```json
{
  "policy_id": "PAR-001",
  "evaluation_time": "2024-01-15T10:30:00Z",
  "current_metrics": {
    "wind_speed_kmh": 165,
    "rainfall_mm": 220
  },
  "triggers_exceeded": true,
  "payout_initiated": true,
  "payout_id": "PAY-12345",
  "amount": 100000
}
```

#### 3. Disaster Impact Mapping

**Get Active Disasters**
```http
GET /api/disasters/active?region=north_america
```

**Response:**
```json
{
  "disasters": [
    {
      "disaster_id": "DIS-789",
      "type": "wildfire",
      "location": "California",
      "severity": "high",
      "start_date": "2024-01-10",
      "affected_area_km2": 500,
      "status": "active"
    }
  ]
}
```

**Generate Impact Map**
```http
POST /api/disasters/impact-map
Content-Type: application/json

{
  "disaster_id": "DIS-789",
  "insurer_id": "INS-001",
  "property_portfolio": [
    {
      "property_id": "PROP-001",
      "location": {"lat": 37.7749, "lng": -122.4194},
      "insured_value": 500000
    }
  ]
}
```

**Response:**
```json
{
  "impact_map_id": "MAP-456",
  "total_properties": 150,
  "at_risk": 45,
  "potential_risk": 32,
  "safe": 73,
  "total_exposure": 6750000,
  "properties_detail": [
    {
      "property_id": "PROP-001",
      "risk_level": "at_risk",
      "distance_to_hazard_km": 2.3,
      "estimated_damage_percentage": 35,
      "potential_loss": 175000
    }
  ],
  "map_url": "..."
}
```

---

## 💻 Core Technologies

### Frontend Stack
- **React 18.2** - UI framework
- **TypeScript 5.0** - Type safety
- **Vite 4.4** - Build tool
- **Tailwind CSS 3.3** - Styling
- **shadcn/ui** - Component library
- **React Router 6.14** - Navigation
- **Lucide React** - Icons
- **Recharts** - Data visualization

### Backend Stack

**Python (Port 8000)**
- **FastAPI 0.100** - Web framework
- **Pydantic 2.0** - Data validation
- **Google Earth Engine** - Satellite data
- **NumPy 1.24** - Numerical computing
- **OpenCV 4.8** - Image processing
- **Scikit-image 0.21** - Image analysis

**Node.js (Port 5000)**
- **Express 4.18** - Web framework
- **Turf.js 3.0** - Geospatial analysis
- **Axios 1.4** - HTTP client
- **CORS 2.8** - Cross-origin support

**API Gateway (Port 3000)**
- **Express 4.18** - Server
- **http-proxy-middleware 2.0** - Request proxying

### External Services
- **Google Earth Engine** - Satellite imagery
- **NASA FIRMS** - Fire data
- **NOAA APIs** - Weather data
- **Anthropic Claude** - AI summarization

---

## 🔬 Rule-Based Detection Logic

### System-Wide Rule Engine

| Component | Input Source | Rule Logic Applied | Output Generated |
|-----------|--------------|-------------------|------------------|
| **Damage Detection** | NDWI / NBR / RGB Delta | Threshold on ΔIndex | Damage % |
| **Parametric Trigger** | Wind Speed / Rainfall | Exceedance of Threshold | Payout Event |
| **Impact Mapping** | Property & Hazard GeoJSON | Spatial Intersection | Exposure Map |

### Detailed Algorithms

#### Flood Detection Algorithm
```python
def detect_flood(pre_image, post_image):
    # Compute MNDWI
    mndwi_pre = (pre_green - pre_swir) / (pre_green + pre_swir)
    mndwi_post = (post_green - post_swir) / (post_green + post_swir)
    
    # Calculate delta
    delta_mndwi = mndwi_post - mndwi_pre
    
    # Apply Otsu's threshold
    threshold = otsu_threshold(delta_mndwi)
    flooded_mask = delta_mndwi > threshold
    
    # Calculate percentage
    affected_percentage = (flooded_mask.sum() / total_pixels) * 100
    
    # Classify severity
    if affected_percentage < 10:
        severity = "none"
    elif affected_percentage < 40:
        severity = "moderate"
    else:
        severity = "severe"
    
    return {
        "affected_percentage": affected_percentage,
        "severity": severity,
        "confidence": calculate_confidence(delta_mndwi)
    }
```

#### Wildfire Detection Algorithm
```python
def detect_wildfire(pre_image, post_image):
    # Compute NBR
    nbr_pre = (pre_nir - pre_swir) / (pre_nir + pre_swir)
    nbr_post = (post_nir - post_swir) / (post_nir + post_swir)
    
    # Calculate difference
    dnbr = nbr_pre - nbr_post
    
    # Apply threshold
    burned_mask = dnbr > 0.27
    
    # Apply contextual filters
    ndvi_pre = (pre_nir - pre_red) / (pre_nir + pre_red)
    vegetation_mask = ndvi_pre > 0.1
    
    # Exclude water and clouds
    final_mask = burned_mask & vegetation_mask & ~water_mask & ~cloud_mask
    
    # Calculate percentage
    burned_percentage = (final_mask.sum() / total_pixels) * 100
    
    # Classify severity
    severity = classify_severity(burned_percentage)
    
    return {
        "burned_percentage": burned_percentage,
        "severity": severity,
        "confidence": calculate_confidence(dnbr)
    }
```

#### Confidence-Aware Fusion
```python
def fuse_assessments(rule_severity, validation_confidence, embedding_score):
    # Weighted combination
    weights = {
        "rule": 0.5,
        "validation": 0.3,
        "embedding": 0.2
    }
    
    fused_score = (
        weights["rule"] * rule_severity +
        weights["validation"] * validation_confidence +
        weights["embedding"] * embedding_score
    )
    
    # Decision logic
    if fused_score >= 0.70:
        decision = "auto_approve"
    elif fused_score >= 0.40:
        decision = "manual_review"
    else:
        decision = "reject"
    
    return {
        "fused_score": fused_score,
        "decision": decision,
        "explanation": generate_explanation(fused_score)
    }
```

---

## 📊 Data Sources & Update Frequencies

| Data Source | Type | Resolution | Update Frequency | Use Case |
|-------------|------|------------|------------------|----------|
| **Sentinel-2** | Optical | 10-30m | 5 days | Flood, vegetation analysis |
| **Landsat-8/9** | Optical | 30m | 16 days | Long-term change detection |
| **MODIS** | Thermal | 250-1000m | 2x daily | Fire detection, real-time |
| **NOAA** | Weather | Variable | Hourly | Wind, rainfall metrics |
| **NASA FIRMS** | Fire | 375m-1km | Real-time | Active fire monitoring |
| **GEE Archives** | Multi-source | Various | Historical | Baseline comparison |

---

## 🎯 Current Limitations & Future Enhancements

### Current Limitations

1. **Low-Altitude Detail**
   - Satellite imagery lacks fine-scale resolution for individual roof assessment
   - Limited in dense urban/forested areas

2. **Atmospheric Interference**
   - Cloud cover, haze affect post-disaster readings
   - Seasonal lighting variations

3. **Rule Threshold Sensitivity**
   - Thresholds may need regional calibration
   - Limited generalization across sensors

### Upcoming Enhancements (v2.0)

- [ ] **Machine Learning Integration**
  - Deep learning models for non-linear damage patterns
  - Historical disaster dataset training
  
- [ ] **Multi-Sensor Fusion**
  - Optical + Radar (SAR) for all-weather accuracy
  - Cloud-penetrating capabilities
  
- [ ] **Continuous Model Tuning**
  - Adaptive thresholds based on new events
  - Global calibration system
  
- [ ] **Drone Imagery Integration**
  - High-resolution low-altitude assessment
  - Automated drone deployment post-disaster
  
- [ ] **Advanced Atmospheric Correction**
  - ML-based cloud/haze removal
  - Seasonal normalization
  
- [ ] **Blockchain Audit Trail**
  - Immutable payout records
  - Smart contract integration

---

## 👥 Team

### Core Contributors

| Name | Role | GitHub |
|------|------|--------|
| **Raghav Gali** | Lead Developer, ML/AI | [@raghavgali](#) |
| **Sachin Ramesh Shet** | Backend Architect, Node.js | [@sachinrshet](#) |
| **Gagan Chigateri Mahadeswara** | Frontend Lead, UI/UX | [@gaganchigateri](#) |

---

## 🗺️ Roadmap

### Phase 1: Core Platform (Completed ✅)
- [x] Automated damage claims processing
- [x] Parametric insurance engine
- [x] Disaster impact mapping
- [x] API Gateway architecture
- [x] Frontend dashboard with Vision UI

### Phase 2: Intelligence Enhancement (Q2 2024)
- [ ] Machine learning damage classifier
- [ ] Predictive risk modeling
- [ ] Historical data analysis
- [ ] Advanced visualization tools
- [ ] Mobile application (iOS/Android)

### Phase 3: Scale & Integration (Q3 2024)
- [ ] Multi-sensor data fusion
- [ ] Drone imagery integration
- [ ] Third-party API ecosystem
- [ ] Reinsurance platform integration
- [ ] Blockchain audit trail

### Phase 4: Global Expansion (Q4 2024)
- [ ] Multi-language support
- [ ] Regional calibration system
- [ ] Global disaster database
- [ ] Enterprise white-label solution
- [ ] Compliance certifications (ISO, SOC 2)

---

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
npm run test

# Python backend tests
cd python-backend
pytest

# Node.js backend tests
cd nodejs-backend
npm run test

# E2E tests
npm run test:e2e
```

### Test Coverage

Current coverage: ~85%
```bash
# Generate coverage report
npm run test:coverage
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. **Fork the repository**
2. **Clone your fork**
```bash
   git clone https://github.com/YOUR-USERNAME/alphaearth.git
```
3. **Create a branch**
```bash
   git checkout -b feature/amazing-feature
```
4. **Make changes and commit**
```bash
   git commit -m "Add amazing feature"
```
5. **Push to your fork**
```bash
   git push origin feature/amazing-feature
```
6. **Create Pull Request**

### Coding Standards

- **JavaScript/TypeScript**: Follow Airbnb style guide
- **Python**: Follow PEP 8
- **Commits**: Use conventional commits
```
  feat: add new feature
  fix: bug fix
  docs: documentation update
  style: formatting changes
  refactor: code refactoring
  test: add tests
  chore: maintenance
```

### Pull Request Process

1. Update README.md with any new features
2. Ensure all tests pass
3. Update documentation
4. Request review from maintainers

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
```
MIT License

Copyright (c) 2024 AlphaEarth Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 Acknowledgments

- **Google Earth Engine** - Satellite data infrastructure
- **Anthropic** - Claude AI API for intelligent summarization
- **NASA** - FIRMS active fire data
- **NOAA** - Weather and climate data
- **Open-source community** - Foundational libraries and tools

### Special Thanks

- Vision UI design system
- shadcn/ui component library
- FastAPI and Express.js communities
- All hackathon mentors and judges

---

## 📧 Contact & Support

### Get Help

- **Documentation**: [docs.alphaearth.io](#)
- **Discord Community**: [Join our Discord](#)
- **Email**: support@alphaearth.io

### Report Issues

Found a bug? [Open an issue](https://github.com/yourusername/alphaearth/issues/new)

### Feature Requests

Have an idea? [Submit a feature request](https://github.com/yourusername/alphaearth/discussions/new)

---

## 📈 Project Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Last Commit](https://img.shields.io/github/last-commit/yourusername/alphaearth)

### Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/alphaearth&type=Date)](https://star-history.com/#yourusername/alphaearth&Date)

---

<div align="center">

**Built with ❤️ for transforming climate insurance through AI and geospatial intelligence**

[Website](#) • [Documentation](#) • [Demo](#) • [Blog](#)

</div>