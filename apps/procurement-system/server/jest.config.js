/**
 * Jest Configuration
 * For ES6 Modules (type: "module")
 */

export default {
  // Use node environment for testing
  testEnvironment: 'node',

  // Transform ES6 modules (experimental)
  transform: {},

  // File extensions to consider
  moduleFileExtensions: ['js', 'json'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Coverage settings
  collectCoverageFrom: [
    'services/**/*.js',
    'controllers/**/*.js',
    'utils/**/*.js',
    'models/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

  // Timeout for tests
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true
};
