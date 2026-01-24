import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import FormInput from '../components/FormInput';

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
      <h1 className="text-2xl font-semibold text-center mb-6">Reset Password</h1>
      {message && <div className="mb-4 text-sm text-emerald-400">{message}</div>}
      {error && <div className="mb-4 text-sm text-red-400">{error}</div>}
      <FormInput label="New Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
      <FormInput label="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="••••••••" />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-60"
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
      <p className="text-sm text-slate-400 mt-4 text-center">
        Back to <Link className="text-indigo-400" to="/login">Login</Link>
      </p>
    </form>
  );
};

export default ResetPassword;
