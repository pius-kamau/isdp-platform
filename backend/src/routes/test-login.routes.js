const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test login endpoint - completely independent
router.post('/test-login', async (req, res) => {
  try {
    console.log('=== TEST LOGIN ENDPOINT HIT ===');
    const { email, password } = req.body;
    
    console.log('Email received:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password required'
      });
    }
    
    // Find user directly
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }
    
    console.log('User found:', user.id);
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log('Invalid password for:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    // Return success
    const { password: _, ...safeUser } = user;
    res.json({
      status: 'success',
      message: 'Test login successful',
      data: {
        user: safeUser,
        token: token
      }
    });
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
