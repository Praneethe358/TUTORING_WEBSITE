import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { CourseraInput, CourseraButton, CourseraAlert } from '../components/CourseraCard';
import { colors, typography, spacing, borderRadius } from '../theme/designSystem';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('No reset token found. Please use the link from the email.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/student/reset-password', { token, password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 style={{
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.semibold,
        textAlign: 'center',
        marginBottom: spacing.xl,
        color: colors.textPrimary,
      }}>
        Reset Password
      </h1>
      {message && <CourseraAlert type="success">{message}</CourseraAlert>}
      {error && <CourseraAlert type="error" onClose={() => setError('')}>{error}</CourseraAlert>}
      
      {!token && (
        <CourseraAlert type="error">
          No reset token provided. Please click the link from the email sent after your reset request was approved.
        </CourseraAlert>
      )}
      
      <div style={{
        marginBottom: spacing.lg,
        padding: spacing.lg,
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        backgroundColor: colors.bgSecondary,
        borderRadius: borderRadius.md,
        border: `1px solid ${colors.gray200}`,
      }}>
        <p style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing.sm, color: colors.textPrimary }}>
          Password requirements:
        </p>
        <ul style={{ paddingLeft: spacing.xl, listStyleType: 'disc' }}>
          <li style={{ marginBottom: spacing.xs }}>At least 8 characters</li>
          <li style={{ marginBottom: spacing.xs }}>At least 1 uppercase letter (A-Z)</li>
          <li style={{ marginBottom: spacing.xs }}>At least 1 lowercase letter (a-z)</li>
          <li style={{ marginBottom: spacing.xs }}>At least 1 number (0-9)</li>
        </ul>
      </div>
      
      <CourseraInput 
        label="New Password" 
        type="password" 
        name="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        required 
        disabled={!token}
        placeholder="••••••••" 
      />
      <CourseraInput 
        label="Confirm Password" 
        type="password" 
        name="confirm" 
        value={confirm} 
        onChange={e => setConfirm(e.target.value)} 
        required 
        disabled={!token}
        placeholder="••••••••" 
      />
      <CourseraButton
        type="submit"
        disabled={loading || !token}
        fullWidth={true}
        style={{ marginTop: spacing.md }}
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </CourseraButton>
      <p style={{
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.lg,
        textAlign: 'center',
      }}>
        Back to <Link to="/login" style={{ color: colors.accent, textDecoration: 'none', fontWeight: typography.fontWeight.semibold }}>Login</Link>
      </p>
    </form>
  );
};

export default ResetPassword;
