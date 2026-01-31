import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { CourseraInput, CourseraButton, CourseraAlert } from '../components/CourseraCard';
import { colors, typography, spacing } from '../theme/designSystem';

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
      setError('Missing token');
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
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
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
      <CourseraInput label="New Password" type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
      <CourseraInput label="Confirm Password" type="password" name="confirm" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="••••••••" />
      <CourseraButton
        type="submit"
        disabled={loading}
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
