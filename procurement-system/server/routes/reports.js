/**
 * Report Routes
 * API endpoints for report generation and export
 */

import express from 'express';
import * as reportController from '../controllers/report-controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All report routes require authentication
router.use(authenticate);

/**
 * POST /api/reports/export/detailed/csv
 * Export detailed report as CSV
 * Body: { month, year, departmentId, status, procurementMethod }
 */
router.post('/export/detailed/csv', reportController.exportDetailedCSV);

/**
 * POST /api/reports/export/detailed/pdf
 * Export detailed report as PDF
 * Body: { month, year, departmentId, status, procurementMethod }
 */
router.post('/export/detailed/pdf', reportController.exportDetailedPDF);

/**
 * POST /api/reports/export/executive/csv
 * Export executive summary as CSV
 * Body: { month, year, departmentId, status, procurementMethod }
 */
router.post('/export/executive/csv', reportController.exportExecutiveCSV);

/**
 * POST /api/reports/export/executive/pdf
 * Export executive summary as PDF
 * Body: { month, year, departmentId, status, procurementMethod }
 */
router.post('/export/executive/pdf', reportController.exportExecutivePDF);

export default router;
