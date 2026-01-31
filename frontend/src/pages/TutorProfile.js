import React, { useEffect, useState } from 'react';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import api from '../lib/api';

const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace('/api', '');

/**
 * TUTOR PROFILE PAGE
 * 
 * View and edit tutor profile
 * - Bio, expertise, qualifications
 * - Hourly rate
 * - Profile picture upload
 * - Performance statistics
 * - Earnings and student info
 */
const TutorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 18,
    totalSessions: 64,
    rating: 4.8,
    reviews: 12,
    earnings: 3240
  });
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    subjects: '',
    hourlyRate: '',
    qualifications: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/tutor/profile');
      setProfile(res.data.tutor);
      setFormData({
        name: res.data.tutor.name || '',
        bio: res.data.tutor.bio || '',
        subjects: res.data.tutor.subjects?.join(', ') || '',
        hourlyRate: res.data.tutor.hourlyRate || '',
        qualifications: res.data.tutor.qualifications || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveAvatar = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${apiBase}${url}`;
  };

  const handlePhotoUpdate = (newPhotoUrl) => {
    const resolved = resolveAvatar(newPhotoUrl);
    setProfile({ ...profile, avatar: resolved });
    fetchProfile();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/tutor/profile', {
        ...formData,
        subjects: formData.subjects.split(',').map(s => s.trim())
      });
      alert('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <p className="text-slate-400">Loading profile...</p>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">My Profile</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Manage your professional information</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition min-h-[44px]"
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700 space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Profile Photo</h2>
            <ProfilePhotoUpload 
              currentPhoto={profile?.avatar} 
              onPhotoUpdate={handlePhotoUpdate}
              userType="tutor"
            />
          </div>
          
          <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700 space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Professional Information</h2>
            <div>
              <label className="block text-sm text-slate-300 font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                required
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 font-medium mb-2">Professional Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Write about your teaching experience, teaching style, and background..."
              />
              <p className="text-xs text-slate-500 mt-1">This will be shown to students on your profile</p>
            </div>

            <div>
              <label className="block text-sm text-slate-300 font-medium mb-2">Subjects You Teach (comma separated) *</label>
              <input
                type="text"
                value={formData.subjects}
                onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                className="w-full px-4 py-3 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                placeholder="e.g., Mathematics, Physics, Chemistry, English"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 font-medium mb-2">Hourly Rate ($) *</label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                className="w-full px-4 py-3 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                min="0"
                step="0.01"
                placeholder="Enter your hourly rate"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 font-medium mb-2">Qualifications & Certifications</label>
              <textarea
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="List your degrees, certifications, and professional experience..."
              />
              <p className="text-xs text-slate-500 mt-1">Include university degrees, professional certifications, and relevant experience</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition min-h-[44px]"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="w-full sm:w-auto px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Profile Picture & Header */}
          <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="relative">
                {resolveAvatar(profile?.avatar) ? (
                  <img 
                    src={resolveAvatar(profile.avatar)} 
                    alt="Profile" 
                    className="w-28 h-28 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-indigo-500">
                    <span className="text-4xl sm:text-6xl font-bold text-white">
                      {profile?.name?.[0]?.toUpperCase() || 'T'}
                    </span>
                  </div>
                )}
                {profile?.status === 'approved' && (
                  <div className="absolute bottom-0 right-0 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    ✓ Approved
                  </div>
                )}
              </div>
              <div className="flex-1 sm:pt-4">
                <h2 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{profile?.name}</h2>
                <p className="text-slate-400 text-sm sm:text-lg mb-3 sm:mb-4 break-all">{profile?.email}</p>
                {profile?.subjects && profile.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.subjects.map((subject, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 sm:px-4 sm:py-2 bg-indigo-600/20 text-indigo-300 rounded-full text-xs sm:text-sm font-medium border border-indigo-500"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profile?.bio && (
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">About Me</h3>
              <p className="text-slate-300 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Qualifications Section */}
          {profile?.qualifications && (
            <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Qualifications & Certifications</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{profile.qualifications}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Account Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <p className="text-slate-400 text-sm">Account Status</p>
                <p className="text-white font-medium mt-1 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${profile?.status === 'approved' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                  {profile?.status?.charAt(0).toUpperCase() + profile?.status?.slice(1) || 'Pending'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Member Since</p>
                <p className="text-white font-medium mt-1">Jan 2024</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileField = ({ label, value, badge }) => (
  <div>
    <label className="text-sm text-slate-400">{label}</label>
    {badge ? (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
        value === 'approved' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
      }`}>
        {value}
      </span>
    ) : (
      <p className="text-white font-medium">{value}</p>
    )}
  </div>
);

export default TutorProfile;
