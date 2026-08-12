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
    console.log('User has passwordHash:', !!user.passwordHash);
    
    // Verify password - using passwordHash field
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      console.log('Invalid password for:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }
    
    console.log('Password valid');
    
    // Get JWT secret with fallback
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
    
    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role || 'user' 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );
    
    console.log('Token generated');
    
    // Return success
    const { passwordHash, ...safeUser } = user;
    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: safeUser,
        accessToken: token
      }
    });
  } catch (error) {
    console.error('Test login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
});

module.exports = router;
