import React from 'react';
import { SHADOWS, TRANSITIONS } from '../styles/designSystem';

/**
 * Modern Card Component
 * Clean, minimal design with hover effects
 */
export const Card = ({ 
  children, 
  className = '', 
  hover = true,
  noPadding = false,
  ...props 
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700
        ${noPadding ? '' : 'p-6'}
        ${hover ? 'hover:shadow-lg cursor-pointer' : ''}
        ${TRANSITIONS.base}
        ${className}
      `}
      style={{
        boxShadow: SHADOWS.card,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Modern Button Component
 */
export const Button = ({
  children,
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variants = {
    primary: `bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg`,
    secondary: `bg-purple-600 hover:bg-purple-700 text-white`,
    outline: `border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50`,
    ghost: `text-indigo-600 hover:bg-indigo-50`,
  };

  return (
    <button
      disabled={loading || disabled}
      className={`
        font-semibold rounded-lg
        ${sizes[size]}
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${TRANSITIONS.fast}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * Stat Card - For dashboards
 */
export const StatCard = ({
  icon,
  label,
  value,
  change,
  trend, // 'up', 'down', 'neutral'
  className = '',
}) => {
  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full -mr-12 -mt-12 opacity-30" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">{icon}</span>
          {trend && (
            <span className={`text-sm font-semibold ${trendColor[trend]}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {change}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </Card>
  );
};

/**
 * Badge Component
 */
export const Badge = ({
  children,
  variant = 'primary', // primary, secondary, success, warning, error
  size = 'md',
  className = '',
}) => {
  const variants = {
    primary: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs font-medium rounded',
    md: 'px-3 py-1.5 text-sm font-medium rounded-md',
    lg: 'px-4 py-2 text-base font-medium rounded-lg',
  };

  return (
    <span className={`inline-block ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

/**
 * Empty State Component
 */
export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-5xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
};
