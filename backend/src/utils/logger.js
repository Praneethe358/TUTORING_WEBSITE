/**
 * PRODUCTION-SAFE LOGGER
 * Replaces console.log/error/warn with environment-aware logging
 * In production, logs are suppressed or sent to proper logging service
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
  // Development: Full console logging
  // Production: Silent or log to service (e.g., Winston, Sentry)
  
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
    // In production, send to logging service:
    // logger.service.log(...args);
  },

  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // Always log errors even in production (to error tracking service)
      console.error(...args);
      // logger.service.error(...args);
    }
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
    // In production, send to logging service:
    // logger.service.warn(...args);
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

module.exports = logger;
