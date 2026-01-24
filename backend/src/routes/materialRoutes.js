const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const materialController = require('../controllers/materialController');
const { protectStudent, protectTutor } = require('../middleware/authMiddleware');

/**
 * MATERIAL ROUTES
 * File upload configuration with multer
 */

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/materials');
    // Create directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, PowerPoint, Excel, Images, and Text files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

/**
 * TUTOR ROUTES - Upload and manage materials
 */

// Upload material
router.post('/upload', protectTutor, upload.single('file'), materialController.uploadMaterial);

// Get tutor's materials
router.get('/tutor/materials', protectTutor, materialController.getTutorMaterials);

// Delete material
router.delete('/:materialId', protectTutor, materialController.deleteMaterial);

// Share material with student
router.post('/:materialId/share', protectTutor, materialController.shareMaterial);

/**
 * STUDENT ROUTES - View and download materials
 */

// Get all available materials
router.get('/student/materials', protectStudent, materialController.getAllAvailableMaterials);

// Get materials from specific tutor
router.get('/tutor/:tutorId/materials', protectStudent, materialController.getStudentMaterials);

// Download material
router.get('/:materialId/download', protectStudent, materialController.downloadMaterial);

module.exports = router;
