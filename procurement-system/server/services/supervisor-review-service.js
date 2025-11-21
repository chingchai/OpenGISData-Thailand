/**
 * Supervisor Review Service
 * จัดการการตรวจสอบโครงการจากผู้บริหาร
 */

import { query, queryOne, execute, transaction, getDatabase } from '../config/database.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import { createNotification } from './notification-service.js';

/**
 * สร้างข้อความตรวจสอบจากผู้บริหาร
 */
export function createReview(reviewData, supervisorId) {
  try {
    const { projectId, reviewType, message, priority } = reviewData;

    // ตรวจสอบว่าโครงการมีอยู่จริง
    const project = queryOne(
      'SELECT id, name, created_by FROM projects WHERE id = ? AND deleted_at IS NULL',
      [projectId]
    );

    if (!project) {
      throw new NotFoundError('ไม่พบโครงการที่ต้องการตรวจสอบ');
    }

    // ใช้ transaction เพื่อสร้าง review และ notification พร้อมกัน
    const reviewId = transaction(() => {
      const db = getDatabase();

      // 1. สร้าง supervisor review
      const result = db.prepare(`
        INSERT INTO supervisor_reviews (
          project_id, supervisor_id, review_type, message, priority, created_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).run(projectId, supervisorId, reviewType, message, priority || 'normal');

      const newReviewId = result.lastInsertRowid;

      // 2. สร้างการแจ้งเตือนให้ผู้รับผิดชอบโครงการ
      const reviewTypeText = {
        feedback: 'ข้อเสนอแนะ',
        concern: 'ข้อกังวล',
        approval: 'การอนุมัติ',
        question: 'คำถาม'
      };

      const notificationTitle = `${reviewTypeText[reviewType] || 'ข้อความ'}จากผู้บริหาร: ${project.name}`;
      const notificationMessage = message.length > 100
        ? message.substring(0, 100) + '...'
        : message;

      db.prepare(`
        INSERT INTO notifications (
          user_id, type, title, message, link, related_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        project.created_by,
        'supervisor_review',
        notificationTitle,
        notificationMessage,
        `/projects/${projectId}`,
        newReviewId
      );

      logger.info('Supervisor review created', {
        reviewId: newReviewId,
        projectId,
        supervisorId,
        reviewType,
        priority
      });

      return newReviewId;
    });

    return getReviewById(reviewId);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    logger.error('Error creating supervisor review:', error);
    throw error;
  }
}

/**
 * ดึงข้อความตรวจสอบตาม ID
 */
export function getReviewById(reviewId) {
  try {
    const review = queryOne(`
      SELECT
        sr.*,
        u.full_name as supervisor_name,
        u.role as supervisor_role,
        p.name as project_name,
        p.project_code
      FROM supervisor_reviews sr
      LEFT JOIN users u ON sr.supervisor_id = u.id
      LEFT JOIN projects p ON sr.project_id = p.id
      WHERE sr.id = ?
    `, [reviewId]);

    if (!review) {
      throw new NotFoundError('ไม่พบข้อความตรวจสอบ');
    }

    return { data: review };
  } catch (error) {
    logger.error('Error getting review:', error);
    throw error;
  }
}

/**
 * ดึงข้อความตรวจสอบของโครงการ
 */
export function getProjectReviews(projectId) {
  try {
    const reviews = query(`
      SELECT
        sr.*,
        u.full_name as supervisor_name,
        u.role as supervisor_role
      FROM supervisor_reviews sr
      LEFT JOIN users u ON sr.supervisor_id = u.id
      WHERE sr.project_id = ?
      ORDER BY sr.created_at DESC
    `, [projectId]);

    return { data: reviews };
  } catch (error) {
    logger.error('Error getting project reviews:', error);
    throw error;
  }
}

/**
 * ดึงรายงานการตรวจสอบทั้งหมด (สำหรับผู้บริหาร)
 */
export function getReviewsReport(filters = {}) {
  try {
    const { supervisorId, projectId, reviewType, priority, startDate, endDate, limit = 100 } = filters;

    let sql = `
      SELECT
        sr.*,
        u.full_name as supervisor_name,
        p.name as project_name,
        p.project_code,
        p.department_id,
        d.name as department_name,
        creator.full_name as project_owner_name
      FROM supervisor_reviews sr
      LEFT JOIN users u ON sr.supervisor_id = u.id
      LEFT JOIN projects p ON sr.project_id = p.id
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN users creator ON p.created_by = creator.id
      WHERE 1=1
    `;

    const params = [];

    if (supervisorId) {
      sql += ' AND sr.supervisor_id = ?';
      params.push(supervisorId);
    }

    if (projectId) {
      sql += ' AND sr.project_id = ?';
      params.push(projectId);
    }

    if (reviewType) {
      sql += ' AND sr.review_type = ?';
      params.push(reviewType);
    }

    if (priority) {
      sql += ' AND sr.priority = ?';
      params.push(priority);
    }

    if (startDate) {
      sql += ' AND date(sr.created_at) >= date(?)';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND date(sr.created_at) <= date(?)';
      params.push(endDate);
    }

    sql += ' ORDER BY sr.created_at DESC LIMIT ?';
    params.push(limit);

    const reviews = query(sql, params);

    // สถิติเพิ่มเติม
    const stats = queryOne(`
      SELECT
        COUNT(*) as total_reviews,
        SUM(CASE WHEN review_type = 'feedback' THEN 1 ELSE 0 END) as feedback_count,
        SUM(CASE WHEN review_type = 'concern' THEN 1 ELSE 0 END) as concern_count,
        SUM(CASE WHEN review_type = 'approval' THEN 1 ELSE 0 END) as approval_count,
        SUM(CASE WHEN review_type = 'question' THEN 1 ELSE 0 END) as question_count,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_count,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_count
      FROM supervisor_reviews sr
      WHERE 1=1
      ${supervisorId ? 'AND sr.supervisor_id = ?' : ''}
      ${projectId ? 'AND sr.project_id = ?' : ''}
      ${startDate ? 'AND date(sr.created_at) >= date(?)' : ''}
      ${endDate ? 'AND date(sr.created_at) <= date(?)' : ''}
    `, params.filter((_, i) => {
      // กรอง params ให้ตรงกับ query stats
      if (supervisorId && i === params.indexOf(supervisorId)) return true;
      if (projectId && i === params.indexOf(projectId)) return true;
      if (startDate && i === params.indexOf(startDate)) return true;
      if (endDate && i === params.indexOf(endDate)) return true;
      return false;
    }));

    return {
      data: reviews,
      stats: stats || {
        total_reviews: 0,
        feedback_count: 0,
        concern_count: 0,
        approval_count: 0,
        question_count: 0,
        urgent_count: 0,
        high_count: 0
      }
    };
  } catch (error) {
    logger.error('Error getting reviews report:', error);
    throw error;
  }
}

export default {
  createReview,
  getReviewById,
  getProjectReviews,
  getReviewsReport
};
