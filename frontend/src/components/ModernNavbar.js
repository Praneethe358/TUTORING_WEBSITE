import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button, Container } from './ModernUI';
import Logo from './Logo';
import { colors, typography, spacing, shadows } from '../theme/designSystem';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = role === 'student' ? [
    { name: 'Dashboard', path: '/student/dashboard' },
    { name: 'Find Tutors', path: '/tutors' },
    { name: 'My Classes', path: '/student/classes' },
    { name: 'Bookings', path: '/student/bookings' },
  ] : role === 'tutor' ? [
    { name: 'Dashboard', path: '/tutor/dashboard' },
    { name: 'Classes', path: '/tutor/manage-classes' },
    { name: 'Earnings', path: '/tutor/earnings' },
  ] : [];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: theme === 'dark' ? colors.gray900 : colors.white,
      boxShadow: scrolled ? shadows.md : shadows.xs,
      zIndex: 1000,
      transition: 'all 0.3s ease',
      borderBottom: theme === 'dark' ? `1px solid ${colors.gray800}` : `1px solid ${colors.gray100}`,
    }}>
      <Container>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: `${spacing.lg} 0`,
        }}>
          {/* Logo */}
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <Logo size={64} withText={true} />
          </div>

          {/* Desktop Nav Links */}
          <div style={{
            display: 'flex',
            gap: spacing['2xl'],
            alignItems: 'center',
          }}>
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.path);
                }}
                style={{
                  color: location.pathname === link.path ? colors.accent : colors.textSecondary,
                  textDecoration: 'none',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  transition: 'color 0.2s',
                  borderBottom: location.pathname === link.path ? `2px solid ${colors.accent}` : 'none',
                  paddingBottom: '4px',
                  cursor: 'pointer',
                }}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div style={{
            display: 'flex',
            gap: spacing.lg,
            alignItems: 'center',
          }}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {user ? (
              <>
                {/* Profile/Notifications - Desktop */}
                <div style={{ display: 'flex', gap: spacing.md }}>
                  <button
                    onClick={() => navigate(role === 'student' ? '/student/profile' : '/tutor/profile')}
                    style={{
                      background: user.avatar 
                        ? `url(http://localhost:5000${user.avatar}) center/cover no-repeat` 
                        : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
                      border: `2px solid ${colors.gray200}`,
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.white,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title={user.name}
                  >
                    {!user.avatar && user.name?.charAt(0).toUpperCase()}
                  </button>
                  <button
                    onClick={logout}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: colors.textSecondary,
                      cursor: 'pointer',
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: spacing.md }}>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{
            display: 'none',
            flexDirection: 'column',
            gap: spacing.lg,
            paddingBottom: spacing.xl,
          }}>
            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.path);
                  setMenuOpen(false);
                }}
                style={{
                  color: location.pathname === link.path ? colors.accent : colors.textSecondary,
                  textDecoration: 'none',
                  fontSize: typography.fontSize.sm,
                }}
              >
                {link.name}
              </a>
            ))}
            {!user && (
              <Button onClick={() => navigate('/login')} variant="secondary">
                Sign In
              </Button>
            )}
          </div>
        )}
      </Container>
    </nav>
  );
};

export default Navbar;
