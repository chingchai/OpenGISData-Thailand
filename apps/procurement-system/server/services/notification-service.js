/**
 * Notification Service
 * จัดการการแจ้งเตือนในระบบกำกับติดตามความก้าวหน้าโครงการ
 */

import { query, queryOne, execute } from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * สร้างการแจ้งเตือนใหม่
 */
export function createNotification(notificationData) {
  try {
    const { userId, type, title, message, link, relatedId } = notificationData;

    const result = execute(`
      INSERT INTO notifications (
        user_id, type, title, message, link, related_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `, [userId, type, title, message, link || null, relatedId || null]);

    logger.info('Notification created', {
      notificationId: result.lastInsertRowid,
      userId,
      type
    });

    return { data: { id: result.lastInsertRowid } };
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * ดึงการแจ้งเตือนของผู้ใช้
 */
export function getUserNotifications(userId, options = {}) {
  try {
    const { limit = 20, unreadOnly = false } = options;

    let sql = `
      SELECT * FROM notifications
      WHERE user_id = ?
    `;

    const params = [userId];

    if (unreadOnly) {
      sql += ' AND is_read = 0';
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const notifications = query(sql, params);

    // นับจำนวนที่ยังไม่อ่าน
    const unreadCount = queryOne(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    return {
      data: notifications,
      unreadCount: unreadCount ? unreadCount.count : 0
    };
  } catch (error) {
    logger.error('Error getting notifications:', error);
    throw error;
  }
}

/**
 * ทำเครื่องหมายอ่านแล้ว
 */
export function markAsRead(notificationId, userId) {
  try {
    execute(`
      UPDATE notifications
      SET is_read = 1, read_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `, [notificationId, userId]);

    return { data: { success: true } };
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * ทำเครื่องหมายอ่านทั้งหมด
 */
export function markAllAsRead(userId) {
  try {
    execute(`
      UPDATE notifications
      SET is_read = 1, read_at = datetime('now')
      WHERE user_id = ? AND is_read = 0
    `, [userId]);

    return { data: { success: true } };
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    throw error;
  }
}

export default {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead
};
