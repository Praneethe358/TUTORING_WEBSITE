const express = require('express');
const { verifyEmail, resendVerificationEmail } = require('../controllers/emailVerificationController');
const { protectStudent, protectTutor } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route - verify email with token
router.get('/verify', verifyEmail);

// Protected routes - resend verification email
router.post('/resend', (req, res, next) => {
  // Use protectStudent or protectTutor based on who's logged in
  if (req.user?.role === 'student') {
    return protectStudent(req, res, next);
  } else if (req.user?.role === 'tutor') {
    return protectTutor(req, res, next);
  }
  next();
}, resendVerificationEmail);

module.exports = router;
