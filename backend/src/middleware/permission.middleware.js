const { ROLE_PERMISSIONS, ROLE_HIERARCHY, ROLES } = require('../constants/roles.constants');
const responseUtils = require('../utils/response.utils');
const userModel = require('../models/user.model');

/**
 * Check if user has a specific role
 */
const hasRole = (role) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return responseUtils.unauthorized(res, 'Authentication required');
      }

      if (user.role !== role) {
        return responseUtils.forbidden(res, `Access denied. ${role} role required.`);
      }

      next();
    } catch (error) {
      return responseUtils.error(res, error.message);
    }
  };
};

/**
 * Check if user has one of the specified roles
 */
const hasAnyRole = (roles) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return responseUtils.unauthorized(res, 'Authentication required');
      }

      if (!roles.includes(user.role)) {
        return responseUtils.forbidden(res, `Access denied. Required roles: ${roles.join(', ')}`);
      }

      next();
    } catch (error) {
      return responseUtils.error(res, error.message);
    }
  };
};

/**
 * Check if user has a specific permission
 */
const hasPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return responseUtils.unauthorized(res, 'Authentication required');
      }

      // Get permissions for user's role
      const permissions = ROLE_PERMISSIONS[user.role] || [];

      if (!permissions.includes(permission)) {
        return responseUtils.forbidden(res, `Access denied. ${permission} permission required.`);
      }

      next();
    } catch (error) {
      return responseUtils.error(res, error.message);
    }
  };
};

/**
 * Check if user has any of the specified permissions
 */
const hasAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return responseUtils.unauthorized(res, 'Authentication required');
      }

      // Get permissions for user's role
      const userPermissions = ROLE_PERMISSIONS[user.role] || [];

      const hasPermission = permissions.some(p => userPermissions.includes(p));

      if (!hasPermission) {
        return responseUtils.forbidden(res, `Access denied. Required permissions: ${permissions.join(', ')}`);
      }

      next();
    } catch (error) {
      return responseUtils.error(res, error.message);
    }
  };
};

/**
 * Check if user has access to a specific resource
 * (e.g., can only access their own data)
 */
const canAccessResource = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return responseUtils.unauthorized(res, 'Authentication required');
      }

      // Admin can access everything
      if (user.role === ROLES.ADMIN) {
        return next();
      }

      // Get the user ID from the resource
      const resourceUserId = typeof getResourceUserId === 'function'
        ? getResourceUserId(req)
        : req.params.userId || req.params.id;

      // Check if user owns the resource
      if (user.id !== resourceUserId) {
        return responseUtils.forbidden(res, 'You do not have access to this resource');
      }

      next();
    } catch (error) {
      return responseUtils.error(res, error.message);
    }
  };
};

/**
 * Check if user is the owner of the resource or has admin role
 */
const isOwnerOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return responseUtils.unauthorized(res, 'Authentication required');
      }

      // Admin can access everything
      if (user.role === ROLES.ADMIN) {
        return next();
      }

      // Get the user ID from the resource
      const resourceUserId = typeof getResourceUserId === 'function'
        ? getResourceUserId(req)
        : req.params.userId || req.params.id;

      // Check if user owns the resource
      if (user.id !== resourceUserId) {
        return responseUtils.forbidden(res, 'You do not have access to this resource');
      }

      next();
    } catch (error) {
      return responseUtils.error(res, error.message);
    }
  };
};

/**
 * Check if user has minimum role level
 */
const hasMinimumRoleLevel = (minimumRole) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return responseUtils.unauthorized(res, 'Authentication required');
      }

      const userLevel = ROLE_HIERARCHY[user.role] || 0;
      const minLevel = ROLE_HIERARCHY[minimumRole] || 0;

      if (userLevel < minLevel) {
        return responseUtils.forbidden(res, `Access denied. Minimum role level: ${minimumRole}`);
      }

      next();
    } catch (error) {
      return responseUtils.error(res, error.message);
    }
  };
};

module.exports = {
  hasRole,
  hasAnyRole,
  hasPermission,
  hasAnyPermission,
  canAccessResource,
  isOwnerOrAdmin,
  hasMinimumRoleLevel,
};