import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

/**
 * STUDENT SIDEBAR COMPONENT
 * 
 * Left sidebar navigation for student dashboard
 * - Shows active route highlighting
 * - Includes logout button
 * - Mobile responsive
 */
const StudentSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/student/classes', label: 'My Classes', icon: '📚' },
    { path: '/student/my-tutors', label: 'My Tutors', icon: '👨‍🏫' },
    { path: '/student/attendance', label: 'Attendance', icon: '📝' },
    { path: '/student/materials', label: 'Materials', icon: '📄' },
    { path: '/student/messages', label: 'Messages', icon: '✉️' },
    { path: '/announcements', label: 'Announcements', icon: '📢' },
    { path: '/student/profile', label: 'My Profile', icon: '👤' },
    
    // LMS Section
    { label: 'Learning', divider: true },
    { path: '/student/courses', label: 'Course Catalog', icon: '🔍' },
    { path: '/student/lms/dashboard', label: 'LMS Dashboard', icon: '📚' },
    { path: '/student/lms/assignments', label: 'Assignments', icon: '✏️' },
    { path: '/student/lms/quizzes', label: 'Quizzes', icon: '❓' },
    { path: '/student/lms/certificates', label: 'Certificates', icon: '🎓' },
    
    { path: '/student/settings', label: 'Settings', icon: '⚙️' }
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
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.accent,
            marginBottom: spacing.xs,
          }}
        >
          Student Portal
        </h1>
        <p style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>Learning Dashboard</p>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.md,
                  padding: `${spacing.md} ${spacing.lg}`,
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.textSecondary,
                  marginTop: spacing.sm,
                  borderTop: `1px solid ${colors.gray200}`,
                  marginBottom: spacing.sm,
                }}
              >
                {item.label}
              </div>
            );
          }

          // no action items
          
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
        onClick={handleLogout}
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

export default StudentSidebar;
