import { verifyToken, extractTokenFromHeader } from '../config/auth.js';
import { queryOne } from '../config/database.js';

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = queryOne(
      'SELECT id, username, full_name, email, role, department_id, active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.active) {
      return res.status(401).json({
        success: false,
        error: 'User account is disabled'
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      departmentId: user.department_id
    };

    next();
  } catch (error) {
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Middleware to check if user has specific role
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        requiredRole: roles
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware to check if user is admin or executive
 */
export const requireAdminOrExecutive = requireRole('admin', 'executive');

/**
 * Middleware to check if user can access specific department
 */
export const requireDepartmentAccess = (req, res, next) => {
  const { user } = req;
  const { departmentId } = req.params;

  // Admin and Executive can access all departments
  if (user.role === 'admin' || user.role === 'executive') {
    return next();
  }

  // Staff can only access their own department
  if (user.role === 'staff') {
    if (parseInt(departmentId) !== user.departmentId) {
      return res.status(403).json({
        success: false,
        error: 'Cannot access other department data'
      });
    }
  }

  next();
};

/**
 * Optional authentication - doesn't fail if no token
 * but adds user to req if token is valid
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      const user = queryOne(
        'SELECT id, username, full_name, email, role, department_id, active FROM users WHERE id = ?',
        [decoded.id]
      );

      if (user && user.active) {
        req.user = {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          departmentId: user.department_id
        };
      }
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

export default {
  authenticate,
  requireRole,
  requireAdmin,
  requireAdminOrExecutive,
  requireDepartmentAccess,
  optionalAuth
};
