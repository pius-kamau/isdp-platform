const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const upload = require('../middleware/upload.middleware');

// All routes require authentication
router.use(authenticate);

// ============ FILE UPLOAD ============
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      status: 'success',
      data: {
        fileUrl: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============ EXPERIENCE ============
router.post('/experience', async (req, res) => {
  try {
    const { title, company, years } = req.body;
    const userId = req.userId;
    
    const experience = await prisma.userExperience.create({
      data: { userId, title, company, years: years || '0' }
    });
    
    res.json({ status: 'success', data: experience });
  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/experience/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const experience = await prisma.userExperience.findFirst({
      where: { id, userId }
    });
    
    if (!experience) {
      return res.status(404).json({ status: 'error', message: 'Experience not found' });
    }
    
    await prisma.userExperience.delete({ where: { id } });
    res.json({ status: 'success', message: 'Experience deleted' });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============ QUALIFICATIONS ============
router.post('/qualification', async (req, res) => {
  try {
    console.log('📝 Adding qualification');
    console.log('Body:', req.body);
    console.log('User ID:', req.userId);
    
    const { name, issuer, year, fileUrl } = req.body;
    const userId = req.userId;
    
    const qualification = await prisma.userQualification.create({
      data: { 
        userId, 
        name, 
        issuer, 
        year: year || '',
        fileUrl: fileUrl || null
      }
    });
    
    console.log('✅ Qualification added:', qualification);
    res.json({ status: 'success', data: qualification });
  } catch (error) {
    console.error('Add qualification error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/qualification/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const qualification = await prisma.userQualification.findFirst({
      where: { id, userId }
    });
    
    if (!qualification) {
      return res.status(404).json({ status: 'error', message: 'Qualification not found' });
    }
    
    await prisma.userQualification.delete({ where: { id } });
    res.json({ status: 'success', message: 'Qualification deleted' });
  } catch (error) {
    console.error('Delete qualification error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============ VOLUNTEERING ============
router.post('/volunteering', async (req, res) => {
  try {
    const { title, organization, hours } = req.body;
    const userId = req.userId;
    
    const volunteering = await prisma.userVolunteering.create({
      data: { userId, title, organization, hours: hours || '0' }
    });
    
    res.json({ status: 'success', data: volunteering });
  } catch (error) {
    console.error('Add volunteering error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/volunteering/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const volunteering = await prisma.userVolunteering.findFirst({
      where: { id, userId }
    });
    
    if (!volunteering) {
      return res.status(404).json({ status: 'error', message: 'Volunteering not found' });
    }
    
    await prisma.userVolunteering.delete({ where: { id } });
    res.json({ status: 'success', message: 'Volunteering deleted' });
  } catch (error) {
    console.error('Delete volunteering error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============ AVAILABILITY ============
router.post('/availability', async (req, res) => {
  try {
    const { day, start, end } = req.body;
    const userId = req.userId;
    
    const availability = await prisma.userAvailability.create({
      data: { userId, day, start, end }
    });
    
    res.json({ status: 'success', data: availability });
  } catch (error) {
    console.error('Add availability error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/availability/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const availability = await prisma.userAvailability.findFirst({
      where: { id, userId }
    });
    
    if (!availability) {
      return res.status(404).json({ status: 'error', message: 'Availability not found' });
    }
    
    await prisma.userAvailability.delete({ where: { id } });
    res.json({ status: 'success', message: 'Availability deleted' });
  } catch (error) {
    console.error('Delete availability error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
