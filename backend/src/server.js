const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();


const connectDB = require('./config/database');

// Connect to MongoDB
connectDB();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Other middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/applications', require('./routes/applications'));
// In backend/src/server.js, add:
app.use('/api/intercaste-marriage', require('./routes/intercasteMarriage'));

// API root route
app.get('/api', (req, res) => {
  res.json({ 
    success: true,
    message: 'SAHAAYAK Backend API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      applications: '/api/applications',
      health: '/api/health'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Basic root route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'SAHAAYAK Backend Server is running!',
    version: '1.0.0',
    api: 'Visit /api for API information'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SAHAAYAK Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API available at: http://localhost:${PORT}/api`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});