const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { isAdmin } = require('../middleware/auth.middleware');
const prisma = new PrismaClient();

// Apply isAdmin middleware to all admin routes
router.use(isAdmin);

// Get admin stats
router.get('/stats', async (req, res) => {
  try {
    console.log('Fetching admin stats');
    
    const totalUsers = await prisma.user.count();
    const totalSkills = await prisma.skill.count();
    const totalMessages = await prisma.message.count();
    
    res.json({
      status: 'success',
      data: {
        users: totalUsers,
        skills: totalSkills,
        messages: totalMessages
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stats'
    });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    console.log('Fetching all users for admin');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        county: true,
        isActive: true,
        isMentor: true,
        isVerified: true,
        occupation: true,
        profilePhoto: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${users.length} users`);
    
    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    console.log('Updating user role:', id, 'to', role);
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role'
      });
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      }
    });
    
    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user role'
    });
  }
});

// Toggle user active status
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    console.log('Toggling user status:', id, 'to', isActive);
    
    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true
      }
    });
    
    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to toggle user status'
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting user:', id);
    
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!userExists) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    await prisma.user.delete({
      where: { id }
    });
    
    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
});

module.exports = router;
