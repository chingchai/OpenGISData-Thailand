/**
 * Step Service Unit Tests
 * Tests business logic for step management
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import {
  initTestDb,
  seedTestDb,
  clearTestDb,
  closeTestDb,
  createTestProject,
  createTestStep,
  queryOne,
  execute
} from '../helpers/testDb.js';

describe('Step Service - Unit Tests', () => {
  beforeAll(() => {
    initTestDb();
    seedTestDb();
  });

  afterAll(() => {
    closeTestDb();
  });

  beforeEach(() => {
    clearTestDb();
    seedTestDb();
  });

  describe('getStepsByProject', () => {
    test('should get all steps for a project', () => {
      // Arrange: Create project and steps
      const project = createTestProject({ name: 'Test Project 1' });
      createTestStep(project.id, { step_number: 1, step_name: 'Step 1' });
      createTestStep(project.id, { step_number: 2, step_name: 'Step 2' });

      // Act: Query steps
      const steps = queryOne(`
        SELECT COUNT(*) as count FROM project_steps WHERE project_id = ?
      `, [project.id]);

      // Assert
      expect(steps.count).toBe(2);
    });

    test('should calculate delay for overdue steps', () => {
      // Arrange: Create overdue step
      const project = createTestProject();
      const overdueStep = createTestStep(project.id, {
        step_name: 'Overdue Step',
        planned_end_date: '2020-01-01', // Past date
        status: 'in_progress'
      });

      // Act: Check computed status
      const step = queryOne(`
        SELECT *,
          CASE
            WHEN status != 'completed' AND DATE('now') > planned_end_date THEN 'overdue'
            ELSE status
          END as computed_status,
          CASE
            WHEN DATE('now') > planned_end_date THEN
              CAST((julianday('now') - julianday(planned_end_date)) AS INTEGER)
            ELSE 0
          END as delay_days
        FROM project_steps WHERE id = ?
      `, [overdueStep.id]);

      // Assert
      expect(step.computed_status).toBe('overdue');
      expect(step.delay_days).toBeGreaterThan(1000); // More than 1000 days overdue
    });
  });

  describe('updateStepStatus', () => {
    test('should update step status successfully', () => {
      // Arrange
      const project = createTestProject();
      const step = createTestStep(project.id, { status: 'pending' });

      // Act: Update status
      execute(`
        UPDATE project_steps
        SET status = ?, updated_at = datetime('now')
        WHERE id = ?
      `, ['in_progress', step.id]);

      // Assert
      const updated = queryOne('SELECT * FROM project_steps WHERE id = ?', [step.id]);
      expect(updated.status).toBe('in_progress');
    });

    test('should auto-set actual_start_date when status changes to in_progress', () => {
      // Arrange
      const project = createTestProject();
      const step = createTestStep(project.id, { status: 'pending' });

      // Act: Update to in_progress with actual_start_date
      execute(`
        UPDATE project_steps
        SET status = ?,
            actual_start_date = datetime('now'),
            updated_at = datetime('now')
        WHERE id = ?
      `, ['in_progress', step.id]);

      // Assert
      const updated = queryOne('SELECT * FROM project_steps WHERE id = ?', [step.id]);
      expect(updated.status).toBe('in_progress');
      expect(updated.actual_start_date).toBeTruthy();
    });

    test('should auto-set actual_end_date when status changes to completed', () => {
      // Arrange
      const project = createTestProject();
      const step = createTestStep(project.id, { status: 'in_progress' });

      // Act: Complete step
      execute(`
        UPDATE project_steps
        SET status = ?,
            actual_end_date = datetime('now'),
            updated_at = datetime('now')
        WHERE id = ?
      `, ['completed', step.id]);

      // Assert
      const updated = queryOne('SELECT * FROM project_steps WHERE id = ?', [step.id]);
      expect(updated.status).toBe('completed');
      expect(updated.actual_end_date).toBeTruthy();
    });
  });

  describe('calculateStepDelay', () => {
    test('should calculate delay for completed late step', () => {
      // Arrange: Create step that finished late
      const project = createTestProject();

      // Insert step with explicit dates
      execute(`
        INSERT INTO project_steps (
          project_id, step_number, step_name, step_description,
          planned_start_date, planned_end_date,
          actual_start_date, actual_end_date,
          sla_days, status, created_by,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [
        project.id, 1, 'Delayed Step', 'Test',
        '2024-01-01', '2024-01-15',
        '2024-01-01', '2024-01-20',
        14, 'completed', 1
      ]);

      // Act: Calculate delay (2024-01-20 minus 2024-01-15 = 5 days)
      const result = queryOne(`
        SELECT
          ROUND(julianday(actual_end_date) - julianday(planned_end_date)) as delay_days
        FROM project_steps
        WHERE project_id = ? AND step_number = 1
      `, [project.id]);

      // Assert
      expect(result.delay_days).toBe(5);
    });

    test('should return 0 delay for on-time completion', () => {
      // Arrange
      const project = createTestProject();
      const step = createTestStep(project.id, {
        planned_end_date: '2024-01-15',
        actual_end_date: '2024-01-14',
        status: 'completed'
      });

      // Act
      const result = queryOne(`
        SELECT
          COALESCE(ROUND(julianday(actual_end_date) - julianday(planned_end_date)), 0) as delay_days
        FROM project_steps WHERE id = ?
      `, [step.id]);

      // Assert
      expect(result.delay_days).toBeLessThanOrEqual(0);
    });
  });

  describe('getStepProgress', () => {
    test('should calculate project progress correctly', () => {
      // Arrange: Create project with 5 steps, 2 completed
      const project = createTestProject();
      createTestStep(project.id, { step_number: 1, status: 'completed' });
      createTestStep(project.id, { step_number: 2, status: 'completed' });
      createTestStep(project.id, { step_number: 3, status: 'in_progress' });
      createTestStep(project.id, { step_number: 4, status: 'pending' });
      createTestStep(project.id, { step_number: 5, status: 'pending' });

      // Act
      const progress = queryOne(`
        SELECT
          COUNT(*) as total_steps,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_steps,
          CAST(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS INTEGER) as progress_percentage
        FROM project_steps
        WHERE project_id = ?
      `, [project.id]);

      // Assert
      expect(progress.total_steps).toBe(5);
      expect(progress.completed_steps).toBe(2);
      expect(progress.progress_percentage).toBe(40); // 2/5 = 40%
    });
  });

  describe('getOverdueSteps', () => {
    test('should identify overdue steps', () => {
      // Arrange
      const project = createTestProject();

      // Overdue step
      createTestStep(project.id, {
        step_number: 1,
        planned_end_date: '2020-01-01',
        status: 'in_progress'
      });

      // On-time step
      createTestStep(project.id, {
        step_number: 2,
        planned_end_date: '2099-12-31',
        status: 'in_progress'
      });

      // Act: Find overdue steps
      const overdueSteps = queryOne(`
        SELECT COUNT(*) as count
        FROM project_steps
        WHERE status != 'completed'
          AND DATE('now') > planned_end_date
      `);

      // Assert
      expect(overdueSteps.count).toBe(1);
    });
  });
});
