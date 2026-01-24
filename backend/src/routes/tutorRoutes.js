const express = require('express');
const { body } = require('express-validator');
const {
  register, login, logout, profile, updateProfile, changePassword,
  updateAvailability, createCourse, myCourses, upcomingBookings,
  listApprovedTutors, getTutorProfile, bookTutor, studentBookings,
  forgotPassword, resetPassword
} = require('../controllers/tutorController');
const { protectTutor, protectStudent } = require('../middleware/authMiddleware');

const router = express.Router();

const passwordValidator = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Include uppercase')
  .matches(/[a-z]/).withMessage('Include lowercase')
  .matches(/[0-9]/).withMessage('Include number');

router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('phone').notEmpty(),
  passwordValidator,
  body('qualifications').notEmpty(),
  body('subjects').isArray({ min: 1 }),
  body('experienceYears').isNumeric()
], register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], login);

router.post('/forgot-password', [body('email').isEmail()], forgotPassword);
router.post('/reset-password', [body('token').notEmpty(), passwordValidator], resetPassword);

router.get('/profile', protectTutor, profile);
router.put('/profile', protectTutor, updateProfile);
router.post('/change-password', protectTutor, changePassword);
router.post('/availability', protectTutor, updateAvailability);

router.post('/courses', protectTutor, createCourse);
router.get('/courses', protectTutor, myCourses);
router.get('/bookings', protectTutor, upcomingBookings);

// student-facing tutor interactions
router.get('/public', listApprovedTutors);
router.get('/public/:id', getTutorProfile);
router.post('/book', protectStudent, bookTutor);
router.get('/student/bookings', protectStudent, studentBookings);

router.post('/logout', protectTutor, logout);

module.exports = router;
