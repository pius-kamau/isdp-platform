const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserController {
  // Register a new user
  async register(req, res) {
    try {
      const { fullName, email, phone, password, county, subCounty, bio, occupation } = req.body;

      // Validate required fields
      if (!fullName) {
        return res.status(400).json({ message: 'Full name is required' });
      }
      if (!password) {
        return res.status(400).json({ message: 'Password is required' });
      }
      if (!county) {
        return res.status(400).json({ message: 'County is required' });
      }

      // Check if email already exists
      if (email) {
        const existingEmail = await userModel.findByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ message: 'Email already registered' });
        }
      }

      // Check if phone already exists
      if (phone) {
        const existingPhone = await userModel.findByPhone(phone);
        if (existingPhone) {
          return res.status(400).json({ message: 'Phone number already registered' });
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await userModel.create({
        fullName,
        email,
        phone,
        passwordHash,
        county,
        subCounty,
        bio,
        occupation,
      });

      // Remove password from response
      const { passwordHash: _, ...userData } = user;

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: userData,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Registration failed',
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, phone, password } = req.body;

      // Validate input
      if (!email && !phone) {
        return res.status(400).json({
          status: 'error',
          message: 'Email or phone number is required',
        });
      }

      if (!password) {
        return res.status(400).json({
          status: 'error',
          message: 'Password is required',
        });
      }

      // Find user by email or phone
      let user;
      if (email) {
        user = await userModel.findByEmail(email);
      } else if (phone) {
        user = await userModel.findByPhone(phone);
      }

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials',
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Remove password from response
      const { passwordHash, ...userData } = user;

      res.json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: userData,
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Login failed',
      });
    }
  }

  // Get all users
  async getAll(req, res) {
    try {
      const users = await userModel.findAll();
      res.json({
        status: 'success',
        count: users.length,
        data: users,
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch users',
      });
    }
  }

  // Get single user by ID
  async getOne(req, res) {
    try {
      const { id } = req.params;
      const user = await userModel.findById(id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      res.json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user',
      });
    }
  }

  // Update user
  async update(req, res) {
    try {
      const { id } = req.params;
      const { 
        fullName, 
        email, 
        phone, 
        county, 
        subCounty, 
        bio, 
        occupation,
        isMentor,
        isVolunteer,
        isVerified,
        profilePhoto
      } = req.body;

      // Check if user exists
      const existingUser = await userModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      // Prepare update data
      const updateData = {};
      if (fullName) updateData.fullName = fullName;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (county) updateData.county = county;
      if (subCounty !== undefined) updateData.subCounty = subCounty;
      if (bio !== undefined) updateData.bio = bio;
      if (occupation !== undefined) updateData.occupation = occupation;
      if (isMentor !== undefined) updateData.isMentor = isMentor;
      if (isVolunteer !== undefined) updateData.isVolunteer = isVolunteer;
      if (isVerified !== undefined) updateData.isVerified = isVerified;
      if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;

      const user = await userModel.update(id, updateData);

      res.json({
        status: 'success',
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update user',
      });
    }
  }

  // Delete user
  async delete(req, res) {
    try {
      const { id } = req.params;

      const user = await userModel.findById(id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }

      await userModel.delete(id);

      res.json({
        status: 'success',
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete user',
      });
    }
  }
}

module.exports = new UserController();