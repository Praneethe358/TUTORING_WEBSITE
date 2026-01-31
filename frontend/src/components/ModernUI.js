import React from 'react';
import { colors, typography, spacing, borderRadius, shadows, transitions } from '../theme/designSystem';

// ============= MODERN BUTTON COMPONENT =============
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  ...props 
}) => {
  const baseStyles = {
    fontFamily: typography.fontFamily.base,
    fontWeight: typography.fontWeight.semibold,
    border: 'none',
    borderRadius: borderRadius.lg,
    cursor: 'pointer',
    transition: transitions.base,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    fontSize: typography.fontSize.sm,
    gap: spacing.md,
  };

  const sizeStyles = {
    sm: { padding: `${spacing.sm} ${spacing.lg}`, minHeight: '32px' },
    md: { padding: `${spacing.md} ${spacing.xl}`, minHeight: '40px' },
    lg: { padding: `${spacing.lg} ${spacing['2xl']}`, minHeight: '48px', fontSize: typography.fontSize.base },
  };

  const variantStyle = {
    primary: {
      backgroundColor: colors.accent,
      color: colors.white,
      boxShadow: shadows.md,
    },
    secondary: {
      backgroundColor: colors.gray100,
      color: colors.textPrimary,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.accent,
    },
    danger: {
      backgroundColor: colors.error,
      color: colors.white,
    },
  }[variant] || {};

  return (
    <button
      style={{
        ...baseStyles,
        ...(sizeStyles[size] || sizeStyles.md),
        ...variantStyle,
      }}
      className={`modern-btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// ============= MODERN CARD COMPONENT =============
export const Card = ({ children, className = '', hover = false, ...props }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      style={{
        background: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing['2xl'],
        boxShadow: isHovered && hover ? shadows.lg : shadows.sm,
        transition: transitions.base,
        transform: isHovered && hover ? 'translateY(-2px)' : 'none',
        cursor: hover ? 'pointer' : 'default'
      }}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      className={`modern-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// ============= BADGE COMPONENT =============
export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: { bg: colors.accent, text: colors.white },
    success: { bg: colors.success, text: colors.white },
    warning: { bg: colors.warning, text: colors.white },
    error: { bg: colors.error, text: colors.white },
    gray: { bg: colors.gray100, text: colors.textPrimary },
  };

  const style = variants[variant] || variants.primary;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: `${spacing.xs} ${spacing.md}`,
        borderRadius: borderRadius.full,
        backgroundColor: style.bg,
        color: style.text,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
      }}
      className={className}
    >
      {children}
    </span>
  );
};

// ============= STAT CARD COMPONENT =============
export const StatCard = ({ label, value, icon, trend }) => (
  <Card>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ color: colors.textTertiary, margin: 0, marginBottom: spacing.md }}>
          {label}
        </p>
        <p style={{ 
          fontSize: typography.fontSize['3xl'], 
          fontWeight: typography.fontWeight.bold,
          margin: 0,
          color: colors.textPrimary 
        }}>
          {value}
        </p>
        {trend && <Badge variant="success">{trend}</Badge>}
      </div>
      {icon && <div style={{ fontSize: '32px' }}>{icon}</div>}
    </div>
  </Card>
);

// ============= GRADIENT TEXT =============
export const GradientText = ({ children, className = '' }) => (
  <span
    style={{
      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}
    className={className}
  >
    {children}
  </span>
);

// ============= DIVIDER =============
export const Divider = ({ margin = 'lg' }) => (
  <div
    style={{
      height: '1px',
      background: colors.gray200,
      margin: `${spacing[margin]} 0`,
    }}
  />
);

// ============= SECTION HEADING =============
export const SectionHeading = ({ title, subtitle, centered = false }) => (
  <div style={{ textAlign: centered ? 'center' : 'left', marginBottom: spacing['3xl'] }}>
    <h2 style={{
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.bold,
      margin: 0,
      color: colors.textPrimary,
      marginBottom: spacing.lg,
    }}>
      {title}
    </h2>
    {subtitle && (
      <p style={{
        fontSize: typography.fontSize.lg,
        color: colors.textSecondary,
        margin: 0,
      }}>
        {subtitle}
      </p>
    )}
  </div>
);

// ============= CONTAINER =============
export const Container = ({ children, className = '' }) => (
  <div
    style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: `0 ${spacing.xl}`,
      width: '100%',
    }}
    className={className}
  >
    {children}
  </div>
);

// ============= GRID =============
export const Grid = ({ children, cols = 3, gap = 'xl', className = '' }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(300px, 1fr))`,
      gap: spacing[gap],
    }}
    className={className}
  >
    {children}
  </div>
);

const ModernUIExport = {
  Button,
  Card,
  Badge,
  StatCard,
  GradientText,
  Divider,
  SectionHeading,
  Container,
  Grid,
};

export default ModernUIExport;
