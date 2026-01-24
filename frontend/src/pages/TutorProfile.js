import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import TutorSidebar from '../components/TutorSidebar';
import api from '../lib/api';

/**
 * TUTOR PROFILE PAGE
 * 
 * View and edit tutor profile
 * - Bio, expertise, qualifications
 * - Hourly rate
 * - Profile picture upload
 */
const TutorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
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
      <DashboardLayout sidebar={TutorSidebar}>
        <p className="text-slate-400">Loading profile...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={TutorSidebar}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-slate-400 mt-1">Manage your tutor information</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tell students about yourself..."
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Subjects (comma separated)</label>
              <input
                type="text"
                value={formData.subjects}
                onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Math, Physics, Chemistry"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Hourly Rate ($)</label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Qualifications</label>
              <textarea
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your degrees, certifications, experience..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
            <div className="space-y-4">
              <ProfileField label="Name" value={profile?.name} />
              <ProfileField label="Email" value={profile?.email} />
              <ProfileField label="Bio" value={profile?.bio || 'Not provided'} />
              <ProfileField label="Subjects" value={profile?.subjects?.join(', ') || 'None'} />
              <ProfileField label="Hourly Rate" value={profile?.hourlyRate ? `$${profile.hourlyRate}` : 'Not set'} />
              <ProfileField label="Qualifications" value={profile?.qualifications || 'Not provided'} />
              <ProfileField label="Status" value={profile?.status || 'pending'} badge />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
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
