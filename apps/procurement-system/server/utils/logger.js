/**
 * Winston Logger Configuration
 * Structured logging สำหรับระบบ
 * ES6 Modules
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// สร้าง logs directory ถ้ายังไม่มี
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create Winston logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: {
    service: 'procurement-system',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 30,
      tailable: true
    }),

    // Audit log file (for security-sensitive operations)
    new winston.transports.File({
      filename: path.join(logsDir, 'audit.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 60,
      tailable: true
    })
  ],

  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Console output in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

/**
 * Structured logging functions
 */

/**
 * Log authentication success
 * @param {number} userId - User ID
 * @param {string} action - Action performed
 * @param {Object} details - Additional details
 */
logger.authSuccess = function(userId, action, details = {}) {
  this.info('Authentication success', {
    category: 'auth',
    userId,
    action,
    ...details
  });
};

/**
 * Log authentication failure
 * @param {string} username - Username attempted
 * @param {string} reason - Failure reason
 * @param {Object} details - Additional details
 */
logger.authFailure = function(username, reason, details = {}) {
  this.warn('Authentication failure', {
    category: 'auth',
    username,
    reason,
    ...details
  });
};

/**
 * Log project operations
 * @param {string} action - Action performed (create, update, delete)
 * @param {number} projectId - Project ID
 * @param {number} userId - User ID
 * @param {Object} details - Additional details
 */
logger.projectOperation = function(action, projectId, userId, details = {}) {
  this.info('Project operation', {
    category: 'project',
    action,
    projectId,
    userId,
    ...details
  });
};

/**
 * Log SLA violations
 * @param {number} projectId - Project ID
 * @param {number} stepId - Step ID
 * @param {number} delayDays - Delay in days
 * @param {Object} details - Additional details
 */
logger.slaViolation = function(projectId, stepId, delayDays, details = {}) {
  this.warn('SLA violation detected', {
    category: 'sla',
    projectId,
    stepId,
    delayDays,
    severity: delayDays > 7 ? 'critical' : delayDays > 3 ? 'high' : 'medium',
    ...details
  });
};

/**
 * Log database operations
 * @param {string} operation - Operation type
 * @param {string} table - Table name
 * @param {Object} details - Additional details
 */
logger.dbOperation = function(operation, table, details = {}) {
  this.debug('Database operation', {
    category: 'database',
    operation,
    table,
    ...details
  });
};

/**
 * Log security events
 * @param {string} event - Security event type
 * @param {Object} details - Event details
 */
logger.securityEvent = function(event, details = {}) {
  this.warn('Security event', {
    category: 'security',
    event,
    ...details
  });
};

/**
 * Log API requests (middleware)
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {number} duration - Request duration in ms
 */
logger.apiRequest = function(req, res, duration) {
  const logData = {
    category: 'api',
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id
  };

  if (res.statusCode >= 500) {
    this.error('API request failed', logData);
  } else if (res.statusCode >= 400) {
    this.warn('API request error', logData);
  } else {
    this.info('API request', logData);
  }
};

/**
 * Log performance issues
 * @param {string} operation - Operation name
 * @param {number} duration - Duration in ms
 * @param {number} threshold - Threshold in ms
 * @param {Object} details - Additional details
 */
logger.performanceIssue = function(operation, duration, threshold, details = {}) {
  this.warn('Performance issue detected', {
    category: 'performance',
    operation,
    duration,
    threshold,
    exceeded: duration - threshold,
    ...details
  });
};

/**
 * Log system events
 * @param {string} event - Event type
 * @param {Object} details - Event details
 */
logger.systemEvent = function(event, details = {}) {
  this.info('System event', {
    category: 'system',
    event,
    ...details
  });
};

/**
 * Log audit trail
 * @param {number} userId - User performing action
 * @param {string} action - Action performed
 * @param {string} resource - Resource affected
 * @param {Object} changes - Changes made
 * @param {Object} details - Additional details
 */
logger.audit = function(userId, action, resource, changes = {}, details = {}) {
  this.info('Audit trail', {
    category: 'audit',
    userId,
    action,
    resource,
    changes,
    ...details
  });
};

/**
 * Request logging middleware
 * @returns {Function} Express middleware
 */
logger.requestMiddleware = function() {
  return (req, res, next) => {
    const startTime = Date.now();

    // Log when response finishes
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.apiRequest(req, res, duration);

      // Log slow requests
      if (duration > 3000) {
        this.performanceIssue('API request', duration, 3000, {
          method: req.method,
          url: req.url
        });
      }
    });

    next();
  };
};

export default logger;
