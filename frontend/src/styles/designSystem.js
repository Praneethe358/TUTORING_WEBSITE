/**
 * DESIGN SYSTEM
 * Centralized color palette, typography, and spacing
 * Inspired by Coursera, Vedantu, modern startup design
 */

export const COLORS = {
  // Primary - Deep Blue / Indigo (trust & education)
  primary: {
    50: '#f0f4ff',
    100: '#e0e9ff',
    200: '#c7d7ff',
    300: '#a8bfff',
    400: '#7d9fff',
    500: '#5b7eff', // Main
    600: '#4a63e0',
    700: '#3d4fc4',
    800: '#343ca0',
    900: '#2d3382',
  },

  // Secondary - Soft Purple / Teal
  secondary: {
    50: '#f5f0ff',
    100: '#ebe0ff',
    200: '#d8c7ff',
    300: '#bba8ff',
    400: '#9d7dff',
    500: '#8b5cf6', // Main (Purple)
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // Accent - Emerald / Green (success, payments)
  accent: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },

  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutral - Gray scale
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Dark mode
  dark: {
    bg: '#0f172a',
    surface: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #5b7eff 0%, #7c3aed 100%)',
    accent: 'linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)',
    warmth: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  },
};

export const TYPOGRAPHY = {
  // Headings
  h1: 'text-4xl md:text-5xl font-bold tracking-tight',
  h2: 'text-3xl md:text-4xl font-bold tracking-tight',
  h3: 'text-2xl md:text-3xl font-bold',
  h4: 'text-xl md:text-2xl font-semibold',
  h5: 'text-lg font-semibold',
  h6: 'text-base font-semibold',

  // Body
  body: 'text-base',
  bodySmall: 'text-sm',
  bodyExtraSmall: 'text-xs',

  // Variants
  bold: 'font-bold',
  semibold: 'font-semibold',
  medium: 'font-medium',
  regular: 'font-normal',
};

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
};

export const SHADOWS = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  hover: '0 10px 25px rgba(0, 0, 0, 0.12)',
};

export const BORDER_RADIUS = {
  sm: '6px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
};

export const TRANSITIONS = {
  fast: 'transition-all duration-150 ease-out',
  base: 'transition-all duration-300 ease-out',
  slow: 'transition-all duration-500 ease-out',
};
