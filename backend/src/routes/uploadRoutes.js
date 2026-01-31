const express = require('express');
const { upload } = require('../middleware/uploadMiddleware');
const {
  uploadStudentPhoto,
  uploadTutorPhoto,
  deleteStudentPhoto,
  deleteTutorPhoto
} = require('../controllers/uploadController');
const { protectStudent, protectTutor } = require('../middleware/authMiddleware');

const router = express.Router();

// Student photo routes
router.post('/student/photo', protectStudent, upload.single('photo'), uploadStudentPhoto);
router.delete('/student/photo', protectStudent, deleteStudentPhoto);

// Tutor photo routes
router.post('/tutor/photo', protectTutor, upload.single('photo'), uploadTutorPhoto);
router.delete('/tutor/photo', protectTutor, deleteTutorPhoto);

module.exports = router;
