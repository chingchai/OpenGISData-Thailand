/**
 * Upload Routes
 * API endpoints for file uploads
 */

import express from 'express';
import multer from 'multer';
import * as uploadController from '../controllers/uploadController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for Excel uploads
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

// Configure multer for image and document uploads
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Accept images and documents
    const allowedMimes = [
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      // PDF
      'application/pdf',
      // Word documents
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Excel documents
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));

    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพและเอกสาร (.jpg, .jpeg, .png, .gif, .webp, .pdf, .doc, .docx, .xls, .xlsx) เท่านั้น'), false);
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

/**
 * POST /api/upload/images
 * Upload multiple images and documents and return base64 encoded data URLs
 * Supports: Images (jpg, png, gif, webp), PDF, Word (doc, docx), Excel (xls, xlsx)
 * Authenticated users only
 */
router.post(
  '/images',
  authenticate,
  uploadImage.array('images', 10), // Max 10 files
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'ไม่พบไฟล์ที่อัพโหลด'
        });
      }

      // Convert files to base64 data URLs with metadata
      const imageUrls = req.files.map(file => {
        const base64 = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64}`;
        return {
          url: dataUrl,
          name: file.originalname,
          type: file.mimetype,
          size: file.size
        };
      });

      res.json({
        success: true,
        data: {
          imageUrls: imageUrls.map(f => f.url), // For backward compatibility
          files: imageUrls, // New detailed format
          count: imageUrls.length
        },
        message: `อัพโหลดไฟล์สำเร็จ ${imageUrls.length} ไฟล์`
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({
        success: false,
        error: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์'
      });
    }
  }
);

export default router;
