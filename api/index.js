// Vercel serverless function wrapper for Node.js backend
// This file handles all API routes through the Express app

import express from 'express';
import cors from 'cors';
import disasterRoutes from '../backend/src/routes/disasterRoutes.js';
import riskRoutes from '../backend/src/routes/riskRoutes.js';
import propertyRoutes from '../backend/src/routes/propertyRoutes.js';
import analysisRoutes from '../backend/src/routes/analysisRoutes.js';
import imageryRoutes from '../backend/src/routes/imageryRoutes.js';
import earthquakeRoutes from '../backend/src/routes/earthquakeRoutes.js';
import severeWeatherRoutes from '../backend/src/routes/severeWeatherRoutes.js';
import parametricRoutes from '../backend/src/routes/parametricRoutes.js';
import flightRoutes from '../backend/src/routes/flightRoutes.js';
import claimProcessingRoutes from '../backend/src/routes/claimProcessingRoutes.js';
import demoRoutes from '../backend/src/routes/demoRoutes.js';
import dashboardRoutes from '../backend/src/routes/dashboardRoutes.js';

const app = express();

// Normalize CORS origins - remove trailing slashes to avoid mismatches
const normalizeOrigin = (origin) => {
  if (!origin) return origin;
  return origin.trim().replace(/\/+$/, ''); // Remove trailing slashes
};

// Determine CORS origin(s)
const getCorsOrigin = () => {
  if (process.env.CORS_ORIGIN) {
    // Support comma-separated list of origins
    return process.env.CORS_ORIGIN.split(',').map(normalizeOrigin);
  }
  // On Vercel, allow requests from the same domain and preview deployments
  if (process.env.VERCEL_URL) {
    const baseUrl = `https://${process.env.VERCEL_URL}`;
    // Also allow requests from the same domain without subdomain if applicable
    return [normalizeOrigin(baseUrl)];
  }
  // Development origins
  return ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'];
};

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getCorsOrigin();
    const normalizedOrigin = normalizeOrigin(origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!normalizedOrigin) {
      return callback(null, true);
    }
    
    // Check if the normalized origin is in the allowed list
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    
    // Also check if any allowed origin matches when normalized
    const isAllowed = allowedOrigins.some(allowed => 
      normalizeOrigin(allowed) === normalizedOrigin
    );
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AlphaEarth Backend API',
    environment: process.env.NODE_ENV || 'production',
    vercel: true
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AlphaEarth Backend API',
    environment: process.env.NODE_ENV || 'production',
    vercel: true
  });
});

// API Routes
app.use('/api/disasters', disasterRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/imagery', imageryRoutes);
app.use('/api/earthquakes', earthquakeRoutes);
app.use('/api/severe-weather', severeWeatherRoutes);
app.use('/api/parametric', parametricRoutes);
app.use('/api/flight', flightRoutes);
app.use('/api/claim_processing', claimProcessingRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path
  });
});

// Export for Vercel serverless
export default app;

