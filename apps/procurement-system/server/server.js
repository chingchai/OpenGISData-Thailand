import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/app.js';
import { initializeDatabase, seedDatabase, closeDatabase } from './config/database.js';
import routes from './routes/index.js';

// ES Module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ========================================
// SECURITY MIDDLEWARE
// ========================================

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// CORS - Allow cross-origin requests
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - DISABLED
// const limiter = rateLimit({
//   windowMs: config.RATE_LIMIT_WINDOW_MS,
//   max: config.RATE_LIMIT_MAX_REQUESTS,
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false
// });
// app.use('/api/', limiter);

// ========================================
// GENERAL MIDDLEWARE
// ========================================

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ========================================
// DATABASE INITIALIZATION
// ========================================

try {
  console.log('🔄 Initializing database...');
  initializeDatabase();

  // Seed database if empty
  seedDatabase();

  console.log('✅ Database ready');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}

// ========================================
// API ROUTES
// ========================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

// API routes
app.use('/api', routes);

// ========================================
// SERVE STATIC FILES (Production)
// ========================================

// Static files are served by Nginx - commented out for reverse proxy setup
// const clientDistPath = path.join(__dirname, '../client/dist');
// app.use(express.static(clientDistPath));

// Handle client-side routing - send all non-API requests to index.html
// app.get('*', (req, res) => {
//   res.sendFile(path.join(clientDistPath, 'index.html'));
// });

// ========================================
// ERROR HANDLING
// ========================================

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.message
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      details: err.message
    });
  }

  // Database error
  if (err.code && err.code.startsWith('SQLITE_')) {
    return res.status(500).json({
      success: false,
      error: 'Database error',
      details: config.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========================================
// START SERVER
// ========================================

const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('🚀 Procurement System API Server');
  console.log('========================================');
  console.log(`📍 Environment: ${config.NODE_ENV}`);
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🌐 Client URL: ${config.CLIENT_URL}`);
  console.log(`🗄️  Database: SQLite (${config.DB_PATH})`);
  console.log('========================================');
  console.log('✅ Server is ready!');
  console.log('');
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

const gracefulShutdown = (signal) => {
  console.log(`\n📴 ${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log('🔌 HTTP server closed');

    // Close database connection
    closeDatabase();

    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

export default app;
