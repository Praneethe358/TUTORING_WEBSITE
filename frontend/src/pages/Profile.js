import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
  }, [user]);

  const saveProfile = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.put('/student/profile', { name, phone });
      setUser(res.data.student);
      setMessage('Profile updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/student/change-password', { oldPassword, newPassword });
      setMessage('Password changed');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Change password failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-400">Manage account</p>
            <h1 className="text-3xl font-semibold">Profile</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/student/dashboard" className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700">Back</Link>
            <button onClick={logout} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white">Logout</button>
          </div>
        </div>

        {message && <div className="text-sm text-emerald-400">{message}</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}

        <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 space-y-3">
          <h2 className="text-lg font-semibold">Basic Info</h2>
          <label className="block">
            <span className="text-sm text-slate-300">Full Name</span>
            <input className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
              value={name} onChange={e => setName(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Mobile Number</span>
            <input className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
              value={phone} onChange={e => setPhone(e.target.value)} />
          </label>
          <button
            onClick={saveProfile}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 space-y-3">
          <h2 className="text-lg font-semibold">Change Password</h2>
          <label className="block">
            <span className="text-sm text-slate-300">Current Password</span>
            <input className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
              type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">New Password</span>
            <input className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
              type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </label>
          <button
            onClick={changePassword}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
