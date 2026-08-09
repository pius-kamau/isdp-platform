const express = require('express');
const router = express.Router();

/**
 * API Documentation routes
 * Swagger UI will be available at /api/docs
 */
router.get('/', (req, res) => {
  res.json({
    message: 'API Documentation',
    description: 'Swagger UI will be available here once configured',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      skills: '/api/skills',
      search: '/api/search',
      mentorship: '/api/mentorship',
      messages: '/api/messages',
      notifications: '/api/notifications',
      recommendations: '/api/recommendations',
      analytics: '/api/analytics',
      admin: '/api/admin',
    },
  });
});

module.exports = router;