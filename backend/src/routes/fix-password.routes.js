const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Quick fix - set password for the user
router.post('/fix-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('=== FIX PASSWORD ===');
    console.log('Email:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password required'
      });
    }
    
    // Check if user exists
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
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    console.log('Password updated successfully');
    
    res.json({
      status: 'success',
      message: 'Password updated successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        passwordSet: true
      }
    });
  } catch (error) {
    console.error('Fix password error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
