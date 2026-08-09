const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.get('/users', searchController.searchUsers);
router.get('/nearby', searchController.getNearby);
router.get('/skills', searchController.getSkillSuggestions);

// Protected routes
router.get('/suggestions', authenticate, searchController.getSuggestions);

module.exports = router;