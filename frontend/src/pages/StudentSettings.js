import React, { useEffect, useState } from 'react';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

/**
 * STUDENT SETTINGS PAGE
 * 
 * Manage account settings
 * - Email notifications
 * - Privacy settings
 * - Change password
 * - Account preferences
 */
const StudentSettings = () => {
  const { user, setUser } = useAuth();
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    classReminders: true,
    assignmentReminders: true,
    quizReminders: true,
    gradeNotifications: true,
    marketingEmails: false,
    weeklyReports: true
  });
  
  const [preferences] = useState({
    language: 'English',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [message, setMessage] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleSaveSettings = async () => {
    try {
      setSaveLoading(true);
      setMessage('');
      // Save settings to localStorage (UI preferences only)
      localStorage.setItem('studentSettings', JSON.stringify(settings));
      localStorage.setItem('studentPreferences', JSON.stringify(preferences));
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save settings');
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('New passwords do not match');
        return;
      }
      if (passwordForm.newPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
      await api.post('/student/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      alert('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change password');
    }
  };

  useEffect(() => {
    setAvatar(user?.avatar || null);
  }, [user]);

  const handlePhotoUpdate = (newPhotoUrl) => {
    setAvatar(newPhotoUrl);
    setUser(prev => prev ? { ...prev, avatar: newPhotoUrl } : prev);
  };

  return (
    <StudentDashboardLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      {message && (
        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg ${
          message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Profile Picture */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-black mb-6">📸 Profile Picture</h2>
          
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              {avatar ? (
                <img
                  src={avatar.startsWith('http') ? avatar : `http://localhost:5000${avatar}`}
                  alt="Profile"
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-indigo-500 shadow-lg">
                  <span className="text-4xl sm:text-5xl font-bold text-white">
                    {user?.name?.[0]?.toUpperCase() || 'S'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-black font-semibold text-lg sm:text-xl">{user?.name}</p>
              <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
            </div>

            <ProfilePhotoUpload
              currentPhoto={avatar}
              onPhotoUpdate={handlePhotoUpdate}
              userType="student"
            />
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-black mb-4">👤 Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Name</label>
              <p className="text-black font-medium">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="text-black font-medium break-all">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-black mb-4">🔔 Notification Preferences</h2>
          <div className="space-y-4">
            <SettingToggle
              label="Email Notifications"
              description="Receive updates via email"
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
            />
            <SettingToggle
              label="Assignment Reminders"
              description="Get notified about due assignments"
              checked={settings.assignmentReminders}
              onChange={() => handleToggle('assignmentReminders')}
            />
            <SettingToggle
              label="Quiz Reminders"
              description="Get reminded before upcoming quizzes"
              checked={settings.quizReminders}
              onChange={() => handleToggle('quizReminders')}
            />
            <SettingToggle
              label="Grade Notifications"
              description="Receive updates when grades are posted"
              checked={settings.gradeNotifications}
              onChange={() => handleToggle('gradeNotifications')}
            />
            <SettingToggle
              label="Class Reminders"
              description="Get reminded before your classes"
              checked={settings.classReminders}
              onChange={() => handleToggle('classReminders')}
            />
            <SettingToggle
              label="Weekly Reports"
              description="Receive weekly progress summaries"
              checked={settings.weeklyReports}
              onChange={() => handleToggle('weeklyReports')}
            />
          </div>
          <div className="mt-6">
            <button
              onClick={handleSaveSettings}
              disabled={saveLoading}
              className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition disabled:opacity-50 min-h-[44px]"
            >
              {saveLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-black mb-4">🔒 Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-4 py-3 sm:py-2 bg-white border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-3 sm:py-2 bg-white border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 sm:py-2 bg-white border border-gray-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition min-h-[44px]"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

// Reusable Toggle Component
const SettingToggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-4 sm:py-3 border-b border-gray-100 last:border-0 gap-4">
    <div className="flex-1 min-w-0">
      <p className="text-black font-medium text-sm sm:text-base">{label}</p>
      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange();
      }}
      className={`relative inline-flex h-8 w-14 sm:h-7 sm:w-12 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex-shrink-0 ${
        checked 
          ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md' 
          : 'bg-gray-300 hover:bg-gray-400'
      }`}
    >
      <span
        className={`inline-block h-6 w-6 sm:h-5 sm:w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          checked ? 'translate-x-7 sm:translate-x-6' : 'translate-x-1 sm:translate-x-0.5'
        }`}
      />
    </button>
  </div>
);

export default StudentSettings;
