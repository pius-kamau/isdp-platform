const express = require('express');
const router = express.Router();
const mentorshipController = require('../controllers/mentorship.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All mentorship routes require authentication
router.use(authenticate);

// ============ MENTORSHIP REQUESTS ============
router.post('/requests', mentorshipController.createRequest);
router.get('/requests', mentorshipController.getRequests);
router.put('/requests/:id', mentorshipController.updateRequest);

// ============ MENTORSHIP SESSIONS ============
router.post('/sessions', mentorshipController.createSession);
router.get('/sessions', mentorshipController.getSessions);
router.put('/sessions/:id', mentorshipController.updateSession);

// ============ MENTORSHIP SEARCH ============
router.get('/search', mentorshipController.searchMentors);

// ============ MENTORSHIP STATS ============
router.get('/stats', mentorshipController.getStats);

module.exports = router;
