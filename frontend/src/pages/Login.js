import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CourseraInput, CourseraButton, CourseraAlert } from '../components/CourseraCard';
import { colors, typography, spacing } from '../theme/designSystem';

const Login = ({ inline = false, onLoginSuccess }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
            if (onLoginSuccess) {
              onLoginSuccess();
            }
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!inline && (
        <h1 style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.semibold,
          textAlign: 'center',
          marginBottom: spacing.xl,
          color: colors.textPrimary,
        }}>
          Student Login
        </h1>
      )}
      {error && <CourseraAlert type="error" onClose={() => setError('')}>{error}</CourseraAlert>}
      <CourseraInput label="Email" name="email" type="email" value={form.email} onChange={onChange} required placeholder="student@example.com" />
      <CourseraInput label="Password" name="password" type="password" value={form.password} onChange={onChange} required placeholder="••••••••" />
      <CourseraButton
        type="submit"
        disabled={loading}
        fullWidth={true}
        style={{ marginTop: spacing.md }}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </CourseraButton>
      {!inline && (
        <>
          <div style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
            marginTop: spacing.lg,
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <Link to="/forgot-password" style={{ color: colors.accent, textDecoration: 'none' }}>Forgot password?</Link>
            <Link to="/register" style={{ color: colors.accent, textDecoration: 'none' }}>Create account</Link>
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.textTertiary,
            marginTop: spacing.md,
            textAlign: 'center',
          }}>
            Tutor? <Link to="/tutor/login" style={{ color: colors.accent, textDecoration: 'none' }}>Go to tutor login</Link> | Admin? <Link to="/admin/login" style={{ color: colors.accent, textDecoration: 'none' }}>Go to admin login</Link>
          </div>
        </>
      )}
    </form>
  );
};

export default Login;
