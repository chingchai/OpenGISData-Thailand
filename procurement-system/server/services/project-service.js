/**
 * Project Service - Business Logic Layer
 * Handles project CRUD operations, step generation, and validation
 */

import { query, queryOne, execute, transaction, getDatabase } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load procurement methods configuration
const procurementMethodsPath = path.join(__dirname, '../data/procurement-methods.json');
const PROCUREMENT_METHODS = JSON.parse(fs.readFileSync(procurementMethodsPath, 'utf8'));

/**
 * Get all projects with optional filtering
 * @param {Object} filters - Filter criteria
 * @param {number} filters.departmentId - Filter by department (required for staff role)
 * @param {string} filters.status - Filter by status
 * @param {number} filters.budgetYear - Filter by budget year
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 20)
 * @returns {Object} - { projects, pagination }
 */
export const getAllProjects = (filters = {}) => {
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
    const { total } = queryOne(countSql, params);

    // Add sorting and pagination
    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const projects = query(sql, params);

    return {
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    throw new Error('Failed to fetch projects');
  }
};

/**
 * Get project by ID
 * @param {number} projectId - Project ID
 * @returns {Object} - Project with steps
 */
export const getProjectById = (projectId) => {
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
      throw new Error('Project not found');
    }

    // Get project steps
    const steps = query(`
      SELECT * FROM project_steps
      WHERE project_id = ?
      ORDER BY step_number ASC
    `, [projectId]);

    // Get comments count
    const { comment_count } = queryOne(`
      SELECT COUNT(*) as comment_count
      FROM comments
      WHERE project_id = ? AND deleted_at IS NULL
    `, [projectId]) || { comment_count: 0 };

    return {
      success: true,
      data: {
        ...project,
        steps,
        comment_count
      }
    };
  } catch (error) {
    console.error('Error in getProjectById:', error);
    throw error;
  }
};

/**
 * Create new project with auto-generated steps
 * @param {Object} projectData - Project data
 * @param {number} userId - User ID creating the project
 * @returns {Object} - Created project
 */
export const createProject = (projectData, userId) => {
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
      throw new Error('Invalid procurement method');
    }

    // Generate project code
    const projectCode = generateProjectCode(departmentId, budgetYear);

    // Use transaction for atomicity
    const result = transaction(() => {
      const db = getDatabase();

      // Insert project
      const projectResult = db.prepare(`
        INSERT INTO projects (
          project_code, name, description, department_id,
          procurement_method, budget_amount, budget_year,
          status, planned_start_date, created_by, created_at
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

      const projectId = projectResult.lastInsertRowid;

      // Generate and insert project steps
      const steps = generateProjectSteps(projectId, method, startDate);
      const stepInsert = db.prepare(`
        INSERT INTO project_steps (
          project_id, step_number, step_name, step_description,
          planned_start_date, planned_end_date, sla_days,
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
        projectId,
        JSON.stringify({ projectCode, name, procurementMethod }),
        '127.0.0.1' // Will be updated with actual IP from request
      );

      return projectId;
    });

    // Fetch and return the created project
    return getProjectById(result);
  } catch (error) {
    console.error('Error in createProject:', error);
    throw error;
  }
};

/**
 * Update existing project
 * @param {number} projectId - Project ID
 * @param {Object} updateData - Data to update
 * @param {number} userId - User ID making the update
 * @returns {Object} - Updated project
 */
export const updateProject = (projectId, updateData, userId) => {
  try {
    // Get current project for audit
    const currentProject = queryOne('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!currentProject) {
      throw new Error('Project not found');
    }

    // Build dynamic update query
    const allowedFields = [
      'name', 'description', 'budget_amount', 'status',
      'actual_start_date', 'actual_end_date', 'winner_vendor',
      'contract_number', 'contract_date', 'remarks'
    ];

    const updates = [];
    const params = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Add updated timestamp and user
    updates.push('updated_at = datetime(\'now\')');
    updates.push('updated_by = ?');
    params.push(userId);
    params.push(projectId);

    const sql = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;

    transaction(() => {
      const db = getDatabase();

      db.prepare(sql).run(...params);

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
        JSON.stringify({ before: currentProject, after: updateData }),
        '127.0.0.1'
      );
    });

    return getProjectById(projectId);
  } catch (error) {
    console.error('Error in updateProject:', error);
    throw error;
  }
};

/**
 * Delete project (soft delete)
 * @param {number} projectId - Project ID
 * @param {number} userId - User ID performing deletion
 * @returns {Object} - Success status
 */
export const deleteProject = (projectId, userId) => {
  try {
    const project = queryOne('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      throw new Error('Project not found');
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
        JSON.stringify({ project_code: project.project_code, name: project.name }),
        '127.0.0.1'
      );
    });

    return {
      success: true,
      message: 'Project deleted successfully'
    };
  } catch (error) {
    console.error('Error in deleteProject:', error);
    throw error;
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
      throw new Error('Department not found');
    }

    // Get count of projects for this department and year
    const { count } = queryOne(`
      SELECT COUNT(*) as count
      FROM projects
      WHERE department_id = ? AND budget_year = ?
    `, [departmentId, budgetYear]) || { count: 0 };

    const sequence = String(count + 1).padStart(4, '0');
    return `${dept.code.substring(0, 3).toUpperCase()}-${budgetYear}-${sequence}`;
  } catch (error) {
    console.error('Error generating project code:', error);
    throw error;
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

  return steps;
};

/**
 * Get project statistics for dashboard
 * @param {number} departmentId - Optional department filter
 * @returns {Object} - Statistics object
 */
export const getProjectStatistics = (departmentId = null) => {
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
        SUM(p.budget_amount) as total_budget,
        AVG(p.budget_amount) as average_budget
      FROM projects p
      ${whereClause}
    `, params);

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error in getProjectStatistics:', error);
    throw error;
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
