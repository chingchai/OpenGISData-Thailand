/**
 * User Service - Business Logic for User Management
 */

import { getDatabase, queryAll, queryOne, transaction } from '../config/database.js';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors.js';
import bcrypt from 'bcrypt';
import logger from '../utils/logger.js';

/**
 * Get all users
 * @param {Object} filters - Filter options
 * @returns {Object} - { data: users array }
 */
export function getAllUsers(filters = {}) {
  try {
    const { departmentId, role, active, page = 1, limit = 50 } = filters;

    let sql = `
      SELECT
        u.id, u.username, u.full_name, u.email, u.role,
        u.department_id, d.name as department_name,
        u.active, u.created_at, u.last_login
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (departmentId) {
      sql += ` AND u.department_id = ?`;
      params.push(departmentId);
    }

    if (role) {
      sql += ` AND u.role = ?`;
      params.push(role);
    }

    if (active !== undefined) {
      sql += ` AND u.active = ?`;
      params.push(active ? 1 : 0);
    }

    sql += ` ORDER BY u.created_at DESC`;

    // Apply pagination
    const offset = (page - 1) * limit;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const users = queryAll(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM users u WHERE 1=1`;
    const countParams = [];

    if (departmentId) {
      countSql += ` AND u.department_id = ?`;
      countParams.push(departmentId);
    }

    if (role) {
      countSql += ` AND u.role = ?`;
      countParams.push(role);
    }

    if (active !== undefined) {
      countSql += ` AND u.active = ?`;
      countParams.push(active ? 1 : 0);
    }

    const { total } = queryOne(countSql, countParams);

    logger.info('Users retrieved successfully', {
      count: users.length,
      total,
      filters
    });

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Error in getAllUsers service:', {
      error: error.message,
      stack: error.stack
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
  }
}

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Object} - { data: user object }
 */
export function getUserById(userId) {
  try {
    const user = queryOne(`
      SELECT
        u.id, u.username, u.full_name, u.email, u.role,
        u.department_id, d.name as department_name,
        u.active, u.created_at, u.last_login
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.id = ?
    `, [userId]);

    if (!user) {
      throw new NotFoundError('ไม่พบผู้ใช้ที่ต้องการ');
    }

    logger.info('User retrieved successfully', { userId });

    return { data: user };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error in getUserById service:', {
      error: error.message,
      userId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
  }
}

/**
 * Create new user
 * @param {Object} userData - User data
 * @param {number} creatorId - ID of user creating this user
 * @returns {Object} - { data: created user }
 */
export async function createUser(userData, creatorId) {
  try {
    const { username, password, fullName, email, role, departmentId, active = true } = userData;

    // Check if username already exists
    const existingUser = queryOne('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser) {
      throw new ValidationError('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const userId = transaction(() => {
      const db = getDatabase();
      const result = db.prepare(`
        INSERT INTO users (
          username, password, full_name, email, role,
          department_id, active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        username,
        hashedPassword,
        fullName,
        email || null,
        role,
        departmentId || null,
        active ? 1 : 0
      );

      // Log audit trail
      db.prepare(`
        INSERT INTO audit_log (
          user_id, action, entity_type, entity_id,
          new_values, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        creatorId,
        'CREATE',
        'users',
        result.lastInsertRowid,
        JSON.stringify({ username, fullName, role, departmentId }),
        '127.0.0.1'
      );

      return result.lastInsertRowid;
    });

    logger.info('User created successfully', {
      userId,
      username,
      role,
      creatorId
    });

    return getUserById(userId);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logger.error('Error in createUser service:', {
      error: error.message,
      stack: error.stack
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการสร้างผู้ใช้');
  }
}

/**
 * Update user
 * @param {number} userId - User ID
 * @param {Object} updateData - Data to update
 * @param {number} updaterId - ID of user making the update
 * @returns {Object} - { data: updated user }
 */
export async function updateUser(userId, updateData, updaterId) {
  try {
    // Get current user
    const currentUser = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
    if (!currentUser) {
      throw new NotFoundError('ไม่พบผู้ใช้ที่ต้องการแก้ไข');
    }

    const allowedFields = ['full_name', 'email', 'role', 'department_id', 'active'];
    const fieldMapping = {
      fullName: 'full_name',
      email: 'email',
      role: 'role',
      departmentId: 'department_id',
      active: 'active'
    };

    const updates = [];
    const params = [];
    const changeLog = {};

    Object.keys(updateData).forEach(key => {
      const dbField = fieldMapping[key] || key;
      if (allowedFields.includes(dbField) && updateData[key] !== undefined) {
        updates.push(`${dbField} = ?`);
        params.push(updateData[key]);
        changeLog[dbField] = {
          from: currentUser[dbField],
          to: updateData[key]
        };
      }
    });

    // Handle password update separately
    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
      changeLog.password = { changed: true };
    }

    if (updates.length === 0) {
      throw new ValidationError('ไม่มีข้อมูลที่ต้องการแก้ไข');
    }

    updates.push('updated_at = datetime(\'now\')');
    params.push(userId);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    transaction(() => {
      const db = getDatabase();
      const result = db.prepare(sql).run(...params);

      if (result.changes === 0) {
        throw new NotFoundError('ไม่พบผู้ใช้ที่ต้องการแก้ไข');
      }

      // Log audit trail
      db.prepare(`
        INSERT INTO audit_log (
          user_id, action, entity_type, entity_id,
          new_values, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        updaterId,
        'UPDATE',
        'users',
        userId,
        JSON.stringify(changeLog),
        '127.0.0.1'
      );
    });

    logger.info('User updated successfully', {
      userId,
      updaterId,
      updatedFields: Object.keys(changeLog)
    });

    return getUserById(userId);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    logger.error('Error in updateUser service:', {
      error: error.message,
      userId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการแก้ไขผู้ใช้');
  }
}

/**
 * Delete user (soft delete by setting active = false)
 * @param {number} userId - User ID
 * @param {number} deleterId - ID of user performing the delete
 * @returns {Object} - { success: true }
 */
export function deleteUser(userId, deleterId) {
  try {
    const user = queryOne('SELECT id, username FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw new NotFoundError('ไม่พบผู้ใช้ที่ต้องการลบ');
    }

    // Prevent deleting yourself
    if (userId === deleterId) {
      throw new ValidationError('ไม่สามารถลบบัญชีของตัวเองได้');
    }

    transaction(() => {
      const db = getDatabase();

      // Soft delete - set active = false
      db.prepare('UPDATE users SET active = 0, updated_at = datetime(\'now\') WHERE id = ?')
        .run(userId);

      // Log audit trail
      db.prepare(`
        INSERT INTO audit_log (
          user_id, action, entity_type, entity_id,
          old_values, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        deleterId,
        'DELETE',
        'users',
        userId,
        JSON.stringify({ username: user.username }),
        '127.0.0.1'
      );
    });

    logger.info('User deleted successfully', {
      userId,
      deleterId
    });

    return { success: true, message: 'ลบผู้ใช้สำเร็จ' };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    logger.error('Error in deleteUser service:', {
      error: error.message,
      userId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการลบผู้ใช้');
  }
}

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
