import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { CourseraInput, CourseraButton, CourseraAlert } from '../components/CourseraCard';
import { colors, typography, spacing } from '../theme/designSystem';

const AdminLogin = ({ inline = false, onLoginSuccess }) => {
  const navigate = useNavigate();
  const { adminLogin } = useAdmin();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(form.email, form.password);
            if (onLoginSuccess) {
              onLoginSuccess();
            }
      navigate('/admin/dashboard');
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
          Admin Login
        </h1>
      )}
      {error && <CourseraAlert type="error" onClose={() => setError('')}>{error}</CourseraAlert>}
      <CourseraInput label="Email" name="email" type="email" value={form.email} onChange={onChange} required placeholder="admin@example.com" />
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
            <span style={{ color: 'transparent', userSelect: 'none' }}>.</span>
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.textTertiary,
            marginTop: spacing.md,
            textAlign: 'center',
          }}>
            Student? <Link to="/login" style={{ color: colors.accent, textDecoration: 'none' }}>Go to student login</Link> | Tutor? <Link to="/tutor/login" style={{ color: colors.accent, textDecoration: 'none' }}>Go to tutor login</Link>
          </div>
        </>
      )}
    </form>
  );
};

export default AdminLogin;
