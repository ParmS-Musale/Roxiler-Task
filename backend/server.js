const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
require("./config/database");


const app = express();
const PORT = process.env.PORT || 5000;

// Test database connection (with error handling)
let dbConnected = false;
try {
  const { testConnection } = require('./config/database');
  testConnection().then(() => {
    dbConnected = true;
    console.log('✅ Database connected successfully');
  }).catch((error) => {
    console.log('⚠️  Database connection failed:', error.message);
    console.log('📝 Server will start anyway for testing...');
  });
} catch (error) {
  console.log('⚠️  Database config not found, continuing without database...');
}

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbConnected ? 'Connected' : 'Disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Store Rating Platform API',
    version: '1.0.0',
    status: 'Running',
    database: dbConnected ? 'Connected' : 'Disconnected',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      stores: '/api/stores',
      ratings: '/api/ratings'
    }
  });
});

// API routes with error handling
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.log('⚠️  Auth routes failed to load:', error.message);
  // Create fallback auth route
  app.use('/api/auth', (req, res) => {
    res.json({ message: 'Auth routes not available yet', error: error.message });
  });
}

try {
  app.use('/api/users', require('./routes/users'));
  console.log('✅ User routes loaded');
} catch (error) {
  console.log('⚠️  User routes failed to load:', error.message);
  app.use('/api/users', (req, res) => {
    res.json({ message: 'User routes not available yet' });
  });
}

try {
  app.use('/api/stores', require('./routes/stores'));
  console.log('✅ Store routes loaded');
} catch (error) {
  console.log('⚠️  Store routes failed to load:', error.message);
  app.use('/api/stores', (req, res) => {
    res.json({ message: 'Store routes not available yet' });
  });
}

try {
  app.use('/api/ratings', require('./routes/ratings'));
  console.log('✅ Rating routes loaded');
} catch (error) {
  console.log('⚠️  Rating routes failed to load:', error.message);
  app.use('/api/ratings', (req, res) => {
    res.json({ message: 'Rating routes not available yet' });
  });
}

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global Error Handler:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: error.errors
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry. This record already exists.'
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`
🚀 Server is running on port ${PORT}
📍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 API URL: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
💾 Database: ${dbConnected ? 'Connected' : 'Disconnected'}
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;