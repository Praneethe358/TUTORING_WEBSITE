// Modern Design System
// Color palette, typography, spacing, animations

export const colors = {
  // Primary
  primary: '#0F172A',      // Dark blue (primary brand)
  primaryLight: '#1E293B', // Lighter dark blue
  
  // Accent
  accent: '#3B82F6',       // Vibrant blue
  accentLight: '#60A5FA',  // Light blue
  accentDark: '#1D4ED8',   // Dark blue
  
  // Neutral
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Backgrounds
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F9FAFB',
  bgTertiary: '#F3F4F6',
  
  // Text
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textTertiary: '#9CA3AF',
  
  // Shadows & Overlays
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowMd: 'rgba(0, 0, 0, 0.12)',
  shadowLg: 'rgba(0, 0, 0, 0.15)',
};

export const typography = {
  // Font families
  fontFamily: {
    base: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Fira Code', monospace",
  },
  
  // Font sizes
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  
  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
};

export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
};

export const transitions = {
  fast: 'all 0.15s ease-in-out',
  base: 'all 0.25s ease-in-out',
  slow: 'all 0.35s ease-in-out',
};

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};
