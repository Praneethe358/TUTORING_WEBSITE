import React, { useState } from 'react';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import FormInput from '../components/FormInput';

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
      <h1 className="text-2xl font-semibold text-center mb-6">Forgot Password</h1>
      {message && <div className="mb-4 text-sm text-emerald-400">{message}</div>}
      {error && <div className="mb-4 text-sm text-red-400">{error}</div>}
      <FormInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="student@example.com" />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-60"
      >
        {loading ? 'Sending...' : 'Send reset link'}
      </button>
      <p className="text-sm text-slate-400 mt-4 text-center">
        Back to <Link className="text-indigo-400" to="/login">Login</Link>
      </p>
    </form>
  );
};

export default ForgotPassword;
