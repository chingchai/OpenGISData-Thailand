import express from 'express';
import authRoutes from './auth.js';
import projectRoutes from './projects.js';
import stepRoutes from './steps.js';
import uploadRoutes from './upload.js';

const router = express.Router();

// API version info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Procurement System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      projectSteps: '/api/projects/:projectId/steps',
      steps: '/api/steps',
      stepsByProject: '/api/projects/:projectId/steps',
      overdueSteps: '/api/steps/overdue',
      upload: '/api/upload'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/steps', stepRoutes);
router.use('/upload', uploadRoutes);

export default router;
