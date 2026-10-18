/**
 * Notifications Routes
 * API สำหรับการแจ้งเตือน
 */

import express from 'express';
import * as notificationService from '../services/notification-service.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/notifications
 * ดึงการแจ้งเตือนของผู้ใช้
 */
router.get(
  '/',
  authenticate,
  async (req, res) => {
    try {
      const { limit, unreadOnly } = req.query;

      const result = await notificationService.getUserNotifications(
        req.user.id,
        {
          limit: limit ? parseInt(limit) : 20,
          unreadOnly: unreadOnly === 'true'
        }
      );

      res.json({
        success: true,
        data: result.data,
        unreadCount: result.unreadCount
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({
        success: false,
        error: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
      });
    }
  }
);

/**
 * PUT /api/notifications/:id/read
 * ทำเครื่องหมายอ่านแล้ว
 */
router.put(
  '/:id/read',
  authenticate,
  async (req, res) => {
    try {
      const { id } = req.params;

      await notificationService.markAsRead(id, req.user.id);

      res.json({
        success: true,
        message: 'ทำเครื่องหมายอ่านแล้ว'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        error: 'เกิดข้อผิดพลาดในการอัพเดท'
      });
    }
  }
);

/**
 * PUT /api/notifications/read-all
 * ทำเครื่องหมายอ่านทั้งหมด
 */
router.put(
  '/read-all',
  authenticate,
  async (req, res) => {
    try {
      await notificationService.markAllAsRead(req.user.id);

      res.json({
        success: true,
        message: 'ทำเครื่องหมายอ่านทั้งหมดแล้ว'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        error: 'เกิดข้อผิดพลาดในการอัพเดท'
      });
    }
  }
);

export default router;
