const messageModel = require('../models/message.model');

class MessageController {
  // Send a message
  async sendMessage(req, res) {
    try {
      const { receiverId, messageText, attachmentUrl, parentId } = req.body;
      const senderId = req.userId;

      // Validate required fields
      if (!receiverId) {
        return res.status(400).json({
          status: 'error',
          message: 'Receiver ID is required',
        });
      }

      if (!messageText && (!attachmentUrl || attachmentUrl.length === 0)) {
        return res.status(400).json({
          status: 'error',
          message: 'Message text or attachment is required',
        });
      }

      // Check if user is sending to themselves
      if (receiverId === senderId) {
        return res.status(400).json({
          status: 'error',
          message: 'You cannot send a message to yourself',
        });
      }

      // Send the message
      const message = await messageModel.sendMessage({
        senderId,
        receiverId,
        messageText,
        attachmentUrl,
        parentId,
      });

      res.status(201).json({
        status: 'success',
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send message',
      });
    }
  }

  // Get conversation between two users
  async getConversation(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.userId;
      const { limit, offset } = req.query;

      // Get messages
      const messages = await messageModel.getConversation(
        currentUserId,
        userId,
        limit ? parseInt(limit) : 50,
        offset ? parseInt(offset) : 0
      );

      // Mark messages as read (when user views conversation)
      await messageModel.markAsRead(userId, currentUserId);

      res.json({
        status: 'success',
        data: messages,
        pagination: {
          limit: limit ? parseInt(limit) : 50,
          offset: offset ? parseInt(offset) : 0,
        },
      });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get conversation',
      });
    }
  }

  // Get all conversations for current user
  async getMyConversations(req, res) {
    try {
      const userId = req.userId;
      const conversations = await messageModel.getUserConversations(userId);

      res.json({
        status: 'success',
        data: conversations,
      });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get conversations',
      });
    }
  }

  // Get unread message count
  async getUnreadCount(req, res) {
    try {
      const userId = req.userId;
      const count = await messageModel.getUnreadCount(userId);

      res.json({
        status: 'success',
        data: { unreadCount: count },
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get unread count',
      });
    }
  }

  // Mark messages as read
  async markAsRead(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.userId;

      const result = await messageModel.markAsRead(userId, currentUserId);

      res.json({
        status: 'success',
        message: 'Messages marked as read',
        data: { count: result.count },
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark messages as read',
      });
    }
  }

  // Delete a message
  async deleteMessage(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const message = await messageModel.deleteMessage(id, userId);

      if (!message) {
        return res.status(404).json({
          status: 'error',
          message: 'Message not found or you are not authorized to delete it',
        });
      }

      res.json({
        status: 'success',
        message: 'Message deleted successfully',
      });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete message',
      });
    }
  }

  // Get a single message
  async getMessage(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const message = await messageModel.findById(id);

      if (!message) {
        return res.status(404).json({
          status: 'error',
          message: 'Message not found',
        });
      }

      // Check if user is involved in the conversation
      if (message.senderId !== userId && message.receiverId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to view this message',
        });
      }

      res.json({
        status: 'success',
        data: message,
      });
    } catch (error) {
      console.error('Get message error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get message',
      });
    }
  }
}

module.exports = new MessageController();