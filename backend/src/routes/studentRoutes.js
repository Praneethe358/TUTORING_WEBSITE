const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  profile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/studentController');
const { protectStudent } = require('../middleware/authMiddleware');
const { authLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

const passwordValidator = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
  .matches(/[a-z]/).withMessage('Password must include a lowercase letter')
  .matches(/[0-9]/).withMessage('Password must include a number');

router.post('/register', registerLimiter, [
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').notEmpty().withMessage('Phone required'),
  passwordValidator
], register);

router.post('/login', authLimiter, [
  body('email').isEmail(),
  body('password').notEmpty()
], login);

router.post('/forgot-password', passwordResetLimiter, [
  body('email').isEmail().withMessage('Valid email required')
], forgotPassword);

router.post('/reset-password', passwordResetLimiter, [
  body('token').notEmpty(),
  passwordValidator
], resetPassword);

router.get('/profile', protectStudent, profile);
router.put('/profile', protectStudent, updateProfile);
router.post('/change-password', protectStudent, changePassword);
router.post('/logout', protectStudent, logout);
router.get('/bookings', protectStudent, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const bookings = await Booking.find({ student: req.student._id })
      .populate('tutor', 'name email subjects')
      .sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

module.exports = router;
