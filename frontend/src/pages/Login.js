import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';

const Login = () => {
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
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold text-center mb-6">Student Login</h1>
      {error && <div className="mb-4 p-3 text-sm text-red-400 bg-red-900 bg-opacity-20 rounded">{error}</div>}
      <FormInput label="Email" name="email" type="email" value={form.email} onChange={onChange} required placeholder="student@example.com" />
      <FormInput label="Password" name="password" type="password" value={form.password} onChange={onChange} required placeholder="••••••••" />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-60"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      <div className="text-sm text-slate-400 mt-4 flex justify-between">
        <Link className="text-indigo-400" to="/forgot-password">Forgot password?</Link>
        <Link className="text-indigo-400" to="/register">Create account</Link>
      </div>
      <div className="text-xs text-slate-400 mt-3 text-center">
        Tutor? <Link className="text-indigo-400" to="/tutor/login">Go to tutor login</Link> | Admin? <Link className="text-indigo-400" to="/admin/login">Go to admin login</Link>
      </div>
    </form>
  );
};

export default Login;
