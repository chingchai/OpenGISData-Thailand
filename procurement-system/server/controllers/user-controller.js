/**
 * User Controller - HTTP Request Handlers
 * Handles incoming requests and responses for user management
 */

import userService from '../services/user-service.js';
import { asyncHandler } from '../utils/errors.js';
import {
  sendSuccess,
  sendPaginated,
  sendCreated,
  sendValidationError,
  sendForbidden
} from '../utils/responses.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { sanitizeInt, sanitizeEnum } from '../utils/sanitize.js';
import logger from '../utils/logger.js';

/**
 * Get all users
 * GET /api/users
 * Query params: departmentId, role, active, page, limit
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { departmentId, role, active, page, limit } = req.query;
  const user = req.user;

  // Only admins can view all users
  if (user.role !== 'admin') {
    throw new ForbiddenError('ไม่มีสิทธิ์เข้าถึงข้อมูลผู้ใช้');
  }

  // Sanitize query parameters
  const filters = {
    page: sanitizeInt(page, { min: 1, default: 1 }),
    limit: sanitizeInt(limit, { min: 1, max: 100, default: 50 })
  };

  if (departmentId) {
    filters.departmentId = sanitizeInt(departmentId, { min: 1, max: 7 });
  }

  if (role) {
    filters.role = sanitizeEnum(role, ['staff', 'admin', 'executive']);
  }

  if (active !== undefined) {
    filters.active = active === 'true' || active === '1';
  }

  // Get users
  const result = await userService.getAllUsers(filters);

  logger.apiRequest(req, res, Date.now() - req.startTime);

  sendPaginated(res, result, 'ดึงข้อมูลผู้ใช้สำเร็จ');
});

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  // Only admins can view user details
  if (user.role !== 'admin') {
    throw new ForbiddenError('ไม่มีสิทธิ์เข้าถึงข้อมูลผู้ใช้');
  }

  const userId = sanitizeInt(id, { min: 1 });
  if (!userId) {
    throw new ValidationError('รหัสผู้ใช้ไม่ถูกต้อง');
  }

  const result = await userService.getUserById(userId);

  logger.apiRequest(req, res, Date.now() - req.startTime);

  sendSuccess(res, result.data, 'ดึงข้อมูลผู้ใช้สำเร็จ');
});

/**
 * Create new user
 * POST /api/users
 * Body: { username, password, fullName, email, role, departmentId, active }
 */
export const createUser = asyncHandler(async (req, res) => {
  const user = req.user;
  const userData = req.body;

  // Only admins can create users
  if (user.role !== 'admin') {
    throw new ForbiddenError('ไม่มีสิทธิ์สร้างผู้ใช้');
  }

  // Validate required fields
  const requiredFields = ['username', 'password', 'fullName', 'role'];
  const missingFields = requiredFields.filter(field => !userData[field]);

  if (missingFields.length > 0) {
    throw new ValidationError(
      `กรุณากรอกข้อมูลให้ครบถ้วน: ${missingFields.join(', ')}`,
      { missing: missingFields }
    );
  }

  // Validate role
  const validRoles = ['staff', 'admin', 'executive'];
  if (!validRoles.includes(userData.role)) {
    throw new ValidationError(
      `ตำแหน่งไม่ถูกต้อง ต้องเป็น: ${validRoles.join(', ')}`
    );
  }

  // Validate password length
  if (userData.password.length < 6) {
    throw new ValidationError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
  }

  // Sanitize and prepare data
  const sanitizedData = {
    username: userData.username.trim(),
    password: userData.password,
    fullName: userData.fullName.trim(),
    email: userData.email?.trim() || null,
    role: userData.role,
    departmentId: userData.departmentId ? sanitizeInt(userData.departmentId, { min: 1, max: 7 }) : null,
    active: userData.active !== undefined ? Boolean(userData.active) : true
  };

  // Create user
  const result = await userService.createUser(sanitizedData, user.id);

  logger.projectOperation('create_user', result.data.id, user.id, {
    username: result.data.username,
    role: result.data.role
  });

  sendCreated(res, result.data, 'สร้างผู้ใช้สำเร็จ');
});

/**
 * Update user
 * PUT /api/users/:id
 * Body: Fields to update
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const updateData = req.body;

  // Only admins can update users
  if (user.role !== 'admin') {
    throw new ForbiddenError('ไม่มีสิทธิ์แก้ไขผู้ใช้');
  }

  const userId = sanitizeInt(id, { min: 1 });
  if (!userId) {
    throw new ValidationError('รหัสผู้ใช้ไม่ถูกต้อง');
  }

  // Validate role if provided
  if (updateData.role) {
    const validRoles = ['staff', 'admin', 'executive'];
    if (!validRoles.includes(updateData.role)) {
      throw new ValidationError(
        `ตำแหน่งไม่ถูกต้อง ต้องเป็น: ${validRoles.join(', ')}`
      );
    }
  }

  // Validate password length if provided
  if (updateData.password && updateData.password.length < 6) {
    throw new ValidationError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
  }

  // Sanitize data
  const sanitizedData = {};
  if (updateData.fullName) sanitizedData.fullName = updateData.fullName.trim();
  if (updateData.email !== undefined) sanitizedData.email = updateData.email?.trim() || null;
  if (updateData.role) sanitizedData.role = updateData.role;
  if (updateData.departmentId !== undefined) {
    sanitizedData.departmentId = updateData.departmentId ?
      sanitizeInt(updateData.departmentId, { min: 1, max: 7 }) : null;
  }
  if (updateData.active !== undefined) sanitizedData.active = Boolean(updateData.active);
  if (updateData.password) sanitizedData.password = updateData.password;

  // Update user
  const result = await userService.updateUser(userId, sanitizedData, user.id);

  logger.projectOperation('update_user', userId, user.id, {
    updatedFields: Object.keys(sanitizedData)
  });

  sendSuccess(res, result.data, 'แก้ไขผู้ใช้สำเร็จ');
});

/**
 * Delete user
 * DELETE /api/users/:id
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  // Only admins can delete users
  if (user.role !== 'admin') {
    throw new ForbiddenError('ไม่มีสิทธิ์ลบผู้ใช้');
  }

  const userId = sanitizeInt(id, { min: 1 });
  if (!userId) {
    throw new ValidationError('รหัสผู้ใช้ไม่ถูกต้อง');
  }

  // Delete user
  const result = await userService.deleteUser(userId, user.id);

  logger.projectOperation('delete_user', userId, user.id);

  sendSuccess(res, null, result.message);
});

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
