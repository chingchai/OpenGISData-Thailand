/**
 * Department Routes
 */

import express from 'express';
import { getAllDepartments, getDepartmentById } from '../services/department-service.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/departments
 * Get all active departments
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = getAllDepartments();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/departments/:id
 * Get department by ID
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const result = getDepartmentById(parseInt(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
