const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { 
  hasRole, 
  hasAnyRole, 
  hasPermission, 
  hasMinimumRoleLevel 
} = require('../middleware/permission.middleware');
const { ROLES, PERMISSIONS } = require('../constants/roles.constants');
const responseUtils = require('../utils/response.utils');
const logger = require('../config/logger');
const auditService = require('../services/audit.service');

// All admin routes require authentication
router.use(authenticate);

// Admin only routes
router.get('/dashboard', 
  hasRole(ROLES.ADMIN), 
  (req, res) => {
    responseUtils.success(res, {
      message: 'Welcome to admin dashboard',
      user: {
        id: req.user.id,
        role: req.user.role,
      },
    }, 'Admin dashboard');
  }
);

// Routes for admin and moderator
router.get('/moderate',
  hasAnyRole([ROLES.ADMIN, ROLES.MODERATOR]),
  (req, res) => {
    responseUtils.success(res, {
      message: 'Moderation panel',
      user: {
        id: req.user.id,
        role: req.user.role,
      },
    }, 'Moderation panel');
  }
);

// Route that requires specific permission
router.get('/users',
  hasPermission(PERMISSIONS.VIEW_USERS),
  (req, res) => {
    responseUtils.success(res, {
      message: 'User list',
      users: [],
    }, 'Users retrieved');
  }
);

// Route that requires minimum role level (mentor or higher)
router.get('/mentor-area',
  hasMinimumRoleLevel(ROLES.MENTOR),
  (req, res) => {
    responseUtils.success(res, {
      message: 'Mentor area',
      user: {
        id: req.user.id,
        role: req.user.role,
      },
    }, 'Mentor area');
  }
);

// Get audit logs (Admin only)
router.get('/audit-logs',
  hasRole(ROLES.ADMIN),
  async (req, res) => {
    try {
      const { limit, userId, action, fromDate, toDate } = req.query;

      const logs = await auditService.getLogs(
        { 
          userId, 
          action, 
          fromDate, 
          toDate 
        },
        limit ? parseInt(limit) : 100
      );

      // Log the admin action
      await auditService.logAdminAction(
        req.userId, 
        'view_audit_logs', 
        { 
          filters: req.query,
          count: logs.length 
        }, 
        req
      );

      responseUtils.success(res, {
        logs,
        count: logs.length,
        filters: { userId, action, fromDate, toDate },
      }, 'Audit logs retrieved');
    } catch (error) {
      logger.error('Get audit logs error:', error);
      responseUtils.error(res, 'Failed to get audit logs');
    }
  }
);

module.exports = router;