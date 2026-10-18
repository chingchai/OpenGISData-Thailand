import express from 'express';
import authRoutes from './auth.js';
import projectRoutes from './projects.js';
import stepRoutes from './steps.js';
import uploadRoutes from './upload.js';
import reportRoutes from './reports.js';
import userRoutes from './users.js';
import departmentRoutes from './departments.js';
import notificationRoutes from './notifications.js';
import supervisorReviewRoutes from './supervisor-reviews.js';

const router = express.Router();

// API version info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ระบบกำกับติดตามความก้าวหน้าโครงการ API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      projectSteps: '/api/projects/:projectId/steps',
      steps: '/api/steps',
      stepsByProject: '/api/projects/:projectId/steps',
      overdueSteps: '/api/steps/overdue',
      upload: '/api/upload',
      reports: '/api/reports',
      users: '/api/users',
      departments: '/api/departments',
      notifications: '/api/notifications',
      supervisorReviews: '/api/supervisor-reviews'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/steps', stepRoutes);
router.use('/upload', uploadRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/supervisor-reviews', supervisorReviewRoutes);

export default router;
