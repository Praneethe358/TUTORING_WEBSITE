import React, { useState } from 'react';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import { CourseraInput, CourseraButton, CourseraAlert } from '../components/CourseraCard';
import { colors, typography, spacing } from '../theme/designSystem';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/student/forgot-password', { email });
      setMessage(res.data.message || 'If the email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
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
        Forgot Password
      </h1>
      {message && <CourseraAlert type="success">{message}</CourseraAlert>}
      {error && <CourseraAlert type="error" onClose={() => setError('')}>{error}</CourseraAlert>}
      <CourseraInput label="Email" type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="student@example.com" />
      <CourseraButton
        type="submit"
        disabled={loading}
        fullWidth={true}
        style={{ marginTop: spacing.md }}
      >
        {loading ? 'Sending...' : 'Send reset link'}
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

export default ForgotPassword;
