const rateLimit = require('express-rate-limit');

/**
 * RATE LIMITING MIDDLEWARE
 * Protects against brute force attacks and API abuse
 */

// Strict rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count successful logins too
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many login attempts. Please try again after 15 minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime.getTime() / 1000)
    });
  }
});

// Moderate rate limit for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: 'Too many accounts created. Please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many accounts created from this IP. Please try again after an hour.'
    });
  }
});

// Password reset rate limit
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour
  message: 'Too many password reset attempts. Please try again after an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many password reset attempts. Please try again after an hour.'
    });
  }
});

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for whitelisted IPs (e.g., localhost in dev)
    const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
    return whitelist.includes(req.ip);
  }
});

module.exports = {
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  apiLimiter
};
