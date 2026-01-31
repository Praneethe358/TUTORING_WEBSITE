import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

/**
 * TUTOR SETTINGS PAGE
 * 
 * Manage tutor account settings
 * - Notification preferences
 * - Privacy settings
 * - Change password
 * - Account preferences
 */
const TutorSettings = () => {
  const { user, setUser } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    bookingReminders: true,
    marketingEmails: false,
    autoAcceptBookings: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadMessage('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      setUploadingImage(true);
      setUploadMessage('');
      const response = await api.post('/tutor/upload-profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update user context with new profile image
      setUser(prev => ({ ...prev, profileImage: response.data.profileImage }));
      setUploadMessage('Profile picture updated successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (err) {
      setUploadMessage(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('New passwords do not match');
        return;
      }
      await api.post('/tutor/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      alert('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Picture */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700 border-2 border-slate-600">
                {user?.profileImage || user?.avatar ? (
                  <img
                    src={(user?.profileImage || user?.avatar)?.startsWith('http') 
                      ? (user?.profileImage || user?.avatar) 
                      : `${process.env.REACT_APP_API_URL?.replace('/api', '')}${user?.profileImage || user?.avatar}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-3xl font-bold text-white">${user?.name?.charAt(0).toUpperCase()}</div>`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-3">Upload a new profile picture. JPG, PNG or GIF (Max 5MB)</p>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition cursor-pointer">
                  {uploadingImage ? 'Uploading...' : 'Choose Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                {uploadMessage && (
                  <p className={`text-sm ${uploadMessage.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                    {uploadMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-400">Name</label>
              <p className="text-white font-medium">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm text-slate-400">Email</label>
              <p className="text-white font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-slate-400">Account Status</label>
              <p className="text-white font-medium">{user?.status || 'pending'}</p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
          <div className="space-y-4">
            <SettingToggle
              label="Email Notifications"
              description="Receive updates via email"
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
            />
            <SettingToggle
              label="SMS Notifications"
              description="Receive text message alerts"
              checked={settings.smsNotifications}
              onChange={() => handleToggle('smsNotifications')}
            />
            <SettingToggle
              label="Booking Reminders"
              description="Get reminded before your classes"
              checked={settings.bookingReminders}
              onChange={() => handleToggle('bookingReminders')}
            />
            <SettingToggle
              label="Marketing Emails"
              description="Receive promotional content"
              checked={settings.marketingEmails}
              onChange={() => handleToggle('marketingEmails')}
            />
          </div>
        </div>

        {/* Booking Preferences */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Booking Preferences</h2>
          <div className="space-y-4">
            <SettingToggle
              label="Auto-accept Bookings"
              description="Automatically accept all booking requests"
              checked={settings.autoAcceptBookings}
              onChange={() => handleToggle('autoAcceptBookings')}
            />
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-4 py-3 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-3 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition min-h-[44px]"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Reusable Toggle Component
const SettingToggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-700 last:border-b-0">
    <div className="flex-1 pr-4">
      <p className="text-white font-medium text-sm sm:text-base">{label}</p>
      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{description}</p>
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
      className={`relative h-8 w-14 sm:h-7 sm:w-12 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-800 flex-shrink-0 shadow-inner ${
        checked 
          ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/50' 
          : 'bg-slate-700 hover:bg-slate-600 shadow-slate-900/50'
      }`}
    >
      <span
        className={`absolute top-1 left-1 h-6 w-6 sm:h-5 sm:w-5 bg-white rounded-full transition-all duration-300 ease-in-out shadow-lg ${
          checked ? 'translate-x-6 sm:translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export default TutorSettings;
