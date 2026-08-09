const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skill.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes (no authentication required)
router.get('/', skillController.getAll);
router.get('/category/:category', skillController.getByCategory);
router.get('/:id', skillController.getOne);

// Protected routes (require authentication)
router.post('/', authenticate, skillController.create);
router.put('/:id', authenticate, skillController.update);
router.delete('/:id', authenticate, skillController.delete);

// User skills routes
router.post('/user', authenticate, skillController.addUserSkill);
router.get('/user/:userId', authenticate, skillController.getUserSkills);
router.get('/user/me', authenticate, skillController.getUserSkills);
router.put('/user/:id', authenticate, skillController.updateUserSkill);
router.delete('/user/:id', authenticate, skillController.removeUserSkill);

module.exports = router;