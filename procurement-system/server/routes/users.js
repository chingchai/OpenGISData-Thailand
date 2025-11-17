/**
 * User Routes
 * API endpoints for user management
 */

import express from 'express';
import * as userController from '../controllers/user-controller.js';
import { authenticate } from '../middleware/auth.js';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

/**
 * Validation middleware to check for validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * Validation rules for user ID parameter
 */
const validateUserId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
];

/**
 * Validation rules for creating user
 */
const validateCreateUser = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters'),
  body('fullName')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Full name must be between 3 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be valid'),
  body('role')
    .isIn(['staff', 'admin', 'executive'])
    .withMessage('Role must be one of: staff, admin, executive'),
  body('departmentId')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Department ID must be between 1 and 7'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean')
];

/**
 * Validation rules for updating user
 */
const validateUpdateUser = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Full name must be between 3 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be valid'),
  body('password')
    .optional()
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6 and 100 characters'),
  body('role')
    .optional()
    .isIn(['staff', 'admin', 'executive'])
    .withMessage('Role must be one of: staff, admin, executive'),
  body('departmentId')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Department ID must be between 1 and 7'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean')
];

// ==========================================
// Routes
// ==========================================

/**
 * GET /api/users
 * Get all users
 * Accessible by: admin only
 */
router.get(
  '/',
  authenticate,
  userController.getAllUsers
);

/**
 * GET /api/users/:id
 * Get user by ID
 * Accessible by: admin only
 */
router.get(
  '/:id',
  authenticate,
  validateUserId,
  validate,
  userController.getUserById
);

/**
 * POST /api/users
 * Create new user
 * Accessible by: admin only
 */
router.post(
  '/',
  authenticate,
  validateCreateUser,
  validate,
  userController.createUser
);

/**
 * PUT /api/users/:id
 * Update user
 * Accessible by: admin only
 */
router.put(
  '/:id',
  authenticate,
  validateUpdateUser,
  validate,
  userController.updateUser
);

/**
 * DELETE /api/users/:id
 * Delete user (soft delete)
 * Accessible by: admin only
 */
router.delete(
  '/:id',
  authenticate,
  validateUserId,
  validate,
  userController.deleteUser
);

export default router;
