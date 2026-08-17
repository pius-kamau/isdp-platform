const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const messageController = {
  // Get all conversations for a user
  async getConversations(req, res) {
    try {
      const userId = req.userId;

      console.log('=== GET CONVERSATIONS ===');
      console.log('User ID:', userId);

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
              email: true
            }
          },
          receiver: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const conversationMap = new Map();

      messages.forEach(msg => {
        const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            id: `conv_${otherUserId}`,
            participants: [otherUser],
            messages: [],
            unreadCount: 0
          });
        }
        
        const conv = conversationMap.get(otherUserId);
        conv.messages.push(msg);
        
        if (msg.receiverId === userId && !msg.isRead) {
          conv.unreadCount += 1;
        }
      });

      const conversations = Array.from(conversationMap.values())
        .map(conv => ({
          ...conv,
          messages: conv.messages.sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
          )
        }))
        .sort((a, b) => {
          const aLatest = a.messages[a.messages.length - 1]?.createdAt || 0;
          const bLatest = b.messages[b.messages.length - 1]?.createdAt || 0;
          return new Date(bLatest) - new Date(aLatest);
        });

      console.log(`Found ${conversations.length} conversations`);

      res.json({
        status: 'success',
        data: conversations
      });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to get conversations'
      });
    }
  },

  // Get messages between two users
  async getMessages(req, res) {
    try {
      const userId = req.userId;
      const { userId: otherUserId } = req.params;

      console.log('=== GET MESSAGES ===');
      console.log('User:', userId);
      console.log('Other User:', otherUserId);

      if (!otherUserId) {
        return res.status(400).json({
          status: 'error',
          message: 'User ID is required'
        });
      }

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: userId,
              receiverId: otherUserId
            },
            {
              senderId: otherUserId,
              receiverId: userId
            }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true
            }
          },
          receiver: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      console.log(`Found ${messages.length} messages`);

      res.json({
        status: 'success',
        data: messages
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to get messages'
      });
    }
  },

  // Send a message
  async sendMessage(req, res) {
    try {
      const senderId = req.userId;
      const { receiverId, messageText, attachmentUrl } = req.body;

      console.log('=== SEND MESSAGE ===');
      console.log('Sender:', senderId);
      console.log('Receiver:', receiverId);

      if (!receiverId || !messageText) {
        return res.status(400).json({
          status: 'error',
          message: 'Receiver and message text are required'
        });
      }

      const receiver = await prisma.user.findUnique({
        where: { id: receiverId }
      });

      if (!receiver) {
        return res.status(404).json({
          status: 'error',
          message: 'Receiver not found'
        });
      }

      const sender = await prisma.user.findUnique({
        where: { id: senderId }
      });

      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          messageText,
          attachmentUrl: attachmentUrl || [],
          isRead: false
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true
            }
          },
          receiver: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true
            }
          }
        }
      });

      console.log('✅ Message sent:', message.id);

      // ============ EMIT SOCKET EVENT ============
      const io = req.app.get('io');
      if (io) {
        // Emit to the receiver's room
        io.to(`user_${receiverId}`).emit('receive_message', {
          messageId: message.id,
          content: messageText,
          senderId: senderId,
          receiverId: receiverId,
          senderName: sender.fullName,
          senderPhoto: sender.profilePhoto || null,
          createdAt: message.createdAt
        });
        console.log(`📤 Emitted receive_message to user_${receiverId} room`);
        
        // Also emit to the sender's room (so sender gets delivery confirmation)
        io.to(`user_${senderId}`).emit('message_status', {
          messageId: message.id,
          status: 'delivered'
        });
        console.log(`📤 Emitted message_status to user_${senderId} room`);
      } else {
        console.log('⚠️ Socket.IO not available, skipping event emission');
      }

      res.status(201).json({
        status: 'success',
        message: 'Message sent successfully',
        data: message
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to send message'
      });
    }
  },

  // Mark a message as read
  async markAsRead(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      console.log('=== MARK AS READ ===');
      console.log('Message ID:', id);

      const message = await prisma.message.findUnique({
        where: { id }
      });

      if (!message) {
        return res.status(404).json({
          status: 'error',
          message: 'Message not found'
        });
      }

      if (message.receiverId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to mark this message as read'
        });
      }

      const updated = await prisma.message.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      // ============ EMIT READ RECEIPT ============
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${message.senderId}`).emit('message_read', {
          messageId: id,
          readerId: userId
        });
        console.log(`📤 Emitted message_read to user_${message.senderId}`);
      }

      res.json({
        status: 'success',
        data: updated
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to mark message as read'
      });
    }
  },

  // Get unread count
  async getUnreadCount(req, res) {
    try {
      const userId = req.userId;

      const count = await prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false
        }
      });

      console.log('📬 Unread count for user:', userId, '=', count);

      res.json({
        status: 'success',
        data: { unreadCount: count }
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to get unread count'
      });
    }
  },

  // Clear all messages between two users
  async clearMessages(req, res) {
    try {
      const userId = req.userId;
      const { userId: otherUserId } = req.params;

      console.log('=== CLEAR MESSAGES ===');
      console.log('User:', userId);
      console.log('Other User:', otherUserId);

      if (!otherUserId) {
        return res.status(400).json({
          status: 'error',
          message: 'User ID is required'
        });
      }

      // Soft delete - mark as deleted for this user
      // Instead of hard delete, we add the userId to a deletedFor array
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            {
              senderId: userId,
              receiverId: otherUserId
            },
            {
              senderId: otherUserId,
              receiverId: userId
            }
          ]
        }
      });

      // Update each message to add userId to deletedFor array
      for (const msg of messages) {
        const deletedFor = msg.deletedFor || [];
        if (!deletedFor.includes(userId)) {
          deletedFor.push(userId);
          await prisma.message.update({
            where: { id: msg.id },
            data: { deletedFor }
          });
        }
      }

      console.log(`✅ Soft deleted messages for user ${userId}`);

      res.json({
        status: 'success',
        message: 'Chat cleared from your side',
        data: { clearedFor: userId }
      });
    } catch (error) {
      console.error('Clear messages error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to clear messages'
      });
    }
  }
};

module.exports = messageController;
