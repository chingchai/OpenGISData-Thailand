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

// Configure multer for image uploads
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per image
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('อนุญาตเฉพาะไฟล์รูปภาพ (.jpg, .jpeg, .png, .gif, .webp) เท่านั้น'), false);
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

// Configure multer for document uploads
const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per document
  },
  fileFilter: (req, file, cb) => {
    // Accept documents
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed'
    ];

    if (allowedMimes.includes(file.mimetype) ||
        file.originalname.match(/\.(pdf|doc|docx|xls|xlsx|txt|zip)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('อนุญาตเฉพาะไฟล์เอกสาร (.pdf, .doc, .docx, .xls, .xlsx, .txt, .zip) เท่านั้น'), false);
    }
  }
});

/**
 * POST /api/upload/images
 * Upload multiple images and return base64 encoded data URLs
 * Authenticated users only
 */
router.post(
  '/images',
  authenticate,
  uploadImage.array('images', 10), // Max 10 images
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'ไม่พบไฟล์รูปภาพที่อัพโหลด'
        });
      }

      // Convert images to base64 data URLs
      const imageUrls = req.files.map(file => {
        const base64 = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64}`;
        return dataUrl;
      });

      res.json({
        success: true,
        data: {
          imageUrls,
          count: imageUrls.length
        },
        message: `อัพโหลดรูปภาพสำเร็จ ${imageUrls.length} ไฟล์`
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({
        success: false,
        error: 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ'
      });
    }
  }
);

/**
 * POST /api/upload/documents
 * Upload multiple documents and return base64 encoded data URLs
 * Authenticated users only
 */
router.post(
  '/documents',
  authenticate,
  uploadDocument.array('documents', 10), // Max 10 documents
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'ไม่พบไฟล์เอกสารที่อัพโหลด'
        });
      }

      // Convert documents to base64 data URLs with metadata
      const documentUrls = req.files.map(file => {
        const base64 = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64}`;
        return {
          url: dataUrl,
          name: file.originalname,
          size: file.size,
          type: file.mimetype
        };
      });

      res.json({
        success: true,
        data: {
          documentUrls,
          count: documentUrls.length
        },
        message: `อัพโหลดเอกสารสำเร็จ ${documentUrls.length} ไฟล์`
      });
    } catch (error) {
      console.error('Error uploading documents:', error);
      res.status(500).json({
        success: false,
        error: 'เกิดข้อผิดพลาดในการอัพโหลดเอกสาร'
      });
    }
  }
);

export default router;
