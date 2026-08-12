const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * REQUEST PASSWORD RESET
 * Sends a reset link to the user's email (no token exposure)
 */
router.post('/forgot-password', async (req, res) => {
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
    
    // Don't reveal if user exists (security)
    if (!user) {
      return res.json({
        status: 'success',
        message: 'If your email is registered, you will receive a reset link'
      });
    }
    
    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    // Store token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry
      }
    });
    
    // TODO: Send email with reset link
    // await emailService.sendPasswordResetEmail(email, resetToken);
    
    console.log('Password reset requested for:', email);
    
    res.json({
      status: 'success',
      message: 'If your email is registered, you will receive a reset link'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process request'
    });
  }
});

/**
 * RESET PASSWORD WITH TOKEN
 * Requires valid token (one-time use, expires in 1 hour)
 */
router.post('/reset-password', async (req, res) => {
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
    
    // Update password and clear tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
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
      message: 'Failed to reset password'
    });
  }
});

module.exports = router;
