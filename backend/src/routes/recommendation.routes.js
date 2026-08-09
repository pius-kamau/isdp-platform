const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All recommendation routes require authentication
router.use(authenticate);

// Recommendation routes
router.get('/', recommendationController.getRecommendations);
router.get('/mentors', recommendationController.getMentorRecommendations);
router.get('/volunteers', recommendationController.getVolunteerRecommendations);
router.get('/nearby', recommendationController.getNearbyRecommendations);
router.get('/score/:userId', recommendationController.calculateScore);

module.exports = router;