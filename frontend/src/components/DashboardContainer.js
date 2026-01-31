import React from 'react';
import { colors, typography, spacing, shadows, borderRadius } from '../theme/designSystem';

/**
 * Modern Dashboard Container with Coursera-style design
 * Used to wrap dashboard pages with consistent styling
 */
const DashboardContainer = ({ children, maxWidth = '1400px' }) => {
  return (
    <div style={{
      backgroundColor: colors.bgSecondary,
      minHeight: '100vh',
      fontFamily: typography.fontFamily.base,
    }}>
      <div style={{
        maxWidth: maxWidth,
        margin: '0 auto',
        padding: spacing['2xl'],
      }}>
        {children}
      </div>
    </div>
  );
};

/**
 * Dashboard Header Component
 */
export const DashboardHeader = ({ title, subtitle = null, action = null }) => {
  return (
    <div style={{
      marginBottom: spacing['2xl'],
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: spacing.lg,
    }}>
      <div>
        <h1 style={{
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.textPrimary,
          marginBottom: subtitle ? spacing.sm : 0,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: typography.fontSize.lg,
            color: colors.textSecondary,
            marginTop: spacing.sm,
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

/**
 * Dashboard Grid for cards
 */
export const DashboardGrid = ({ columns = 4, children }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
      gap: spacing.xl,
      marginBottom: spacing['2xl'],
    }}>
      {children}
    </div>
  );
};

/**
 * Stat Card Component
 */
export const StatCard = ({ icon, label, value, change = null, trend = 'neutral' }) => {
  const trendColors = {
    up: colors.success,
    down: colors.error,
    neutral: colors.textSecondary,
  };

  return (
    <div style={{
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      boxShadow: shadows.sm,
      transition: 'all 0.3s ease',
      cursor: 'default',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = shadows.md;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = shadows.sm;
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
        <span style={{ fontSize: typography.fontSize['2xl'] }}>{icon}</span>
        <span style={{
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
          fontWeight: typography.fontWeight.medium,
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
      }}>
        {value}
      </div>
      {change && (
        <div style={{
          fontSize: typography.fontSize.sm,
          color: trendColors[trend],
          fontWeight: typography.fontWeight.medium,
        }}>
          {change}
        </div>
      )}
    </div>
  );
};

/**
 * Dashboard Card Component
 */
export const DashboardCard = ({ title, action = null, children, noPadding = false }) => {
  return (
    <div style={{
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.sm,
      overflow: 'hidden',
    }}>
      {(title || action) && (
        <div style={{
          padding: spacing.xl,
          borderBottom: `1px solid ${colors.gray200}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {title && (
            <h3 style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.textPrimary,
            }}>
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: noPadding ? 0 : spacing.xl }}>
        {children}
      </div>
    </div>
  );
};

/**
 * Empty State Component
 */
export const EmptyState = ({ icon, title, description, action = null }) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: `${spacing['3xl']} ${spacing.xl}`,
    }}>
      <div style={{
        fontSize: typography.fontSize['5xl'],
        marginBottom: spacing.xl,
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
      }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

/**
 * Badge Component
 */
export const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: {
      backgroundColor: colors.gray100,
      color: colors.textPrimary,
    },
    success: {
      backgroundColor: '#ECFDF5',
      color: '#065F46',
    },
    warning: {
      backgroundColor: '#FFFBEB',
      color: '#92400E',
    },
    error: {
      backgroundColor: '#FEF2F2',
      color: '#991B1B',
    },
    info: {
      backgroundColor: '#EFF6FF',
      color: '#1E3A8A',
    },
  };

  const variantStyle = variants[variant];

  return (
    <span style={{
      ...variantStyle,
      padding: `${spacing.xs} ${spacing.md}`,
      borderRadius: borderRadius.full,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      display: 'inline-block',
    }}>
      {children}
    </span>
  );
};

export default DashboardContainer;
