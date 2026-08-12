const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/set-password', async (req, res) => {
  try {
    const { email, password, secret } = req.body;
    
    // Secret check - remove this route after use
    if (secret !== 'FIX_PASSWORD_2026') {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hashedPassword }
    });
    
    console.log('✅ Password set for:', email);
    res.json({ status: 'success', message: 'Password set successfully' });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
