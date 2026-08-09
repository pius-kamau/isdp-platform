const speakeasy = require('speakeasy');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../config/logger');
const auditService = require('./audit.service');
const redis = require('../config/redis');

class TwoFactorService {
  /**
   * Generate TOTP secret and OTPAuth URL
   */
  async generateSecret(userId, email) {
    // Generate secret using speakeasy
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `ISDP Platform (${email})`,
    });

    // Store secret temporarily (will be verified before enabling)
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
        twoFactorEnabled: false,
      },
    });

    // Audit log
    await auditService.log(userId, '2FA_SETUP_STARTED', {}, null);

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
    };
  }

  /**
   * Verify TOTP code during setup
   */
  async verifySetupCode(userId, code) {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.twoFactorSecret) {
      throw new Error('2FA setup not initiated');
    }

    // Trim whitespace from code
    const trimmedCode = code ? code.trim() : '';

    // Verify the code using speakeasy
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: trimmedCode,
      window: 2,
    });

    if (!isValid) {
      // Audit log failed attempt
      await auditService.log(userId, '2FA_SETUP_FAILED', { reason: 'Invalid code' }, null);
      throw new Error('Invalid 2FA code');
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorBackup: new Date(),
      },
    });

    // Generate recovery codes
    const recoveryCodes = await this.generateRecoveryCodes(userId);

    // Audit log success
    await auditService.log(userId, '2FA_ENABLED', {}, null);

    return {
      success: true,
      recoveryCodes,
    };
  }

  /**
   * Generate recovery codes (10 codes)
   */
  async generateRecoveryCodes(userId) {
    const codes = [];
    const codeHashes = [];

    // Generate 10 recovery codes
    for (let i = 0; i < 10; i++) {
      // Format: XXXX-XXXX
      const code = this.generateRecoveryCode();
      codes.push(code);

      // Hash the code for storage
      const hashedCode = await bcrypt.hash(code, 10);
      codeHashes.push({
        userId,
        codeHash: hashedCode,
        used: false,
      });
    }

    // Delete old recovery codes
    await prisma.recoveryCode.deleteMany({
      where: { userId },
    });

    // Save new recovery codes
    await prisma.recoveryCode.createMany({
      data: codeHashes,
    });

    // Audit log
    await auditService.log(userId, 'RECOVERY_CODES_GENERATED', { count: codes.length }, null);

    return codes;
  }

  /**
   * Generate a single recovery code
   * Format: XXXX-XXXX
   */
  generateRecoveryCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Verify 2FA code during login
   */
  async verifyLoginCode(userId, code) {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new Error('2FA not enabled for this user');
    }

    // Trim whitespace from code
    const trimmedCode = code ? code.trim() : '';

    // Verify the code using speakeasy
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: trimmedCode,
      window: 2,
    });

    if (!isValid) {
      // Audit log failed attempt
      await auditService.log(userId, '2FA_VERIFICATION_FAILED', { reason: 'Invalid code' }, null);
      throw new Error('Invalid 2FA code');
    }

    // Audit log success
    await auditService.log(userId, '2FA_VERIFICATION_SUCCESS', {}, null);

    return true;
  }

  /**
   * Verify a recovery code
   */
  async verifyRecoveryCode(userId, recoveryCode) {
    // Get user's recovery codes
    const recoveryCodes = await prisma.recoveryCode.findMany({
      where: {
        userId,
        used: false,
      },
    });

    if (recoveryCodes.length === 0) {
      throw new Error('No valid recovery codes available');
    }

    // Check each code
    for (const code of recoveryCodes) {
      const isValid = await bcrypt.compare(recoveryCode, code.codeHash);
      if (isValid) {
        // Mark as used
        await prisma.recoveryCode.update({
          where: { id: code.id },
          data: {
            used: true,
            usedAt: new Date(),
          },
        });

        // Audit log
        await auditService.log(userId, 'RECOVERY_CODE_USED', {}, null);

        return true;
      }
    }

    // Audit log failed attempt
    await auditService.log(userId, 'RECOVERY_CODE_FAILED', { reason: 'Invalid code' }, null);
    throw new Error('Invalid recovery code');
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId, code) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new Error('2FA is not enabled');
    }

    // Trim whitespace from code
    const trimmedCode = code ? code.trim() : '';

    // Verify the code using speakeasy
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: trimmedCode,
      window: 2,
    });

    if (!isValid) {
      // Audit log failed attempt
      await auditService.log(userId, '2FA_DISABLE_FAILED', { reason: 'Invalid code' }, null);
      throw new Error('Invalid 2FA code');
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    // Delete recovery codes
    await prisma.recoveryCode.deleteMany({
      where: { userId },
    });

    // Audit log
    await auditService.log(userId, '2FA_DISABLED', {}, null);

    return true;
  }

  /**
   * Get 2FA status for a user
   */
  async getStatus(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      enabled: user.twoFactorEnabled,
      hasSecret: !!user.twoFactorSecret,
    };
  }

  /**
   * Regenerate recovery codes
   */
  async regenerateRecoveryCodes(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new Error('2FA must be enabled to generate recovery codes');
    }

    return await this.generateRecoveryCodes(userId);
  }

  /**
   * Generate a temporary 2FA challenge token
   * This is used during login when 2FA is required
   */
  async generateChallengeToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    
    try {
      const client = redis.getClient();
      if (client) {
        // Store in Redis with 5 minute expiry (300 seconds)
        await client.setex(`2fa:challenge:${token}`, 300, userId);
        logger.debug(`2FA challenge token generated for user ${userId}`);
      } else {
        logger.warn('Redis not available, challenge token stored in memory only');
      }
    } catch (error) {
      logger.error('Failed to store challenge token in Redis:', error);
    }
    
    return token;
  }

  /**
   * Validate and get user ID from challenge token
   */
  async validateChallengeToken(token) {
    try {
      const client = redis.getClient();
      if (!client) {
        logger.warn('Redis not available, cannot validate challenge token');
        return null;
      }

      const userId = await client.get(`2fa:challenge:${token}`);
      if (!userId) {
        return null;
      }

      // Delete the token after use (one-time use)
      await client.del(`2fa:challenge:${token}`);
      
      return userId;
    } catch (error) {
      logger.error('Failed to validate challenge token:', error);
      return null;
    }
  }
}

module.exports = new TwoFactorService();