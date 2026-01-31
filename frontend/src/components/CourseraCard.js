import React from 'react';
import { colors, borderRadius, shadows, spacing, typography } from '../theme/designSystem';

/**
 * Reusable Card Component with Coursera-style design
 */
export const CourseraCard = ({ 
  children, 
  padding = spacing.xl,
  hover = false,
  onClick = null,
  style = {}
}) => {
  const baseStyle = {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: padding,
    boxShadow: shadows.sm,
    transition: 'all 0.3s ease',
    cursor: onClick ? 'pointer' : 'default',
    ...style
  };

  return (
    <div 
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = shadows.lg;
          e.currentTarget.style.transform = 'translateY(-4px)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = shadows.sm;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </div>
  );
};

/**
 * Section Heading Component
 */
export const SectionHeading = ({ children, subtitle = null, align = 'left' }) => {
  return (
    <div style={{ 
      marginBottom: spacing['2xl'], 
      textAlign: align 
    }}>
      <h2 style={{
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: subtitle ? spacing.sm : 0,
      }}>
        {children}
      </h2>
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
  );
};

/**
 * Button Component with Coursera styling
 */
export const CourseraButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick = null,
  type = 'button',
  style = {}
}) => {
  const variants = {
    primary: {
      backgroundColor: colors.accent,
      color: colors.white,
      border: 'none',
      hover: {
        backgroundColor: colors.accentDark,
      }
    },
    secondary: {
      backgroundColor: 'transparent',
      color: colors.accent,
      border: `2px solid ${colors.accent}`,
      hover: {
        backgroundColor: colors.gray50,
      }
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.textPrimary,
      border: `1px solid ${colors.gray300}`,
      hover: {
        backgroundColor: colors.gray50,
      }
    }
  };

  const sizes = {
    small: {
      padding: `${spacing.sm} ${spacing.lg}`,
      fontSize: typography.fontSize.sm,
    },
    medium: {
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: typography.fontSize.base,
    },
    large: {
      padding: `${spacing.lg} ${spacing['2xl']}`,
      fontSize: typography.fontSize.lg,
    }
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  const buttonStyle = {
    ...variantStyle,
    ...sizeStyle,
    width: fullWidth ? '100%' : 'auto',
    borderRadius: borderRadius.md,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.base,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.3s ease',
    ...style
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={buttonStyle}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, variantStyle.hover);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = variantStyle.backgroundColor;
        }
      }}
    >
      {children}
    </button>
  );
};

/**
 * Input Component with Coursera styling
 */
export const CourseraInput = ({ 
  label, 
  type = 'text', 
  name,
  value, 
  onChange, 
  placeholder = '',
  required = false,
  error = null,
  helperText = null,
  style = {}
}) => {
  return (
    <div style={{ marginBottom: spacing.lg }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          color: colors.textPrimary,
          marginBottom: spacing.sm,
        }}>
          {label}
          {required && <span style={{ color: colors.error }}> *</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: `${spacing.md} ${spacing.lg}`,
          fontSize: typography.fontSize.base,
          border: `1px solid ${error ? colors.error : colors.gray300}`,
          borderRadius: borderRadius.md,
          outline: 'none',
          transition: 'all 0.3s ease',
          fontFamily: typography.fontFamily.base,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          ...style
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? colors.error : colors.accent;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? colors.error : colors.gray300;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {error && (
        <p style={{
          marginTop: spacing.sm,
          fontSize: typography.fontSize.sm,
          color: colors.error,
        }}>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p style={{
          marginTop: spacing.sm,
          fontSize: typography.fontSize.sm,
          color: colors.textTertiary,
        }}>
          {helperText}
        </p>
      )}
    </div>
  );
};

/**
 * Alert Component
 */
export const CourseraAlert = ({ 
  children, 
  type = 'info', 
  onClose = null 
}) => {
  const types = {
    success: {
      backgroundColor: '#ECFDF5',
      color: '#065F46',
      borderColor: '#10B981',
      icon: '✓'
    },
    error: {
      backgroundColor: '#FEF2F2',
      color: '#991B1B',
      borderColor: '#EF4444',
      icon: '✕'
    },
    warning: {
      backgroundColor: '#FFFBEB',
      color: '#92400E',
      borderColor: '#F59E0B',
      icon: '⚠'
    },
    info: {
      backgroundColor: '#EFF6FF',
      color: '#1E3A8A',
      borderColor: '#3B82F6',
      icon: 'ℹ'
    }
  };

  const alertStyle = types[type];

  return (
    <div style={{
      backgroundColor: alertStyle.backgroundColor,
      color: alertStyle.color,
      border: `1px solid ${alertStyle.borderColor}`,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
        <span style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold }}>
          {alertStyle.icon}
        </span>
        <span style={{ fontSize: typography.fontSize.sm }}>
          {children}
        </span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: alertStyle.color,
            cursor: 'pointer',
            fontSize: typography.fontSize.lg,
            padding: spacing.sm,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
