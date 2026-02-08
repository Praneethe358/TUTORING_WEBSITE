import { Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';
import Logo from './Logo';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAdmin();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/tutors', label: 'Tutors', icon: '👨‍🏫' },
    { path: '/admin/tutor-cvs', label: 'Tutor CVs', icon: '📄' },
    { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
    { path: '/admin/assignments', label: 'Assignments', icon: '🔗' },
    { path: '/admin/demo-requests', label: 'Demo Requests', icon: '🎯' },
    { path: '/admin/courses', label: 'Courses', icon: '📚' },
    { path: '/admin/enrollments', label: 'Enrollments', icon: '📝' },
    { path: '/admin/announcements', label: 'Announcements', icon: '📢' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
    // LMS Section - NEW
    { divider: true, label: 'LMS Monitoring' },
    { path: '/admin/lms/dashboard', label: 'LMS Dashboard', icon: '🎓' },
    { path: '/admin/lms/courses', label: 'Courses Monitor', icon: '📖' },
    { path: '/admin/lms/grades', label: 'Grades & Performance', icon: '⭐' },
    { path: '/admin/lms/reports', label: 'Reports', icon: '📊' },
    // Settings Section
    { divider: true, label: 'System' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div
      style={{
        width: '260px',
        height: '100vh',
        backgroundColor: colors.white,
        borderRight: `1px solid ${colors.gray200}`,
        padding: spacing['2xl'],
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.lg,
        boxShadow: shadows.sm,
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Header with Logo */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
          <Logo size={24} withText={false} />
          <span style={{ fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.textPrimary }}>HOPE</span>
        </div>
        <p style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>Admin Panel</p>
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing.xs, overflowY: 'auto', overflowX: 'hidden' }}>
        {menuItems.map((item, idx) => {
          // Handle dividers
          if (item.divider) {
            return (
              <div
                key={`divider-${idx}`}
                style={{
                  paddingTop: spacing.lg,
                  paddingBottom: spacing.xs,
                  paddingLeft: spacing.lg,
                  paddingRight: spacing.lg,
                  marginTop: idx === 0 ? 0 : spacing.md,
                  marginBottom: spacing.xs,
                  borderTop: idx === 0 ? 'none' : `1px solid ${colors.gray200}`,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {item.label}
              </div>
            );
          }

          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.md,
                padding: `${spacing.md} ${spacing.lg}`,
                borderRadius: borderRadius.md,
                textDecoration: 'none',
                backgroundColor: active ? colors.accent : 'transparent',
                color: active ? colors.white : colors.textSecondary,
                fontWeight: typography.fontWeight.medium,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = colors.gray100;
                  e.currentTarget.style.color = colors.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.textSecondary;
                }
              }}
            >
              <span style={{ fontSize: typography.fontSize.lg }}>{item.icon}</span>
              <span style={{ fontSize: typography.fontSize.sm }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <button
        onClick={logout}
        style={{
          marginTop: 'auto',
          width: '100%',
          backgroundColor: colors.error,
          color: colors.white,
          border: 'none',
          padding: `${spacing.md} ${spacing.lg}`,
          borderRadius: borderRadius.md,
          fontWeight: typography.fontWeight.semibold,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.error; }}
      >
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </div>
  );
};

export default AdminSidebar;
