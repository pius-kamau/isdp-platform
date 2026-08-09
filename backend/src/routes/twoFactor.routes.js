const express = require('express');
const router = express.Router();
const twoFactorController = require('../controllers/twoFactor.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Rate limiter for 2FA verification
const rateLimit = require('express-rate-limit');
const twoFactorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    status: 'error',
    message: 'Too many 2FA attempts. Please try again later.',
  },
});

// Routes that require authentication (using regular access token)
router.post('/2fa/setup', authenticate, twoFactorController.setup);
router.post('/2fa/verify-setup', authenticate, twoFactorLimiter, twoFactorController.verifySetup);
router.get('/2fa/status', authenticate, twoFactorController.getStatus);
router.post('/2fa/disable', authenticate, twoFactorLimiter, twoFactorController.disable);
router.post('/2fa/regenerate-recovery-codes', authenticate, twoFactorLimiter, twoFactorController.regenerateRecoveryCodes);

// Routes that use challenge token (no authenticate middleware)
// These are called during the 2FA login flow
router.post('/2fa/verify', twoFactorLimiter, twoFactorController.verifyLogin);
router.post('/2fa/recovery', twoFactorLimiter, twoFactorController.verifyRecovery);

module.exports = router;