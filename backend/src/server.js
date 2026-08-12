cd ~/isdp-platform/backend

# Create a complete server.js with the fix-password route
cat > src/server.js << 'EOF'
// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const fs = require('fs');
const path = require('path');

// Import redis
const redis = require('./config/redis');

// Import mail service
const mailService = require('./config/mail');

// Import error handlers
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler.middleware');

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
// CREATE UPLOADS DIRECTORY
// ============================================

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Uploads directory created');
}

// ============================================
// CONNECT TO REDIS
// ============================================

redis.connect();
mailService.connect();

// ============================================
// MIDDLEWARE
// ============================================

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(sanitizeInput);
app.use(securityHeaders);
app.use(hidePoweredBy);

// ============================================
// SERVE UPLOADS - PUBLIC ACCESS
// ============================================

console.log('📁 Serving uploads from:', uploadDir);
app.use('/uploads', express.static(uploadDir, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD');
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      res.setHeader('Content-Type', `image/${ext.replace('.', '')}`);
    }
  }
}));

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
const profileRoutes = require('./routes/profile.routes');
const fixPasswordRoutes = require('./routes/fix-password.routes'); // ADD THIS LINE

// ============================================
// TEST LOGIN ROUTE - INDEPENDENT
// ============================================
console.log('✅ Loading test login route...');
const testLoginRoutes = require('./routes/test-login.routes');
console.log('✅ Test login route loaded');

// ============================================
// REGISTER ROUTES
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'ISDP API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

// Register routes
app.use('/api/docs', docsRoutes);
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
app.use('/api/test', testLoginRoutes); // Use test login routes
app.use('/api/test-original', testRoutes); // Original test routes
app.use('/api/profile', profileRoutes);
app.use('/api/fix', fixPasswordRoutes); // ADD THIS LINE - FIX PASSWORD ROUTE

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
      test: '/api/test/test-login (independent login)',
      'fix-password': '/api/fix/fix-password',
      profile: '/api/profile',
      uploads: '/uploads (static files - public)'
    },
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

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

const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('ISDP Backend Server');
  console.log('='.repeat(50));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Docs: http://localhost:${PORT}/api/docs`);
  console.log(`Uploads (public): http://localhost:${PORT}/uploads`);
  console.log(`Test Login: http://localhost:${PORT}/api/test/test-login`);
  console.log(`Fix Password: http://localhost:${PORT}/api/fix/fix-password`);
  console.log('='.repeat(50));
  console.log('Server started successfully');
});

initSocket(server);
scheduleCleanup(cleanupQueue);
EOF