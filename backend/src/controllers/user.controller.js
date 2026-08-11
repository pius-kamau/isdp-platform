const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userController = {
  // Register new user
  async register(req, res) {
    try {
      const { email, password, fullName, phone } = req.body;
      
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'User already exists' 
        });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await userModel.create({
        email,
        password: hashedPassword,
        fullName,
        phone
      });
      
      const { password: _, ...safeUser } = user;
      res.status(201).json({ 
        status: 'success', 
        data: safeUser 
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  },

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          status: 'error', 
          message: 'Invalid credentials' 
        });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ 
          status: 'error', 
          message: 'Invalid credentials' 
        });
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      const { password: _, ...safeUser } = user;
      res.json({ 
        status: 'success', 
        data: { user: safeUser, token } 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  },

  // Get all users
  async getAll(req, res) {
    try {
      const users = await userModel.findAll();
      const safeUsers = users.map(({ password, ...rest }) => rest);
      res.json({ status: 'success', data: safeUsers });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  },

  // Get single user
  async getOne(req, res) {
    try {
      const { id } = req.params;
      
      const user = await userModel.findById(id);
      if (!user) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'User not found' 
        });
      }
      
      const { password, ...safeUser } = user;
      res.json({ status: 'success', data: safeUser });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  },

  // Update user
  async update(req, res) {
    try {
      const { id } = req.params;
      
      console.log('=== UPDATE USER ===');
      console.log('User ID:', id);
      console.log('Request User ID:', req.userId);
      console.log('Body:', req.body);
      
      // Check if user exists
      const existingUser = await userModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'User not found' 
        });
      }
      
      // Check authorization
      if (req.userId !== id) {
        return res.status(403).json({ 
          status: 'error', 
          message: 'You can only update your own profile' 
        });
      }
      
      // Build update data
      const updateData = {};
      const { fullName, bio, occupation, phone, county, subCounty, isMentor, isVolunteer, profilePhoto } = req.body;
      
      if (fullName !== undefined) updateData.fullName = fullName;
      if (bio !== undefined) updateData.bio = bio;
      if (occupation !== undefined) updateData.occupation = occupation;
      if (phone !== undefined) updateData.phone = phone;
      if (county !== undefined) updateData.county = county;
      if (subCounty !== undefined) updateData.subCounty = subCounty;
      if (isMentor !== undefined) updateData.isMentor = isMentor;
      if (isVolunteer !== undefined) updateData.isVolunteer = isVolunteer;
      if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
      
      console.log('Update data:', updateData);
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'No fields to update' 
        });
      }
      
      const updatedUser = await userModel.update(id, updateData);
      
      console.log('User updated successfully');
      
      const { password, ...safeUser } = updatedUser;
      res.json({ status: 'success', data: safeUser });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error.message || 'Failed to update user' 
      });
    }
  },

  // Delete user
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (req.userId !== id) {
        return res.status(403).json({ 
          status: 'error', 
          message: 'You can only delete your own account' 
        });
      }
      
      await userModel.delete(id);
      
      res.json({ 
        status: 'success', 
        message: 'User account deactivated' 
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: error.message 
      });
    }
  }
};

module.exports = userController;
