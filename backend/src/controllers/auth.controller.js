const authService = require('../services/auth.service');
const userModel = require('../models/user.model');
const responseUtils = require('../utils/response.utils');
const logger = require('../config/logger');
const auditService = require('../services/audit.service');

class AuthController {
  // Register a new user
  async register(req, res) {
    try {
      const userData = req.body;
      const result = await authService.register(userData);

      // Log registration
      await auditService.logUserRegistration(result.user.id, req);

      return responseUtils.created(res, {
        user: result.user,
        verificationToken: result.verificationToken,
      }, 'User registered successfully. Please verify your email.');
    } catch (error) {
      logger.error('Register error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  }

  // Login user
async login(req, res) {
  try {
    const { email, phone, password } = req.body;
    const result = await authService.login({ email, phone, password });

    // Log login attempt
    if (result.user) {
      await auditService.logUserLogin(result.user.id, req);
    }

    // Check if 2FA is required
    if (result.requires2FA) {
      return responseUtils.success(res, {
        requires2FA: true,
        challengeToken: result.challengeToken,
        user: result.user,
        message: result.message,
      }, '2FA verification required');
    }

    return responseUtils.success(res, {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }, 'Login successful');
  } catch (error) {
    logger.error('Login error:', error);
    return responseUtils.unauthorized(res, error.message);
  }
}
  // Refresh access token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      return responseUtils.success(res, {
        accessToken: result.accessToken,
      }, 'Token refreshed successfully');
    } catch (error) {
      logger.error('Refresh token error:', error);
      return responseUtils.unauthorized(res, error.message);
    }
  }

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token } = req.query;
      const result = await authService.verifyEmail(token);

      // Log email verification
      const decoded = require('../utils/token.utils').verifyToken(token);
      if (decoded && decoded.id) {
        await auditService.logEmailVerified(decoded.id, req);
      }

      return responseUtils.success(res, result, 'Email verified successfully');
    } catch (error) {
      logger.error('Verify email error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  }

  // Resend verification email
  async resendVerification(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.resendVerification(email);

      return responseUtils.success(res, result, 'Verification email sent');
    } catch (error) {
      logger.error('Resend verification error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  }

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);

      return responseUtils.success(res, result, 'Password reset email sent');
    } catch (error) {
      logger.error('Forgot password error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      const result = await authService.resetPassword(token, password);

      return responseUtils.success(res, result, 'Password reset successfully');
    } catch (error) {
      logger.error('Reset password error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  }

  // Change password (authenticated)
  async changePassword(req, res) {
    try {
      const userId = req.userId;
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(userId, currentPassword, newPassword);

      // Log password change
      await auditService.logPasswordChanged(userId, req);

      return responseUtils.success(res, result, 'Password changed successfully');
    } catch (error) {
      logger.error('Change password error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const userId = req.userId;
      const { refreshToken } = req.body;
      const result = await authService.logout(userId, refreshToken);

      // Log logout
      await auditService.logUserLogout(userId, req);

      return responseUtils.success(res, result, 'Logged out successfully');
    } catch (error) {
      logger.error('Logout error:', error);
      return responseUtils.badRequest(res, error.message);
    }
  }

  // Get current user profile
  async me(req, res) {
    try {
      const user = await userModel.findById(req.userId);
      if (!user) {
        return responseUtils.notFound(res, 'User not found');
      }

      return responseUtils.success(res, user, 'User profile retrieved');
    } catch (error) {
      logger.error('Get profile error:', error);
      return responseUtils.error(res, 'Failed to get user profile');
    }
  }
}

module.exports = new AuthController();