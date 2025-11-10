import express from 'express';
import authRoutes from './auth.js';
import projectRoutes from './projects.js';
import stepRoutes from './steps.js';

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
      steps: '/api/projects/:id/steps'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);

export default router;
