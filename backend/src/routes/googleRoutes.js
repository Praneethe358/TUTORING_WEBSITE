const express = require('express');
const router = express.Router();
const { protectTutor } = require('../middleware/authMiddleware');
const {
  connectGoogle,
  googleCallback,
  disconnectGoogle,
  getGoogleStatus
} = require('../controllers/googleController');

/**
 * GOOGLE OAUTH & CALENDAR ROUTES FOR TUTORS
 */

// @route   GET /api/tutor/google/connect
// @desc    Get Google OAuth authorization URL
// @access  Private (Tutor only)
router.get('/connect', protectTutor, connectGoogle);

// @route   GET /api/tutor/google/callback
// @desc    Handle Google OAuth callback
// @access  Public (called by Google)
router.get('/callback', googleCallback);

// @route   POST /api/tutor/google/disconnect
// @desc    Disconnect Google account
// @access  Private (Tutor only)
router.post('/disconnect', protectTutor, disconnectGoogle);

// @route   GET /api/tutor/google/status
// @desc    Get Google connection status
// @access  Private (Tutor only)
router.get('/status', protectTutor, getGoogleStatus);

module.exports = router;
