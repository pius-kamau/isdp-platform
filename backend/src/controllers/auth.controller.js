const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = new PrismaClient();

const authController = {
  async register(req, res) {
    console.log("📝 Registration data:", req.body);
    try {
      const { email, password, fullName, phone, county, subCounty } = req.body;

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

      // Check if phone is already registered
      if (phone) {
        const existingPhone = await prisma.user.findUnique({
          where: { phone }
        });
        if (existingPhone) {
          return res.status(400).json({
            status: 'error',
            message: 'This phone number is already registered. Please use a different phone number.'
          });
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      console.log("💾 Creating user with data:", { email, fullName, county, subCounty });
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          fullName,
          phone: phone || null,
          county: county || "Nairobi",
          subCounty: subCounty || null,
          emailVerified: false,
          isActive: true,
          role: 'user'
        }
      });

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: verificationToken,
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      // Try to send verification email
      try {
        const mailService = require('../config/mail');
        const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
        const verifyLink = `${CLIENT_URL}/verify-email?token=${verificationToken}`;
        
        const emailResult = await mailService.sendVerificationEmail(email, fullName, verificationToken);
        console.log('📧 Email send result:', emailResult);
        console.log('✅ Verification email sent to:', email);
        console.log('🔗 Verification link:', verifyLink);
      } catch (emailError) {
        console.error('❌ Failed to send verification email:', emailError.message);
        console.error('❌ Email error stack:', emailError.stack);
        // Continue - don't fail registration if email fails
      }

      const { passwordHash, ...safeUser } = user;

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully. Please check your email to verify your account.',
        data: safeUser
      });
    } catch (error) {
      console.error('Register error:', error);
      
      // Check if it's a unique constraint error
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        if (field === 'phone') {
          return res.status(400).json({
            status: 'error',
            message: 'This phone number is already registered. Please use a different phone number.'
          });
        }
        if (field === 'email') {
          return res.status(400).json({
            status: 'error',
            message: 'This email is already registered. Please login or use a different email.'
          });
        }
      }
      
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to register user'
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

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
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

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
        return res.json({
          status: 'success',
          message: 'If your email is registered, you will receive a password reset link'
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry
        }
      });

      // Send email using Brevo
      try {
        const mailService = require('../config/mail');
        const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;
        
        const emailResult = await mailService.sendPasswordResetEmail(email, resetToken);
        console.log('📧 Password reset email result:', emailResult);
        console.log('✅ Password reset email sent to:', email);
        console.log('🔗 Reset link:', resetLink);
      } catch (emailError) {
        console.error('❌ Could not send password reset email:', emailError.message);
      }

      res.json({
        status: 'success',
        message: 'If your email is registered, you will receive a password reset link'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to process request'
      });
    }
  },

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