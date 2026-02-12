import React, { useState } from 'react';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import { CourseraInput, CourseraButton, CourseraAlert } from '../components/CourseraCard';
import { colors, typography, spacing } from '../theme/designSystem';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/student/forgot-password', { email, reason });
      setMessage(res.data.message || 'Password reset request submitted successfully!');
      setSubmitted(true);
      setEmail('');
      setReason('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit password reset request');
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
      
      {!submitted && (
        <div style={{
          marginBottom: spacing.lg,
          padding: spacing.lg,
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
          backgroundColor: colors.bgSecondary,
          borderRadius: '0.5rem',
          border: `1px solid ${colors.gray200}`,
        }}>
          <p style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing.sm, color: colors.textPrimary }}>
            Password Reset Process:
          </p>
          <ul style={{ paddingLeft: spacing.xl, listStyleType: 'disc', margin: 0 }}>
            <li style={{ marginBottom: spacing.xs }}>Submit your email address and reason for password reset</li>
            <li style={{ marginBottom: spacing.xs }}>Our admin team will review your request</li>
            <li style={{ marginBottom: spacing.xs }}>Upon approval, you'll receive a reset link via email</li>
            <li>Use the link to create a new password</li>
          </ul>
        </div>
      )}
      
      {message && <CourseraAlert type="success">{message}</CourseraAlert>}
      {error && <CourseraAlert type="error" onClose={() => setError('')}>{error}</CourseraAlert>}
      
      {!submitted ? (
        <>
          <CourseraInput 
            label="Email Address" 
            type="email" 
            name="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            placeholder="student@example.com" 
          />
          <CourseraInput 
            label="Reason for Reset (Optional)" 
            name="reason" 
            value={reason} 
            onChange={e => setReason(e.target.value)} 
            placeholder="e.g., Forgot password, Security concern"
          />
          <CourseraButton
            type="submit"
            disabled={loading}
            fullWidth={true}
            style={{ marginTop: spacing.md }}
          >
            {loading ? 'Submitting...' : 'Submit Reset Request'}
          </CourseraButton>
        </>
      ) : (
        <div style={{
          padding: spacing.lg,
          textAlign: 'center',
          backgroundColor: '#ecfdf5',
          borderRadius: '0.5rem',
          border: `1px solid #d1fae5`,
        }}>
          <p style={{ color: '#047857', fontWeight: '600', marginBottom: spacing.sm }}>
            ✓ Request Submitted
          </p>
          <p style={{ color: '#6b7280', fontSize: typography.fontSize.sm }}>
            Your password reset request has been submitted. The admin team will review it shortly and send you a reset link via email if approved.
          </p>
          <p style={{ color: '#9ca3af', fontSize: typography.fontSize.xs, marginTop: spacing.md }}>
            Check your email for updates. This process typically takes 1-2 business days.
          </p>
        </div>
      )}
      
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
