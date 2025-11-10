import { queryOne, execute } from '../config/database.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken
} from '../config/auth.js';

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { username, password, role, departmentId } = req.body;

    // Find user by username and role
    const user = queryOne(
      'SELECT * FROM users WHERE username = ? AND role = ?',
      [username, role]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is active
    if (!user.active) {
      return res.status(401).json({
        success: false,
        error: 'Account is disabled',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // For MVP, we'll check if password matches (in production, use bcrypt)
    // Temporary: Accept 'password123' for all users
    const isValidPassword = password === 'password123'; // TODO: Use bcrypt in production

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // For staff, verify department matches
    if (role === 'staff') {
      if (!departmentId) {
        return res.status(400).json({
          success: false,
          error: 'Department is required for staff users',
          code: 'DEPARTMENT_REQUIRED'
        });
      }

      if (user.department_id !== parseInt(departmentId)) {
        return res.status(401).json({
          success: false,
          error: 'Invalid department',
          code: 'INVALID_DEPARTMENT'
        });
      }
    }

    // Update last login
    execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Get department info
    let department = null;
    if (user.department_id) {
      department = queryOne(
        'SELECT id, code, name FROM departments WHERE id = ?',
        [user.department_id]
      );
    }

    // Return user data and token
    res.json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        department: department ? {
          id: department.id,
          code: department.code,
          name: department.name
        } : null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: error.message
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    // In a real application, invalidate the refresh token here
    // For now, client will just remove the token

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      details: error.message
    });
  }
};

/**
 * Verify token and get current user
 * GET /api/auth/verify
 */
export const verifyToken = async (req, res) => {
  try {
    // req.user is already populated by authenticate middleware
    const { user } = req;

    // Get department info
    let department = null;
    if (user.departmentId) {
      department = queryOne(
        'SELECT id, code, name FROM departments WHERE id = ?',
        [user.departmentId]
      );
    }

    res.json({
      success: true,
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: department ? {
          id: department.id,
          code: department.code,
          name: department.name
        } : null
      }
    });

  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      error: 'Token verification failed',
      details: error.message
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const { user } = req;

    // Get full user data
    const userData = queryOne(
      `SELECT u.*, d.name as department_name, d.code as department_code
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [user.id]
    );

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: userData.id,
        username: userData.username,
        fullName: userData.full_name,
        email: userData.email,
        role: userData.role,
        department: userData.department_id ? {
          id: userData.department_id,
          code: userData.department_code,
          name: userData.department_name
        } : null,
        lastLogin: userData.last_login,
        createdAt: userData.created_at
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data',
      details: error.message
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const { verifyToken } = await import('../config/auth.js');
    const decoded = verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      return res.status(400).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Get user
    const user = queryOne(
      'SELECT * FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.json({
      success: true,
      token: accessToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: 'Token refresh failed',
      details: error.message
    });
  }
};

export default {
  login,
  logout,
  verifyToken,
  getCurrentUser,
  refreshAccessToken
};
