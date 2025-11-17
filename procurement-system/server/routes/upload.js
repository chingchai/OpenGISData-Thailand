/**
 * Upload Routes
 * API endpoints for file uploads
 */

import express from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/uploadController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only Excel files
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];

    if (allowedMimes.includes(file.mimetype) ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('อนุญาตเฉพาะไฟล์ Excel (.xlsx, .xls) เท่านั้น'), false);
    }
  }
});

/**
 * POST /api/upload/excel
 * Upload and parse Excel file
 * Admin only
 */
router.post(
  '/excel',
  authenticate,
  requireAdmin,
  upload.single('file'),
  uploadController.uploadExcel
);

/**
 * POST /api/upload/import-projects
 * Import parsed projects into database
 * Admin only
 */
router.post(
  '/import-projects',
  authenticate,
  requireAdmin,
  uploadController.importProjects
);

/**
 * GET /api/upload/template
 * Download Excel template (instructions)
 * Admin only
 */
router.get(
  '/template',
  authenticate,
  requireAdmin,
  uploadController.downloadTemplate
);

export default router;
