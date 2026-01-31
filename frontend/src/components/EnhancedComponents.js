import React from 'react';

/**
 * ENHANCED UI COMPONENTS
 * Professional visual depth, typography, and micro-interactions
 */

// Enhanced Card with better shadows and hover effects
export const EnhancedCard = ({ 
  children, 
  className = '', 
  hover = true,
  noPadding = false,
  gradient = false,
  ...props 
}) => {
  return (
    <div
      className={`
        bg-white rounded-xl border border-slate-200
        ${noPadding ? '' : 'p-6'}
        ${hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : 'shadow-lg'}
        ${gradient ? 'bg-gradient-to-br from-white to-slate-50' : ''}
        transition-all duration-300 ease-out
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Enhanced Button with micro-interactions
export const EnhancedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-700',
    ghost: 'text-slate-700 hover:bg-slate-100',
    success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
};

// Enhanced Stat Card
export const EnhancedStatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'indigo',
  description 
}) => {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    blue: 'from-blue-500 to-blue-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{title}</h3>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
      <div className="mb-2">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
      {description && (
        <p className="text-sm text-slate-500">{description}</p>
      )}
      {trend && (
        <div className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          <span>{trend > 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  );
};

// Enhanced Badge
export const EnhancedBadge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '' 
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

// Enhanced Section Header
export const SectionHeader = ({ 
  title, 
  subtitle, 
  action,
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-base text-slate-600">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

// Enhanced Empty State
export const EnhancedEmptyState = ({ 
  icon = '📭', 
  title = 'No items found',
  description,
  action 
}) => {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-6xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-600 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

// Enhanced Input with better focus states
export const EnhancedInput = ({ 
  label, 
  error, 
  icon,
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 ${icon ? 'pl-10' : ''} 
            bg-white border-2 border-slate-200 rounded-lg
            focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
            transition-all duration-200
            text-slate-900 placeholder-slate-400
            disabled:bg-slate-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

// Enhanced Alert
export const EnhancedAlert = ({ 
  type = 'info', 
  title,
  children,
  onClose 
}) => {
  const types = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: '✓',
      iconBg: 'bg-green-600',
      text: 'text-green-800',
      titleColor: 'text-green-900'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: '✗',
      iconBg: 'bg-red-600',
      text: 'text-red-800',
      titleColor: 'text-red-900'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: '⚠',
      iconBg: 'bg-yellow-600',
      text: 'text-yellow-800',
      titleColor: 'text-yellow-900'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'ℹ',
      iconBg: 'bg-blue-600',
      text: 'text-blue-800',
      titleColor: 'text-blue-900'
    }
  };

  const config = types[type];

  return (
    <div className={`${config.bg} border rounded-xl p-4 shadow-sm animate-slideInRight`}>
      <div className="flex items-start gap-3">
        <div className={`${config.iconBg} w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
          {config.icon}
        </div>
        <div className="flex-1">
          {title && (
            <h4 className={`font-bold ${config.titleColor} mb-1`}>{title}</h4>
          )}
          <p className={`text-sm ${config.text}`}>{children}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`${config.text} hover:opacity-70 transition-opacity`}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

const EnhancedComponents = {
  EnhancedCard,
  EnhancedButton,
  EnhancedStatCard,
  EnhancedBadge,
  SectionHeader,
  EnhancedEmptyState,
  EnhancedInput,
  EnhancedAlert
};

export default EnhancedComponents;
