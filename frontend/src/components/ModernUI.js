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
  const baseStyles = `
    font-family: ${typography.fontFamily.base};
    font-weight: ${typography.fontWeight.semibold};
    border: none;
    border-radius: ${borderRadius.lg};
    cursor: pointer;
    transition: ${transitions.base};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    font-size: ${typography.fontSize.sm};
    gap: ${spacing.md};
  `;

  const sizeStyles = {
    sm: `padding: ${spacing.sm} ${spacing.lg}; min-height: 32px;`,
    md: `padding: ${spacing.md} ${spacing.xl}; min-height: 40px;`,
    lg: `padding: ${spacing.lg} ${spacing['2xl']}; min-height: 48px; font-size: ${typography.fontSize.base};`,
  };

  const variantStyles = {
    primary: `
      background: ${colors.accent};
      color: ${colors.white};
      box-shadow: ${shadows.md};
      &:hover { background: ${colors.accentDark}; box-shadow: ${shadows.lg}; }
      &:active { transform: scale(0.98); }
    `,
    secondary: `
      background: ${colors.gray100};
      color: ${colors.textPrimary};
      &:hover { background: ${colors.gray200}; }
    `,
    ghost: `
      background: transparent;
      color: ${colors.accent};
      &:hover { background: ${colors.gray50}; }
    `,
    danger: `
      background: ${colors.error};
      color: ${colors.white};
      &:hover { background: #DC2626; }
    `,
  };

  return (
    <button
      style={{
        ...Object.assign({}, 
          ...baseStyles.split(';').filter(s => s.trim()).map(s => {
            const [key, value] = s.split(':');
            return { [key.trim()]: value.trim() };
          })
        ),
        ...Object.assign({}, 
          ...sizeStyles[size].split(';').filter(s => s.trim()).map(s => {
            const [key, value] = s.split(':');
            return { [key.trim()]: value.trim() };
          })
        ),
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
  return (
    <div
      style={{
        background: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing['2xl'],
        boxShadow: shadows.sm,
        transition: transitions.base,
        ...(hover && {
          cursor: 'pointer',
          '&:hover': {
            boxShadow: shadows.lg,
            transform: 'translateY(-2px)',
          }
        })
      }}
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

export default {
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
