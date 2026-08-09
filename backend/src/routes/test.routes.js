const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const mailService = require('../config/mail');
const { cache } = require('../middleware/cache.middleware');

// Test logging endpoint
router.get('/log-test', (req, res) => {
  logger.info('Test log: Info message');
  logger.warn('Test log: Warning message');
  logger.error('Test log: Error message');

  res.json({
    status: 'success',
    message: 'Logs have been generated. Check logs/ directory',
  });
});

// Test error endpoint
router.get('/error-test', (req, res) => {
  try {
    throw new Error('This is a test error');
  } catch (error) {
    logger.error('Test error caught:', error);
    res.status(500).json({
      status: 'error',
      message: 'Test error generated. Check error.log',
    });
  }
});

// Cached test endpoint
router.get('/cached', cache(60), (req, res) => {
  const data = {
    message: 'This response is cached for 60 seconds',
    timestamp: new Date().toISOString(),
  };
  res.json(data);
});

// Test email endpoint
router.post('/email-test', async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    
    await mailService.sendEmail({
      to: email || 'test@example.com',
      subject: subject || 'Test Email from ISDP',
      html: message || '<h1>This is a test email</h1><p>Your Brevo integration is working!</p>',
    });
    
    res.json({
      status: 'success',
      message: 'Email sent successfully',
    });
  } catch (error) {
    logger.error('Test email error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send test email',
      error: error.message,
    });
  }
});

module.exports = router;