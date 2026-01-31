import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [fatherName, setFatherName] = useState(user?.fatherName || '');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
  const [school, setSchool] = useState(user?.school || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setFatherName(user?.fatherName || '');
    setBloodGroup(user?.bloodGroup || '');
    setSchool(user?.school || '');
  }, [user]);

  const saveProfile = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.put('/student/profile', { name, phone, fatherName, bloodGroup, school });
      setUser(res.data.student);
      setMessage('Profile updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Manage account</p>
          <h1 className="text-3xl font-bold text-black">My Profile</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/student/dashboard" className="px-4 py-2 rounded-lg bg-gray-200 border border-gray-300 hover:bg-gray-100 text-black">Back</Link>
          <button onClick={logout} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white">Logout</button>
        </div>
      </div>

      {message && <div className="text-sm text-green-600 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">{message}</div>}
      {error && <div className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Picture & Member Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-black mb-4">Profile Picture</h2>
            <div className="flex flex-col items-center gap-4">
              {user?.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-indigo-500">
                  <span className="text-4xl font-bold text-white">{user?.name?.[0]?.toUpperCase() || 'S'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Member Since */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-4">Membership Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Member Since</span>
                <span className="text-black font-medium">Jan 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Status</span>
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Login</span>
                <span className="text-black font-medium">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-black">Personal Information</h2>
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">Full Name</span>
              <input 
                className="mt-2 w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Enter your full name"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">Email Address</span>
              <input 
                className="mt-2 w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-600 cursor-not-allowed"
                value={user?.email || ''}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </label>
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">Mobile Number</span>
              <input 
                className="mt-2 w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">Father's Name</span>
              <input 
                className="mt-2 w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={fatherName} 
                onChange={e => setFatherName(e.target.value)}
                placeholder="Enter father's name"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">Blood Group</span>
              <select 
                className="mt-2 w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-black focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={bloodGroup} 
                onChange={e => setBloodGroup(e.target.value)}
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-gray-700 font-medium">School/College</span>
              <input 
                className="mt-2 w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={school} 
                onChange={e => setSchool(e.target.value)}
                placeholder="Enter your school or college name"
              />
            </label>
            <button
              onClick={saveProfile}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-60 transition"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default Profile;
