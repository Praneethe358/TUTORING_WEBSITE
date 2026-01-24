import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StudentSidebar from '../components/StudentSidebar';
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
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    classReminders: true,
    marketingEmails: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('New passwords do not match');
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

  return (
    <DashboardLayout sidebar={StudentSidebar}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
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
              label="Class Reminders"
              description="Get reminded before your classes"
              checked={settings.classReminders}
              onChange={() => handleToggle('classReminders')}
            />
            <SettingToggle
              label="Marketing Emails"
              description="Receive promotional content"
              checked={settings.marketingEmails}
              onChange={() => handleToggle('marketingEmails')}
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
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Reusable Toggle Component
const SettingToggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-white font-medium">{label}</p>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition ${
        checked ? 'bg-indigo-600' : 'bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition transform ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export default StudentSettings;
