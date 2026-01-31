import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { CourseraAlert } from '../components/CourseraCard';
import { colors, typography, spacing } from '../theme/designSystem';

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await api.get(`/email-verification/verify?token=${token}`);
        setMessage(res.data.message);
        
        // Redirect after 3 seconds
        setTimeout(() => {
          if (res.data.userType === 'student') {
            navigate('/student/dashboard');
          } else if (res.data.userType === 'tutor') {
            navigate('/tutor/dashboard');
          } else {
            navigate('/login');
          }
        }, 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Email verification failed');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setError('No verification token provided');
      setLoading(false);
    }
  }, [token, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
      padding: spacing.lg
    }}>
      <div style={{
        background: colors.white,
        padding: spacing['2xl'],
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          marginBottom: spacing.xl,
          color: colors.textPrimary
        }}>
          Email Verification
        </h1>

        {loading && (
          <div>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f4f6',
              borderTop: `4px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ color: colors.textSecondary }}>Verifying your email...</p>
          </div>
        )}

        {message && !loading && (
          <div>
            <div style={{
              fontSize: '60px',
              marginBottom: spacing.lg
            }}>✅</div>
            <CourseraAlert type="success">{message}</CourseraAlert>
            <p style={{
              color: colors.textSecondary,
              fontSize: typography.fontSize.sm,
              marginTop: spacing.lg
            }}>
              Redirecting to your dashboard...
            </p>
          </div>
        )}

        {error && !loading && (
          <div>
            <div style={{
              fontSize: '60px',
              marginBottom: spacing.lg
            }}>❌</div>
            <CourseraAlert type="error">{error}</CourseraAlert>
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.textSecondary,
              marginTop: spacing.xl
            }}>
              <Link to="/login" style={{ color: colors.accent, textDecoration: 'none' }}>
                Return to Login
              </Link>
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;
