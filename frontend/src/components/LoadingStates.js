import React from 'react';

/**
 * PROFESSIONAL LOADING STATES
 * Skeleton loaders and spinners for better UX
 */

// Spinner Component
export const Spinner = ({ size = 'md', color = 'indigo' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };

  const colors = {
    indigo: 'border-indigo-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    purple: 'border-purple-600 border-t-transparent',
    gray: 'border-gray-400 border-t-transparent'
  };

  return (
    <div
      className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
};

// Full Page Loader
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <Spinner size="xl" color="indigo" />
        <p className="mt-4 text-lg font-medium text-slate-600">{message}</p>
      </div>
    </div>
  );
};

// Card Skeleton
export const CardSkeleton = ({ lines = 3 }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse shadow-sm hover:shadow-md transition-all duration-300">
      <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 rounded w-full mb-3"></div>
      ))}
      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
    </div>
  );
};

// Stat Card Skeleton
export const StatCardSkeleton = () => {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 p-6 animate-pulse shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 bg-slate-200 rounded w-1/2"></div>
        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
      </div>
      <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
      <div className="h-3 bg-slate-200 rounded w-3/4"></div>
    </div>
  );
};

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 4 }) => {
  return (
    <tr className="animate-pulse border-b border-slate-200">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
};

// List Item Skeleton
export const ListItemSkeleton = () => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200 animate-pulse shadow-sm">
      <div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-5 bg-slate-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
      <div className="h-8 w-20 bg-slate-200 rounded"></div>
    </div>
  );
};

// Dashboard Grid Skeleton
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Content Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <CardSkeleton key={i} lines={4} />
        ))}
      </div>
    </div>
  );
};

// Inline Loader (for buttons)
export const InlineLoader = ({ size = 'sm' }) => {
  return (
    <div className="flex items-center gap-2">
      <Spinner size={size} color="white" />
      <span>Loading...</span>
    </div>
  );
};

// Content Shimmer Effect
export const Shimmer = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
    </div>
  );
};

// Pulse Loader (for empty states)
export const PulseLoader = ({ dots = 3 }) => {
  return (
    <div className="flex items-center gap-2">
      {[...Array(dots)].map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        ></div>
      ))}
    </div>
  );
};

const LoadingStates = {
  Spinner,
  PageLoader,
  CardSkeleton,
  StatCardSkeleton,
  TableRowSkeleton,
  ListItemSkeleton,
  DashboardSkeleton,
  InlineLoader,
  Shimmer,
  PulseLoader
};

export default LoadingStates;
