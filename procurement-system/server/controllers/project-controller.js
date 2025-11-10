/**
 * Project Controller - HTTP Request Handlers
 * Handles incoming requests and responses for project management
 */

import * as projectService from '../services/project-service.js';

/**
 * Get all projects
 * GET /api/projects
 * Query params: departmentId, status, budgetYear, procurementMethod, page, limit
 */
export const getAllProjects = async (req, res) => {
  try {
    const { departmentId, status, budgetYear, procurementMethod, page, limit } = req.query;
    const user = req.user;

    // Build filters
    const filters = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    // Staff users can only see their department's projects
    if (user.role === 'staff') {
      filters.departmentId = user.departmentId;
    } else if (departmentId) {
      // Admin/Executive can filter by department
      filters.departmentId = parseInt(departmentId);
    }

    if (status) filters.status = status;
    if (budgetYear) filters.budgetYear = parseInt(budgetYear);
    if (procurementMethod) filters.procurementMethod = procurementMethod;

    const result = projectService.getAllProjects(filters);

    res.json(result);
  } catch (error) {
    console.error('Error in getAllProjects controller:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch projects'
    });
  }
};

/**
 * Get project by ID
 * GET /api/projects/:id
 */
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const result = projectService.getProjectById(parseInt(id));

    // Check permission - staff can only view their department's projects
    if (user.role === 'staff' && result.data.department_id !== user.departmentId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view projects from your department.'
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error in getProjectById controller:', error);
    const statusCode = error.message === 'Project not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to fetch project'
    });
  }
};

/**
 * Create new project
 * POST /api/projects
 * Body: { name, description, departmentId, procurementMethod, budgetAmount, budgetYear, startDate }
 */
export const createProject = async (req, res) => {
  try {
    const user = req.user;
    const projectData = req.body;

    // Validate required fields
    const requiredFields = ['name', 'departmentId', 'procurementMethod', 'budgetAmount', 'budgetYear'];
    for (const field of requiredFields) {
      if (!projectData[field]) {
        return res.status(400).json({
          success: false,
          error: `Missing required field: ${field}`
        });
      }
    }

    // Staff can only create projects for their department
    if (user.role === 'staff') {
      if (parseInt(projectData.departmentId) !== user.departmentId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only create projects for your department.'
        });
      }
    }

    // Validate procurement method
    const validMethods = ['public_invitation', 'selection', 'specific'];
    if (!validMethods.includes(projectData.procurementMethod)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid procurement method. Must be one of: ' + validMethods.join(', ')
      });
    }

    // Validate budget amount
    if (projectData.budgetAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Budget amount must be greater than 0'
      });
    }

    const result = projectService.createProject(
      {
        name: projectData.name,
        description: projectData.description,
        departmentId: parseInt(projectData.departmentId),
        procurementMethod: projectData.procurementMethod,
        budgetAmount: parseFloat(projectData.budgetAmount),
        budgetYear: parseInt(projectData.budgetYear),
        startDate: projectData.startDate
      },
      user.id
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Error in createProject controller:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create project'
    });
  }
};

/**
 * Update project
 * PUT /api/projects/:id
 * Body: Fields to update
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const updateData = req.body;

    // Get current project to check permissions
    const currentProject = projectService.getProjectById(parseInt(id));

    // Check permission - staff can only update their department's projects
    if (user.role === 'staff' && currentProject.data.department_id !== user.departmentId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only update projects from your department.'
      });
    }

    // Executives cannot create/edit projects
    if (user.role === 'executive') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Executives can only view and comment on projects.'
      });
    }

    // Validate budget amount if provided
    if (updateData.budgetAmount !== undefined && updateData.budgetAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Budget amount must be greater than 0'
      });
    }

    // Validate status if provided
    if (updateData.status) {
      const validStatuses = ['draft', 'in_progress', 'completed', 'cancelled', 'on_hold'];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
      }
    }

    const result = projectService.updateProject(
      parseInt(id),
      updateData,
      user.id
    );

    res.json(result);
  } catch (error) {
    console.error('Error in updateProject controller:', error);
    const statusCode = error.message === 'Project not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to update project'
    });
  }
};

/**
 * Delete project (soft delete)
 * DELETE /api/projects/:id
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Get current project to check permissions
    const currentProject = projectService.getProjectById(parseInt(id));

    // Check permission - staff can only delete their department's projects
    if (user.role === 'staff' && currentProject.data.department_id !== user.departmentId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only delete projects from your department.'
      });
    }

    // Executives cannot delete projects
    if (user.role === 'executive') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Executives cannot delete projects.'
      });
    }

    // Don't allow deletion of completed projects
    if (currentProject.data.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete completed projects. Please contact an administrator.'
      });
    }

    const result = projectService.deleteProject(
      parseInt(id),
      user.id
    );

    res.json(result);
  } catch (error) {
    console.error('Error in deleteProject controller:', error);
    const statusCode = error.message === 'Project not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to delete project'
    });
  }
};

/**
 * Get project statistics
 * GET /api/projects/stats
 */
export const getProjectStatistics = async (req, res) => {
  try {
    const user = req.user;

    // Staff users can only see their department's statistics
    const departmentId = user.role === 'staff' ? user.departmentId : null;

    const result = projectService.getProjectStatistics(departmentId);

    res.json(result);
  } catch (error) {
    console.error('Error in getProjectStatistics controller:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch project statistics'
    });
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
