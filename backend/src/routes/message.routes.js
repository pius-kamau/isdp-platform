const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All message routes require authentication
router.use(authenticate);

// Get all conversations
router.get('/conversations', messageController.getConversations);

// Get unread count
router.get('/unread', messageController.getUnreadCount);

// Get messages with a specific user
router.get('/:userId', messageController.getMessages);

// Send a message
router.post('/', messageController.sendMessage);

// Mark a message as read
router.put('/:id/read', messageController.markAsRead);

// Clear all messages with a user
router.delete('/clear/:userId', messageController.clearMessages);

module.exports = router;
