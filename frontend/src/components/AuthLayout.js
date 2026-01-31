import React from 'react';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

const AuthLayout = ({ children }) => (
  <div style={{
    minHeight: '100vh',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    fontFamily: typography.fontFamily.base,
  }}>
    <div style={{
      width: '100%',
      maxWidth: '480px',
      backgroundColor: 'white',
      borderRadius: borderRadius.xl,
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      padding: spacing['3xl'],
    }}>
      <div style={{
        marginBottom: spacing.xl,
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: typography.fontSize['3xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.accent,
          marginBottom: spacing.sm,
        }}>
          HOPE
        </div>
        <p style={{
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
        }}>
          Your gateway to expert tutoring
        </p>
      </div>
      {children}
    </div>
  </div>
);

export default AuthLayout;
