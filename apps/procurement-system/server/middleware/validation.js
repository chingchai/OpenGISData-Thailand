import { validationResult, body, param, query } from 'express-validator';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
};

/**
 * Validation rules for login
 */
export const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

  body('role')
    .notEmpty().withMessage('User type is required')
    .isIn(['staff', 'admin', 'executive']).withMessage('Invalid user type'),

  body('departmentId')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid department ID'),

  handleValidationErrors
];

/**
 * Validation rules for creating project
 */
export const validateCreateProject = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 5, max: 200 }).withMessage('Project name must be between 5 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),

  body('departmentId')
    .notEmpty().withMessage('Department is required')
    .isInt({ min: 1 }).withMessage('Invalid department ID'),

  body('procurementMethod')
    .notEmpty().withMessage('Procurement method is required')
    .isIn(['public_invitation', 'selection', 'specific']).withMessage('Invalid procurement method'),

  body('budget')
    .notEmpty().withMessage('Budget is required')
    .isFloat({ min: 1 }).withMessage('Budget must be greater than 0'),

  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid date format (use YYYY-MM-DD)'),

  body('expectedEndDate')
    .optional()
    .isISO8601().withMessage('Invalid date format (use YYYY-MM-DD)'),

  body('urgencyLevel')
    .optional()
    .isIn(['normal', 'urgent', 'critical']).withMessage('Invalid urgency level'),

  body('contractorType')
    .optional()
    .isIn(['goods', 'services', 'construction']).withMessage('Invalid contractor type'),

  handleValidationErrors
];

/**
 * Validation rules for updating project
 */
export const validateUpdateProject = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid project ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Project name must be between 5 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),

  body('budget')
    .optional()
    .isFloat({ min: 1 }).withMessage('Budget must be greater than 0'),

  body('startDate')
    .optional()
    .isISO8601().withMessage('Invalid date format (use YYYY-MM-DD)'),

  body('urgencyLevel')
    .optional()
    .isIn(['normal', 'urgent', 'critical']).withMessage('Invalid urgency level'),

  handleValidationErrors
];

/**
 * Validation rules for updating step
 */
export const validateUpdateStep = [
  param('id').isInt({ min: 1 }).withMessage('Invalid project ID'),
  param('stepId').isInt({ min: 1 }).withMessage('Invalid step ID'),

  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'delayed', 'cancelled'])
    .withMessage('Invalid status'),

  body('actualStartDate')
    .optional()
    .isISO8601().withMessage('Invalid date format (use YYYY-MM-DD)'),

  body('actualEndDate')
    .optional()
    .isISO8601().withMessage('Invalid date format (use YYYY-MM-DD)'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),

  handleValidationErrors
];

/**
 * Validation rules for adding comment
 */
export const validateAddComment = [
  param('id').isInt({ min: 1 }).withMessage('Invalid project ID'),

  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .isLength({ min: 1, max: 2000 }).withMessage('Comment must be between 1 and 2000 characters'),

  body('type')
    .optional()
    .isIn(['general', 'approval', 'concern', 'suggestion', 'question', 'instruction'])
    .withMessage('Invalid comment type'),

  body('priority')
    .optional()
    .isIn(['normal', 'high', 'urgent'])
    .withMessage('Invalid priority'),

  body('visibility')
    .optional()
    .isIn(['public', 'department', 'management'])
    .withMessage('Invalid visibility'),

  handleValidationErrors
];

/**
 * Validation rules for pagination
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  handleValidationErrors
];

/**
 * Validation rules for ID parameter
 */
export const validateId = [
  param('id').isInt({ min: 1 }).withMessage('Invalid ID'),
  handleValidationErrors
];

export default {
  handleValidationErrors,
  validateLogin,
  validateCreateProject,
  validateUpdateProject,
  validateUpdateStep,
  validateAddComment,
  validatePagination,
  validateId
};
