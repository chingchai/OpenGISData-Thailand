/**
 * Step Routes
 * API endpoints for project step management
 */

import express from 'express';
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
 * Validation rules for project ID parameter
 */
const validateProjectId = [
  param('projectId')
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer')
];

/**
 * Validation rules for step ID parameter
 */
const validateStepId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Step ID must be a positive integer')
];

/**
 * Validation rules for updating step status
 */
const validateUpdateStatus = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Step ID must be a positive integer'),
  body('status')
    .isIn(['pending', 'in_progress', 'completed', 'on_hold'])
    .withMessage('Status must be one of: pending, in_progress, completed, on_hold')
];

/**
 * Validation rules for updating step details
 */
const validateUpdateStep = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Step ID must be a positive integer'),
  body('stepName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Step name must be between 3 and 200 characters'),
  body('stepDescription')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Step description must not exceed 1000 characters'),
  body('plannedStartDate')
    .optional()
    .isISO8601()
    .withMessage('Planned start date must be a valid date in ISO format'),
  body('plannedEndDate')
    .optional()
    .isISO8601()
    .withMessage('Planned end date must be a valid date in ISO format'),
  body('slaDays')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('SLA days must be between 1 and 365'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

/**
 * Validation rules for overdue steps query
 */
const validateOverdueQuery = [
  query('departmentId')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Department ID must be between 1 and 7')
];

// ==========================================
// Routes
// ==========================================

/**
 * GET /api/steps/overdue
 * Get overdue steps across all projects
 * Accessible by: all authenticated users (filtered by role/department)
 */
router.get(
  '/overdue',
  authenticate,
  validateOverdueQuery,
  validate,
  stepController.getOverdueSteps
);

/**
 * GET /api/projects/:projectId/steps
 * Get all steps for a specific project
 * Accessible by: all authenticated users (filtered by role/department)
 */
router.get(
  '/projects/:projectId/steps',
  authenticate,
  validateProjectId,
  validate,
  stepController.getStepsByProject
);

/**
 * GET /api/projects/:projectId/steps/progress
 * Get step progress summary for a project
 * Accessible by: all authenticated users (filtered by role/department)
 */
router.get(
  '/projects/:projectId/steps/progress',
  authenticate,
  validateProjectId,
  validate,
  stepController.getStepProgress
);

/**
 * GET /api/steps/:id
 * Get step by ID
 * Accessible by: all authenticated users (filtered by role/department)
 */
router.get(
  '/:id',
  authenticate,
  validateStepId,
  validate,
  stepController.getStepById
);

/**
 * GET /api/steps/:id/delay
 * Calculate step delay information
 * Accessible by: all authenticated users (filtered by role/department)
 */
router.get(
  '/:id/delay',
  authenticate,
  validateStepId,
  validate,
  stepController.calculateStepDelay
);

/**
 * PATCH /api/steps/:id/status
 * Update step status
 * Accessible by: staff (own dept only), admin (all depts)
 */
router.patch(
  '/:id/status',
  authenticate,
  validateUpdateStatus,
  validate,
  stepController.updateStepStatus
);

/**
 * PUT /api/steps/:id
 * Update step details
 * Accessible by: staff (own dept only), admin (all depts)
 */
router.put(
  '/:id',
  authenticate,
  validateUpdateStep,
  validate,
  stepController.updateStep
);

export default router;
