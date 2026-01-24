/**
 * GOOGLE OAUTH & CALENDAR CONTROLLER
 * Handles Google authentication and calendar integration for tutors
 */

const Tutor = require('../models/Tutor');
const googleService = require('../services/googleService');

/**
 * Initiate Google OAuth flow
 * GET /api/tutor/google/connect
 */
exports.connectGoogle = async (req, res, next) => {
  try {
    const tutorId = req.user._id.toString();
    const authUrl = googleService.getAuthUrl(tutorId);
    
    res.json({
      message: 'Authorization URL generated',
      authUrl
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle OAuth callback from Google
 * GET /api/tutor/google/callback
 */
exports.googleCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code missing' });
    }

    const tutorId = state; // Extract tutorId from state parameter
    
    // Exchange code for tokens
    const tokens = await googleService.getTokens(code);
    
    // Save tokens to tutor profile
    await Tutor.findByIdAndUpdate(tutorId, {
      'googleAuth.accessToken': tokens.access_token,
      'googleAuth.refreshToken': tokens.refresh_token,
      'googleAuth.tokenExpiry': new Date(tokens.expiry_date),
      'googleAuth.isConnected': true,
      'googleAuth.connectedAt': new Date()
    });

    // Redirect to frontend success page
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/tutor/settings?googleConnected=true`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/tutor/settings?googleConnected=false&error=auth_failed`);
  }
};

/**
 * Disconnect Google account
 * POST /api/tutor/google/disconnect
 */
exports.disconnectGoogle = async (req, res, next) => {
  try {
    await Tutor.findByIdAndUpdate(req.user._id, {
      'googleAuth.accessToken': null,
      'googleAuth.refreshToken': null,
      'googleAuth.tokenExpiry': null,
      'googleAuth.isConnected': false,
      'googleAuth.connectedAt': null
    });

    res.json({ message: 'Google account disconnected successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Google connection status
 * GET /api/tutor/google/status
 */
exports.getGoogleStatus = async (req, res, next) => {
  try {
    const tutor = await Tutor.findById(req.user._id).select('googleAuth');
    
    res.json({
      data: {
        isConnected: tutor.googleAuth?.isConnected || false,
        connectedAt: tutor.googleAuth?.connectedAt || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Google tokens if expired
 */
exports.refreshGoogleTokens = async (tutorId) => {
  try {
    const tutor = await Tutor.findById(tutorId);
    
    if (!tutor.googleAuth?.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const now = new Date();
    const expiry = new Date(tutor.googleAuth.tokenExpiry);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

    if (expiry < fiveMinutesFromNow) {
      const newTokens = await googleService.refreshAccessToken(tutor.googleAuth.refreshToken);
      
      await Tutor.findByIdAndUpdate(tutorId, {
        'googleAuth.accessToken': newTokens.access_token,
        'googleAuth.tokenExpiry': new Date(newTokens.expiry_date)
      });

      return newTokens.access_token;
    }

    return tutor.googleAuth.accessToken;
  } catch (error) {
    console.error('Error refreshing Google tokens:', error);
    throw error;
  }
};

module.exports = exports;
