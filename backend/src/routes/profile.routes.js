const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

console.log('✅ Profile routes module loaded');

// All routes require authentication
router.use(authenticate);

// ============ FILE UPLOAD ============
console.log('✅ Registering /upload route');
router.post('/upload', upload.single('file'), async (req, res) => {
  console.log('✅ Upload endpoint hit!');
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    
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

module.exports = router;
