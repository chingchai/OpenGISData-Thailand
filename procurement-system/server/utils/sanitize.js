/**
 * Input Sanitization Utilities
 * ฟังก์ชันสำหรับทำความสะอาดข้อมูล input เพื่อป้องกัน XSS และ Injection
 */

const validator = require('validator');

/**
 * Sanitize string input (remove HTML tags and dangerous characters)
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Escape HTML entities
  sanitized = validator.escape(sanitized);

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  return sanitized;
}

/**
 * Sanitize input recursively (handles objects and arrays)
 * @param {*} data - Data to sanitize
 * @returns {*} Sanitized data
 */
function sanitizeInput(data) {
  // Handle null or undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle strings
  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  // Handle numbers, booleans
  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item));
  }

  // Handle objects
  if (typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize key (prevent prototype pollution)
      const sanitizedKey = key.toString().replace(/[^a-zA-Z0-9_]/g, '');

      // Skip dangerous keys
      if (['__proto__', 'constructor', 'prototype'].includes(sanitizedKey)) {
        continue;
      }

      sanitized[sanitizedKey] = sanitizeInput(value);
    }
    return sanitized;
  }

  return data;
}

/**
 * Validate and sanitize email
 * @param {string} email - Email address
 * @returns {string|null} Sanitized email or null if invalid
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const trimmed = email.trim().toLowerCase();

  if (!validator.isEmail(trimmed)) {
    return null;
  }

  return validator.normalizeEmail(trimmed);
}

/**
 * Sanitize phone number (Thai format)
 * @param {string} phone - Phone number
 * @returns {string|null} Sanitized phone or null if invalid
 */
function sanitizePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return null;
  }

  // Remove all non-digit characters
  let sanitized = phone.replace(/\D/g, '');

  // Check Thai phone format (10 digits starting with 0)
  if (!/^0\d{9}$/.test(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitize URL
 * @param {string} url - URL string
 * @returns {string|null} Sanitized URL or null if invalid
 */
function sanitizeURL(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();

  if (!validator.isURL(trimmed, { protocols: ['http', 'https'], require_protocol: true })) {
    return null;
  }

  return trimmed;
}

/**
 * Sanitize integer input
 * @param {*} input - Input value
 * @param {Object} options - { min, max, default }
 * @returns {number|null} Sanitized integer
 */
function sanitizeInt(input, options = {}) {
  const { min, max, default: defaultValue = null } = options;

  // Convert to number
  const num = parseInt(input, 10);

  // Check if valid number
  if (isNaN(num)) {
    return defaultValue;
  }

  // Check min/max bounds
  if (min !== undefined && num < min) {
    return defaultValue;
  }

  if (max !== undefined && num > max) {
    return defaultValue;
  }

  return num;
}

/**
 * Sanitize float input
 * @param {*} input - Input value
 * @param {Object} options - { min, max, precision, default }
 * @returns {number|null} Sanitized float
 */
function sanitizeFloat(input, options = {}) {
  const { min, max, precision, default: defaultValue = null } = options;

  // Convert to number
  const num = parseFloat(input);

  // Check if valid number
  if (isNaN(num)) {
    return defaultValue;
  }

  // Check min/max bounds
  if (min !== undefined && num < min) {
    return defaultValue;
  }

  if (max !== undefined && num > max) {
    return defaultValue;
  }

  // Apply precision
  if (precision !== undefined) {
    return parseFloat(num.toFixed(precision));
  }

  return num;
}

/**
 * Sanitize date input
 * @param {*} input - Input date
 * @returns {Date|null} Sanitized date or null if invalid
 */
function sanitizeDate(input) {
  if (!input) {
    return null;
  }

  // Handle Date objects
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  // Handle string dates
  if (typeof input === 'string') {
    // Check ISO format
    if (validator.isISO8601(input)) {
      const date = new Date(input);
      return isNaN(date.getTime()) ? null : date;
    }
  }

  return null;
}

/**
 * Sanitize enum value
 * @param {*} input - Input value
 * @param {Array} allowedValues - Array of allowed values
 * @param {*} defaultValue - Default value if invalid
 * @returns {*} Sanitized enum value
 */
function sanitizeEnum(input, allowedValues, defaultValue = null) {
  if (!Array.isArray(allowedValues) || allowedValues.length === 0) {
    return defaultValue;
  }

  return allowedValues.includes(input) ? input : defaultValue;
}

/**
 * Sanitize boolean input
 * @param {*} input - Input value
 * @param {*} defaultValue - Default value
 * @returns {boolean} Sanitized boolean
 */
function sanitizeBoolean(input, defaultValue = false) {
  if (typeof input === 'boolean') {
    return input;
  }

  if (typeof input === 'string') {
    const lower = input.toLowerCase().trim();
    if (['true', '1', 'yes', 'y'].includes(lower)) {
      return true;
    }
    if (['false', '0', 'no', 'n'].includes(lower)) {
      return false;
    }
  }

  if (typeof input === 'number') {
    return input !== 0;
  }

  return defaultValue;
}

/**
 * Prevent SQL Injection (escape special characters for SQL)
 * Note: ควรใช้ parameterized queries แทนที่จะ escape manually
 * @param {string} input - Input string
 * @returns {string} Escaped string
 */
function escapeSQLString(input) {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
}

/**
 * Sanitize filename (remove path traversal attempts)
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return 'unnamed';
  }

  // Remove path separators
  let sanitized = filename.replace(/[\/\\]/g, '');

  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '');

  // Remove leading dots (hidden files)
  sanitized = sanitized.replace(/^\.+/, '');

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    const name = sanitized.substring(0, 255 - ext.length - 1);
    sanitized = `${name}.${ext}`;
  }

  return sanitized || 'unnamed';
}

/**
 * Sanitize object keys (prevent prototype pollution)
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
function sanitizeObjectKeys(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  const sanitized = {};
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

  for (const [key, value] of Object.entries(obj)) {
    // Skip dangerous keys
    if (dangerousKeys.includes(key)) {
      continue;
    }

    // Sanitize nested objects
    if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObjectKeys(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Comprehensive input sanitization for request body
 * @param {Object} body - Request body
 * @returns {Object} Sanitized body
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  // First prevent prototype pollution
  const safe = sanitizeObjectKeys(body);

  // Then sanitize all values
  return sanitizeInput(safe);
}

module.exports = {
  sanitizeInput,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeURL,
  sanitizeInt,
  sanitizeFloat,
  sanitizeDate,
  sanitizeEnum,
  sanitizeBoolean,
  escapeSQLString,
  sanitizeFilename,
  sanitizeObjectKeys,
  sanitizeRequestBody
};
