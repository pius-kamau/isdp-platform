const userModel = require('../models/user.model');
const passwordUtils = require('../utils/password.utils');
const tokenUtils = require('../utils/token.utils');
const logger = require('../config/logger');
const { AUTH_ERRORS } = require('../constants/auth.constants');
const mailService = require('../config/mail');
const twoFactorService = require('./twoFactor.service');

class AuthService {
  async register(data) {
    const { fullName, email, phone, password, county, subCounty, bio, occupation } = data;

    // Check if email already exists
    if (email) {
      const existing = await userModel.findByEmail(email);
      if (existing) {
        throw new Error(AUTH_ERRORS.EMAIL_ALREADY_EXISTS);
      }
    }

    // Check if phone already exists
    if (phone) {
      const existing = await userModel.findByPhone(phone);
      if (existing) {
        throw new Error(AUTH_ERRORS.PHONE_ALREADY_EXISTS);
      }
    }

    // Validate password strength
    const validation = passwordUtils.validatePasswordStrength(password);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Hash password
    const passwordHash = await passwordUtils.hash(password);

    // Create user
    const user = await userModel.create({
      fullName,
      email,
      phone,
      passwordHash,
      county,
      subCounty,
      bio,
      occupation,
    });

    // Generate verification token
    const verificationToken = tokenUtils.generateVerificationToken({
      id: user.id,
      email: user.email,
    });

    // Send verification email (skip in test environment)
    if (user.email && process.env.NODE_ENV !== 'test') {
      await mailService.sendVerificationEmail(user.email, verificationToken);
      await mailService.sendWelcomeEmail(user.email, user.fullName);
    }

    return { user, verificationToken };
  }

  async login(credentials) {
    const { email, phone, password } = credentials;

    // Find user - using findUnique directly to ensure all fields are fetched
    let user;
    if (email) {
      user = await userModel.findByEmail(email);
    } else if (phone) {
      user = await userModel.findByPhone(phone);
    }

    if (!user) {
      throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error(AUTH_ERRORS.ACCOUNT_SUSPENDED);
    }

    // Check if email is verified (skip in test environment)
    if (user.email && !user.emailVerified && process.env.NODE_ENV !== 'test') {
      throw new Error(AUTH_ERRORS.EMAIL_NOT_VERIFIED);
    }

    // Verify password
    const isValid = await passwordUtils.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // Update login stats
    await userModel.updateLoginStats(user.id);

    // Remove sensitive data
    const { passwordHash, ...userData } = user;

    // 🔐 CRITICAL: Check if 2FA is enabled
    // The twoFactorEnabled field should be a boolean
    const is2FAEnabled = user.twoFactorEnabled === true;

    console.log('🔐 2FA DEBUG:');
    console.log('  User ID:', user.id);
    console.log('  twoFactorEnabled value:', user.twoFactorEnabled);
    console.log('  twoFactorEnabled type:', typeof user.twoFactorEnabled);
    console.log('  Is 2FA Enabled?', is2FAEnabled);

    if (is2FAEnabled) {
      console.log('🔐 2FA IS ENABLED - Requiring 2FA verification');
      const challengeToken = await twoFactorService.generateChallengeToken(user.id);
      
      return {
        requires2FA: true,
        challengeToken,
        message: '2FA verification required',
        user: userData,
      };
    }

    console.log('🔐 2FA IS DISABLED - Full login');
    // Generate tokens
    const accessToken = tokenUtils.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role || 'user',
    });

    const refreshToken = tokenUtils.generateRefreshToken({
      id: user.id,
    });

    return {
      user: userData,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken) {
    const decoded = tokenUtils.verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (!decoded) {
      throw new Error(AUTH_ERRORS.REFRESH_TOKEN_INVALID);
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      throw new Error(AUTH_ERRORS.REFRESH_TOKEN_INVALID);
    }

    const accessToken = tokenUtils.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role || 'user',
    });

    return { accessToken };
  }

  async verifyEmail(token) {
    const decoded = tokenUtils.verifyToken(token);
    if (!decoded) {
      throw new Error(AUTH_ERRORS.TOKEN_INVALID);
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      throw new Error(AUTH_ERRORS.TOKEN_INVALID);
    }

    if (user.emailVerified) {
      return { message: 'Email already verified' };
    }

    await userModel.update(user.id, { emailVerified: true });
    return { message: 'Email verified successfully' };
  }

  async resendVerification(email) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email already verified');
    }

    const verificationToken = tokenUtils.generateVerificationToken({
      id: user.id,
      email: user.email,
    });

    await mailService.sendVerificationEmail(user.email, verificationToken);
    return { message: 'Verification email sent' };
  }

  async forgotPassword(email) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = tokenUtils.generatePasswordResetToken({
      id: user.id,
      email: user.email,
    });

    await mailService.sendPasswordResetEmail(user.email, resetToken);
    return { message: 'Password reset email sent' };
  }

  async resetPassword(token, newPassword) {
    const decoded = tokenUtils.verifyToken(token);
    if (!decoded) {
      throw new Error(AUTH_ERRORS.TOKEN_INVALID);
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      throw new Error(AUTH_ERRORS.TOKEN_INVALID);
    }

    // Validate password strength
    const validation = passwordUtils.validatePasswordStrength(newPassword);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    const passwordHash = await passwordUtils.hash(newPassword);
    await userModel.update(user.id, { passwordHash });

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await passwordUtils.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    const validation = passwordUtils.validatePasswordStrength(newPassword);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    const passwordHash = await passwordUtils.hash(newPassword);
    await userModel.update(userId, { passwordHash });

    return { message: 'Password changed successfully' };
  }

  async logout(userId, refreshToken) {
    logger.info(`User ${userId} logged out`);
    return { message: 'Logged out successfully' };
  }
}

module.exports = new AuthService();