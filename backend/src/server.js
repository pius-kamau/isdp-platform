const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');
const messageRoutes = require('./routes/message.routes');
const adminRoutes = require('./routes/admin.routes');
const skillRoutes = require('./routes/skill.routes');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://isdp-frontend.vercel.app',
      'https://*.vercel.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ============ SOCKET.IO CONFIGURATION ============
// Store online users
const onlineUsers = new Map();
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // User joins with their userId
  socket.on('user-joined', (userId) => {
    console.log('👤 User joined:', userId);
    onlineUsers.set(userId, socket.id);
    userSockets.set(socket.id, userId);
    
    // Broadcast online users
    io.emit('online-users', Array.from(onlineUsers.keys()));
    console.log('📊 Online users:', Array.from(onlineUsers.keys()));
  });

  // Handle sending messages
  socket.on('send-message', async (data) => {
    try {
      const { senderId, receiverId, messageText } = data;
      console.log('📨 Message from', senderId, 'to', receiverId, ':', messageText);

      // Save message to database
      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          messageText,
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

      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new-message', message);
        console.log('📤 Message delivered to:', receiverId);
      }

      // Send confirmation to sender
      socket.emit('message-sent', message);
      
      // Update unread count for receiver
      const unreadCount = await prisma.message.count({
        where: {
          receiverId,
          isRead: false
        }
      });
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('unread-count', { count: unreadCount });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { senderId, receiverId, isTyping } = data;
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', {
        userId: senderId,
        isTyping
      });
    }
  });

  // Handle read receipts
  socket.on('mark-read', async (data) => {
    try {
      const { messageId, senderId } = data;
      
      await prisma.message.update({
        where: { id: messageId },
        data: { isRead: true, readAt: new Date() }
      });

      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('message-read', { messageId });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userId = userSockets.get(socket.id);
    if (userId) {
      onlineUsers.delete(userId);
      userSockets.delete(socket.id);
      io.emit('online-users', Array.from(onlineUsers.keys()));
      console.log('👋 User disconnected:', userId);
    }
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// ============ CORS CONFIGURATION ============
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://isdp-frontend.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.options('*', cors());

// ============ MIDDLEWARE ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============ STATIC FILES ============
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Uploads directory created');
}

app.use('/uploads', express.static(uploadsDir));
console.log(`📁 Serving uploads from: ${uploadsDir}`);

// ============ ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/skills', skillRoutes);

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'ISDP Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      profile: '/api/profile',
      messages: '/api/messages',
      admin: '/api/admin',
      skills: '/api/skills',
      health: '/api/health'
    }
  });
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// ============ START SERVER ============
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🔌 Socket.io server ready`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});
