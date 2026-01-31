const crypto = require('crypto');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const { sendVerificationEmail } = require('../utils/email');

/**
 * EMAIL VERIFICATION CONTROLLER
 * Handles email verification and resend functionality
 */

// Verify email with token
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Check student
    let user = await Student.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    let userType = 'student';

    // If not student, check tutor
    if (!user) {
      user = await Tutor.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() }
      });
      userType = 'tutor';
    }

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token. Please request a new verification email.' 
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ 
      message: 'Email verified successfully! You can now access all features.',
      userType
    });
  } catch (err) {
    next(err);
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    let user;
    if (userRole === 'student') {
      user = await Student.findById(userId);
    } else if (userRole === 'tutor') {
      user = await Tutor.findById(userId);
    } else {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send email
    try {
      await sendVerificationEmail(user.email, verificationToken, user.name);
      res.json({ message: 'Verification email sent. Please check your inbox.' });
    } catch (emailError) {
      res.status(500).json({ 
        message: 'Failed to send verification email. Please try again later.' 
      });
    }
  } catch (err) {
    next(err);
  }
};
