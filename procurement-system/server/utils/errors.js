/**
 * Custom Error Classes
 * ระบบจัดการ Error แบบมีโครงสร้าง
 */

/**
 * Base Application Error
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error (400)
 * ใช้เมื่อข้อมูลที่ส่งมาไม่ถูกต้อง
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/**
 * Not Found Error (404)
 * ใช้เมื่อไม่พบข้อมูลที่ต้องการ
 */
class NotFoundError extends AppError {
  constructor(message = 'ไม่พบข้อมูลที่ต้องการ') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Unauthorized Error (401)
 * ใช้เมื่อไม่มีการยืนยันตัวตนหรือ token ไม่ถูกต้อง
 */
class UnauthorizedError extends AppError {
  constructor(message = 'ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบ') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Forbidden Error (403)
 * ใช้เมื่อยืนยันตัวตนแล้วแต่ไม่มีสิทธิ์เข้าถึงทรัพยากร
 */
class ForbiddenError extends AppError {
  constructor(message = 'การเข้าถึงถูกปฏิเสธ ไม่มีสิทธิ์ในการดำเนินการนี้') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Database Error (500)
 * ใช้เมื่อเกิดข้อผิดพลาดในฐานข้อมูล
 */
class DatabaseError extends AppError {
  constructor(message = 'เกิดข้อผิดพลาดในระบบฐานข้อมูล', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

/**
 * Conflict Error (409)
 * ใช้เมื่อข้อมูลซ้ำหรือขัดแย้ง
 */
class ConflictError extends AppError {
  constructor(message = 'ข้อมูลซ้ำหรือขัดแย้งกับข้อมูลที่มีอยู่') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Bad Request Error (400)
 * ใช้เมื่อ request ไม่ถูกต้อง
 */
class BadRequestError extends AppError {
  constructor(message = 'คำขอไม่ถูกต้อง') {
    super(message, 400, 'BAD_REQUEST');
  }
}

/**
 * Error Handler Middleware สำหรับ Express
 * @param {Error} err - Error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      user: req.user?.id
    });
  }

  // Mongoose/Knex bad ObjectId
  if (err.name === 'CastError') {
    const message = 'ไม่พบข้อมูลที่ต้องการ';
    error = new NotFoundError(message);
  }

  // Mongoose/Knex duplicate key
  if (err.code === 11000 || err.code === 'ER_DUP_ENTRY') {
    const message = 'ข้อมูลซ้ำ ไม่สามารถบันทึกได้';
    error = new ConflictError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map(val => val.message).join(', ');
    error = new ValidationError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new UnauthorizedError('Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่');
  }

  if (err.name === 'TokenExpiredError') {
    error = new UnauthorizedError('Token หมดอายุ กรุณาเข้าสู่ระบบใหม่');
  }

  // SQL errors
  if (err.code && err.code.startsWith('ER_')) {
    error = new DatabaseError('เกิดข้อผิดพลาดในระบบฐานข้อมูล', err);
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    ...(error.code && { code: error.code }),
    ...(error.details && { details: error.details }),
    ...(error.timestamp && { timestamp: error.timestamp }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * Async Handler Wrapper
 * ใช้ wrap async functions เพื่อจับ error อัตโนมัติ
 * @param {Function} fn - Async function
 * @returns {Function} Wrapped function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  DatabaseError,
  ConflictError,
  BadRequestError,
  errorHandler,
  asyncHandler
};
