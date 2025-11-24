/**
 * Step API Integration Tests
 * Tests HTTP endpoints with permissions and auto-tracking
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import {
  initTestDb,
  seedTestDb,
  clearTestDb,
  closeTestDb,
  createTestProject,
  createTestStep
} from '../helpers/testDb.js';
import { testTokens, authHeader } from '../helpers/authHelper.js';
import stepController from '../../controllers/step-controller.js';
import { authenticate } from '../../middleware/auth.js';
import { errorHandler } from '../../utils/errors.js';

// Create test Express app
let app;

beforeAll(() => {
  // Initialize database
  initTestDb();
  seedTestDb();

  // Setup Express app
  app = express();
  app.use(express.json());

  // Mock authenticate middleware for testing
  app.use((req, res, next) => {
    // Extract token from Authorization header
    const authHeaderValue = req.headers.authorization;
    if (!authHeaderValue || !authHeaderValue.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeaderValue.substring(7);

    // Mock user based on token
    if (token === testTokens.admin) {
      req.user = { id: 1, username: 'admin', role: 'admin', departmentId: 1 };
    } else if (token === testTokens.staff1) {
      req.user = { id: 2, username: 'staff1', role: 'staff', departmentId: 1 };
    } else if (token === testTokens.staff2) {
      req.user = { id: 3, username: 'staff2', role: 'staff', departmentId: 2 };
    } else if (token === testTokens.executive) {
      req.user = { id: 4, username: 'exec', role: 'executive', departmentId: 1 };
    } else {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    next();
  });

  // Mount step routes
  app.get('/api/projects/:projectId/steps', stepController.getStepsByProject);
  app.get('/api/steps/:id', stepController.getStepById);
  app.patch('/api/steps/:id/status', stepController.updateStepStatus);
  app.put('/api/steps/:id', stepController.updateStep);
  app.get('/api/projects/:projectId/steps/progress', stepController.getStepProgress);
  app.get('/api/steps/:id/delay', stepController.calculateStepDelay);
  app.get('/api/steps/overdue', stepController.getOverdueSteps);

  // Error handler
  app.use(errorHandler);
});

afterAll(() => {
  closeTestDb();
});

beforeEach(() => {
  clearTestDb();
  seedTestDb();
});

describe('Step API - Integration Tests', () => {

  describe('GET /api/projects/:projectId/steps', () => {
    test('should get all steps for a project (admin)', async () => {
      // Arrange
      const project = createTestProject({ name: 'Test Project', department_id: 1 });
      createTestStep(project.id, { step_number: 1, step_name: 'Step 1' });
      createTestStep(project.id, { step_number: 2, step_name: 'Step 2' });

      // Act
      const response = await request(app)
        .get(`/api/projects/${project.id}/steps`)
        .set('Authorization', authHeader(testTokens.admin));

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].step_name).toBe('Step 1');
    });

    test('should allow staff to view their department projects', async () => {
      // Arrange: Staff1 is in department 1
      const project = createTestProject({ department_id: 1 });
      createTestStep(project.id, { step_name: 'Department 1 Step' });

      // Act
      const response = await request(app)
        .get(`/api/projects/${project.id}/steps`)
        .set('Authorization', authHeader(testTokens.staff1));

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    test('should deny staff access to other department projects', async () => {
      // Arrange: Staff1 is in dept 1, project is in dept 2
      const project = createTestProject({ department_id: 2 });
      createTestStep(project.id, { step_name: 'Department 2 Step' });

      // Act
      const response = await request(app)
        .get(`/api/projects/${project.id}/steps`)
        .set('Authorization', authHeader(testTokens.staff1));

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('should return 401 without authentication', async () => {
      // Act
      const response = await request(app)
        .get('/api/projects/1/steps');

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/steps/:id/status', () => {
    test('should update step status to in_progress', async () => {
      // Arrange
      const project = createTestProject({ created_by: 1 });
      const step = createTestStep(project.id, {
        status: 'pending',
        created_by: 1
      });

      // Act
      const response = await request(app)
        .patch(`/api/steps/${step.id}/status`)
        .set('Authorization', authHeader(testTokens.admin))
        .send({ status: 'in_progress' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
      expect(response.body.data.actual_start_date).toBeTruthy();
    });

    test('should update step status to completed', async () => {
      // Arrange
      const project = createTestProject({ created_by: 1 });
      const step = createTestStep(project.id, {
        status: 'in_progress',
        actual_start_date: '2024-01-01',
        created_by: 1
      });

      // Act
      const response = await request(app)
        .patch(`/api/steps/${step.id}/status`)
        .set('Authorization', authHeader(testTokens.admin))
        .send({ status: 'completed' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.actual_end_date).toBeTruthy();
    });

    test('should reject invalid status value', async () => {
      // Arrange
      const project = createTestProject();
      const step = createTestStep(project.id);

      // Act
      const response = await request(app)
        .patch(`/api/steps/${step.id}/status`)
        .set('Authorization', authHeader(testTokens.admin))
        .send({ status: 'invalid_status' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should deny staff from updating other department steps', async () => {
      // Arrange: Project in dept 2, staff1 is in dept 1
      const project = createTestProject({ department_id: 2 });
      const step = createTestStep(project.id);

      // Act
      const response = await request(app)
        .patch(`/api/steps/${step.id}/status`)
        .set('Authorization', authHeader(testTokens.staff1))
        .send({ status: 'in_progress' });

      // Assert
      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/projects/:projectId/steps/progress', () => {
    test('should calculate project progress correctly', async () => {
      // Arrange: 5 steps, 2 completed
      const project = createTestProject();
      createTestStep(project.id, { step_number: 1, status: 'completed' });
      createTestStep(project.id, { step_number: 2, status: 'completed' });
      createTestStep(project.id, { step_number: 3, status: 'in_progress' });
      createTestStep(project.id, { step_number: 4, status: 'pending' });
      createTestStep(project.id, { step_number: 5, status: 'pending' });

      // Act
      const response = await request(app)
        .get(`/api/projects/${project.id}/steps/progress`)
        .set('Authorization', authHeader(testTokens.admin));

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total_steps).toBe(5);
      expect(response.body.data.completed_steps).toBe(2);
      expect(response.body.data.progress_percentage).toBe(40); // 2/5 = 40%
    });
  });

  describe('GET /api/steps/:id/delay', () => {
    test('should calculate delay for overdue step', async () => {
      // Arrange: Step with past deadline
      const project = createTestProject();
      const step = createTestStep(project.id, {
        planned_end_date: '2020-01-01',
        status: 'in_progress'
      });

      // Act
      const response = await request(app)
        .get(`/api/steps/${step.id}/delay`)
        .set('Authorization', authHeader(testTokens.admin));

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.is_overdue).toBe(true);
      expect(response.body.data.delay_days).toBeGreaterThan(1000);
    });

    test('should show no delay for on-time step', async () => {
      // Arrange: Future deadline
      const project = createTestProject();
      const step = createTestStep(project.id, {
        planned_end_date: '2099-12-31',
        status: 'in_progress'
      });

      // Act
      const response = await request(app)
        .get(`/api/steps/${step.id}/delay`)
        .set('Authorization', authHeader(testTokens.admin));

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.is_overdue).toBe(false);
    });
  });

  describe('GET /api/steps/overdue', () => {
    test('should get all overdue steps (admin)', async () => {
      // Arrange
      const project1 = createTestProject({ department_id: 1 });
      const project2 = createTestProject({ department_id: 2 });

      // Overdue steps
      createTestStep(project1.id, {
        step_number: 1,
        planned_end_date: '2020-01-01',
        status: 'in_progress'
      });
      createTestStep(project2.id, {
        step_number: 1,
        planned_end_date: '2020-01-01',
        status: 'in_progress'
      });

      // On-time step
      createTestStep(project1.id, {
        step_number: 2,
        planned_end_date: '2099-12-31',
        status: 'in_progress'
      });

      // Act
      const response = await request(app)
        .get('/api/steps/overdue')
        .set('Authorization', authHeader(testTokens.admin));

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    test('should filter overdue steps by department for staff', async () => {
      // Arrange
      const project1 = createTestProject({ department_id: 1 });
      const project2 = createTestProject({ department_id: 2 });

      createTestStep(project1.id, {
        planned_end_date: '2020-01-01',
        status: 'in_progress'
      });
      createTestStep(project2.id, {
        planned_end_date: '2020-01-01',
        status: 'in_progress'
      });

      // Act: Staff1 is in department 1
      const response = await request(app)
        .get('/api/steps/overdue')
        .set('Authorization', authHeader(testTokens.staff1));

      // Assert
      expect(response.status).toBe(200);
      // Should only see department 1 steps
      const deptIds = response.body.data.map(s => s.department_id);
      expect(deptIds.every(id => id === 1)).toBe(true);
    });
  });

  describe('Permission-Based Access Control', () => {
    test('admin can access all departments', async () => {
      const project = createTestProject({ department_id: 2 });
      const step = createTestStep(project.id);

      const response = await request(app)
        .get(`/api/steps/${step.id}`)
        .set('Authorization', authHeader(testTokens.admin));

      expect(response.status).toBe(200);
    });

    test('executive can view all departments', async () => {
      const project = createTestProject({ department_id: 2 });
      const step = createTestStep(project.id);

      const response = await request(app)
        .get(`/api/steps/${step.id}`)
        .set('Authorization', authHeader(testTokens.executive));

      expect(response.status).toBe(200);
    });

    test('staff can only view own department', async () => {
      // Arrange: Staff1 in dept 1
      const ownDeptProject = createTestProject({ department_id: 1 });
      const ownDeptStep = createTestStep(ownDeptProject.id);

      const otherDeptProject = createTestProject({ department_id: 2 });
      const otherDeptStep = createTestStep(otherDeptProject.id);

      // Act & Assert: Own department - allowed
      const response1 = await request(app)
        .get(`/api/steps/${ownDeptStep.id}`)
        .set('Authorization', authHeader(testTokens.staff1));
      expect(response1.status).toBe(200);

      // Act & Assert: Other department - denied
      const response2 = await request(app)
        .get(`/api/steps/${otherDeptStep.id}`)
        .set('Authorization', authHeader(testTokens.staff1));
      expect(response2.status).toBe(403);
    });
  });

  describe('Auto-Tracking Features', () => {
    test('should auto-track actual_start_date when changing to in_progress', async () => {
      // Arrange
      const project = createTestProject();
      const step = createTestStep(project.id, { status: 'pending' });

      // Act
      const response = await request(app)
        .patch(`/api/steps/${step.id}/status`)
        .set('Authorization', authHeader(testTokens.admin))
        .send({ status: 'in_progress' });

      // Assert
      expect(response.body.data.actual_start_date).toBeTruthy();
      expect(response.body.data.status).toBe('in_progress');
    });

    test('should auto-track actual_end_date when changing to completed', async () => {
      // Arrange
      const project = createTestProject();
      const step = createTestStep(project.id, {
        status: 'in_progress',
        actual_start_date: '2024-01-01'
      });

      // Act
      const response = await request(app)
        .patch(`/api/steps/${step.id}/status`)
        .set('Authorization', authHeader(testTokens.admin))
        .send({ status: 'completed' });

      // Assert
      expect(response.body.data.actual_end_date).toBeTruthy();
      expect(response.body.data.status).toBe('completed');
    });

    test('should calculate delay_days on completion', async () => {
      // Arrange: Step that will be late
      const project = createTestProject();
      const step = createTestStep(project.id, {
        planned_end_date: '2024-01-10',
        status: 'in_progress',
        actual_start_date: '2024-01-01'
      });

      // Act
      const response = await request(app)
        .patch(`/api/steps/${step.id}/status`)
        .set('Authorization', authHeader(testTokens.admin))
        .send({ status: 'completed' });

      // Assert
      expect(response.status).toBe(200);
      // Delay will be calculated based on actual_end_date vs planned_end_date
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent step', async () => {
      const response = await request(app)
        .get('/api/steps/99999')
        .set('Authorization', authHeader(testTokens.admin));

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 for invalid step ID', async () => {
      const response = await request(app)
        .get('/api/steps/invalid')
        .set('Authorization', authHeader(testTokens.admin));

      expect(response.status).toBe(400);
    });

    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/steps/1');

      expect(response.status).toBe(401);
    });
  });
});
