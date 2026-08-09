/**
 * User Roles
 * Each role has different permissions
 */
const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MENTOR: 'mentor',
  VOLUNTEER: 'volunteer',
  STUDENT: 'student',
  EMPLOYER: 'employer',
  USER: 'user',
  GUEST: 'guest',
};

/**
 * Role Hierarchy
 * Higher number = more permissions
 */
const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 100,
  [ROLES.MODERATOR]: 80,
  [ROLES.MENTOR]: 60,
  [ROLES.EMPLOYER]: 50,
  [ROLES.VOLUNTEER]: 40,
  [ROLES.STUDENT]: 30,
  [ROLES.USER]: 20,
  [ROLES.GUEST]: 10,
};

/**
 * Permissions
 * What each role can do
 */
const PERMISSIONS = {
  // User management
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  SUSPEND_USER: 'suspend_user',
  VERIFY_USER: 'verify_user',

  // Role management
  ASSIGN_ROLE: 'assign_role',
  REMOVE_ROLE: 'remove_role',

  // Skills
  VIEW_SKILLS: 'view_skills',
  CREATE_SKILL: 'create_skill',
  UPDATE_SKILL: 'update_skill',
  DELETE_SKILL: 'delete_skill',
  VERIFY_SKILL: 'verify_skill',

  // Mentorship
  REQUEST_MENTORSHIP: 'request_mentorship',
  ACCEPT_MENTORSHIP: 'accept_mentorship',
  REJECT_MENTORSHIP: 'reject_mentorship',
  VIEW_MENTORSHIP: 'view_mentorship',

  // Content moderation
  VIEW_REPORTS: 'view_reports',
  MODERATE_CONTENT: 'moderate_content',
  DELETE_CONTENT: 'delete_content',

  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',

  // System
  VIEW_SYSTEM: 'view_system',
  CONFIGURE_SYSTEM: 'configure_system',
  VIEW_LOGS: 'view_logs',
};

/**
 * Role Permission Mapping
 * Defines which permissions each role has
 */
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // All permissions
    ...Object.values(PERMISSIONS),
  ],

  [ROLES.MODERATOR]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_SKILLS,
    PERMISSIONS.UPDATE_SKILL,
    PERMISSIONS.DELETE_SKILL,
    PERMISSIONS.VERIFY_SKILL,
    PERMISSIONS.VIEW_MENTORSHIP,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.DELETE_CONTENT,
    PERMISSIONS.VIEW_ANALYTICS,
  ],

  [ROLES.MENTOR]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_SKILLS,
    PERMISSIONS.CREATE_SKILL,
    PERMISSIONS.REQUEST_MENTORSHIP,
    PERMISSIONS.ACCEPT_MENTORSHIP,
    PERMISSIONS.REJECT_MENTORSHIP,
    PERMISSIONS.VIEW_MENTORSHIP,
  ],

  [ROLES.VOLUNTEER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_SKILLS,
    PERMISSIONS.CREATE_SKILL,
    PERMISSIONS.REQUEST_MENTORSHIP,
    PERMISSIONS.VIEW_MENTORSHIP,
  ],

  [ROLES.STUDENT]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_SKILLS,
    PERMISSIONS.REQUEST_MENTORSHIP,
    PERMISSIONS.VIEW_MENTORSHIP,
  ],

  [ROLES.EMPLOYER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_SKILLS,
    PERMISSIONS.VIEW_MENTORSHIP,
  ],

  [ROLES.USER]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_SKILLS,
    PERMISSIONS.REQUEST_MENTORSHIP,
  ],

  [ROLES.GUEST]: [
    PERMISSIONS.VIEW_SKILLS,
  ],
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROLE_PERMISSIONS,
};