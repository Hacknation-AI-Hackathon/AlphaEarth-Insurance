# 🚀 AlphaEarth Vercel Deployment

This project is configured for deployment on Vercel with:
- **Frontend**: React + Vite (Static Site)
- **Node.js Backend**: Express.js (Serverless Functions)
- **Python Backend**: Flask (Serverless Functions)

## 📋 Quick Start

### 1. Prerequisites

- Vercel account
- GitHub repository
- Environment variables (see below)

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Or deploy via [Vercel Dashboard](https://vercel.com/dashboard).

### 3. Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `ANTHROPIC_API_KEY` - Anthropic API key
- `NOAA_API_KEY` - NOAA API key
- `NASA_FIRMS_KEY` - NASA FIRMS key
- `GEE_PROJECT_ID` - Google Earth Engine project ID
- `GEE_SERVICE_ACCOUNT` - GEE service account email

**Optional:**
- `VITE_API_URL` - Frontend API URL (defaults to `/api`)
- `CORS_ORIGIN` - CORS allowed origins (defaults to Vercel URL)
- `PYTHON_SERVICE_URL` - Python service URL (defaults to `/api/python`)

### 4. Verify Deployment

- Frontend: `https://your-app.vercel.app`
- Node.js API: `https://your-app.vercel.app/api/health`
- Python API: `https://your-app.vercel.app/api/python/health`

## 📁 Project Structure

```
.
├── frontend/           # React frontend
├── backend/            # Node.js backend
│   └── python-service/ # Python Flask backend
├── api/                # Vercel serverless functions
│   ├── index.js       # Node.js API handler
│   └── python/        # Python API handlers
└── vercel.json        # Vercel configuration
```

## 🔧 Configuration

### Vercel Configuration

See `vercel.json` for routing and function configuration.

### Function Timeouts

- Node.js: 60 seconds (free tier: 10 seconds)
- Python: 300 seconds (free tier: 10 seconds)

**Note:** For Earth Engine operations, upgrade to Vercel Pro for longer timeouts.

## 📚 Documentation

- [Full Deployment Guide](DEPLOYMENT_VERCEL.md)
- [Setup Guide](SETUP_GUIDE.md)
- [API Documentation](README.md)

## 🐛 Troubleshooting

See [DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md#-troubleshooting) for common issues and solutions.

## 📞 Support

For issues or questions, please open an issue on GitHub.

