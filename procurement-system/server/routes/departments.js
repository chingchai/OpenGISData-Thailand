/**
 * Department Routes
 */

import express from 'express';
import { getAllDepartments, getDepartmentById } from '../services/department-service.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/departments
 * Get all active departments
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const result = getAllDepartments();
  res.json(result);
}));

/**
 * GET /api/departments/:id
 * Get department by ID
 */
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const result = getDepartmentById(parseInt(req.params.id));
  res.json(result);
}));

export default router;
