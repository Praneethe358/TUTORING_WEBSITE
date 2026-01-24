import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import FormInput from '../components/FormInput';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      await api.post('/student/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
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
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold text-center mb-6">Student Sign Up</h1>
      {error && <div className="mb-4 p-3 text-sm text-red-400 bg-red-900 bg-opacity-20 rounded">{error}</div>}
      <FormInput label="Full Name" name="name" value={form.name} onChange={onChange} required placeholder="John Doe" />
      <FormInput label="Email" name="email" type="email" value={form.email} onChange={onChange} required placeholder="student@example.com" />
      <FormInput label="Mobile Number" name="phone" value={form.phone} onChange={onChange} required placeholder="1234567890" />
      <div className="mb-4 p-3 text-xs text-slate-300 bg-slate-800 rounded">
        <p className="font-semibold mb-2">Password requirements:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>At least 8 characters</li>
          <li>At least 1 uppercase letter (A-Z)</li>
          <li>At least 1 lowercase letter (a-z)</li>
          <li>At least 1 number (0-9)</li>
        </ul>
      </div>
      <FormInput label="Password" name="password" type="password" value={form.password} onChange={onChange} required placeholder="••••••••" />
      <FormInput label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={onChange} required placeholder="••••••••" />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-60"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
      <p className="text-sm text-slate-400 mt-4 text-center">
        Already have an account? <Link className="text-indigo-400" to="/login">Log in</Link>
      </p>
    </form>
  );
};

export default Register;
