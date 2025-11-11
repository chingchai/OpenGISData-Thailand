/**
 * Project Service - Business Logic Layer
 * Handles project CRUD operations, step generation, and validation
 * REFACTORED: ใช้ Core Infrastructure
 */

import { query, queryOne, execute, transaction, getDatabase } from '../config/database.js';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load procurement methods configuration
const procurementMethodsPath = path.join(__dirname, '../data/procurement-methods.json');
let PROCUREMENT_METHODS;

try {
  PROCUREMENT_METHODS = JSON.parse(fs.readFileSync(procurementMethodsPath, 'utf8'));
  logger.info('Loaded procurement methods configuration', {
    methodCount: PROCUREMENT_METHODS.length
  });
} catch (error) {
  logger.error('Failed to load procurement methods configuration:', {
    error: error.message,
    path: procurementMethodsPath
  });
  throw new Error('Failed to initialize project service: procurement methods configuration not found');
}

/**
 * Get all projects with optional filtering
 * @param {Object} filters - Filter criteria
 * @param {number} filters.departmentId - Filter by department (required for staff role)
 * @param {string} filters.status - Filter by status
 * @param {number} filters.budgetYear - Filter by budget year
 * @param {string} filters.procurementMethod - Filter by procurement method
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 20)
 * @returns {Object} - { data, pagination }
 */
export function getAllProjects(filters = {}) {
  try {
    const {
      departmentId,
      status,
      budgetYear,
      procurementMethod,
      page = 1,
      limit = 20
    } = filters;

    let sql = `
      SELECT
        p.*,
        d.name as department_name,
        d.code as department_code,
        u.full_name as created_by_name,
        (SELECT COUNT(*) FROM project_steps WHERE project_id = p.id) as total_steps,
        (SELECT COUNT(*) FROM project_steps WHERE project_id = p.id AND status = 'completed') as completed_steps,
        (SELECT COUNT(*) FROM project_steps WHERE project_id = p.id AND status = 'overdue') as overdue_steps
      FROM projects p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.deleted_at IS NULL
    `;

    const params = [];

    // Apply filters
    if (departmentId) {
      sql += ' AND p.department_id = ?';
      params.push(departmentId);
    }

    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (budgetYear) {
      sql += ' AND p.budget_year = ?';
      params.push(budgetYear);
    }

    if (procurementMethod) {
      sql += ' AND p.procurement_method = ?';
      params.push(procurementMethod);
    }

    // Get total count for pagination
    const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(DISTINCT p.id) as total FROM');
    const countResult = queryOne(countSql, params);
    const total = countResult ? countResult.total : 0;

    // Add sorting and pagination
    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const projects = query(sql, params);

    logger.dbOperation('getAllProjects', 'projects', {
      filters: { departmentId, status, budgetYear, procurementMethod },
      resultCount: projects.length,
      page,
      limit
    });

    return {
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  } catch (error) {
    logger.error('Error in getAllProjects service:', {
      error: error.message,
      stack: error.stack,
      filters
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการดึงข้อมูลโครงการ', error);
  }
};

/**
 * Get project by ID
 * @param {number} projectId - Project ID
 * @returns {Object} - { data: project with steps }
 */
export function getProjectById(projectId) {
  try {
    const project = queryOne(`
      SELECT
        p.*,
        d.name as department_name,
        d.code as department_code,
        u.full_name as created_by_name
      FROM projects p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = ? AND p.deleted_at IS NULL
    `, [projectId]);

    if (!project) {
      logger.warn('Project not found', { projectId });
      throw new NotFoundError('ไม่พบโครงการที่ต้องการ');
    }

    // Get project steps
    const steps = query(`
      SELECT * FROM project_steps
      WHERE project_id = ?
      ORDER BY step_number ASC
    `, [projectId]);

    // Get comments count
    const commentResult = queryOne(`
      SELECT COUNT(*) as comment_count
      FROM comments
      WHERE project_id = ?
    `, [projectId]);
    const comment_count = commentResult ? commentResult.comment_count : 0;

    logger.dbOperation('getProjectById', 'projects', {
      projectId,
      found: true,
      stepsCount: steps.length,
      commentsCount: comment_count
    });

    return {
      data: {
        ...project,
        steps,
        comment_count
      }
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Error in getProjectById service:', {
      error: error.message,
      stack: error.stack,
      projectId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการดึงข้อมูลโครงการ', error);
  }
};

/**
 * Create new project with auto-generated steps
 * @param {Object} projectData - Project data
 * @param {string} projectData.name - Project name
 * @param {string} projectData.description - Project description
 * @param {number} projectData.departmentId - Department ID
 * @param {string} projectData.procurementMethod - Procurement method code
 * @param {number} projectData.budgetAmount - Budget amount
 * @param {number} projectData.budgetYear - Budget year
 * @param {string} projectData.startDate - Start date (optional)
 * @param {number} userId - User ID creating the project
 * @returns {Object} - { data: created project }
 */
export function createProject(projectData, userId) {
  try {
    const {
      name,
      description,
      departmentId,
      procurementMethod,
      budgetAmount,
      budgetYear,
      startDate
    } = projectData;

    // Validate procurement method
    const method = PROCUREMENT_METHODS.find(m => m.code === procurementMethod);
    if (!method) {
      logger.warn('Invalid procurement method attempted', {
        procurementMethod,
        userId
      });
      throw new ValidationError(
        `วิธีจัดซื้อจัดจ้างไม่ถูกต้อง: ${procurementMethod}`,
        { validMethods: PROCUREMENT_METHODS.map(m => m.code) }
      );
    }

    // Generate project code
    const projectCode = generateProjectCode(departmentId, budgetYear);

    // Use transaction for atomicity
    const projectId = transaction(() => {
      const db = getDatabase();

      // Insert project
      const projectResult = db.prepare(`
        INSERT INTO projects (
          project_code, name, description, department_id,
          procurement_method, budget, budget_year,
          status, planned_start, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        projectCode,
        name,
        description || null,
        departmentId,
        procurementMethod,
        budgetAmount,
        budgetYear,
        'draft',
        startDate || new Date().toISOString().split('T')[0],
        userId
      );

      const newProjectId = projectResult.lastInsertRowid;

      // Generate and insert project steps
      const steps = generateProjectSteps(newProjectId, method, startDate);
      const stepInsert = db.prepare(`
        INSERT INTO project_steps (
          project_id, step_number, step_name, step_description,
          planned_start, planned_end, sla_days,
          status, is_critical, allow_weekends, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      steps.forEach(step => {
        stepInsert.run(
          step.projectId,
          step.stepNumber,
          step.stepName,
          step.stepDescription,
          step.plannedStartDate,
          step.plannedEndDate,
          step.slaDays,
          step.status,
          step.isCritical ? 1 : 0,
          step.allowWeekends ? 1 : 0
        );
      });

      // Log audit trail
      db.prepare(`
        INSERT INTO audit_logs (
          user_id, action, table_name, record_id,
          changes, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        userId,
        'CREATE',
        'projects',
        newProjectId,
        JSON.stringify({ projectCode, name, procurementMethod, budgetAmount }),
        '127.0.0.1' // Will be updated with actual IP from request
      );

      logger.info('Project created successfully', {
        projectId: newProjectId,
        projectCode,
        userId,
        departmentId,
        procurementMethod,
        stepsGenerated: steps.length
      });

      return newProjectId;
    });

    // Fetch and return the created project
    return exports.getProjectById(projectId);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Error in createProject service:', {
      error: error.message,
      stack: error.stack,
      projectData,
      userId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการสร้างโครงการ', error);
  }
};

/**
 * Update existing project
 * @param {number} projectId - Project ID
 * @param {Object} updateData - Data to update
 * @param {number} userId - User ID making the update
 * @returns {Object} - { data: updated project }
 */
export function updateProject(projectId, updateData, userId) {
  try {
    // Get current project for audit
    const currentProject = queryOne('SELECT * FROM projects WHERE id = ? AND deleted_at IS NULL', [projectId]);
    if (!currentProject) {
      logger.warn('Project not found for update', { projectId, userId });
      throw new NotFoundError('ไม่พบโครงการที่ต้องการแก้ไข');
    }

    // Build dynamic update query
    const allowedFields = [
      'name', 'description', 'budget', 'status',
      'actual_start', 'actual_end', 'winner_vendor',
      'contract_number', 'contract_date', 'remarks'
    ];

    // Map camelCase to snake_case
    const fieldMapping = {
      name: 'name',
      description: 'description',
      budgetAmount: 'budget',
      status: 'status',
      actualStartDate: 'actual_start',
      actualEndDate: 'actual_end',
      winnerVendor: 'winner_vendor',
      contractNumber: 'contract_number',
      contractDate: 'contract_date',
      remarks: 'remarks'
    };

    const updates = [];
    const params = [];
    const changeLog = {};

    Object.keys(updateData).forEach(key => {
      const dbField = fieldMapping[key];
      if (dbField && updateData[key] !== undefined) {
        updates.push(`${dbField} = ?`);
        params.push(updateData[key]);
        changeLog[dbField] = {
          from: currentProject[dbField],
          to: updateData[key]
        };
      }
    });

    if (updates.length === 0) {
      logger.warn('No valid fields to update', { projectId, updateData });
      throw new ValidationError('ไม่มีข้อมูลที่ต้องการแก้ไข');
    }

    // Add updated timestamp and user
    updates.push('updated_at = datetime(\'now\')');
    updates.push('updated_by = ?');
    params.push(userId);
    params.push(projectId);

    const sql = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;

    transaction(() => {
      const db = getDatabase();

      const result = db.prepare(sql).run(...params);

      if (result.changes === 0) {
        throw new NotFoundError('ไม่พบโครงการที่ต้องการแก้ไข');
      }

      // Log audit trail
      db.prepare(`
        INSERT INTO audit_logs (
          user_id, action, table_name, record_id,
          changes, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        userId,
        'UPDATE',
        'projects',
        projectId,
        JSON.stringify(changeLog),
        '127.0.0.1'
      );

      logger.info('Project updated successfully', {
        projectId,
        userId,
        updatedFields: Object.keys(changeLog),
        changes: result.changes
      });
    });

    return exports.getProjectById(projectId);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }

    logger.error('Error in updateProject service:', {
      error: error.message,
      stack: error.stack,
      projectId,
      updateData,
      userId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการแก้ไขโครงการ', error);
  }
};

/**
 * Delete project (soft delete)
 * @param {number} projectId - Project ID
 * @param {number} userId - User ID performing deletion
 * @returns {Object} - { data: null }
 */
export function deleteProject(projectId, userId) {
  try {
    const project = queryOne('SELECT * FROM projects WHERE id = ? AND deleted_at IS NULL', [projectId]);
    if (!project) {
      logger.warn('Project not found for deletion', { projectId, userId });
      throw new NotFoundError('ไม่พบโครงการที่ต้องการลบ');
    }

    transaction(() => {
      const db = getDatabase();

      // Soft delete project
      db.prepare(`
        UPDATE projects
        SET deleted_at = datetime('now'), deleted_by = ?
        WHERE id = ?
      `).run(userId, projectId);

      // Soft delete related steps
      db.prepare(`
        UPDATE project_steps
        SET deleted_at = datetime('now')
        WHERE project_id = ?
      `).run(projectId);

      // Log audit trail
      db.prepare(`
        INSERT INTO audit_logs (
          user_id, action, table_name, record_id,
          changes, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        userId,
        'DELETE',
        'projects',
        projectId,
        JSON.stringify({
          project_code: project.project_code,
          name: project.name,
          status: project.status
        }),
        '127.0.0.1'
      );

      logger.info('Project deleted successfully', {
        projectId,
        projectCode: project.project_code,
        userId
      });
    });

    return {
      data: null
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Error in deleteProject service:', {
      error: error.message,
      stack: error.stack,
      projectId,
      userId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการลบโครงการ', error);
  }
};

/**
 * Generate project code
 * Format: DEPT-YEAR-XXXX (e.g., ENG-2024-0001)
 * @param {number} departmentId - Department ID
 * @param {number} budgetYear - Budget year
 * @returns {string} - Generated project code
 */
const generateProjectCode = (departmentId, budgetYear) => {
  try {
    // Get department code
    const dept = queryOne('SELECT code FROM departments WHERE id = ?', [departmentId]);
    if (!dept) {
      logger.warn('Department not found for project code generation', { departmentId });
      throw new NotFoundError('ไม่พบข้อมูลกอง/สำนัก');
    }

    // Get count of projects for this department and year
    const countResult = queryOne(`
      SELECT COUNT(*) as count
      FROM projects
      WHERE department_id = ? AND budget_year = ?
    `, [departmentId, budgetYear]);
    const count = countResult ? countResult.count : 0;

    const sequence = String(count + 1).padStart(4, '0');
    const projectCode = `${dept.code.substring(0, 3).toUpperCase()}-${budgetYear}-${sequence}`;

    logger.dbOperation('generateProjectCode', 'projects', {
      departmentId,
      budgetYear,
      sequence: count + 1,
      projectCode
    });

    return projectCode;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Error generating project code:', {
      error: error.message,
      departmentId,
      budgetYear
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการสร้างรหัสโครงการ', error);
  }
};

/**
 * Generate project steps based on procurement method
 * @param {number} projectId - Project ID
 * @param {Object} method - Procurement method configuration
 * @param {string} startDate - Project start date
 * @returns {Array} - Array of step objects
 */
const generateProjectSteps = (projectId, method, startDate) => {
  const steps = [];
  let currentDate = new Date(startDate || new Date());

  method.steps.forEach((step, index) => {
    const plannedStartDate = new Date(currentDate);
    const plannedEndDate = new Date(currentDate);
    plannedEndDate.setDate(plannedEndDate.getDate() + step.defaultDays);

    steps.push({
      projectId,
      stepNumber: step.stepNumber,
      stepName: step.name,
      stepDescription: step.description,
      plannedStartDate: plannedStartDate.toISOString().split('T')[0],
      plannedEndDate: plannedEndDate.toISOString().split('T')[0],
      slaDays: step.defaultDays,
      status: 'pending',
      isCritical: step.isCritical,
      allowWeekends: step.allowWeekends
    });

    // Set next step start date
    currentDate = new Date(plannedEndDate);
    currentDate.setDate(currentDate.getDate() + 1);
  });

  logger.dbOperation('generateProjectSteps', 'project_steps', {
    projectId,
    methodCode: method.code,
    stepCount: steps.length
  });

  return steps;
};

/**
 * Get project statistics for dashboard
 * @param {number} departmentId - Optional department filter
 * @returns {Object} - { data: statistics object }
 */
export function getProjectStatistics(departmentId = null) {
  try {
    let whereClause = 'WHERE p.deleted_at IS NULL';
    const params = [];

    if (departmentId) {
      whereClause += ' AND p.department_id = ?';
      params.push(departmentId);
    }

    const stats = queryOne(`
      SELECT
        COUNT(*) as total_projects,
        SUM(CASE WHEN p.status = 'draft' THEN 1 ELSE 0 END) as draft_count,
        SUM(CASE WHEN p.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
        SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN p.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
        SUM(CASE WHEN p.status = 'on_hold' THEN 1 ELSE 0 END) as on_hold_count,
        SUM(p.budget) as total_budget,
        AVG(p.budget) as average_budget
      FROM projects p
      ${whereClause}
    `, params);

    logger.dbOperation('getProjectStatistics', 'projects', {
      departmentId,
      totalProjects: stats ? stats.total_projects : 0
    });

    return {
      data: stats || {
        total_projects: 0,
        draft_count: 0,
        in_progress_count: 0,
        completed_count: 0,
        cancelled_count: 0,
        on_hold_count: 0,
        total_budget: 0,
        average_budget: 0
      }
    };
  } catch (error) {
    logger.error('Error in getProjectStatistics service:', {
      error: error.message,
      stack: error.stack,
      departmentId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการดึงสถิติโครงการ', error);
  }
};

export default {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStatistics
};
