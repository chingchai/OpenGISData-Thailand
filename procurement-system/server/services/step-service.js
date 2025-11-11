/**
 * Step Service - Business Logic Layer
 * Handles project step operations, status tracking, and SLA monitoring
 * ใช้ Core Infrastructure
 */

import { query, queryOne, execute, transaction, getDatabase } from '../config/database.js';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Get all steps for a specific project
 * @param {number} projectId - Project ID
 * @returns {Object} - { data: array of steps }
 */
export function getStepsByProject(projectId) {
  try {
    const steps = query(`
      SELECT
        ps.*,
        CASE
          WHEN ps.status = 'completed' AND ps.actual_end > ps.planned_end THEN 'delayed'
          WHEN ps.status != 'completed' AND DATE('now') > ps.planned_end THEN 'overdue'
          ELSE ps.status
        END as computed_status,
        CASE
          WHEN ps.actual_end IS NOT NULL THEN
            CAST((julianday(ps.actual_end) - julianday(ps.planned_end)) AS INTEGER)
          WHEN DATE('now') > ps.planned_end THEN
            CAST((julianday('now') - julianday(ps.planned_end)) AS INTEGER)
          ELSE 0
        END as delay_days_computed
      FROM project_steps ps
      WHERE ps.project_id = ?
      ORDER BY ps.step_number ASC
    `, [projectId]);

    logger.dbOperation('getStepsByProject', 'project_steps', {
      projectId,
      stepsCount: steps.length
    });

    return {
      data: steps
    };
  } catch (error) {
    logger.error('Error in getStepsByProject service:', {
      error: error.message,
      stack: error.stack,
      projectId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการดึงข้อมูลขั้นตอน', error);
  }
};

/**
 * Get step by ID
 * @param {number} stepId - Step ID
 * @returns {Object} - { data: step details }
 */
export function getStepById(stepId) {
  try {
    const step = queryOne(`
      SELECT
        ps.*,
        p.name as project_name,
        p.project_code,
        p.procurement_method,
        d.name as department_name
      FROM project_steps ps
      LEFT JOIN projects p ON ps.project_id = p.id
      LEFT JOIN departments d ON p.department_id = d.id
      WHERE ps.id = ?
    `, [stepId]);

    if (!step) {
      logger.warn('Step not found', { stepId });
      throw new NotFoundError('ไม่พบขั้นตอนที่ต้องการ');
    }

    logger.dbOperation('getStepById', 'project_steps', {
      stepId,
      found: true
    });

    return {
      data: step
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Error in getStepById service:', {
      error: error.message,
      stack: error.stack,
      stepId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการดึงข้อมูลขั้นตอน', error);
  }
};

/**
 * Update step status with automatic tracking
 * @param {number} stepId - Step ID
 * @param {string} status - New status (pending/in_progress/completed/on_hold)
 * @param {number} userId - User ID making the update
 * @returns {Object} - { data: updated step }
 */
export function updateStepStatus(stepId, status, userId) {
  try {
    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'on_hold', 'overdue'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(
        `สถานะไม่ถูกต้อง ต้องเป็น: ${validStatuses.join(', ')}`
      );
    }

    // Get current step
    const currentStep = queryOne('SELECT * FROM project_steps WHERE id = ?', [stepId]);
    if (!currentStep) {
      throw new NotFoundError('ไม่พบขั้นตอนที่ต้องการ');
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updates = { status };

    // Auto-set actual_start when status changes to in_progress
    if (status === 'in_progress' && !currentStep.actual_start) {
      updates.actual_start = now;
      logger.info('Step started', {
        stepId,
        stepNumber: currentStep.step_number,
        projectId: currentStep.project_id
      });
    }

    // Auto-set actual_end and calculate delay when status changes to completed
    if (status === 'completed' && !currentStep.actual_end) {
      updates.actual_end = now;

      // Calculate delay days
      const plannedEnd = new Date(currentStep.planned_end);
      const actualEnd = new Date(now);
      const delayDays = Math.floor((actualEnd - plannedEnd) / (1000 * 60 * 60 * 24));
      updates.delay_days = Math.max(0, delayDays);

      logger.info('Step completed', {
        stepId,
        stepNumber: currentStep.step_number,
        projectId: currentStep.project_id,
        delayDays: updates.delay_days,
        onTime: updates.delay_days === 0
      });
    }

    // Update step
    const result = transaction(() => {
      const db = getDatabase();

      // Build update SQL
      const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);

      db.prepare(`
        UPDATE project_steps
        SET ${updateFields}, updated_at = datetime('now')
        WHERE id = ?
      `).run(...values, stepId);

      // Log audit trail
      db.prepare(`
        INSERT INTO audit_log (
          user_id, action, entity_type, entity_id,
          new_values, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        userId,
        'UPDATE',
        'project_steps',
        stepId,
        JSON.stringify({
          field: 'status',
          from: currentStep.status,
          to: status,
          metadata: updates
        }),
        '127.0.0.1'
      );

      return stepId;
    });

    // Auto-start next step if current step is completed
    if (status === 'completed') {
      exports.autoStartNextStep(currentStep.project_id, currentStep.step_number);
    }

    return exports.getStepById(result);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Error in updateStepStatus service:', {
      error: error.message,
      stack: error.stack,
      stepId,
      status,
      userId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการอัพเดทสถานะขั้นตอน', error);
  }
};

/**
 * Update step details
 * @param {number} stepId - Step ID
 * @param {Object} updateData - Data to update
 * @param {number} userId - User ID making the update
 * @returns {Object} - { data: updated step }
 */
export function updateStep(stepId, updateData, userId) {
  try {
    // Get current step
    const currentStep = queryOne('SELECT * FROM project_steps WHERE id = ?', [stepId]);
    if (!currentStep) {
      throw new NotFoundError('ไม่พบขั้นตอนที่ต้องการแก้ไข');
    }

    // Allowed fields for update
    const allowedFields = [
      'step_name', 'step_description', 'planned_start', 'planned_end',
      'actual_start', 'actual_end', 'sla_days', 'is_critical',
      'allow_weekends', 'notes'
    ];

    // Map camelCase to snake_case
    const fieldMapping = {
      stepName: 'step_name',
      stepDescription: 'step_description',
      plannedStartDate: 'planned_start',
      plannedEndDate: 'planned_end',
      actualStartDate: 'actual_start',
      actualEndDate: 'actual_end',
      slaDays: 'sla_days',
      isCritical: 'is_critical',
      allowWeekends: 'allow_weekends',
      notes: 'notes'
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
          from: currentStep[dbField],
          to: updateData[key]
        };
      }
    });

    if (updates.length === 0) {
      throw new ValidationError('ไม่มีข้อมูลที่ต้องการแก้ไข');
    }

    // Add updated timestamp
    updates.push('updated_at = datetime(\'now\')');
    params.push(stepId);

    const sql = `UPDATE project_steps SET ${updates.join(', ')} WHERE id = ?`;

    transaction(() => {
      const db = getDatabase();

      const result = db.prepare(sql).run(...params);

      if (result.changes === 0) {
        throw new NotFoundError('ไม่พบขั้นตอนที่ต้องการแก้ไข');
      }

      // Log audit trail
      db.prepare(`
        INSERT INTO audit_log (
          user_id, action, entity_type, entity_id,
          new_values, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        userId,
        'UPDATE',
        'project_steps',
        stepId,
        JSON.stringify(changeLog),
        '127.0.0.1'
      );

      logger.info('Step updated successfully', {
        stepId,
        userId,
        updatedFields: Object.keys(changeLog),
        changes: result.changes
      });
    });

    return exports.getStepById(stepId);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }

    logger.error('Error in updateStep service:', {
      error: error.message,
      stack: error.stack,
      stepId,
      updateData,
      userId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการแก้ไขขั้นตอน', error);
  }
};

/**
 * Calculate step delay and overdue status
 * @param {number} stepId - Step ID
 * @returns {Object} - { data: delay information }
 */
export function calculateStepDelay(stepId) {
  try {
    const step = queryOne('SELECT * FROM project_steps WHERE id = ?', [stepId]);
    if (!step) {
      throw new NotFoundError('ไม่พบขั้นตอนที่ต้องการ');
    }

    const now = new Date();
    const plannedEnd = new Date(step.planned_end);
    let delayDays = 0;
    let isOverdue = false;
    let warningLevel = 'normal'; // normal, warning, critical

    if (step.status === 'completed' && step.actual_end) {
      // Calculate actual delay for completed steps
      const actualEnd = new Date(step.actual_end);
      delayDays = Math.floor((actualEnd - plannedEnd) / (1000 * 60 * 60 * 24));
      isOverdue = delayDays > 0;
    } else if (step.status !== 'completed') {
      // Calculate potential delay for incomplete steps
      delayDays = Math.floor((now - plannedEnd) / (1000 * 60 * 60 * 24));
      isOverdue = delayDays > 0;
    }

    // Determine warning level
    if (delayDays > 7) {
      warningLevel = 'critical';
    } else if (delayDays > 3 || (delayDays < 0 && Math.abs(delayDays) <= 3)) {
      warningLevel = 'warning';
    }

    const delayInfo = {
      stepId,
      stepNumber: step.step_number,
      stepName: step.step_name,
      status: step.status,
      plannedEndDate: step.planned_end,
      actualEndDate: step.actual_end,
      delayDays: Math.max(0, delayDays),
      isOverdue,
      warningLevel,
      daysUntilDeadline: Math.max(0, -delayDays)
    };

    logger.dbOperation('calculateStepDelay', 'project_steps', {
      stepId,
      delayDays: delayInfo.delayDays,
      isOverdue,
      warningLevel
    });

    return {
      data: delayInfo
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Error in calculateStepDelay service:', {
      error: error.message,
      stack: error.stack,
      stepId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการคำนวณความล่าช้า', error);
  }
};

/**
 * Get project progress summary
 * @param {number} projectId - Project ID
 * @returns {Object} - { data: progress summary }
 */
export function getStepProgress(projectId) {
  try {
    const summary = queryOne(`
      SELECT
        COUNT(*) as total_steps,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_steps,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_steps,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_steps,
        SUM(CASE WHEN status = 'on_hold' THEN 1 ELSE 0 END) as on_hold_steps,
        SUM(CASE WHEN DATE('now') > planned_end AND status != 'completed' THEN 1 ELSE 0 END) as overdue_steps,
        SUM(CASE WHEN delay_days > 0 THEN delay_days ELSE 0 END) as total_delay_days,
        AVG(CASE WHEN delay_days > 0 THEN delay_days ELSE 0 END) as average_delay_days,
        MIN(planned_start) as project_start_date,
        MAX(planned_end) as project_end_date
      FROM project_steps
      WHERE project_id = ?
    `, [projectId]);

    if (!summary) {
      throw new NotFoundError('ไม่พบข้อมูลขั้นตอนของโครงการ');
    }

    const totalSteps = summary.total_steps || 0;
    const completedSteps = summary.completed_steps || 0;
    const progressPercentage = totalSteps > 0
      ? Math.round((completedSteps / totalSteps) * 100)
      : 0;

    // Get current step
    const currentStep = queryOne(`
      SELECT * FROM project_steps
      WHERE project_id = ? AND status IN ('in_progress', 'pending')
      ORDER BY step_number ASC
      LIMIT 1
    `, [projectId]);

    const progress = {
      projectId,
      totalSteps,
      completedSteps,
      inProgressSteps: summary.in_progress_steps || 0,
      pendingSteps: summary.pending_steps || 0,
      onHoldSteps: summary.on_hold_steps || 0,
      overdueSteps: summary.overdue_steps || 0,
      progressPercentage,
      totalDelayDays: summary.total_delay_days || 0,
      averageDelayDays: Math.round(summary.average_delay_days || 0),
      projectStartDate: summary.project_start_date,
      projectEndDate: summary.project_end_date,
      currentStep: currentStep ? {
        stepNumber: currentStep.step_number,
        stepName: currentStep.step_name,
        status: currentStep.status,
        plannedEndDate: currentStep.planned_end
      } : null,
      status: progressPercentage === 100 ? 'completed' :
              progressPercentage > 0 ? 'in_progress' : 'pending'
    };

    logger.dbOperation('getStepProgress', 'project_steps', {
      projectId,
      progressPercentage,
      completedSteps: `${completedSteps}/${totalSteps}`
    });

    return {
      data: progress
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    logger.error('Error in getStepProgress service:', {
      error: error.message,
      stack: error.stack,
      projectId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการดึงข้อมูลความคืบหน้า', error);
  }
};

/**
 * Automatically start the next step when current step is completed
 * @param {number} projectId - Project ID
 * @param {number} currentStepNumber - Current step number
 * @returns {Object|null} - Next step if auto-started, null otherwise
 */
export function autoStartNextStep(projectId, currentStepNumber) {
  try {
    // Get next step
    const nextStep = queryOne(`
      SELECT * FROM project_steps
      WHERE project_id = ? AND step_number = ?
    `, [projectId, currentStepNumber + 1]);

    if (!nextStep) {
      logger.info('No next step found, project may be complete', {
        projectId,
        currentStepNumber
      });
      return null;
    }

    // Only auto-start if next step is pending
    if (nextStep.status === 'pending') {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      execute(`
        UPDATE project_steps
        SET status = 'in_progress', actual_start = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [now, nextStep.id]);

      logger.info('Next step auto-started', {
        projectId,
        previousStepNumber: currentStepNumber,
        nextStepNumber: nextStep.step_number,
        nextStepId: nextStep.id
      });

      return exports.getStepById(nextStep.id);
    }

    return null;
  } catch (error) {
    logger.error('Error in autoStartNextStep:', {
      error: error.message,
      projectId,
      currentStepNumber
    });
    // Don't throw error, just log it (auto-start is not critical)
    return null;
  }
};

/**
 * Get overdue steps across all projects (for notifications)
 * @param {number} departmentId - Optional department filter
 * @returns {Object} - { data: array of overdue steps }
 */
export function getOverdueSteps(departmentId = null) {
  try {
    let sql = `
      SELECT
        ps.*,
        p.name as project_name,
        p.project_code,
        p.department_id,
        d.name as department_name,
        u.full_name as created_by_name,
        u.email as created_by_email,
        CAST((julianday('now') - julianday(ps.planned_end)) AS INTEGER) as days_overdue
      FROM project_steps ps
      LEFT JOIN projects p ON ps.project_id = p.id
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE ps.status != 'completed'
        AND DATE('now') > ps.planned_end
        AND p.deleted_at IS NULL
    `;

    const params = [];

    if (departmentId) {
      sql += ' AND p.department_id = ?';
      params.push(departmentId);
    }

    sql += ' ORDER BY ps.planned_end ASC';

    const overdueSteps = query(sql, params);

    logger.dbOperation('getOverdueSteps', 'project_steps', {
      departmentId,
      overdueCount: overdueSteps.length
    });

    return {
      data: overdueSteps
    };
  } catch (error) {
    logger.error('Error in getOverdueSteps service:', {
      error: error.message,
      stack: error.stack,
      departmentId
    });
    throw new DatabaseError('เกิดข้อผิดพลาดในการดึงข้อมูลขั้นตอนที่ล่าช้า', error);
  }
};

export default {
  getStepsByProject,
  getStepById,
  updateStepStatus,
  updateStep,
  calculateStepDelay,
  getStepProgress,
  autoStartNextStep,
  getOverdueSteps
};
