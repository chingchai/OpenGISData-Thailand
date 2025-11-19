/**
 * Jest Setup File
 * Runs before all tests
 */

import { jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.DB_PATH = ':memory:'; // Use in-memory database for tests

// Global test timeout
jest.setTimeout(10000);

// Mock logger to reduce noise in test output
global.mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  authSuccess: jest.fn(),
  authFailure: jest.fn(),
  projectOperation: jest.fn(),
  securityEvent: jest.fn(),
  dbOperation: jest.fn(),
  apiRequest: jest.fn()
};

console.log('✓ Test environment initialized');
