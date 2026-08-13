const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (require authentication)
router.get('/me', authenticate, userController.getMe);
router.get('/', authenticate, userController.getAll);
router.get('/:id', authenticate, userController.getOne);
router.put('/:id', authenticate, userController.update);
router.delete('/:id', authenticate, userController.delete);

module.exports = router;
