/**
 * Custom Error Classes and Error Handling Middleware
 * ES6 Modules
 */

/**
 * Base Application Error Class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = null, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      timestamp: this.timestamp
    };
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      details: this.details
    };
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(message = 'ไม่พบข้อมูลที่ต้องการ') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบ') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'ไม่มีสิทธิ์ในการดำเนินการนี้') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Database Error (500)
 */
export class DatabaseError extends AppError {
  constructor(message = 'เกิดข้อผิดพลาดในการเข้าถึงฐานข้อมูล', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;

    if (originalError) {
      this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      originalError: this.originalError ? {
        message: this.originalError.message,
        code: this.originalError.code
      } : null
    };
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(message = 'ข้อมูลซ้ำหรือขัดแย้งกัน') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends AppError {
  constructor(message = 'คำขอไม่ถูกต้อง') {
    super(message, 400, 'BAD_REQUEST');
  }
}

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    // Add request start time for logging
    req.startTime = Date.now();

    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Error Handler Middleware
 * Global error handling middleware for Express
 */
export function errorHandler(err, req, res, next) {
  let error = err;

  // Log error for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error caught by errorHandler:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode
    });
  }

  // Handle different error types
  if (err.name === 'CastError') {
    error = new NotFoundError('ไม่พบข้อมูลที่ต้องการ');
  }

  if (err.name === 'ValidationError' && !err.isOperational) {
    error = new ValidationError('ข้อมูลไม่ถูกต้อง', err.errors);
  }

  if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'ER_DUP_ENTRY' || err.code === 11000) {
    error = new ConflictError('ข้อมูลซ้ำในระบบ');
  }

  if (err.name === 'JsonWebTokenError') {
    error = new UnauthorizedError('Token ไม่ถูกต้อง');
  }

  if (err.name === 'TokenExpiredError') {
    error = new UnauthorizedError('Token หมดอายุ');
  }

  // SQL errors
  if (err.code && err.code.startsWith && err.code.startsWith('ER_')) {
    error = new DatabaseError('เกิดข้อผิดพลาดในระบบฐานข้อมูล', err);
  }

  // Default to 500 server error if not operational
  const statusCode = error.statusCode || 500;
  const message = error.isOperational
    ? error.message
    : 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์';

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(error.code && { code: error.code }),
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV !== 'production' && {
      stack: err.stack,
      error: err.toJSON ? err.toJSON() : {
        name: err.name,
        message: err.message
      }
    }),
    timestamp: new Date().toISOString()
  });
}

/**
 * 404 Not Found Handler
 * Handles requests to undefined routes
 */
export function notFoundHandler(req, res, next) {
  const error = new NotFoundError(`ไม่พบเส้นทาง: ${req.method} ${req.originalUrl}`);
  next(error);
}

export default {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  DatabaseError,
  ConflictError,
  BadRequestError,
  asyncHandler,
  errorHandler,
  notFoundHandler
};
