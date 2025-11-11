/**
 * Report Service
 * รวบรวมข้อมูลสำหรับสร้างรายงาน
 */

import { query, queryOne } from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Get detailed report - รายละเอียดโครงการทั้งหมด (สำหรับผู้รับผิดชอบโครงการ)
 * @param {Object} filters - ตัวกรอง
 * @returns {Object} - ข้อมูลรายละเอียด
 */
export function getDetailedReport(filters = {}) {
  try {
    const { month, year, departmentId, status, procurementMethod } = filters;

    let sql = `
      SELECT
        p.id,
        p.project_code,
        p.name,
        p.description,
        p.budget,
        p.start_date,
        p.expected_end_date,
        p.actual_end_date,
        p.status,
        p.urgency_level,
        p.procurement_method,
        p.contractor_type,
        p.progress_percentage,
        p.delay_days,
        p.created_at,
        d.name as department_name,
        d.code as department_code,
        u.full_name as created_by_name,
        (SELECT COUNT(*) FROM project_steps WHERE project_id = p.id) as total_steps,
        (SELECT COUNT(*) FROM project_steps WHERE project_id = p.id AND status = 'completed') as completed_steps,
        (SELECT COUNT(*) FROM project_steps WHERE project_id = p.id AND status = 'delayed') as delayed_steps
      FROM projects p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.deleted_at IS NULL
    `;

    const params = [];

    // Filter by month and year
    if (month && year) {
      const startDate = `${year - 543}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year - 543}-${String(month).padStart(2, '0')}-31`;
      sql += ' AND (p.start_date BETWEEN ? AND ? OR p.expected_end_date BETWEEN ? AND ?)';
      params.push(startDate, endDate, startDate, endDate);
    } else if (year) {
      const startDate = `${year - 543}-01-01`;
      const endDate = `${year - 543}-12-31`;
      sql += ' AND (p.start_date BETWEEN ? AND ? OR p.expected_end_date BETWEEN ? AND ?)';
      params.push(startDate, endDate, startDate, endDate);
    }

    if (departmentId) {
      sql += ' AND p.department_id = ?';
      params.push(departmentId);
    }

    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (procurementMethod) {
      sql += ' AND p.procurement_method = ?';
      params.push(procurementMethod);
    }

    sql += ' ORDER BY d.name, p.created_at DESC';

    const projects = query(sql, params);

    // Get delayed steps for each project
    const projectsWithSteps = projects.map(project => {
      const delayedSteps = query(`
        SELECT
          step_number,
          step_name,
          planned_end,
          actual_end,
          delay_days,
          status
        FROM project_steps
        WHERE project_id = ? AND status = 'delayed'
        ORDER BY step_number
      `, [project.id]);

      return {
        ...project,
        delayed_steps: delayedSteps
      };
    });

    logger.info('Generated detailed report', {
      filters,
      projectCount: projects.length
    });

    return {
      filters,
      generated_at: new Date().toISOString(),
      projects: projectsWithSteps,
      total_projects: projects.length
    };
  } catch (error) {
    logger.error('Error generating detailed report:', error);
    throw error;
  }
}

/**
 * Get executive summary - รายงานภาพรวม (สำหรับผู้บริหาร)
 * @param {Object} filters - ตัวกรอง
 * @returns {Object} - ข้อมูลสรุปภาพรวม
 */
export function getExecutiveSummary(filters = {}) {
  try {
    const { month, year, departmentId, status, procurementMethod } = filters;

    let whereClause = 'WHERE p.deleted_at IS NULL';
    const params = [];

    // Build where clause
    if (month && year) {
      const startDate = `${year - 543}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year - 543}-${String(month).padStart(2, '0')}-31`;
      whereClause += ' AND (p.start_date BETWEEN ? AND ? OR p.expected_end_date BETWEEN ? AND ?)';
      params.push(startDate, endDate, startDate, endDate);
    } else if (year) {
      const startDate = `${year - 543}-01-01`;
      const endDate = `${year - 543}-12-31`;
      whereClause += ' AND (p.start_date BETWEEN ? AND ? OR p.expected_end_date BETWEEN ? AND ?)';
      params.push(startDate, endDate, startDate, endDate);
    }

    if (departmentId) {
      whereClause += ' AND p.department_id = ?';
      params.push(departmentId);
    }

    if (status) {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }

    if (procurementMethod) {
      whereClause += ' AND p.procurement_method = ?';
      params.push(procurementMethod);
    }

    // Summary statistics
    const summary = queryOne(`
      SELECT
        COUNT(*) as total_projects,
        SUM(p.budget) as total_budget,
        AVG(p.budget) as average_budget,
        COUNT(CASE WHEN p.status = 'draft' THEN 1 END) as draft_count,
        COUNT(CASE WHEN p.status = 'in_progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN p.status = 'delayed' THEN 1 END) as delayed_count,
        COUNT(CASE WHEN p.status = 'cancelled' THEN 1 END) as cancelled_count,
        AVG(p.progress_percentage) as average_progress
      FROM projects p
      ${whereClause}
    `, params);

    // By department
    const byDepartment = query(`
      SELECT
        d.name as department_name,
        COUNT(*) as project_count,
        SUM(p.budget) as total_budget,
        COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN p.status = 'delayed' THEN 1 END) as delayed_count,
        AVG(p.progress_percentage) as average_progress
      FROM projects p
      LEFT JOIN departments d ON p.department_id = d.id
      ${whereClause}
      GROUP BY p.department_id, d.name
      ORDER BY d.name
    `, params);

    // By procurement method
    const byMethod = query(`
      SELECT
        p.procurement_method,
        COUNT(*) as project_count,
        SUM(p.budget) as total_budget,
        COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN p.status = 'delayed' THEN 1 END) as delayed_count
      FROM projects p
      ${whereClause}
      GROUP BY p.procurement_method
      ORDER BY project_count DESC
    `, params);

    // Delayed projects list (top 10)
    const delayedProjects = query(`
      SELECT
        p.project_code,
        p.name,
        d.name as department_name,
        p.delay_days,
        p.status
      FROM projects p
      LEFT JOIN departments d ON p.department_id = d.id
      ${whereClause} AND p.delay_days > 0
      ORDER BY p.delay_days DESC
      LIMIT 10
    `, params);

    logger.info('Generated executive summary', {
      filters,
      totalProjects: summary.total_projects
    });

    return {
      filters,
      generated_at: new Date().toISOString(),
      summary: {
        ...summary,
        total_budget: parseFloat(summary.total_budget || 0),
        average_budget: parseFloat(summary.average_budget || 0),
        average_progress: parseFloat(summary.average_progress || 0)
      },
      by_department: byDepartment.map(dept => ({
        ...dept,
        total_budget: parseFloat(dept.total_budget || 0),
        average_progress: parseFloat(dept.average_progress || 0)
      })),
      by_procurement_method: byMethod.map(method => ({
        ...method,
        total_budget: parseFloat(method.total_budget || 0)
      })),
      delayed_projects: delayedProjects
    };
  } catch (error) {
    logger.error('Error generating executive summary:', error);
    throw error;
  }
}

/**
 * Get departments list
 */
export function getDepartments() {
  return query('SELECT id, name, code FROM departments WHERE active = 1 ORDER BY name');
}

export default {
  getDetailedReport,
  getExecutiveSummary,
  getDepartments
};
