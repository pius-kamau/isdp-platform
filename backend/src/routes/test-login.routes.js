const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test login endpoint - completely independent with debug
router.post('/test-login', async (req, res) => {
  try {
    console.log('=== TEST LOGIN ENDPOINT HIT ===');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;
    
    console.log('Email received:', email);
    console.log('Password received:', password ? '***' : 'undefined');
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        status: 'error',
        message: 'Email and password required'
      });
    }
    
    console.log('Attempting to find user in database...');
    
    // Find user directly
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    
    console.log('Database query completed');
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }
    
    console.log('User found:', user.id);
    console.log('User has password:', user.password ? 'Yes' : 'No');
    
    // Verify password
    console.log('Verifying password...');
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      console.log('Invalid password for:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    console.log('Generating JWT token...');
    console.log('JWT_SECRET exists:', process.env.JWT_SECRET ? 'Yes' : 'No');
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('Token generated successfully');
    
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
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
