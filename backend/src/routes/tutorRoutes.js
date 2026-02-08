const express = require('express');
const { body } = require('express-validator');
const {
  register, login, logout, profile, updateProfile, changePassword,
  updateAvailability, createCourse, myCourses, upcomingBookings,
  listApprovedTutors, getTutorProfile, bookTutor, studentBookings,
  forgotPassword, resetPassword, getAllStudents, uploadProfileImage
} = require('../controllers/tutorController');
const { protectTutor, protectStudent } = require('../middleware/authMiddleware');
const { upload, cvUpload } = require('../middleware/uploadMiddleware');
const { authLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

const parseSubjects = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (_e) {
      // fall back to CSV parsing
    }
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const passwordValidator = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Include uppercase')
  .matches(/[a-z]/).withMessage('Include lowercase')
  .matches(/[0-9]/).withMessage('Include number');

router.post('/register', registerLimiter, cvUpload.single('cv'), [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('phone').notEmpty(),
  passwordValidator,
  body('qualifications').notEmpty(),
  body('subjects').customSanitizer(parseSubjects).isArray({ min: 1 }),
  body('experienceYears').isNumeric()
], register);

router.post('/login', authLimiter, [
  body('email').isEmail(),
  body('password').notEmpty()
], login);

router.post('/forgot-password', passwordResetLimiter, [body('email').isEmail()], forgotPassword);
router.post('/reset-password', passwordResetLimiter, [body('token').notEmpty(), passwordValidator], resetPassword);

router.get('/profile', protectTutor, profile);
router.put('/profile', protectTutor, updateProfile);
router.post('/upload-profile-image', protectTutor, upload.single('profileImage'), uploadProfileImage);
router.post('/change-password', protectTutor, changePassword);
router.post('/availability', protectTutor, updateAvailability);

router.post('/courses', protectTutor, createCourse);
router.get('/courses', protectTutor, myCourses);
router.get('/bookings', protectTutor, upcomingBookings);
router.get('/all-students', protectTutor, getAllStudents);
router.get('/assigned-students', protectTutor, require('../controllers/tutorAssignmentController').getAssignedStudentsForTutor);

// student-facing tutor interactions
router.get('/public', listApprovedTutors);
router.get('/public/:id', getTutorProfile);
router.post('/book', protectStudent, bookTutor);
router.get('/student/bookings', protectStudent, studentBookings);

router.post('/logout', protectTutor, logout);

module.exports = router;
