import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import FormInput from '../components/FormInput';

const TutorRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', qualifications: '', subjects: '', experienceYears: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/tutor/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        qualifications: form.qualifications,
        subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean),
        experienceYears: Number(form.experienceYears)
      });
      setMessage('Registered. Await admin approval to login.');
      setTimeout(() => navigate('/tutor/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold text-center mb-6">Tutor Sign Up</h1>
      {message && <div className="mb-4 text-sm text-emerald-400">{message}</div>}
      {error && <div className="mb-4 text-sm text-red-400">{error}</div>}
      <FormInput label="Full Name" name="name" value={form.name} onChange={onChange} required placeholder="Jane Doe" />
      <FormInput label="Email" name="email" type="email" value={form.email} onChange={onChange} required placeholder="tutor@example.com" />
      <FormInput label="Phone" name="phone" value={form.phone} onChange={onChange} required placeholder="1234567890" />
      <FormInput label="Qualifications" name="qualifications" value={form.qualifications} onChange={onChange} required placeholder="M.Sc. Mathematics" />
      <FormInput label="Subjects (comma separated)" name="subjects" value={form.subjects} onChange={onChange} required placeholder="Math, Physics" />
      <FormInput label="Years of Experience" name="experienceYears" type="number" value={form.experienceYears} onChange={onChange} required placeholder="3" />
      <FormInput label="Password" name="password" type="password" value={form.password} onChange={onChange} required placeholder="••••••••" />
      <FormInput label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={onChange} required placeholder="••••••••" />
      <button type="submit" disabled={loading} className="w-full py-3 mt-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-60">
        {loading ? 'Submitting...' : 'Register'}
      </button>
      <p className="text-sm text-slate-400 mt-4 text-center">
        Already approved? <Link className="text-indigo-400" to="/tutor/login">Log in</Link>
      </p>
    </form>
  );
};

export default TutorRegister;
