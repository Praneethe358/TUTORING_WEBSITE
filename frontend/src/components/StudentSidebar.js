import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

/**
 * STUDENT SIDEBAR COMPONENT
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
    { path: '/student/tutors-availability', label: 'Browse Tutors', icon: '👨‍🏫' },
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
      className="student-sidebar w-full md:w-[260px] h-full md:h-screen overflow-y-auto overflow-x-hidden"
      style={{
        backgroundColor: colors.white,
        borderRight: `1px solid ${colors.gray200}`,
        padding: spacing['2xl'],
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.lg,
        boxShadow: shadows.sm,
        position: 'relative',
      }}
    >
      {/* Header with brand logo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <Logo size={28} withText={false} />
          <span style={{ fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.textPrimary }}>HOPE</span>
        </div>
        <p style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>Student Portal · Learning Dashboard</p>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item, idx) => {
          // Handle dividers
          if (item.divider) {
            return (
              <div
                key={`divider-${idx}`}
                className="flex items-center gap-3 px-3 py-2 text-xs font-semibold mt-2 mb-2 border-t"
                style={{
                  color: colors.textSecondary,
                  borderColor: colors.gray200,
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
              preventScrollReset={true}
              className="flex items-center gap-3 px-3 py-3 md:py-2 rounded-lg transition-all min-h-[44px] md:min-h-0"
              style={{
                textDecoration: 'none',
                backgroundColor: active ? colors.accent : 'transparent',
                color: active ? colors.white : colors.textSecondary,
                fontWeight: typography.fontWeight.medium,
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
              <span className="text-lg md:text-base flex-shrink-0">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-auto w-full flex items-center justify-center gap-2 py-3 md:py-2 rounded-lg font-semibold transition-all min-h-[48px] md:min-h-0"
        style={{
          backgroundColor: colors.error,
          color: colors.white,
          border: 'none',
          cursor: 'pointer',
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
