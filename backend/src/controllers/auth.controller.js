const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = new PrismaClient();

// Email service (if you have it configured)
// const emailService = require('../services/email.service');

const authController = {
  /**
   * Register a new user
   */
  async register(req, res) {
    try {
      const { email, password, fullName, phone } = req.body;

      // Validate input
      if (!email || !password || !fullName) {
        return res.status(400).json({
          status: 'error',
          message: 'Email, password, and full name are required'
        });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'User already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          phone: phone || null,
          emailVerified: false,
          isActive: true,
          role: 'user'
        }
      });

      // Generate email verification token (optional)
      // const verificationToken = crypto.randomBytes(32).toString('hex');
      // await prisma.user.update({
      //   where: { id: user.id },
      //   data: { emailVerificationToken: verificationToken }
      // });

      // Send verification email (optional)
      // await emailService.sendVerificationEmail(email, verificationToken);

      const { password: _, ...safeUser } = user;

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully. Please verify your email.',
        data: safeUser
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to register user'
      });
    }
  },

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log('=== AUTH LOGIN ===');
      console.log('Email:', email);

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required'
        });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.isActive || user.deletedAt) {
        return res.status(401).json({
          status: 'error',
          message: 'Account is deactivated'
        });
      }

      // Check if password exists
      if (!user.password) {
        console.log('User has no password set:', email);
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        console.log('Invalid password for:', email);
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      console.log('Password valid for:', email);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
          loginCount: {
            increment: 1
          }
        }
      });

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role || 'user'
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      // Generate refresh token (optional)
      const refreshToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          type: 'refresh'
        },
        jwtSecret,
        { expiresIn: '30d' }
      );

      console.log('Login successful for:', email);

      const { password: _, ...safeUser } = user;

      res.json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: safeUser,
          accessToken: token,
          refreshToken: refreshToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to login'
      });
    }
  },

  /**
   * Refresh token
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          status: 'error',
          message: 'Refresh token required'
        });
      }

      const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, jwtSecret);

      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token type'
        });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user || !user.isActive || user.deletedAt) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found or inactive'
        });
      }

      // Generate new access token
      const newToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role || 'user'
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({
        status: 'success',
        data: {
          accessToken: newToken
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        status: 'error',
        message: 'Invalid or expired refresh token'
      });
    }
  },

  /**
   * Logout user
   */
  async logout(req, res) {
    try {
      // If you have a token blacklist, add token to it here
      // Otherwise, client-side logout is sufficient

      res.json({
        status: 'success',
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  /**
   * Get current user profile
   */
  async getMe(req, res) {
    try {
      const userId = req.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          skills: {
            include: { skill: true }
          },
          experience: true,
          qualifications: true,
          volunteering: true,
          availability: true
        }
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      const { password, ...safeUser } = user;

      res.json({
        status: 'success',
        data: safeUser
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'Email is required'
        });
      }

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal if user exists for security
        return res.json({
          status: 'success',
          message: 'If your email is registered, you will receive a password reset link'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry
        }
      });

      // Send reset email (implement your email service)
      // await emailService.sendPasswordResetEmail(email, resetToken);

      res.json({
        status: 'success',
        message: 'If your email is registered, you will receive a password reset link'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Token and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters'
        });
      }

      // Find user with valid token
      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid or expired reset token'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset tokens
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      });

      res.json({
        status: 'success',
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  /**
   * Change password (authenticated)
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.userId;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'New password must be at least 6 characters'
        });
      }

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      res.json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  /**
   * Verify email
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          status: 'error',
          message: 'Verification token required'
        });
      }

      // Find user with valid verification token
      const user = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerificationExpires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid or expired verification token'
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null
        }
      });

      res.json({
        status: 'success',
        message: 'Email verified successfully'
      });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
};

module.exports = authController;
