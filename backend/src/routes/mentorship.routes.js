const express = require('express');
const router = express.Router();
const mentorshipController = require('../controllers/mentorship.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All mentorship routes require authentication
router.use(authenticate);

// Request routes
router.post('/request', mentorshipController.requestMentor);
router.get('/me', mentorshipController.getMyRequests);
router.get('/:id', mentorshipController.getRequest);
router.put('/:id/accept', mentorshipController.acceptRequest);
router.put('/:id/reject', mentorshipController.rejectRequest);
router.delete('/:id', mentorshipController.deleteRequest);

// Session routes
router.post('/sessions', mentorshipController.createSession);
router.get('/sessions/me', mentorshipController.getMySessions);
router.put('/sessions/:id', mentorshipController.updateSession);

module.exports = router;