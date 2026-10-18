import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Bcrypt Configuration
export const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

/**
 * Generate JWT access token
 */
export const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    departmentId: user.department_id,
    fullName: user.full_name
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Check if user has permission for action
 */
export const checkPermission = (user, action, resource, context = {}) => {
  const { role, departmentId } = user;
  const { projectDepartmentId, targetDepartmentId } = context;

  // Permission matrix
  const permissions = {
    staff: {
      project: {
        view: 'own_dept',
        create: 'own_dept',
        edit: 'own_dept',
        delete: 'own_dept'
      },
      step: {
        view: 'own_dept',
        edit: 'own_dept'
      },
      report: {
        view: 'own_dept'
      }
    },
    admin: {
      project: {
        view: 'all',
        create: 'all',
        edit: 'all',
        delete: 'all'
      },
      step: {
        view: 'all',
        edit: 'all'
      },
      report: {
        view: 'all',
        export: 'all'
      },
      comment: {
        view: 'all',
        create: 'all',
        edit: 'own',
        delete: 'own'
      },
      sla: {
        view: 'all',
        edit: 'all'
      },
      notification: {
        view: 'all',
        create: 'all'
      }
    },
    executive: {
      project: {
        view: 'all'
      },
      step: {
        view: 'all'
      },
      report: {
        view: 'all',
        export: 'all'
      },
      comment: {
        view: 'all',
        create: 'all',
        edit: 'own',
        delete: 'own'
      },
      sla: {
        view: 'all',
        edit: 'all'
      }
    }
  };

  // Get permission for this role, action, and resource
  const rolePerms = permissions[role];
  if (!rolePerms) return false;

  const resourcePerms = rolePerms[resource];
  if (!resourcePerms) return false;

  const actionPerm = resourcePerms[action];
  if (!actionPerm) return false;

  // Check permission level
  if (actionPerm === 'all') {
    return true;
  }

  if (actionPerm === 'own_dept') {
    // Staff can only access their own department
    if (projectDepartmentId && departmentId !== projectDepartmentId) {
      return false;
    }
    if (targetDepartmentId && departmentId !== targetDepartmentId) {
      return false;
    }
    return true;
  }

  if (actionPerm === 'own') {
    // Can only edit/delete own items (checked in controller)
    return true;
  }

  return false;
};

/**
 * Get user role label in Thai
 */
export const getRoleLabel = (role) => {
  const labels = {
    staff: 'เจ้าหน้าที่',
    admin: 'ผู้ดูแลระบบ',
    executive: 'ผู้บริหาร'
  };
  return labels[role] || role;
};

export default {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  BCRYPT_ROUNDS,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  hashPassword,
  comparePassword,
  extractTokenFromHeader,
  checkPermission,
  getRoleLabel
};
