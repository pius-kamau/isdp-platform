const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All message routes require authentication
router.use(authenticate);

// Message routes
router.post('/', messageController.sendMessage);
router.get('/conversations', messageController.getMyConversations);
router.get('/unread', messageController.getUnreadCount);
router.get('/:userId', messageController.getConversation);
router.put('/:userId/read', messageController.markAsRead);
router.get('/message/:id', messageController.getMessage);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;