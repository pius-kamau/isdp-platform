const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// One-time password reset endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('=== RESET PASSWORD ===');
    console.log('Email:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password required'
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    console.log('User found:', user.id);
    console.log('Current password exists:', !!user.password);
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword
      }
    });
    
    console.log('Password set for:', email);
    
    res.json({
      status: 'success',
      message: 'Password set successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        passwordSet: true
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
