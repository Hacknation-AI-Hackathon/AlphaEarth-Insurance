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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    service: 'AlphaEarth Backend API'
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