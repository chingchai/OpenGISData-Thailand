/**
 * Project Routes
 * API endpoints for project management
 */

import express from 'express';
import * as projectController from '../controllers/project-controller.js';
import * as stepController from '../controllers/step-controller.js';
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
 * Validation rules for creating a project
 */
const validateCreateProject = [
  body('name')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Project name must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('departmentId')
    .isInt({ min: 1, max: 7 })
    .withMessage('Department ID must be between 1 and 7'),
  body('procurementMethod')
    .isIn(['public_invitation', 'selection', 'specific'])
    .withMessage('Invalid procurement method'),
  body('budgetAmount')
    .isFloat({ min: 1, max: 50000000 })
    .withMessage('Budget amount must be between 1 and 50,000,000'),
  body('budgetYear')
    .isInt({ min: 2020, max: 2100 })
    .withMessage('Budget year must be a valid year'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date in ISO format (YYYY-MM-DD)')
];

/**
 * Validation rules for updating a project
 */
const validateUpdateProject = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Project name must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('budgetAmount')
    .optional()
    .isFloat({ min: 1, max: 50000000 })
    .withMessage('Budget amount must be between 1 and 50,000,000'),
  body('status')
    .optional()
    .isIn(['draft', 'in_progress', 'completed', 'cancelled', 'on_hold'])
    .withMessage('Invalid status'),
  body('actualStartDate')
    .optional()
    .isISO8601()
    .withMessage('Actual start date must be a valid date'),
  body('actualEndDate')
    .optional()
    .isISO8601()
    .withMessage('Actual end date must be a valid date'),
  body('winnerVendor')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Winner vendor name must not exceed 200 characters'),
  body('contractNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contract number must not exceed 100 characters'),
  body('contractDate')
    .optional()
    .isISO8601()
    .withMessage('Contract date must be a valid date'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must not exceed 500 characters')
];

/**
 * Validation rules for getting projects
 */
const validateGetProjects = [
  query('departmentId')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Department ID must be between 1 and 7'),
  query('status')
    .optional()
    .isIn(['draft', 'in_progress', 'completed', 'cancelled', 'on_hold'])
    .withMessage('Invalid status'),
  query('budgetYear')
    .optional()
    .isInt({ min: 2020, max: 2100 })
    .withMessage('Budget year must be a valid year'),
  query('procurementMethod')
    .optional()
    .isIn(['public_invitation', 'selection', 'specific'])
    .withMessage('Invalid procurement method'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

/**
 * Validation rules for project ID parameter
 */
const validateProjectId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer')
];

// ==========================================
// Routes
// ==========================================

/**
 * GET /api/projects/stats
 * Get project statistics
 * Accessible by: all authenticated users
 */
router.get(
  '/stats',
  authenticate,
  projectController.getProjectStatistics
);

/**
 * GET /api/projects
 * Get all projects with filtering and pagination
 * Accessible by: all authenticated users (filtered by role/department)
 */
router.get(
  '/',
  authenticate,
  validateGetProjects,
  validate,
  projectController.getAllProjects
);

/**
 * GET /api/projects/:id
 * Get project by ID
 * Accessible by: all authenticated users (filtered by role/department)
 */
router.get(
  '/:id',
  authenticate,
  validateProjectId,
  validate,
  projectController.getProjectById
);

/**
 * POST /api/projects
 * Create new project
 * Accessible by: staff (own dept only), admin (all depts)
 */
router.post(
  '/',
  authenticate,
  validateCreateProject,
  validate,
  projectController.createProject
);

/**
 * PUT /api/projects/:id
 * Update project
 * Accessible by: staff (own dept only), admin (all depts)
 */
router.put(
  '/:id',
  authenticate,
  validateUpdateProject,
  validate,
  projectController.updateProject
);

/**
 * DELETE /api/projects/:id
 * Delete project (soft delete)
 * Accessible by: staff (own dept only), admin (all depts)
 */
router.delete(
  '/:id',
  authenticate,
  validateProjectId,
  validate,
  projectController.deleteProject
);

// ==========================================
// Nested Step Routes
// ==========================================

/**
 * Validation rules for project ID in nested routes
 */
const validateProjectIdParam = [
  param('projectId')
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer')
];

/**
 * GET /api/projects/:projectId/steps
 * Get all steps for a specific project
 * Accessible by: all authenticated users (filtered by role/department)
 */
router.get(
  '/:projectId/steps',
  authenticate,
  validateProjectIdParam,
  validate,
  stepController.getStepsByProject
);

/**
 * GET /api/projects/:projectId/steps/progress
 * Get step progress summary for a project
 * Accessible by: all authenticated users (filtered by role/department)
 */
router.get(
  '/:projectId/steps/progress',
  authenticate,
  validateProjectIdParam,
  validate,
  stepController.getStepProgress
);

export default router;
