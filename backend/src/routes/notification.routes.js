const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All notification routes require authentication
router.use(authenticate);

// Notification routes
router.get('/', notificationController.getMyNotifications);
router.get('/unread', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.delete);
router.delete('/', notificationController.deleteAll);

module.exports = router;