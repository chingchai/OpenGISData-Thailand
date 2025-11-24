/**
 * Auth Helper for Testing
 * Generate JWT tokens for test users
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing-only';

/**
 * Generate test JWT token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
export function generateTestToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    departmentId: user.department_id || user.departmentId
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Mock authenticated user objects
 */
export const testUsers = {
  admin: {
    id: 1,
    username: 'admin',
    email: 'admin@test.com',
    full_name: 'Admin User',
    role: 'admin',
    departmentId: 1,
    is_active: true
  },
  staff1: {
    id: 2,
    username: 'staff1',
    email: 'staff1@test.com',
    full_name: 'Staff User 1',
    role: 'staff',
    departmentId: 1,
    is_active: true
  },
  staff2: {
    id: 3,
    username: 'staff2',
    email: 'staff2@test.com',
    full_name: 'Staff User 2',
    role: 'staff',
    departmentId: 2,
    is_active: true
  },
  executive: {
    id: 4,
    username: 'exec',
    email: 'exec@test.com',
    full_name: 'Executive User',
    role: 'executive',
    departmentId: 1,
    is_active: true
  }
};

/**
 * Get test tokens for all users
 */
export const testTokens = {
  admin: generateTestToken(testUsers.admin),
  staff1: generateTestToken(testUsers.staff1),
  staff2: generateTestToken(testUsers.staff2),
  executive: generateTestToken(testUsers.executive)
};

/**
 * Create authorization header
 */
export function authHeader(token) {
  return `Bearer ${token}`;
}

export default {
  generateTestToken,
  testUsers,
  testTokens,
  authHeader
};
