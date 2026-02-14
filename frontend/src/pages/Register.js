import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Helmet } from 'react-helmet-async';
import { CourseraInput, CourseraButton, CourseraAlert } from '../components/CourseraCard';
import { colors, typography, spacing, borderRadius } from '../theme/designSystem';

const Register = ({ inline = false, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', contactEmail: '', course: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill form from sessionStorage if booking data exists
  useEffect(() => {
    const bookingData = sessionStorage.getItem('bookingData');
    if (bookingData) {
      try {
        const data = JSON.parse(bookingData);
        setForm(prev => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
        }));
        // Clear the booking data after using it
        sessionStorage.removeItem('bookingData');
      } catch (err) {
        console.error('Error parsing booking data:', err);
      }
    }
  }, []);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
            if (onLoginSuccess) {
              onLoginSuccess();
            }
      await api.post('/student/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        contactEmail: form.contactEmail || '', // Optional real email for notifications
        course: form.course,
        password: form.password
      });
      navigate('/student/dashboard');
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setError(errorData.errors.map(e => e.msg).join(', '));
      } else {
        setError(errorData?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Student Registration - HOPE Online Tuitions</title>
        <meta name="description" content="Create your HOPE Online Tuitions student account. Join thousands of students learning from expert tutors for Classes 6-12." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <form onSubmit={handleSubmit}>
      {!inline && (
        <h1 style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.semibold,
          textAlign: 'center',
          marginBottom: spacing.xl,
          color: colors.textPrimary,
        }}>
          Student Sign Up
        </h1>
      )}
      {error && <CourseraAlert type="error" onClose={() => setError('')}>{error}</CourseraAlert>}
      <CourseraInput label="Full Name" name="name" value={form.name} onChange={onChange} required placeholder="John Doe" />
      <CourseraInput 
        label="Username (Login ID)" 
        name="email" 
        type="email" 
        value={form.email} 
        onChange={onChange} 
        required 
        placeholder="username@gmail.com" 
        helperText="This will be your login username (e.g., john@gmail.com)"
      />
      <CourseraInput 
        label="Contact Email (Optional)" 
        name="contactEmail" 
        type="email" 
        value={form.contactEmail} 
        onChange={onChange} 
        placeholder="your.real.email@gmail.com" 
        helperText="Provide your actual email to receive password reset links and notifications"
      />
      <CourseraInput label="Mobile Number" name="phone" value={form.phone} onChange={onChange} required placeholder="1234567890" />
      <CourseraInput label="Course" name="course" value={form.course} onChange={onChange} required placeholder="e.g., Mathematics, Science, English" />
      {!inline && (
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
      )}
      <CourseraInput label="Password" name="password" type="password" value={form.password} onChange={onChange} required placeholder="••••••••" />
      <CourseraInput label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={onChange} required placeholder="••••••••" />
      <CourseraButton
        type="submit"
        disabled={loading}
        fullWidth={true}
        style={{ marginTop: spacing.md }}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </CourseraButton>
      {!inline && (
        <p style={{
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
          marginTop: spacing.lg,
          textAlign: 'center',
        }}>
          Already have an account? <Link to="/login" style={{ color: colors.accent, textDecoration: 'none', fontWeight: typography.fontWeight.semibold }}>Log in</Link>
        </p>
      )}
    </form>
    </>
  );
};

export default Register;
