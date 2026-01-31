/**
 * PRODUCTION-SAFE LOGGER
 * Suppresses console.error in production, logs to file/service instead
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = {
  error: (message, error) => {
    if (isDevelopment) {
      console.error(message, error);
    } else {
      // In production: log to file or external service (Sentry, DataDog, etc.)
      // For now, silent in production to avoid exposing errors to users
      // TODO: Integrate with proper logging service
    }
  },
  
  warn: (message, data) => {
    if (isDevelopment) {
      console.warn(message, data);
    }
  },
  
  info: (message, data) => {
    if (isDevelopment) {
      console.log(message, data);
    }
  },
  
  debug: (message, data) => {
    if (isDevelopment) {
      console.debug(message, data);
    }
  }
};

export default logger;
