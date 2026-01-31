import React, { useState } from 'react';
import Login from '../pages/Login';
import Register from '../pages/Register';
import TutorLogin from '../pages/TutorLogin';
import AdminLogin from '../pages/AdminLogin';

const AuthModal = ({ isOpen, onClose }) => {
  const [authMode, setAuthMode] = useState('student-login'); // 'student-login', 'student-register', 'tutor-login', 'admin-login'

  if (!isOpen) return null;

  const renderAuthContent = () => {
    switch(authMode) {
      case 'student-login':
        return <Login inline={true} onLoginSuccess={onClose} />;
      case 'student-register':
        return <Register inline={true} onLoginSuccess={onClose} />;
      case 'tutor-login':
        return <TutorLogin inline={true} onLoginSuccess={onClose} />;
      case 'admin-login':
        return <AdminLogin inline={true} onLoginSuccess={onClose} />;
      default:
        return <Login inline={true} onLoginSuccess={onClose} />;
    }
  };

  const getTabLabel = () => {
    switch(authMode) {
      case 'student-login':
      case 'student-register':
        return 'Student';
      case 'tutor-login':
        return 'Tutor';
      case 'admin-login':
        return 'Admin';
      default:
        return 'Student';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '450px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {/* Role Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 20px',
          gap: '24px',
        }}>
          {['Student', 'Tutor', 'Admin'].map((role) => (
            <button
              key={role}
              onClick={() => setAuthMode(role.toLowerCase() + '-login')}
              style={{
                padding: '16px 0',
                background: 'none',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                color: getTabLabel() === role ? '#3b82f6' : '#999',
                borderBottom: getTabLabel() === role ? '2px solid #3b82f6' : 'none',
                marginBottom: '-1px',
              }}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '40px 32px 32px' }}>
          {renderAuthContent()}
          
          {/* Toggle Register/Login for Student */}
          {(authMode === 'student-login' || authMode === 'student-register') && (
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              {authMode === 'student-login' ? (
                <>
                  <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px' }}>
                    Don't have an account?
                  </p>
                  <button
                    onClick={() => setAuthMode('student-register')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textDecoration: 'underline',
                    }}
                  >
                    Sign up here
                  </button>
                </>
              ) : (
                <>
                  <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px' }}>
                    Already have an account?
                  </p>
                  <button
                    onClick={() => setAuthMode('student-login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textDecoration: 'underline',
                    }}
                  >
                    Sign in here
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
