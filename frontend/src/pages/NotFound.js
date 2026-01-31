import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { Button } from '../components/ModernComponents';

/**
 * NOT FOUND PAGE (404)
 * Professional error page with role-aware navigation
 */
const NotFound = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const handleGoHome = () => {
    if (!user) {
      navigate('/');
    } else if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'tutor') {
      navigate('/tutor/dashboard');
    } else if (role === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size={120} withText={false} />
        </div>

        {/* Error Code */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent -mt-16 mb-4">
            Oops!
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-500">
            Please check the URL or return to your dashboard.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleGoHome}
            variant="primary"
            className="px-8 py-3 text-lg"
          >
            {user ? 'Go to Dashboard' : 'Go to Home'}
          </Button>
          
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            className="px-8 py-3 text-lg"
          >
            Go Back
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-4">
            Need help? Contact support or check these common pages:
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            {!user && (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Student Login
                </button>
                <button
                  onClick={() => navigate('/tutor/login')}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Tutor Login
                </button>
                <button
                  onClick={() => navigate('/tutors')}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Browse Tutors
                </button>
              </>
            )}
            {role === 'student' && (
              <>
                <button
                  onClick={() => navigate('/student/classes')}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  My Classes
                </button>
                <button
                  onClick={() => navigate('/student/lms/catalog')}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Course Catalog
                </button>
              </>
            )}
            {role === 'tutor' && (
              <>
                <button
                  onClick={() => navigate('/tutor/classes')}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  My Classes
                </button>
                <button
                  onClick={() => navigate('/tutor/lms/courses')}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  My Courses
                </button>
              </>
            )}
            {role === 'admin' && (
              <>
                <button
                  onClick={() => navigate('/admin/students')}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Students
                </button>
                <button
                  onClick={() => navigate('/admin/tutors')}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Tutors
                </button>
                <button
                  onClick={() => navigate('/admin/analytics')}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Analytics
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
