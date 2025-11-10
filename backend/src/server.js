import express from 'express';
import cors from 'cors';
import disasterRoutes from './routes/disasterRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import imageryRoutes from './routes/imageryRoutes.js';
import earthquakeRoutes from './routes/earthquakeRoutes.js';
import severeWeatherRoutes from './routes/severeWeatherRoutes.js';
import parametricRoutes from './routes/parametricRoutes.js';
import flightRoutes from './routes/flightRoutes.js';
import claimProcessingRoutes from './routes/claimProcessingRoutes.js';
import demoRoutes from './routes/demoRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Normalize CORS origins - remove trailing slashes to avoid mismatches
const normalizeOrigin = (origin) => {
  if (!origin) return origin;
  return origin.trim().replace(/\/+$/, ''); // Remove trailing slashes
};

// Determine CORS origin(s)
const getCorsOrigin = () => {
  if (process.env.CORS_ORIGIN) {
    // Support comma-separated list of origins
    const origins = process.env.CORS_ORIGIN.split(',').map(normalizeOrigin);
    return origins;
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check (also available at /api/health for consistency)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AlphaEarth Backend API'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AlphaEarth Backend API'
  });
});

// API Routes (must be after specific routes like /api/health)
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AlphaEarth Backend API running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:8080'}`);
});

export default app;