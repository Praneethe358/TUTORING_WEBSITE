import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      platformName: 'HOPE',
      supportEmail: 'support@hope.com',
      maxClassDuration: 120,
      timezone: 'UTC',
      maintenanceMode: false
    },
    email: {
      enabled: true,
      provider: 'smtp',
      notifyNewEnrollments: true,
      notifyClassReminders: true,
      notifyAssignmentDue: true
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireEmailVerification: true,
      twoFactorAuth: false
    },
    features: {
      enableMessaging: true,
      enableVideoChat: true,
      enableAssignments: true,
      enableQuizzes: true,
      enableCertificates: true,
      enableDiscussions: true
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      if (res.data.settings) {
        // Flatten the API response into our nested structure
        const apiSettings = res.data.settings;
        const flattenedSettings = {
          general: {
            platformName: apiSettings.platformName || 'HOPE',
            supportEmail: apiSettings.supportEmail || 'support@hope.com',
            maxClassDuration: apiSettings.maxClassDuration || 120,
            timezone: apiSettings.timezone || 'UTC',
            maintenanceMode: apiSettings.maintenanceMode || false
          },
          email: {
            enabled: apiSettings.emailEnabled !== undefined ? apiSettings.emailEnabled : true,
            provider: apiSettings.emailProvider || 'smtp',
            notifyNewEnrollments: apiSettings.notifyNewEnrollments !== undefined ? apiSettings.notifyNewEnrollments : true,
            notifyClassReminders: apiSettings.notifyClassReminders !== undefined ? apiSettings.notifyClassReminders : true,
            notifyAssignmentDue: apiSettings.notifyAssignmentDue !== undefined ? apiSettings.notifyAssignmentDue : true
          },
          security: {
            sessionTimeout: apiSettings.sessionTimeout || 30,
            maxLoginAttempts: apiSettings.maxLoginAttempts || 5,
            passwordMinLength: apiSettings.passwordMinLength || 8,
            requireEmailVerification: apiSettings.requireEmailVerification !== undefined ? apiSettings.requireEmailVerification : true,
            twoFactorAuth: apiSettings.twoFactorAuth !== undefined ? apiSettings.twoFactorAuth : false
          },
          features: {
            enableMessaging: apiSettings.enableMessaging !== undefined ? apiSettings.enableMessaging : true,
            enableVideoChat: apiSettings.enableVideoChat !== undefined ? apiSettings.enableVideoChat : true,
            enableAssignments: apiSettings.enableAssignments !== undefined ? apiSettings.enableAssignments : true,
            enableQuizzes: apiSettings.enableQuizzes !== undefined ? apiSettings.enableQuizzes : true,
            enableCertificates: apiSettings.enableCertificates !== undefined ? apiSettings.enableCertificates : true,
            enableDiscussions: apiSettings.enableDiscussions !== undefined ? apiSettings.enableDiscussions : true
          }
        };
        setSettings(flattenedSettings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaveLoading(true);
      // Flatten settings for API
      const flatSettings = {
        platformName: settings.general.platformName,
        supportEmail: settings.general.supportEmail,
        maxClassDuration: settings.general.maxClassDuration,
        timezone: settings.general.timezone,
        maintenanceMode: settings.general.maintenanceMode,
        emailEnabled: settings.email.enabled,
        emailProvider: settings.email.provider,
        notifyNewEnrollments: settings.email.notifyNewEnrollments,
        notifyClassReminders: settings.email.notifyClassReminders,
        notifyAssignmentDue: settings.email.notifyAssignmentDue,
        sessionTimeout: settings.security.sessionTimeout,
        maxLoginAttempts: settings.security.maxLoginAttempts,
        passwordMinLength: settings.security.passwordMinLength,
        requireEmailVerification: settings.security.requireEmailVerification,
        twoFactorAuth: settings.security.twoFactorAuth,
        enableMessaging: settings.features.enableMessaging,
        enableVideoChat: settings.features.enableVideoChat,
        enableAssignments: settings.features.enableAssignments,
        enableQuizzes: settings.features.enableQuizzes,
        enableCertificates: settings.features.enableCertificates,
        enableDiscussions: settings.features.enableDiscussions
      };
      
      await api.put('/admin/settings', { settings: flatSettings });
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaveLoading(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'email', label: 'Email & Notifications', icon: '📧' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'features', label: 'Features', icon: '🎯' }
  ];

  const renderGeneralSettings = () => (
    <div>
      <h3 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xl
      }}>
        General Settings
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        <SettingField
          label="Platform Name"
          type="text"
          value={settings.general.platformName}
          onChange={(e) => updateSetting('general', 'platformName', e.target.value)}
          helpText="The name displayed across the platform"
        />
        <SettingField
          label="Support Email"
          type="email"
          value={settings.general.supportEmail}
          onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
          helpText="Email address for user support inquiries"
        />
        <SettingField
          label="Max Class Duration (minutes)"
          type="number"
          value={settings.general.maxClassDuration}
          onChange={(e) => updateSetting('general', 'maxClassDuration', parseInt(e.target.value))}
          helpText="Maximum duration for a single class session"
        />
        <SettingField
          label="Timezone"
          type="select"
          value={settings.general.timezone}
          onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
          options={[
            { value: 'UTC', label: 'UTC' },
            { value: 'America/New_York', label: 'Eastern Time' },
            { value: 'America/Chicago', label: 'Central Time' },
            { value: 'America/Los_Angeles', label: 'Pacific Time' },
            { value: 'Europe/London', label: 'London' },
            { value: 'Asia/Kolkata', label: 'India' }
          ]}
          helpText="Default timezone for the platform"
        />
        <SettingToggle
          label="Maintenance Mode"
          checked={settings.general.maintenanceMode}
          onChange={(checked) => updateSetting('general', 'maintenanceMode', checked)}
          helpText="Enable to put the platform in maintenance mode (only admins can access)"
        />
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div>
      <h3 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xl
      }}>
        Email & Notification Settings
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        <SettingToggle
          label="Enable Email Notifications"
          checked={settings.email.enabled}
          onChange={(checked) => updateSetting('email', 'enabled', checked)}
          helpText="Master switch for all email notifications"
        />
        <SettingField
          label="Email Provider"
          type="select"
          value={settings.email.provider}
          onChange={(e) => updateSetting('email', 'provider', e.target.value)}
          options={[
            { value: 'smtp', label: 'SMTP' },
            { value: 'sendgrid', label: 'SendGrid' },
            { value: 'mailgun', label: 'Mailgun' },
            { value: 'ses', label: 'Amazon SES' }
          ]}
          helpText="Email service provider"
        />
        <div style={{
          padding: spacing.lg,
          backgroundColor: colors.gray50,
          borderRadius: borderRadius.md,
          marginTop: spacing.md
        }}>
          <h4 style={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: colors.textPrimary,
            marginBottom: spacing.md
          }}>
            Notification Types
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <SettingToggle
              label="New Enrollment Notifications"
              checked={settings.email.notifyNewEnrollments}
              onChange={(checked) => updateSetting('email', 'notifyNewEnrollments', checked)}
              helpText="Notify tutors when students enroll in their courses"
            />
            <SettingToggle
              label="Class Reminder Notifications"
              checked={settings.email.notifyClassReminders}
              onChange={(checked) => updateSetting('email', 'notifyClassReminders', checked)}
              helpText="Send reminders before scheduled classes"
            />
            <SettingToggle
              label="Assignment Due Notifications"
              checked={settings.email.notifyAssignmentDue}
              onChange={(checked) => updateSetting('email', 'notifyAssignmentDue', checked)}
              helpText="Remind students about upcoming assignment deadlines"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div>
      <h3 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xl
      }}>
        Security Settings
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        <SettingField
          label="Session Timeout (minutes)"
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
          helpText="Auto-logout users after this period of inactivity"
        />
        <SettingField
          label="Max Login Attempts"
          type="number"
          value={settings.security.maxLoginAttempts}
          onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
          helpText="Number of failed login attempts before account lockout"
        />
        <SettingField
          label="Minimum Password Length"
          type="number"
          value={settings.security.passwordMinLength}
          onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
          helpText="Minimum characters required for passwords"
        />
        <SettingToggle
          label="Require Email Verification"
          checked={settings.security.requireEmailVerification}
          onChange={(checked) => updateSetting('security', 'requireEmailVerification', checked)}
          helpText="Users must verify their email before accessing the platform"
        />
        <SettingToggle
          label="Two-Factor Authentication"
          checked={settings.security.twoFactorAuth}
          onChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
          helpText="Enable 2FA for enhanced security"
        />
      </div>
    </div>
  );

  const renderFeatureSettings = () => (
    <div>
      <h3 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xl
      }}>
        Feature Toggles
      </h3>
      <div style={{
        padding: spacing.lg,
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md
      }}>
        <p style={{
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
          marginBottom: spacing.lg
        }}>
          Enable or disable platform features. Disabled features will be hidden from all users.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <SettingToggle
            label="Messaging System"
            checked={settings.features.enableMessaging}
            onChange={(checked) => updateSetting('features', 'enableMessaging', checked)}
            helpText="Allow users to send messages to each other"
          />
          <SettingToggle
            label="Video Chat Integration"
            checked={settings.features.enableVideoChat}
            onChange={(checked) => updateSetting('features', 'enableVideoChat', checked)}
            helpText="Enable video conferencing for classes"
          />
          <SettingToggle
            label="Assignments"
            checked={settings.features.enableAssignments}
            onChange={(checked) => updateSetting('features', 'enableAssignments', checked)}
            helpText="Allow tutors to create and manage assignments"
          />
          <SettingToggle
            label="Quizzes"
            checked={settings.features.enableQuizzes}
            onChange={(checked) => updateSetting('features', 'enableQuizzes', checked)}
            helpText="Enable quiz creation and auto-grading"
          />
          <SettingToggle
            label="Certificates"
            checked={settings.features.enableCertificates}
            onChange={(checked) => updateSetting('features', 'enableCertificates', checked)}
            helpText="Generate completion certificates for students"
          />
          <SettingToggle
            label="Discussion Forums"
            checked={settings.features.enableDiscussions}
            onChange={(checked) => updateSetting('features', 'enableDiscussions', checked)}
            helpText="Enable course discussion forums"
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div style={{ padding: spacing['2xl'], display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', color: colors.textSecondary }}>
            Loading settings...
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div style={{ padding: 'clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 'clamp(1rem, 4vw, 2rem)' }}>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 5vw, 2rem)',
              fontWeight: typography.fontWeight.bold,
              color: colors.textPrimary,
              marginBottom: spacing.sm
            }}>
              System Settings
            </h1>
            <p style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)', color: colors.textSecondary }}>
              Configure platform settings and preferences
            </p>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
            gap: 'clamp(1rem, 3vw, 1.5rem)'
          }}>
            {/* Tabs */}
            <div style={{
              width: window.innerWidth < 768 ? '100%' : '250px',
              backgroundColor: colors.white,
              borderRadius: borderRadius.xl,
              padding: 'clamp(0.75rem, 3vw, 1rem)',
              boxShadow: shadows.sm,
              height: 'fit-content',
              position: window.innerWidth < 768 ? 'static' : 'sticky',
              top: spacing.xl
            }}>
              <div style={{ 
                display: 'flex',
                flexDirection: window.innerWidth < 768 ? 'row' : 'column',
                flexWrap: window.innerWidth < 768 ? 'wrap' : 'nowrap',
                gap: spacing.xs,
                overflowX: window.innerWidth < 768 ? 'auto' : 'visible'
              }}>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      width: window.innerWidth < 768 ? 'auto' : '100%',
                      minHeight: '44px',
                      padding: window.innerWidth < 768 ? 
                        `${spacing.sm} ${spacing.md}` : 
                        `${spacing.md} ${spacing.lg}`,
                      borderRadius: borderRadius.md,
                      backgroundColor: activeTab === tab.id ? colors.accent : 'transparent',
                      color: activeTab === tab.id ? colors.white : colors.textSecondary,
                      border: 'none',
                      textAlign: 'left',
                      fontWeight: typography.fontWeight.medium,
                      cursor: 'pointer',
                      marginBottom: window.innerWidth < 768 ? '0' : spacing.xs,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.sm,
                      fontSize: 'clamp(0.75rem, 2vw, 1rem)',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.backgroundColor = colors.gray100;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{
                backgroundColor: colors.white,
                borderRadius: borderRadius.xl,
                padding: 'clamp(1rem, 4vw, 2rem)',
                boxShadow: shadows.sm
              }}>
                {activeTab === 'general' && renderGeneralSettings()}
                {activeTab === 'email' && renderEmailSettings()}
                {activeTab === 'security' && renderSecuritySettings()}
                {activeTab === 'features' && renderFeatureSettings()}

                {/* Save Button */}
                <div style={{
                  marginTop: 'clamp(1rem, 4vw, 2rem)',
                  paddingTop: 'clamp(0.75rem, 3vw, 1.5rem)',
                  borderTop: `1px solid ${colors.gray200}`,
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={handleSaveSettings}
                    disabled={saveLoading}
                    style={{
                      width: window.innerWidth < 640 ? '100%' : 'auto',
                      minHeight: '44px',
                      padding: window.innerWidth < 640 ?
                        `${spacing.md} ${spacing.lg}` :
                        `${spacing.md} ${spacing['2xl']}`,
                      backgroundColor: colors.accent,
                      color: colors.white,
                      border: 'none',
                      borderRadius: borderRadius.lg,
                      fontWeight: typography.fontWeight.semibold,
                      cursor: saveLoading ? 'not-allowed' : 'pointer',
                      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                      opacity: saveLoading ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => !saveLoading && (e.currentTarget.style.backgroundColor = '#5b4bcd')}
                    onMouseLeave={(e) => !saveLoading && (e.currentTarget.style.backgroundColor = colors.accent)}
                  >
                    {saveLoading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

// Helper Components
const SettingField = ({ label, type, value, onChange, options, helpText }) => (
  <div>
    <label style={{
      display: 'block',
      fontSize: 'clamp(0.875rem, 2vw, 0.875rem)',
      fontWeight: typography.fontWeight.medium,
      color: colors.textPrimary,
      marginBottom: spacing.sm
    }}>
      {label}
    </label>
    {type === 'select' ? (
      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          minHeight: '44px',
          padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
          borderRadius: borderRadius.md,
          backgroundColor: colors.white,
          border: `1px solid ${colors.gray300}`,
          fontSize: 'clamp(0.875rem, 2vw, 1rem)',
          color: colors.textPrimary,
          cursor: 'pointer'
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          minHeight: '44px',
          padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
          borderRadius: borderRadius.md,
          backgroundColor: colors.white,
          border: `1px solid ${colors.gray300}`,
          fontSize: 'clamp(0.875rem, 2vw, 1rem)',
          color: colors.textPrimary
        }}
      />
    )}
    {helpText && (
      <p style={{
        fontSize: 'clamp(0.75rem, 2vw, 0.75rem)',
        color: colors.textSecondary,
        marginTop: spacing.xs
      }}>
        {helpText}
      </p>
    )}
  </div>
);

const SettingToggle = ({ label, checked, onChange, helpText }) => (
  <div style={{
    display: 'flex',
    flexDirection: window.innerWidth < 480 ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: window.innerWidth < 480 ? 'flex-start' : 'flex-start',
    padding: 'clamp(0.75rem, 2vw, 1rem)',
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray50,
    gap: window.innerWidth < 480 ? spacing.md : '0'
  }}>
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: 'clamp(0.875rem, 2vw, 1rem)',
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
        marginBottom: spacing.xs
      }}>
        {label}
      </div>
      {helpText && (
        <div style={{
          fontSize: 'clamp(0.75rem, 2vw, 0.75rem)',
          color: colors.textSecondary
        }}>
          {helpText}
        </div>
      )}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
      }}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '48px',
        height: '24px',
        minHeight: '44px',
        marginLeft: window.innerWidth < 480 ? '0' : spacing.md,
        flexShrink: 0,
        border: 'none',
        cursor: 'pointer',
        backgroundColor: checked ? colors.accent : colors.gray300,
        transition: 'background-color 0.2s',
        borderRadius: '24px',
        outline: 'none'
      }}
      onFocus={(e) => e.target.style.boxShadow = `0 0 0 3px ${colors.accent}33`}
      onBlur={(e) => e.target.style.boxShadow = 'none'}
    >
      <span style={{
        position: 'absolute',
        height: '18px',
        width: '18px',
        left: checked ? '26px' : '3px',
        top: '3px',
        backgroundColor: colors.white,
        transition: 'left 0.2s',
        borderRadius: '50%',
        boxShadow: shadows.sm
      }} />
    </button>
  </div>
);

export default AdminSettings;
