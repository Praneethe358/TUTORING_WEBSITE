/**
 * ERROR HANDLING EXAMPLE - STUDENT DASHBOARD
 * Demonstrates global error handling patterns
 */

import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { useErrorHandler, ErrorFallback, retryRequest } from '../utils/errorHandler';
import { ErrorBoundary } from 'react-error-boundary';

const ExampleStudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { error, handleError, clearError, retryable } = useErrorHandler();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    clearError();
    
    try {
      // Use retry mechanism for retryable errors
      const response = await retryRequest(
        () => api.get('/student/dashboard'),
        3, // max retries
        1000 // initial delay
      );
      
      setData(response.data);
    } catch (err) {
      handleError(err, { context: 'Fetching dashboard data' });
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">Unable to Load Dashboard</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            
            <div className="flex gap-3">
              {retryable && (
                <button
                  onClick={fetchDashboardData}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => window.location.href = '/student'}
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

  // Success state
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Student Dashboard</h1>
      {/* Render dashboard data */}
      <pre className="text-slate-300">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

// Wrap component with error boundary
const StudentDashboardWithErrorBoundary = () => (
  <ErrorBoundary 
    FallbackComponent={ErrorFallback}
    onReset={() => window.location.reload()}
  >
    <ExampleStudentDashboard />
  </ErrorBoundary>
);

export default StudentDashboardWithErrorBoundary;

/**
 * USAGE EXAMPLES:
 * 
 * 1. Simple error handling with hook:
 * ```javascript
 * const { error, handleError, clearError } = useErrorHandler();
 * 
 * try {
 *   await api.post('/endpoint', data);
 * } catch (err) {
 *   handleError(err);
 * }
 * ```
 * 
 * 2. Custom error messages:
 * ```javascript
 * import { getErrorMessage, ErrorTypes } from '../utils/errorHandler';
 * 
 * try {
 *   await api.post('/endpoint', data);
 * } catch (err) {
 *   const message = getErrorMessage(err, {
 *     [ErrorTypes.VALIDATION]: 'Please fill all required fields',
 *     [ErrorTypes.AUTH]: 'Session expired. Please log in.'
 *   });
 *   setError(message);
 * }
 * ```
 * 
 * 3. Retry failed requests:
 * ```javascript
 * import { retryRequest } from '../utils/errorHandler';
 * 
 * const data = await retryRequest(
 *   () => api.get('/endpoint'),
 *   3, // max retries
 *   1000 // delay
 * );
 * ```
 * 
 * 4. Error boundary:
 * ```javascript
 * import { ErrorBoundary } from 'react-error-boundary';
 * import { ErrorFallback } from '../utils/errorHandler';
 * 
 * <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
