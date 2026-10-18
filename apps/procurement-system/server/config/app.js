import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database
  DB_PATH: process.env.DB_PATH || './server/data/database/procurement.db',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-change-this',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  LOG_FILE: process.env.LOG_FILE || './server/logs/app.log',

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || './server/uploads',
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png').split(','),

  // Email (for future use)
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@huatalay.go.th',

  // LINE Notify (for future use)
  LINE_NOTIFY_TOKEN: process.env.LINE_NOTIFY_TOKEN || '',

  // Cron Jobs
  ENABLE_CRON: process.env.ENABLE_CRON === 'true',
  SLA_CHECK_SCHEDULE: process.env.SLA_CHECK_SCHEDULE || '0 8 * * *', // Every day at 8 AM

  // API
  API_PREFIX: '/api',
  API_VERSION: 'v1',

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // SLA Defaults
  DEFAULT_WARNING_DAYS: 3,
  DEFAULT_SLA_DAYS: 7
};

export const isDevelopment = () => config.NODE_ENV === 'development';
export const isProduction = () => config.NODE_ENV === 'production';
export const isTest = () => config.NODE_ENV === 'test';

export default config;
