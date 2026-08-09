const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./logger');
const userModel = require('../models/user.model');

class SocketService {
  constructor(server) {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
    this.initialize(server);
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
      },
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Invalid token'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket) => {
      logger.info(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

      // Store connection
      this.connectedUsers.set(socket.userId, socket.id);
      this.userSockets.set(socket.id, socket.userId);

      // Broadcast online status
      this.broadcastOnlineStatus(socket.userId, true);

      // Join user's personal room
      socket.join(`user:${socket.userId}`);

      // Handle joining a conversation room
      socket.on('join-conversation', (conversationId) => {
        socket.join(`conversation:${conversationId}`);
        logger.debug(`Socket ${socket.id} joined conversation: ${conversationId}`);
      });

      // Handle leaving a conversation room
      socket.on('leave-conversation', (conversationId) => {
        socket.leave(`conversation:${conversationId}`);
        logger.debug(`Socket ${socket.id} left conversation: ${conversationId}`);
      });

      // Handle typing indicator
      socket.on('typing', (data) => {
        const { conversationId, isTyping } = data;
        socket.to(`conversation:${conversationId}`).emit('user-typing', {
          userId: socket.userId,
          conversationId,
          isTyping,
        });
      });

      // Handle mark as read
      socket.on('mark-read', (data) => {
        const { conversationId, messageId } = data;
        socket.to(`conversation:${conversationId}`).emit('message-read', {
          userId: socket.userId,
          messageId,
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`🔌 Socket disconnected: ${socket.id}`);
        this.connectedUsers.delete(socket.userId);
        this.userSockets.delete(socket.id);
        this.broadcastOnlineStatus(socket.userId, false);
      });
    });

    logger.info('✅ Socket.IO initialized');
  }

  // Broadcast online status to all users
  broadcastOnlineStatus(userId, isOnline) {
    this.io.emit('user-status', {
      userId,
      isOnline,
      timestamp: new Date().toISOString(),
    });
  }

  // Send message to a specific user
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Send message to a conversation room
  sendToConversation(conversationId, event, data) {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  // Send new message notification
  notifyNewMessage(receiverId, messageData) {
    this.sendToUser(receiverId, 'new-message', messageData);
  }

  // Send mentorship request notification
  notifyMentorshipRequest(mentorId, requestData) {
    this.sendToUser(mentorId, 'mentorship-request', requestData);
  }

  // Send notification to user
  sendNotification(userId, notificationData) {
    this.sendToUser(userId, 'notification', notificationData);
  }

  // Get online users list
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get socket ID for a user
  getSocketId(userId) {
    return this.connectedUsers.get(userId);
  }
}

// Singleton instance
let socketInstance = null;

const initSocket = (server) => {
  if (!socketInstance) {
    socketInstance = new SocketService(server);
  }
  return socketInstance;
};

const getSocket = () => socketInstance;

module.exports = {
  initSocket,
  getSocket,
};