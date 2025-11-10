/**
 * Standardized API Response Helpers
 * ES6 Modules
 */

/**
 * Send success response
 * @param {Response} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export function sendSuccess(res, data = null, message = 'สำเร็จ', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send error response
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} code - Error code (optional)
 * @param {*} details - Additional error details (optional)
 */
export function sendError(res, message = 'เกิดข้อผิดพลาด', statusCode = 500, code = null, details = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(code && { code }),
    ...(details && { details }),
    timestamp: new Date().toISOString()
  });
}

/**
 * Send paginated response
 * @param {Response} res - Express response object
 * @param {Object} result - Result object { data, pagination }
 * @param {string} message - Success message (default: 'สำเร็จ')
 */
export function sendPaginated(res, result, message = 'สำเร็จ') {
  const { data, pagination } = result;

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNext: pagination.hasNext || false,
      hasPrev: pagination.hasPrev || false
    },
    timestamp: new Date().toISOString()
  });
}

/**
 * Send validation error response
 * @param {Response} res - Express response object
 * @param {Array|Object} errors - Validation errors
 * @param {string} message - Error message (default: 'ข้อมูลไม่ถูกต้อง')
 */
export function sendValidationError(res, errors, message = 'ข้อมูลไม่ถูกต้อง') {
  // Convert to array format if needed
  const errorDetails = Array.isArray(errors) ? errors : [errors];

  return res.status(400).json({
    success: false,
    message,
    code: 'VALIDATION_ERROR',
    details: errorDetails,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send created response (201)
 * @param {Response} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message (default: 'สร้างสำเร็จ')
 */
export function sendCreated(res, data, message = 'สร้างสำเร็จ') {
  return res.status(201).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

/**
 * Send no content response (204)
 * @param {Response} res - Express response object
 */
export function sendNoContent(res) {
  return res.status(204).send();
}

/**
 * Send unauthorized response (401)
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 */
export function sendUnauthorized(res, message = 'ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบ') {
  return res.status(401).json({
    success: false,
    message,
    code: 'UNAUTHORIZED',
    timestamp: new Date().toISOString()
  });
}

/**
 * Send forbidden response (403)
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 */
export function sendForbidden(res, message = 'การเข้าถึงถูกปฏิเสธ') {
  return res.status(403).json({
    success: false,
    message,
    code: 'FORBIDDEN',
    timestamp: new Date().toISOString()
  });
}

/**
 * Send not found response (404)
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 */
export function sendNotFound(res, message = 'ไม่พบข้อมูลที่ต้องการ') {
  return res.status(404).json({
    success: false,
    message,
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString()
  });
}

/**
 * Send conflict response (409)
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 */
export function sendConflict(res, message = 'ข้อมูลซ้ำหรือขัดแย้ง') {
  return res.status(409).json({
    success: false,
    message,
    code: 'CONFLICT',
    timestamp: new Date().toISOString()
  });
}

/**
 * Send custom response
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {*} data - Response data (optional)
 */
export function sendCustom(res, statusCode, success, message, data = null) {
  return res.status(statusCode).json({
    success,
    message,
    ...(data && { data }),
    timestamp: new Date().toISOString()
  });
}

export default {
  sendSuccess,
  sendError,
  sendPaginated,
  sendValidationError,
  sendCreated,
  sendNoContent,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendCustom
};
