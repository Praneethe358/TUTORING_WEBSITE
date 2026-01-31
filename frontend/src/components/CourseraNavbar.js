import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Container, GradientText } from './ModernUI';
import { colors, typography, spacing, borderRadius, shadows, zIndex } from '../theme/designSystem';
import AuthModal from './AuthModal';

const navLinks = [
  { label: 'Projects', target: 'projects' },
  { label: 'Pricing', target: 'pricing' },
  { label: 'Training', target: 'training' },
  { label: 'About', target: 'about' },
];

const CourseraNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const [hovered, setHovered] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const sectionIds = useMemo(() => navLinks.map((link) => link.target), []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);

      let closestSection = activeLink;
      let closestOffset = Number.POSITIVE_INFINITY;

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const offset = Math.abs(rect.top);
        if (offset < closestOffset && rect.top <= window.innerHeight * 0.75) {
          closestSection = id;
          closestOffset = offset;
        }
      });

      if (closestSection && closestSection !== activeLink) {
        setActiveLink(closestSection);
      }
    };

    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveLink(hash);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeLink, sectionIds]);

  const scrollToSection = (target) => {
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveLink(target);
      window.history.replaceState(null, '', `#${target}`);
    } else if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: zIndex.sticky || 1020,
        background: colors.white,
        boxShadow: scrolled ? shadows.md : 'none',
        transition: 'all 0.25s ease',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Container>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: scrolled ? `${spacing.md} 0` : `${spacing.xl} 0`,
            transition: 'padding 0.25s ease, transform 0.25s ease',
            transform: scrolled ? 'translateY(-2px)' : 'none',
          }}
        >
          <div
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              cursor: 'pointer',
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.textPrimary,
              letterSpacing: '-0.3px',
            }}
          >
            <span>Learn</span>
            <GradientText>Hub</GradientText>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing['2xl'],
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xl }}>
              {navLinks.map((link) => {
                const isActive = activeLink === link.target;
                const isHovered = hovered === link.target;
                const showUnderline = isActive || isHovered;

                return (
                  <button
                    key={link.target}
                    onClick={() => scrollToSection(link.target)}
                    onMouseEnter={() => setHovered(link.target)}
                    onMouseLeave={() => setHovered('')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      margin: 0,
                      cursor: 'pointer',
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: isActive ? colors.accent : colors.textSecondary,
                      textDecoration: 'none',
                      backgroundImage: `linear-gradient(${colors.accent}, ${colors.accent})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: showUnderline ? '100% 2px' : '0% 2px',
                      backgroundPosition: '0 100%',
                      transition: 'color 0.2s ease, background-size 0.25s ease',
                    }}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.textSecondary,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                }}
              >
                Sign In
              </button>
              <Button
                size="sm"
                style={{
                  borderRadius: borderRadius.lg,
                  fontWeight: typography.fontWeight.semibold,
                  padding: `${spacing.sm} ${spacing.lg}`,
                }}
                onClick={() => setShowAuthModal(true)}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </Container>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </nav>
  );
};

export default CourseraNavbar;
