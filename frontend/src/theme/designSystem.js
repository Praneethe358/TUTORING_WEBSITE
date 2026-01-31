// Modern Design System
// Color palette, typography, spacing, animations

export const colors = {
  // Primary - Deep Purple (Parent-Trust Theme - BYJU'S Inspired)
  primary: '#5B2D8B',      // Deep Purple - headers, navbar, primary elements
  primaryLight: '#8E6BBF', // Soft Lavender - secondary interactive elements
  primaryLighter: '#D4C5E8', // Very light purple - hover states
  
  // Accent - Premium Gold (CTA buttons)
  accent: '#FFB703',       // Premium Gold - primary actions, CTAs
  accentLight: '#FFC830',  // Lighter gold - hover states
  accentDark: '#E0A302',   // Darker gold - active states
  
  // Secondary - Soft Lavender (cards, sections)
  secondary: '#8E6BBF',    // Soft Lavender - secondary elements
  secondaryLight: '#D4C5E8',
  secondaryDark: '#6B4E8E',
  
  // Neutral & Section Background
  white: '#FFFFFF',
  sectionBg: '#F6F2FA',    // Light Purple Section Background
  gray50: '#F9F8FB',       // Very light - almost white with purple tint
  gray100: '#F6F2FA',      // Section background
  gray200: '#E9E0F6',
  gray300: '#D9CEEA',
  gray400: '#C7C9E2',
  gray500: '#A8A0BF',
  gray600: '#8E86A6',
  gray700: '#6B6D7A',
  gray800: '#4A4D5C',
  gray900: '#1F2937',      // Dark gray - text primary
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#5B2D8B',         // Using primary purple
  
  // Backgrounds
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F6F2FA',  // Light Purple Section Background
  bgTertiary: '#F9F8FB',   // Very light purple
  
  // Text
  textPrimary: '#1F2937',  // Dark Gray
  textSecondary: '#6B6D7A',
  textTertiary: '#9CA3AF',
  
  // Shadows & Overlays (Purple-tinted)
  shadow: 'rgba(91, 45, 139, 0.08)',      // Purple-based shadow
  shadowMd: 'rgba(91, 45, 139, 0.12)',
  shadowLg: 'rgba(91, 45, 139, 0.16)',
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
