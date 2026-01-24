const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protectAny } = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
  }
});

// Upload avatar
router.post('/upload', protectAny, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const Model = req.user.role === 'student' ? Student : Tutor;
    
    // Delete old avatar if exists
    const user = await Model.findById(req.user._id);
    if (user.avatar && user.avatar !== '') {
      const oldPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    // Update user avatar
    await Model.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });
    
    res.json({ 
      message: 'Avatar uploaded successfully', 
      avatar: avatarUrl 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete avatar
router.delete('/delete', protectAny, async (req, res) => {
  try {
    const Model = req.user.role === 'student' ? Student : Tutor;
    const user = await Model.findById(req.user._id);
    
    if (user.avatar && user.avatar !== '') {
      const avatarPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }
    
    await Model.findByIdAndUpdate(req.user._id, { avatar: '' });
    res.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
