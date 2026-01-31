/**
 * GLOBAL ERROR HANDLER
 * Centralized error handling for consistent UX patterns
 */
import React from 'react';

// Error types
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// User-friendly error messages
const ErrorMessages = {
  [ErrorTypes.NETWORK]: 'Unable to connect. Please check your internet connection and try again.',
  [ErrorTypes.AUTH]: 'Your session has expired. Please log in again.',
  [ErrorTypes.VALIDATION]: 'Please check your input and try again.',
  [ErrorTypes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorTypes.SERVER]: 'Something went wrong on our end. Please try again later.',
  [ErrorTypes.TIMEOUT]: 'The request took too long. Please try again.',
  [ErrorTypes.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

// Classify error type from axios error
export function classifyError(error) {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return ErrorTypes.TIMEOUT;
    }
    if (error.message === 'Network Error') {
      return ErrorTypes.NETWORK;
    }
    return ErrorTypes.NETWORK;
  }

  const status = error.response.status;
  
  if (status === 401 || status === 403) {
    return ErrorTypes.AUTH;
  }
  if (status === 404) {
    return ErrorTypes.NOT_FOUND;
  }
  if (status >= 400 && status < 500) {
    return ErrorTypes.VALIDATION;
  }
  if (status >= 500) {
    return ErrorTypes.SERVER;
  }
  
  return ErrorTypes.UNKNOWN;
}

// Get user-friendly error message
export function getErrorMessage(error, customMessages = {}) {
  // Custom message from server
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Classify and get friendly message
  const errorType = classifyError(error);
  
  // Use custom message if provided
  if (customMessages[errorType]) {
    return customMessages[errorType];
  }
  
  return ErrorMessages[errorType] || ErrorMessages[ErrorTypes.UNKNOWN];
}

// Format validation errors
export function formatValidationErrors(error) {
  if (!error.response?.data?.errors) {
    return null;
  }

  const errors = error.response.data.errors;
  
  // Array of error messages
  if (Array.isArray(errors)) {
    return errors.map(err => err.message || err).join(', ');
  }

  // Object with field-specific errors
  if (typeof errors === 'object') {
    return Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(', ');
  }

  return null;
}

// Check if error is retryable
export function isRetryableError(error) {
  const errorType = classifyError(error);
  return [
    ErrorTypes.NETWORK,
    ErrorTypes.TIMEOUT,
    ErrorTypes.SERVER
  ].includes(errorType);
}

// Error logging utility
export function logError(error, context = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Details');
    console.error('Error:', error);
    console.log('Context:', context);
    console.log('Type:', classifyError(error));
    console.log('Message:', getErrorMessage(error));
    console.groupEnd();
  }

  // In production, send to error tracking service
  // Example: Sentry.captureException(error, { extra: context });
}

// Global error handler hook for React components
export function useErrorHandler() {
  const [error, setError] = React.useState(null);
  const [errorType, setErrorType] = React.useState(null);

  const handleError = React.useCallback((err, context = {}) => {
    logError(err, context);
    setErrorType(classifyError(err));
    setError(getErrorMessage(err));
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  const retryable = errorType ? isRetryableError({ response: { status: 0 } }) : false;

  return { error, errorType, handleError, clearError, retryable };
}

// Error boundary fallback component
export function ErrorFallback({ error, resetError }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-slate-400 mb-6">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left mb-4 bg-slate-900 p-4 rounded-lg">
              <summary className="text-sm text-slate-300 cursor-pointer mb-2">
                Error details (dev mode)
              </summary>
              <pre className="text-xs text-red-400 overflow-auto">
                {error.toString()}
              </pre>
            </details>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={resetError}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast notification for errors
export function showErrorToast(error, customMessages = {}) {
  const message = getErrorMessage(error, customMessages);
  
  // If you have a toast library (react-toastify, react-hot-toast, etc.)
  // toast.error(message);
  
  // Fallback: console error
  console.error('Error:', message);
  
  return message;
}

// Retry mechanism for failed requests
export async function retryRequest(requestFn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}

const errorHandler = {
  ErrorTypes,
  classifyError,
  getErrorMessage,
  formatValidationErrors,
  isRetryableError,
  logError,
  useErrorHandler,
  ErrorFallback,
  showErrorToast,
  retryRequest
};

export default errorHandler;
