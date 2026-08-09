const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All analytics routes require authentication
router.use(authenticate);

// Analytics routes
router.get('/dashboard', analyticsController.getDashboard);
router.get('/growth', analyticsController.getUserGrowth);
router.get('/mentorship', analyticsController.getMentorshipStats);
router.get('/geographic', analyticsController.getGeographicDistribution);
router.get('/engagement', analyticsController.getEngagementMetrics);
router.get('/full', analyticsController.getFullAnalytics);

module.exports = router;