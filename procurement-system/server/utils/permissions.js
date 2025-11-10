/**
 * Permission Utilities
 * ฟังก์ชันสำหรับตรวจสอบสิทธิ์การเข้าถึง (ใช้กับ Core Infrastructure)
 */

const { UnauthorizedError, ForbiddenError, NotFoundError } = require('./errors');
const { sendUnauthorized, sendForbidden, sendNotFound } = require('./responses');
const logger = require('./logger');

/**
 * ตรวจสอบสิทธิ์ตาม role
 * @param {Array<string>} allowedRoles - Roles ที่อนุญาต
 * @returns {Function} Express middleware
 *
 * @example
 * router.post('/admin-only', requireRole(['admin']), handler);
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      logger.securityEvent('unauthorized_access_attempt', {
        url: req.url,
        method: req.method,
        ip: req.ip
      });
      return sendUnauthorized(res);
    }

    if (!Array.isArray(allowedRoles)) {
      allowedRoles = [allowedRoles];
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.securityEvent('forbidden_access_attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        url: req.url,
        method: req.method
      });

      return sendForbidden(res, `ไม่มีสิทธิ์เข้าถึง (ต้องการ role: ${allowedRoles.join(', ')})`);
    }

    next();
  };
}

/**
 * ตรวจสอบการเข้าถึงกอง/สำนัก
 * @param {number} targetDepartmentId - Department ID ที่ต้องการเข้าถึง (optional, จะดึงจาก params/body ถ้าไม่ระบุ)
 * @returns {Function} Express middleware
 *
 * @example
 * router.get('/projects/:departmentId', requireDepartmentAccess(), handler);
 */
function requireDepartmentAccess(targetDepartmentId = null) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return sendUnauthorized(res);
    }

    // Determine target department
    const deptId = targetDepartmentId ||
                   req.params.departmentId ||
                   req.body.departmentId ||
                   req.query.departmentId;

    // Admin และ Executive เข้าถึงทุกกองได้
    if (user.role === 'admin' || user.role === 'executive') {
      return next();
    }

    // Staff เข้าถึงเฉพาะกองตนเองได้
    if (user.role === 'staff') {
      if (!deptId || parseInt(deptId) === user.departmentId) {
        return next();
      }

      logger.securityEvent('department_access_denied', {
        userId: user.id,
        userDepartment: user.departmentId,
        requestedDepartment: deptId,
        url: req.url
      });

      return sendForbidden(res, 'ไม่มีสิทธิ์เข้าถึงข้อมูลของกองนี้');
    }

    return sendForbidden(res);
  };
}

/**
 * ตรวจสอบการเป็นเจ้าของทรัพยากร
 * @param {Function} getResourceFn - Function to get resource (async function(id))
 * @param {string} resourceType - Resource type name
 * @returns {Function} Express middleware
 *
 * @example
 * router.put('/projects/:id', requireOwnership(
 *   async (id) => await Project.findById(id),
 *   'project'
 * ), handler);
 */
function requireOwnership(getResourceFn, resourceType = 'resource') {
  return async (req, res, next) => {
    const user = req.user;
    const resourceId = req.params.id;

    if (!user) {
      return sendUnauthorized(res);
    }

    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบ Resource ID'
      });
    }

    try {
      // Get resource from database
      const resource = await getResourceFn(resourceId);

      if (!resource) {
        logger.securityEvent('resource_not_found', {
          userId: user.id,
          resourceType,
          resourceId,
          url: req.url
        });
        return sendNotFound(res, `ไม่พบ${resourceType}`);
      }

      // Admin สามารถเข้าถึงทุกอย่างได้
      if (user.role === 'admin') {
        req.resource = resource; // แนบ resource เข้ากับ request
        return next();
      }

      // ตรวจสอบการเป็นเจ้าของ
      const ownerId = resource.created_by || resource.user_id || resource.userId;

      // Executive: อนุญาตให้เข้าถึงของตนเองและดู read-only ของคนอื่น
      if (user.role === 'executive') {
        // ถ้าเป็นของตนเอง หรือ เป็น GET request
        if (ownerId === user.id || req.method === 'GET') {
          req.resource = resource;
          return next();
        }

        logger.securityEvent('ownership_check_failed', {
          userId: user.id,
          userRole: user.role,
          resourceType,
          resourceId,
          resourceOwner: ownerId
        });

        return sendForbidden(res, 'ไม่สามารถแก้ไขข้อมูลของผู้อื่นได้');
      }

      // Staff: ตรวจสอบการเป็นเจ้าของและกอง
      if (user.role === 'staff') {
        if (ownerId !== user.id) {
          logger.securityEvent('ownership_check_failed', {
            userId: user.id,
            userRole: user.role,
            resourceType,
            resourceId,
            resourceOwner: ownerId
          });

          return sendForbidden(res, 'ไม่สามารถแก้ไขข้อมูลของผู้อื่นได้');
        }

        // ตรวจสอบกอง
        if (resource.department_id && resource.department_id !== user.departmentId) {
          logger.securityEvent('department_check_failed', {
            userId: user.id,
            userDepartment: user.departmentId,
            resourceDepartment: resource.department_id,
            resourceType,
            resourceId
          });

          return sendForbidden(res, 'ไม่สามารถแก้ไขข้อมูลจากกองอื่นได้');
        }

        req.resource = resource;
        return next();
      }

      return sendForbidden(res);

    } catch (error) {
      logger.error('Error in requireOwnership middleware:', {
        error: error.message,
        stack: error.stack,
        userId: user.id,
        resourceType,
        resourceId
      });

      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์'
      });
    }
  };
}

/**
 * กรองข้อมูลตามกอง (สำหรับ Staff)
 * @returns {Function} Express middleware
 */
function applyDepartmentFilter() {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return sendUnauthorized(res);
    }

    // Admin และ Executive เห็นทุกกอง
    if (user.role === 'admin' || user.role === 'executive') {
      req.departmentFilter = null;
      return next();
    }

    // Staff เห็นเฉพาะกองตนเอง
    if (user.role === 'staff') {
      req.departmentFilter = user.departmentId;

      // บังคับ filter ใน query parameters
      if (!req.query.departmentId) {
        req.query.departmentId = user.departmentId;
      } else if (parseInt(req.query.departmentId) !== user.departmentId) {
        logger.securityEvent('department_filter_bypass_attempt', {
          userId: user.id,
          userDepartment: user.departmentId,
          requestedDepartment: req.query.departmentId,
          url: req.url
        });

        return sendForbidden(res, 'ไม่สามารถดูข้อมูลของกองอื่นได้');
      }
    }

    next();
  };
}

/**
 * ตรวจสอบสิทธิ์การเพิ่ม comment
 * @returns {Function} Express middleware
 */
function canComment() {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res);
    }

    // Comment ได้ทุก role แต่มีข้อจำกัดต่างกัน:
    // - Admin: comment ได้ทุกโครงการ
    // - Executive: comment ได้ทุกโครงการ
    // - Staff: comment ได้เฉพาะโครงการของกองตนเอง (ตรวจสอบภายหลัง)

    next();
  };
}

/**
 * ตรวจสอบสิทธิ์การจัดการ SLA
 * @returns {Function} Express middleware
 */
function canManageSLA() {
  return requireRole(['admin']);
}

/**
 * ตรวจสอบสิทธิ์การ export ข้อมูล
 * @returns {Function} Express middleware
 */
function canExport() {
  return requireRole(['admin', 'executive']);
}

/**
 * ตรวจสอบสิทธิ์การจัดการผู้ใช้
 * @returns {Function} Express middleware
 */
function canManageUsers() {
  return requireRole(['admin']);
}

/**
 * ตรวจสอบสิทธิ์การอนุมัติโครงการ
 * @returns {Function} Express middleware
 */
function canApproveProjects() {
  return requireRole(['admin', 'executive']);
}

/**
 * ตรวจสอบสิทธิ์แบบ custom
 * @param {Function} checkFn - Custom check function (req, user) => boolean
 * @param {string} errorMessage - Error message if check fails
 * @returns {Function} Express middleware
 */
function requireCustomPermission(checkFn, errorMessage = 'ไม่มีสิทธิ์ในการดำเนินการนี้') {
  return async (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res);
    }

    try {
      const hasPermission = await checkFn(req, req.user);

      if (!hasPermission) {
        logger.securityEvent('custom_permission_denied', {
          userId: req.user.id,
          url: req.url,
          method: req.method
        });

        return sendForbidden(res, errorMessage);
      }

      next();
    } catch (error) {
      logger.error('Error in custom permission check:', {
        error: error.message,
        userId: req.user.id,
        url: req.url
      });

      return res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์'
      });
    }
  };
}

module.exports = {
  requireRole,
  requireDepartmentAccess,
  requireOwnership,
  applyDepartmentFilter,
  canComment,
  canManageSLA,
  canExport,
  canManageUsers,
  canApproveProjects,
  requireCustomPermission
};
