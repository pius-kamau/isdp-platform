module.exports = {
  // User Roles
  ROLES: {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    MENTOR: 'mentor',
    VOLUNTEER: 'volunteer',
    STUDENT: 'student',
    EMPLOYER: 'employer',
    GUEST: 'guest',
  },

  // User Status
  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING_VERIFICATION: 'pending_verification',
  },

  // Mentorship Status
  MENTORSHIP_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    MESSAGE: 'message',
    MENTORSHIP_REQUEST: 'mentorship_request',
    MENTORSHIP_RESPONSE: 'mentorship_response',
    MENTORSHIP_REMINDER: 'mentorship_reminder',
    SKILL_MATCH: 'skill_match',
    VOLUNTEER: 'volunteer',
    SYSTEM: 'system',
    BADGE_EARNED: 'badge_earned',
    REVIEW_RECEIVED: 'review_received',
  },

  // Proficiency Levels
  PROFICIENCY_LEVELS: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    EXPERT: 'expert',
  },

  // Cache TTL (seconds)
  CACHE_TTL: {
    SKILLS: 3600,
    RECOMMENDATIONS: 1800,
    ANALYTICS: 300,
    SEARCH: 600,
    USER_PROFILE: 1800,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    AUTH_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    AUTH_MAX_REQUESTS: 5,
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOC_TYPES: ['application/pdf', 'application/msword'],
  },
};