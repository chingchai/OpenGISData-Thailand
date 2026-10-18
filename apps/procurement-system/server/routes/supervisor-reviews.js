/**
 * Supervisor Reviews Routes
 * API สำหรับการตรวจสอบโครงการจากผู้บริหาร
 */

import express from 'express';
import * as reviewService from '../services/supervisor-review-service.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/supervisor-reviews
 * สร้างข้อความตรวจสอบจากผู้บริหาร
 * Executive only
 */
router.post(
  '/',
  authenticate,
  requireRole(['executive', 'admin']),
  async (req, res) => {
    try {
      const { projectId, reviewType, message, priority } = req.body;

      // Validation
      if (!projectId || !reviewType || !message) {
        return res.status(400).json({
          success: false,
          error: 'กรุณาระบุ projectId, reviewType และ message'
        });
      }

      const result = await reviewService.createReview(
        { projectId, reviewType, message, priority },
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: result.data,
        message: 'ส่งข้อความตรวจสอบเรียบร้อยแล้ว'
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการส่งข้อความตรวจสอบ'
      });
    }
  }
);

/**
 * GET /api/supervisor-reviews/project/:projectId
 * ดึงข้อความตรวจสอบของโครงการ
 */
router.get(
  '/project/:projectId',
  authenticate,
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const result = await reviewService.getProjectReviews(projectId);

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Error getting project reviews:', error);
      res.status(500).json({
        success: false,
        error: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
      });
    }
  }
);

/**
 * GET /api/supervisor-reviews/report
 * รายงานการตรวจสอบทั้งหมด
 * Executive and Admin only
 */
router.get(
  '/report',
  authenticate,
  requireRole(['executive', 'admin']),
  async (req, res) => {
    try {
      const { supervisorId, projectId, reviewType, priority, startDate, endDate, limit } = req.query;

      const result = await reviewService.getReviewsReport({
        supervisorId,
        projectId,
        reviewType,
        priority,
        startDate,
        endDate,
        limit: limit ? parseInt(limit) : 100
      });

      res.json({
        success: true,
        data: result.data,
        stats: result.stats
      });
    } catch (error) {
      console.error('Error getting reviews report:', error);
      res.status(500).json({
        success: false,
        error: 'เกิดข้อผิดพลาดในการสร้างรายงาน'
      });
    }
  }
);

export default router;
