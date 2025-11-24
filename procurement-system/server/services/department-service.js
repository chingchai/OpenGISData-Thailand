/**
 * Department Service - Business Logic for Department Management
 */

import { query, queryOne } from '../config/database.js';
import { NotFoundError, DatabaseError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Get all active departments
 * @returns {Object} - { data: departments array }
 */
export function getAllDepartments() {
  try {
    const departments = query(`
      SELECT id, code, name, name_en, description
      FROM departments
      WHERE active = 1
      ORDER BY code ASC
    `);

    logger.info('Departments retrieved successfully', {
      count: departments.length
    });

    return { data: departments };
  } catch (error) {
    logger.error('Error in getAllDepartments service:', {
      error: error.message,
      stack: error.stack
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการดึงข้อมูลหน่วยงาน');
  }
}

/**
 * Get department by ID
 * @param {number} deptId - Department ID
 * @returns {Object} - { data: department object }
 */
export function getDepartmentById(deptId) {
  try {
    const department = queryOne(`
      SELECT id, code, name, name_en, description
      FROM departments
      WHERE id = ? AND active = 1
    `, [deptId]);

    if (!department) {
      throw new NotFoundError('ไม่พบหน่วยงานที่ต้องการ');
    }

    logger.info('Department retrieved successfully', { deptId });

    return { data: department };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error in getDepartmentById service:', {
      error: error.message,
      deptId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการดึงข้อมูลหน่วยงาน');
  }
}

export default {
  getAllDepartments,
  getDepartmentById
};
