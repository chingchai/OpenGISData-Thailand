import { checkPermission } from '../config/auth.js';
import { queryOne } from '../config/database.js';

/**
 * Middleware to check if user has permission for action on resource
 */
export const requirePermission = (action, resource) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const context = {
      projectDepartmentId: req.params.departmentId ? parseInt(req.params.departmentId) : null,
      targetDepartmentId: req.body.departmentId ? parseInt(req.body.departmentId) : null
    };

    const hasPermission = checkPermission(req.user, action, resource, context);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions for this action',
        required: { action, resource }
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource (for edit/delete own items)
 */
export const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    const { user } = req;
    const resourceId = req.params.id || req.params.commentId;

    if (!resourceId) {
      return res.status(400).json({
        success: false,
        error: 'Resource ID required'
      });
    }

    try {
      let resource;

      switch (resourceType) {
        case 'comment':
          resource = queryOne('SELECT user_id FROM comments WHERE id = ?', [resourceId]);
          break;

        case 'project':
          resource = queryOne('SELECT created_by, department_id FROM projects WHERE id = ?', [resourceId]);
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid resource type'
          });
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: `${resourceType} not found`
        });
      }

      // Check ownership
      const ownerId = resource.user_id || resource.created_by;

      // Admin can edit/delete anything
      if (user.role === 'admin') {
        return next();
      }

      // Executive can edit/delete own comments
      if (user.role === 'executive' && resourceType === 'comment' && ownerId === user.id) {
        return next();
      }

      // Staff can edit/delete own resources in their department
      if (user.role === 'staff') {
        if (ownerId !== user.id) {
          return res.status(403).json({
            success: false,
            error: 'Cannot modify resources created by others'
          });
        }

        if (resource.department_id && resource.department_id !== user.departmentId) {
          return res.status(403).json({
            success: false,
            error: 'Cannot modify resources from other departments'
          });
        }

        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error checking ownership'
      });
    }
  };
};

/**
 * Middleware to filter data by department (for staff users)
 */
export const filterByDepartment = (req, res, next) => {
  const { user } = req;

  // Admin and Executive see all departments
  if (user.role === 'admin' || user.role === 'executive') {
    req.departmentFilter = null; // No filter
    return next();
  }

  // Staff only see their own department
  if (user.role === 'staff') {
    req.departmentFilter = user.departmentId;
    return next();
  }

  next();
};

/**
 * Middleware to check if user can comment
 */
export const canComment = (req, res, next) => {
  const { user } = req;

  // Only admin and executive can comment
  if (user.role === 'admin' || user.role === 'executive') {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Only admin and executive can add comments'
  });
};

/**
 * Middleware to check if user can manage SLA
 */
export const canManageSLA = (req, res, next) => {
  const { user } = req;

  // Only admin and executive can manage SLA
  if (user.role === 'admin' || user.role === 'executive') {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Only admin and executive can manage SLA settings'
  });
};

/**
 * Middleware to check if user can export data
 */
export const canExport = (req, res, next) => {
  const { user } = req;

  // Only admin and executive can export
  if (user.role === 'admin' || user.role === 'executive') {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Only admin and executive can export data'
  });
};

export default {
  requirePermission,
  requireOwnership,
  filterByDepartment,
  canComment,
  canManageSLA,
  canExport
};
