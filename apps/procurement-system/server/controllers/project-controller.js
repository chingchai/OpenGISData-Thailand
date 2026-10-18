/**
 * Project Controller - HTTP Request Handlers
 * Handles incoming requests and responses for project management
 * REFACTORED: ใช้ Core Infrastructure
 */

import projectService from '../services/project-service.js';
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
 * Get all projects
 * GET /api/projects
 * Query params: departmentId, status, budgetYear, procurementMethod, page, limit
 */
export const getAllProjects = asyncHandler(async (req, res) => {
  const { departmentId, status, budgetYear, procurementMethod, page, limit } = req.query;
  const user = req.user;

  // Sanitize query parameters
  const filters = {
    page: sanitizeInt(page, { min: 1, default: 1 }),
    limit: sanitizeInt(limit, { min: 1, max: 100, default: 20 })
  };

  // Staff users can only see their department's projects
  if (user.role === 'staff') {
    filters.departmentId = user.departmentId;
  } else if (departmentId) {
    // Admin/Executive can filter by department
    filters.departmentId = sanitizeInt(departmentId, { min: 1, max: 7 });
  }

  // Apply filters
  if (status) {
    filters.status = sanitizeEnum(
      status,
      ['draft', 'in_progress', 'completed', 'cancelled', 'on_hold']
    );
  }

  if (budgetYear) {
    filters.budgetYear = sanitizeInt(budgetYear, { min: 2020, max: 2100 });
  }

  if (procurementMethod) {
    filters.procurementMethod = sanitizeEnum(
      procurementMethod,
      ['public_invitation', 'selection', 'specific']
    );
  }

  // Get projects
  const result = await projectService.getAllProjects(filters);

  logger.apiRequest(req, res, Date.now() - req.startTime);

  sendPaginated(res, result, 'ดึงข้อมูลโครงการสำเร็จ');
});

/**
 * Get project by ID
 * GET /api/projects/:id
 */
export const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const projectId = sanitizeInt(id, { min: 1 });
  if (!projectId) {
    throw new ValidationError('รหัสโครงการไม่ถูกต้อง');
  }

  const result = await projectService.getProjectById(projectId);

  // Check permission - staff can only view their department's projects
  if (user.role === 'staff' && result.data.department_id !== user.departmentId) {
    logger.securityEvent('unauthorized_project_access', {
      userId: user.id,
      projectId,
      userDepartment: user.departmentId,
      projectDepartment: result.data.department_id
    });

    throw new ForbiddenError('ไม่มีสิทธิ์เข้าถึง สามารถดูเฉพาะโครงการของกองตนเองเท่านั้น');
  }

  logger.apiRequest(req, res, Date.now() - req.startTime);

  sendSuccess(res, result.data, 'ดึงข้อมูลโครงการสำเร็จ');
});

/**
 * Create new project
 * POST /api/projects
 * Body: { name, description, departmentId, procurementMethod, budgetAmount, budgetYear, startDate }
 */
export const createProject = asyncHandler(async (req, res) => {
  const user = req.user;
  const projectData = req.body;

  // Validate required fields
  const requiredFields = ['name', 'departmentId', 'procurementMethod', 'budgetAmount', 'budgetYear'];
  const missingFields = requiredFields.filter(field => !projectData[field]);

  if (missingFields.length > 0) {
    throw new ValidationError(
      `กรุณากรอกข้อมูลให้ครบถ้วน: ${missingFields.join(', ')}`,
      { missing: missingFields }
    );
  }

  // Staff can only create projects for their department
  if (user.role === 'staff') {
    if (parseInt(projectData.departmentId) !== user.departmentId) {
      logger.securityEvent('unauthorized_project_creation', {
        userId: user.id,
        userDepartment: user.departmentId,
        requestedDepartment: projectData.departmentId
      });

      throw new ForbiddenError('ไม่มีสิทธิ์สร้างโครงการ สามารถสร้างโครงการได้เฉพาะในกองของคุณเท่านั้น');
    }
  }

  // Validate procurement method
  const validMethods = ['public_invitation', 'selection', 'specific'];
  if (!validMethods.includes(projectData.procurementMethod)) {
    throw new ValidationError(
      `วิธีจัดซื้อจัดจ้างไม่ถูกต้อง ต้องเป็น: ${validMethods.join(', ')}`
    );
  }

  // Validate budget amount
  if (projectData.budgetAmount <= 0) {
    throw new ValidationError('งบประมาณต้องมากกว่า 0');
  }

  // Sanitize and prepare data
  const sanitizedData = {
    name: projectData.name.trim(),
    description: projectData.description?.trim() || null,
    departmentId: sanitizeInt(projectData.departmentId, { min: 1, max: 7 }),
    procurementMethod: projectData.procurementMethod,
    budgetAmount: parseFloat(projectData.budgetAmount),
    budgetYear: sanitizeInt(projectData.budgetYear, { min: 2020, max: 2100 }),
    startDate: projectData.startDate || new Date().toISOString().split('T')[0]
  };

  // Create project
  const result = await projectService.createProject(sanitizedData, user.id);

  logger.projectOperation('create', result.data.id, user.id, {
    projectCode: result.data.project_code,
    departmentId: sanitizedData.departmentId,
    procurementMethod: sanitizedData.procurementMethod
  });

  sendCreated(res, result.data, 'สร้างโครงการสำเร็จ');
});

/**
 * Update project
 * PUT /api/projects/:id
 * Body: Fields to update
 */
export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const updateData = req.body;

  const projectId = sanitizeInt(id, { min: 1 });
  if (!projectId) {
    throw new ValidationError('รหัสโครงการไม่ถูกต้อง');
  }

  // Get current project to check permissions
  const currentProject = await projectService.getProjectById(projectId);

  // Check permission - staff can only update their department's projects
  if (user.role === 'staff' && currentProject.data.department_id !== user.departmentId) {
    logger.securityEvent('unauthorized_project_update', {
      userId: user.id,
      projectId,
      userDepartment: user.departmentId,
      projectDepartment: currentProject.data.department_id
    });

    throw new ForbiddenError('ไม่มีสิทธิ์แก้ไข สามารถแก้ไขโครงการของกองตนเองเท่านั้น');
  }

  // Executives cannot create/edit projects
  if (user.role === 'executive') {
    throw new ForbiddenError('ผู้บริหารสามารถดูและแสดงความคิดเห็นเท่านั้น ไม่สามารถแก้ไขโครงการได้');
  }

  // Validate budget amount if provided
  if (updateData.budgetAmount !== undefined && updateData.budgetAmount <= 0) {
    throw new ValidationError('งบประมาณต้องมากกว่า 0');
  }

  // Validate status if provided
  if (updateData.status) {
    const validStatuses = ['draft', 'in_progress', 'completed', 'cancelled', 'on_hold'];
    if (!validStatuses.includes(updateData.status)) {
      throw new ValidationError(
        `สถานะไม่ถูกต้อง ต้องเป็น: ${validStatuses.join(', ')}`
      );
    }
  }

  // Sanitize update data
  const sanitizedUpdate = {};
  if (updateData.name) sanitizedUpdate.name = updateData.name.trim();
  if (updateData.description !== undefined) {
    sanitizedUpdate.description = updateData.description?.trim() || null;
  }
  if (updateData.budgetAmount) {
    sanitizedUpdate.budgetAmount = parseFloat(updateData.budgetAmount);
  }
  if (updateData.status) sanitizedUpdate.status = updateData.status;
  if (updateData.actualStartDate) sanitizedUpdate.actualStartDate = updateData.actualStartDate;
  if (updateData.actualEndDate) sanitizedUpdate.actualEndDate = updateData.actualEndDate;
  if (updateData.winnerVendor) sanitizedUpdate.winnerVendor = updateData.winnerVendor.trim();
  if (updateData.contractNumber) sanitizedUpdate.contractNumber = updateData.contractNumber.trim();
  if (updateData.contractDate) sanitizedUpdate.contractDate = updateData.contractDate;
  if (updateData.remarks !== undefined) {
    sanitizedUpdate.remarks = updateData.remarks?.trim() || null;
  }

  // Update project
  const result = await projectService.updateProject(projectId, sanitizedUpdate, user.id);

  logger.projectOperation('update', projectId, user.id, {
    updatedFields: Object.keys(sanitizedUpdate)
  });

  sendSuccess(res, result.data, 'อัพเดทโครงการสำเร็จ');
});

/**
 * Delete project (soft delete)
 * DELETE /api/projects/:id
 */
export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const projectId = sanitizeInt(id, { min: 1 });
  if (!projectId) {
    throw new ValidationError('รหัสโครงการไม่ถูกต้อง');
  }

  // Get current project to check permissions
  const currentProject = await projectService.getProjectById(projectId);

  // Check permission - staff can only delete their department's projects
  if (user.role === 'staff' && currentProject.data.department_id !== user.departmentId) {
    logger.securityEvent('unauthorized_project_delete', {
      userId: user.id,
      projectId,
      userDepartment: user.departmentId,
      projectDepartment: currentProject.data.department_id
    });

    throw new ForbiddenError('ไม่มีสิทธิ์ลบ สามารถลบโครงการของกองตนเองเท่านั้น');
  }

  // Executives cannot delete projects
  if (user.role === 'executive') {
    throw new ForbiddenError('ผู้บริหารไม่สามารถลบโครงการได้');
  }

  // Don't allow deletion of completed projects
  if (currentProject.data.status === 'completed') {
    throw new ValidationError('ไม่สามารถลบโครงการที่เสร็จสิ้นแล้ว กรุณาติดต่อผู้ดูแลระบบ');
  }

  // Delete project
  const result = await projectService.deleteProject(projectId, user.id);

  logger.projectOperation('delete', projectId, user.id, {
    projectCode: currentProject.data.project_code,
    projectName: currentProject.data.name
  });

  sendSuccess(res, null, 'ลบโครงการสำเร็จ');
});

/**
 * Get project statistics
 * GET /api/projects/stats
 */
export const getProjectStatistics = asyncHandler(async (req, res) => {
  const user = req.user;

  // Staff users can only see their department's statistics
  const departmentId = user.role === 'staff' ? user.departmentId : null;

  const result = await projectService.getProjectStatistics(departmentId);

  logger.apiRequest(req, res, Date.now() - req.startTime);

  sendSuccess(res, result.data, 'ดึงสถิติโครงการสำเร็จ');
});

export default {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStatistics
};
