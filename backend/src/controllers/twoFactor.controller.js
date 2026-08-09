const twoFactorService = require('../services/twoFactor.service');
const userModel = require('../models/user.model');
const responseUtils = require('../utils/response.utils');
const logger = require('../config/logger');
const auditService = require('../services/audit.service');
const rateLimit = require('express-rate-limit');
const tokenUtils = require('../utils/token.utils');

// Rate limiter for 2FA verification
const twoFactorRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    status: 'error',
    message: 'Too many 2FA attempts. Please try again later.',
  },
});

class TwoFactorController {
  /**
   * Setup 2FA - Generate secret and OTPAuth URL
   * POST /api/auth/2fa/setup
   */
  async setup(req, res) {
    try {
      const userId = req.userId;
      const user = await userModel.findById(userId);

      if (!user) {
        return responseUtils.notFound(res, 'User not found');
      }

      // Check if 2FA is already enabled
      const status = await twoFactorService.getStatus(userId);
      if (status.enabled) {
        return responseUtils.badRequest(res, '2FA is already enabled');
      }

      // Generate secret
      const result = await twoFactorService.generateSecret(userId, user.email);

      return responseUtils.success(res, {
        secret: result.secret,
        otpauthUrl: result.otpauthUrl,
      }, '2FA setup initiated');
    } catch (error) {
      logger.error('2FA setup error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Verify 2FA setup - Enable 2FA after code verification
   * POST /api/auth/2fa/verify-setup
   */
  async verifySetup(req, res) {
    try {
      const userId = req.userId;
      const { code } = req.body;

      if (!code) {
        return responseUtils.badRequest(res, '2FA code is required');
      }

      // Verify code and enable 2FA
      const result = await twoFactorService.verifySetupCode(userId, code);

      return responseUtils.success(res, {
        enabled: true,
        recoveryCodes: result.recoveryCodes,
      }, '2FA enabled successfully');
    } catch (error) {
      logger.error('2FA verify setup error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  }

  /**
   * Verify 2FA during login
   * POST /api/auth/2fa/verify
   */
  async verifyLogin(req, res) {
    try {
      const { code, challengeToken } = req.body;

      if (!code) {
        return responseUtils.badRequest(res, '2FA code is required');
      }

      if (!challengeToken) {
        return responseUtils.badRequest(res, 'Challenge token is required');
      }

      // Validate challenge token and get user ID
      const userId = await twoFactorService.validateChallengeToken(challengeToken);

      if (!userId) {
        return responseUtils.unauthorized(res, 'Invalid or expired challenge token');
      }

      // Verify the code
      await twoFactorService.verifyLoginCode(userId, code);

      // Generate full access tokens
      const user = await userModel.findById(userId);
      
      if (!user) {
        return responseUtils.unauthorized(res, 'User not found');
      }

      const accessToken = tokenUtils.generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = tokenUtils.generateRefreshToken({
        id: user.id,
      });

      return responseUtils.success(res, {
        user: user,
        accessToken,
        refreshToken,
        twoFactorVerified: true,
      }, '2FA verification successful');
    } catch (error) {
      logger.error('2FA verify login error:', error);
      return responseUtils.unauthorized(res, error.message);
    }
  }

  /**
   * Verify with recovery code
   * POST /api/auth/2fa/recovery
   */
  async verifyRecovery(req, res) {
    try {
      const { recoveryCode, challengeToken } = req.body;

      if (!recoveryCode) {
        return responseUtils.badRequest(res, 'Recovery code is required');
      }

      if (!challengeToken) {
        return responseUtils.badRequest(res, 'Challenge token is required');
      }

      // Validate challenge token and get user ID
      const userId = await twoFactorService.validateChallengeToken(challengeToken);

      if (!userId) {
        return responseUtils.unauthorized(res, 'Invalid or expired challenge token');
      }

      // Verify recovery code
      await twoFactorService.verifyRecoveryCode(userId, recoveryCode);

      // Generate full access tokens
      const user = await userModel.findById(userId);
      
      if (!user) {
        return responseUtils.unauthorized(res, 'User not found');
      }

      const accessToken = tokenUtils.generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = tokenUtils.generateRefreshToken({
        id: user.id,
      });

      return responseUtils.success(res, {
        user: user,
        accessToken,
        refreshToken,
        twoFactorVerified: true,
      }, 'Recovery code verified successfully');
    } catch (error) {
      logger.error('2FA recovery error:', error);
      return responseUtils.unauthorized(res, error.message);
    }
  }

  /**
   * Get 2FA status
   * GET /api/auth/2fa/status
   */
  async getStatus(req, res) {
    try {
      const userId = req.userId;
      const status = await twoFactorService.getStatus(userId);

      return responseUtils.success(res, status, '2FA status retrieved');
    } catch (error) {
      logger.error('2FA status error:', error);
      return responseUtils.error(res, error.message);
    }
  }

  /**
   * Disable 2FA
   * POST /api/auth/2fa/disable
   */
  async disable(req, res) {
    try {
      const userId = req.userId;
      const { code } = req.body;

      if (!code) {
        return responseUtils.badRequest(res, '2FA code is required');
      }

      await twoFactorService.disable2FA(userId, code);

      return responseUtils.success(res, null, '2FA disabled successfully');
    } catch (error) {
      logger.error('2FA disable error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  }

  /**
   * Regenerate recovery codes
   * POST /api/auth/2fa/regenerate-recovery-codes
   */
  async regenerateRecoveryCodes(req, res) {
    try {
      const userId = req.userId;
      const { code } = req.body;

      if (!code) {
        return responseUtils.badRequest(res, '2FA code is required');
      }

      // Verify the code first
      await twoFactorService.verifyLoginCode(userId, code);

      // Regenerate recovery codes
      const recoveryCodes = await twoFactorService.regenerateRecoveryCodes(userId);

      return responseUtils.success(res, {
        recoveryCodes,
      }, 'Recovery codes regenerated successfully');
    } catch (error) {
      logger.error('Regenerate recovery codes error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  }
}

module.exports = new TwoFactorController();