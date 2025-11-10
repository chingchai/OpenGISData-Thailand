/**
 * Step Controller - HTTP Request Handlers
 * Handles incoming requests and responses for project step management
 * ใช้ Core Infrastructure
 */

const stepService = require('../services/step-service');
const projectService = require('../services/project-service');
const { asyncHandler } = require('../utils/errors');
const {
  sendSuccess,
  sendValidationError,
  sendForbidden
} = require('../utils/responses');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');
const { sanitizeInt, sanitizeEnum } = require('../utils/sanitize');
const logger = require('../utils/logger');

/**
 * Get all steps for a project
 * GET /api/projects/:projectId/steps
 */
exports.getStepsByProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const user = req.user;

  const sanitizedProjectId = sanitizeInt(projectId, { min: 1 });
  if (!sanitizedProjectId) {
    throw new ValidationError('รหัสโครงการไม่ถูกต้อง');
  }

  // Get project to check permissions
  const project = await projectService.getProjectById(sanitizedProjectId);

  // Check permission - staff can only view their department's projects
  if (user.role === 'staff' && project.data.department_id !== user.departmentId) {
    logger.securityEvent('unauthorized_step_access', {
      userId: user.id,
      projectId: sanitizedProjectId,
      userDepartment: user.departmentId,
      projectDepartment: project.data.department_id
    });

    throw new ForbiddenError('ไม่มีสิทธิ์เข้าถึง สามารถดูเฉพาะโครงการของกองตนเองเท่านั้น');
  }

  const result = await stepService.getStepsByProject(sanitizedProjectId);

  logger.apiRequest(req, res, Date.now() - req.startTime);

  sendSuccess(res, result.data, 'ดึงข้อมูลขั้นตอนสำเร็จ');
});

/**
 * Get step by ID
 * GET /api/steps/:id
 */
exports.getStepById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const stepId = sanitizeInt(id, { min: 1 });
  if (!stepId) {
    throw new ValidationError('รหัสขั้นตอนไม่ถูกต้อง');
  }

  const result = await stepService.getStepById(stepId);

  // Get project to check permissions
  const project = await projectService.getProjectById(result.data.project_id);

  // Check permission - staff can only view their department's projects
  if (user.role === 'staff' && project.data.department_id !== user.departmentId) {
    logger.securityEvent('unauthorized_step_view', {
      userId: user.id,
      stepId,
      userDepartment: user.departmentId,
      projectDepartment: project.data.department_id
    });

    throw new ForbiddenError('ไม่มีสิทธิ์เข้าถึง สามารถดูเฉพาะโครงการของกองตนเองเท่านั้น');
  }

  logger.apiRequest(req, res, Date.now() - req.startTime);

  sendSuccess(res, result.data, 'ดึงข้อมูลขั้นตอนสำเร็จ');
});

/**
 * Update step status
 * PATCH /api/steps/:id/status
 * Body: { status: 'pending'|'in_progress'|'completed'|'on_hold' }
 */
exports.updateStepStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = req.user;

  const stepId = sanitizeInt(id, { min: 1 });
  if (!stepId) {
    throw new ValidationError('รหัสขั้นตอนไม่ถูกต้อง');
  }

  // Validate status
  const validStatuses = ['pending', 'in_progress', 'completed', 'on_hold', 'overdue'];
  const sanitizedStatus = sanitizeEnum(status, validStatuses);
  if (!sanitizedStatus) {
    throw new ValidationError(
      `สถานะไม่ถูกต้อง ต้องเป็น: ${validStatuses.join(', ')}`
    );
  }

  // Get step to check permissions
  const stepResult = await stepService.getStepById(stepId);
  const project = await projectService.getProjectById(stepResult.data.project_id);

  // Check permission - staff can only update their department's projects
  if (user.role === 'staff' && project.data.department_id !== user.departmentId) {
    logger.securityEvent('unauthorized_step_update', {
      userId: user.id,
      stepId,
      userDepartment: user.departmentId,
      projectDepartment: project.data.department_id
    });

    throw new ForbiddenError('ไม่มีสิทธิ์แก้ไข สามารถแก้ไขโครงการของกองตนเองเท่านั้น');
  }

  // Executives cannot edit
  if (user.role === 'executive') {
    throw new ForbiddenError('ผู้บริหารสามารถดูและแสดงความคิดเห็นเท่านั้น ไม่สามารถแก้ไขได้');
  }

  // Update status
  const result = await stepService.updateStepStatus(stepId, sanitizedStatus, user.id);

  logger.info('Step status updated', {
    stepId,
    projectId: project.data.id,
    userId: user.id,
    oldStatus: stepResult.data.status,
    newStatus: sanitizedStatus
  });

  sendSuccess(res, result.data, 'อัพเดทสถานะขั้นตอนสำเร็จ');
});

/**
 * Update step details
 * PUT /api/steps/:id
 * Body: { stepName, stepDescription, plannedStartDate, plannedEndDate, slaDays, notes, ... }
 */
exports.updateStep = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const updateData = req.body;

  const stepId = sanitizeInt(id, { min: 1 });
  if (!stepId) {
    throw new ValidationError('รหัสขั้นตอนไม่ถูกต้อง');
  }

  // Get step to check permissions
  const stepResult = await stepService.getStepById(stepId);
  const project = await projectService.getProjectById(stepResult.data.project_id);

  // Check permission - staff can only update their department's projects
  if (user.role === 'staff' && project.data.department_id !== user.departmentId) {
    logger.securityEvent('unauthorized_step_edit', {
      userId: user.id,
      stepId,
      userDepartment: user.departmentId,
      projectDepartment: project.data.department_id
    });

    throw new ForbiddenError('ไม่มีสิทธิ์แก้ไข สามารถแก้ไขโครงการของกองตนเองเท่านั้น');
  }

  // Executives cannot edit
  if (user.role === 'executive') {
    throw new ForbiddenError('ผู้บริหารสามารถดูและแสดงความคิดเห็นเท่านั้น ไม่สามารถแก้ไขได้');
  }

  // Sanitize numeric fields
  if (updateData.slaDays !== undefined) {
    updateData.slaDays = sanitizeInt(updateData.slaDays, { min: 1, max: 365 });
    if (!updateData.slaDays) {
      throw new ValidationError('จำนวนวัน SLA ต้องอยู่ระหว่าง 1-365 วัน');
    }
  }

  // Sanitize boolean fields
  if (updateData.isCritical !== undefined) {
    updateData.isCritical = Boolean(updateData.isCritical);
  }

  if (updateData.allowWeekends !== undefined) {
    updateData.allowWeekends = Boolean(updateData.allowWeekends);
  }

  // Update step
  const result = await stepService.updateStep(stepId, updateData, user.id);

  logger.info('Step updated', {
    stepId,
    projectId: project.data.id,
    userId: user.id,
    updatedFields: Object.keys(updateData)
  });

  sendSuccess(res, result.data, 'อัพเดทขั้นตอนสำเร็จ');
});

/**
 * Get step progress for a project
 * GET /api/projects/:projectId/steps/progress
 */
exports.getStepProgress = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const user = req.user;

  const sanitizedProjectId = sanitizeInt(projectId, { min: 1 });
  if (!sanitizedProjectId) {
    throw new ValidationError('รหัสโครงการไม่ถูกต้อง');
  }

  // Get project to check permissions
  const project = await projectService.getProjectById(sanitizedProjectId);

  // Check permission - staff can only view their department's projects
  if (user.role === 'staff' && project.data.department_id !== user.departmentId) {
    logger.securityEvent('unauthorized_progress_access', {
      userId: user.id,
      projectId: sanitizedProjectId,
      userDepartment: user.departmentId,
      projectDepartment: project.data.department_id
    });

    throw new ForbiddenError('ไม่มีสิทธิ์เข้าถึง สามารถดูเฉพาะโครงการของกองตนเองเท่านั้น');
  }

  const result = await stepService.getStepProgress(sanitizedProjectId);

  logger.apiRequest(req, res, Date.now() - req.startTime);

  sendSuccess(res, result.data, 'ดึงข้อมูลความคืบหน้าสำเร็จ');
});

/**
 * Calculate step delay
 * GET /api/steps/:id/delay
 */
exports.calculateStepDelay = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const stepId = sanitizeInt(id, { min: 1 });
  if (!stepId) {
    throw new ValidationError('รหัสขั้นตอนไม่ถูกต้อง');
  }

  // Get step to check permissions
  const stepResult = await stepService.getStepById(stepId);
  const project = await projectService.getProjectById(stepResult.data.project_id);

  // Check permission - staff can only view their department's projects
  if (user.role === 'staff' && project.data.department_id !== user.departmentId) {
    logger.securityEvent('unauthorized_delay_calculation', {
      userId: user.id,
      stepId,
      userDepartment: user.departmentId,
      projectDepartment: project.data.department_id
    });

    throw new ForbiddenError('ไม่มีสิทธิ์เข้าถึง สามารถดูเฉพาะโครงการของกองตนเองเท่านั้น');
  }

  const result = await stepService.calculateStepDelay(stepId);

  logger.apiRequest(req, res, Date.now() - req.startTime);

  sendSuccess(res, result.data, 'คำนวณความล่าช้าสำเร็จ');
});

/**
 * Get overdue steps
 * GET /api/steps/overdue
 * Query params: departmentId (optional for admin/executive)
 */
exports.getOverdueSteps = asyncHandler(async (req, res) => {
  const { departmentId } = req.query;
  const user = req.user;

  let filterDepartmentId = null;

  // Staff users can only see their department's overdue steps
  if (user.role === 'staff') {
    filterDepartmentId = user.departmentId;
  } else if (departmentId) {
    // Admin/Executive can filter by department
    filterDepartmentId = sanitizeInt(departmentId, { min: 1, max: 7 });
  }

  const result = await stepService.getOverdueSteps(filterDepartmentId);

  logger.apiRequest(req, res, Date.now() - req.startTime);

  sendSuccess(res, result.data, 'ดึงข้อมูลขั้นตอนที่ล่าช้าสำเร็จ');
});

module.exports = {
  getStepsByProject: exports.getStepsByProject,
  getStepById: exports.getStepById,
  updateStepStatus: exports.updateStepStatus,
  updateStep: exports.updateStep,
  getStepProgress: exports.getStepProgress,
  calculateStepDelay: exports.calculateStepDelay,
  getOverdueSteps: exports.getOverdueSteps
};
