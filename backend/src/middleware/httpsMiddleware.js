/**
 * HTTPS ENFORCEMENT MIDDLEWARE
 * Redirects all HTTP requests to HTTPS in production
 */

const enforceHTTPS = (req, res, next) => {
  // Only enforce HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    // Check if request is not secure
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      // Redirect to HTTPS
      return res.redirect(301, `https://${req.get('host')}${req.url}`);
    }
  }
  next();
};

module.exports = enforceHTTPS;
