const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = new PrismaClient();

const authController = {
  async register(req, res) {
    try {
      const { email, password, fullName, phone } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({
          status: 'error',
          message: 'Email, password, and full name are required'
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'User already exists'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          fullName,
          phone: phone || null,
          emailVerified: false,
          isActive: true,
          role: 'user'
        }
      });

      const { passwordHash, ...safeUser } = user;

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
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

  async login(req, res) {
    try {
      const { email, password } = req.body;

      console.log('=== AUTH LOGIN ===');
      console.log('Email:', email);

      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required'
        });
      }

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

      if (!user.isActive || user.deletedAt) {
        return res.status(401).json({
          status: 'error',
          message: 'Account is deactivated'
        });
      }

      if (!user.passwordHash) {
        console.log('User has no password set:', email);
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        console.log('Invalid password for:', email);
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      console.log('Password valid for:', email);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLogin: new Date(),
          loginCount: {
            increment: 1
          }
        }
      });

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

      const { passwordHash, ...safeUser } = user;

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
      const decoded = jwt.verify(refreshToken, jwtSecret);

      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token type'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user || !user.isActive || user.deletedAt) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found or inactive'
        });
      }

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

  async logout(req, res) {
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  },

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

      const { passwordHash, ...safeUser } = user;

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

  async forgotPassword(req, res) {
    try {
      console.log('🚀 FORGOT PASSWORD FUNCTION STARTED');
      console.log('📝 Request body:', req.body);
      
      const { email } = req.body;

      console.log('📧 Email received:', email);

      if (!email) {
        console.log('❌ No email provided');
        return res.status(400).json({
          status: 'error',
          message: 'Email is required'
        });
      }

      console.log('🔍 Looking for user with email:', email);

      const user = await prisma.user.findUnique({
        where: { email }
      });

      console.log('👤 User found:', user ? 'Yes - ' + user.id : 'No');

      if (!user) {
        console.log('❌ User not found, returning success message');
        return res.json({
          status: 'success',
          message: 'If your email is registered, you will receive a password reset link'
        });
      }

      console.log('🔑 Generating reset token for user:', user.id);

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      console.log('🔑 RESET TOKEN:', resetToken);
      console.log('⏰ Token expiry:', resetTokenExpiry);

      console.log('💾 Saving token to database...');
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry
        }
      });
      console.log('✅ Token saved to database');

      // ========== SEND EMAIL ==========
      console.log('📧 Sending password reset email to:', email);
      
      try {
        console.log('📧 Loading mail service...');
        const mailService = require('../config/mail');
        console.log('📧 Mail service loaded, sending email...');
        
        const result = await mailService.sendPasswordResetEmail(email, resetToken);
        console.log('📧 Email send result:', result);
        console.log('✅ Password reset email sent to:', email);
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError.message);
        console.error('❌ Email error stack:', emailError.stack);
        // Don't fail the request if email fails
      }

      console.log('✅ Forgot password completed successfully');
      res.json({
        status: 'success',
        message: 'If your email is registered, you will receive a password reset link'
      });
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to process request'
      });
    }
  },

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      console.log('=== RESET PASSWORD ===');
      console.log('Token received:', token ? token.substring(0, 15) + '...' : 'none');

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

      console.log('Looking for user with token...');

      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        console.log('No user found with valid token');
        return res.status(400).json({
          status: 'error',
          message: 'Invalid or expired reset token'
        });
      }

      console.log('User found:', user.id);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      });

      console.log('Password reset successfully for:', user.email);

      res.json({
        status: 'success',
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to reset password'
      });
    }
  },

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

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Current password is incorrect'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword }
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

  async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          status: 'error',
          message: 'Verification token required'
        });
      }

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
