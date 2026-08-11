const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// Experience
router.post('/experience', async (req, res) => {
  try {
    const { title, company, years } = req.body;
    const userId = req.userId;
    
    const experience = await prisma.userExperience.create({
      data: { userId, title, company, years }
    });
    
    res.json({ status: 'success', data: experience });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/experience/:id', async (req, res) => {
  try {
    await prisma.userExperience.delete({
      where: { id: req.params.id }
    });
    res.json({ status: 'success', message: 'Experience deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Qualifications
router.post('/qualification', async (req, res) => {
  try {
    const { name, issuer, year, fileUrl } = req.body;
    const userId = req.userId;
    
    const qualification = await prisma.userQualification.create({
      data: { userId, name, issuer, year, fileUrl }
    });
    
    res.json({ status: 'success', data: qualification });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/qualification/:id', async (req, res) => {
  try {
    await prisma.userQualification.delete({
      where: { id: req.params.id }
    });
    res.json({ status: 'success', message: 'Qualification deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Volunteering
router.post('/volunteering', async (req, res) => {
  try {
    const { title, organization, hours } = req.body;
    const userId = req.userId;
    
    const volunteering = await prisma.userVolunteering.create({
      data: { userId, title, organization, hours }
    });
    
    res.json({ status: 'success', data: volunteering });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/volunteering/:id', async (req, res) => {
  try {
    await prisma.userVolunteering.delete({
      where: { id: req.params.id }
    });
    res.json({ status: 'success', message: 'Volunteering deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Availability
router.post('/availability', async (req, res) => {
  try {
    const { day, start, end } = req.body;
    const userId = req.userId;
    
    const availability = await prisma.userAvailability.create({
      data: { userId, day, start, end }
    });
    
    res.json({ status: 'success', data: availability });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/availability/:id', async (req, res) => {
  try {
    await prisma.userAvailability.delete({
      where: { id: req.params.id }
    });
    res.json({ status: 'success', message: 'Availability deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;