// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Import redis
const redis = require('./config/redis');

// Import mail service
const mailService = require('./config/mail');

// Import error handlers
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler.middleware');

// Import rate limiters
const { generalLimiter, authLimiter, apiLimiter, adminLimiter } = require('./middleware/rateLimiter.middleware');

// Import security middleware
const { sanitizeInput, securityHeaders, hidePoweredBy } = require('./middleware/security.middleware');

// Import socket
const { initSocket } = require('./config/socket');

// Import background jobs
const { scheduleCleanup } = require('./jobs/scheduler');
const { cleanupQueue } = require('./jobs');

// Create express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// CONNECT TO REDIS
// ============================================

// Connect to Redis on startup
redis.connect();

// Connect to email service
mailService.connect();

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(sanitizeInput);
app.use(securityHeaders);
app.use(hidePoweredBy);

// Rate limiting (applied to all requests except health check)
app.use(generalLimiter);

// ============================================
// ROUTES
// ============================================

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const skillRoutes = require('./routes/skill.routes');
const searchRoutes = require('./routes/search.routes');
const mentorshipRoutes = require('./routes/mentorship.routes');
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const adminRoutes = require('./routes/admin.routes');
const testRoutes = require('./routes/test.routes');
const docsRoutes = require('./routes/docs.routes');

// Health check endpoint (exempt from rate limiting)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'ISDP API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

// API Documentation
app.use('/api/docs', docsRoutes);

// Apply stricter limits to auth routes
app.use('/api/auth', authLimiter);

// Apply API limiter to API routes
app.use('/api/users', apiLimiter);
app.use('/api/skills', apiLimiter);
app.use('/api/search', apiLimiter);
app.use('/api/mentorship', apiLimiter);
app.use('/api/messages', apiLimiter);
app.use('/api/notifications', apiLimiter);
app.use('/api/recommendations', apiLimiter);
app.use('/api/analytics', apiLimiter);

// Apply admin limiter to admin routes
app.use('/api/admin', adminLimiter);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes);

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'ISDP API',
    version: '1.0.0',
    description: 'Invisible Skills Discovery Platform Backend',
    endpoints: {
      health: '/api/health',
      docs: '/api/docs',
      auth: '/api/auth',
      users: '/api/users',
      skills: '/api/skills',
      search: '/api/search',
      mentorship: '/api/mentorship',
      messages: '/api/messages',
      notifications: '/api/notifications',
      recommendations: '/api/recommendations',
      analytics: '/api/analytics',
      admin: '/api/admin',
      test: '/api/test',
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - Route not found
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await redis.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await redis.disconnect();
  process.exit(0);
});

// ============================================
// START SERVER
// ============================================

const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('ISDP Backend Server');
  console.log('='.repeat(50));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Docs: http://localhost:${PORT}/api/docs`);
  console.log('='.repeat(50));
  console.log('Server started successfully');
});

// Initialize Socket.IO
initSocket(server);

// Initialize background jobs
scheduleCleanup(cleanupQueue);