import React from 'react';

// Loading skeleton for cards
export const CardSkeleton = ({ count = 1 }) => (
  <>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-slate-800 rounded-xl p-6 border border-slate-700 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="h-3 bg-slate-700 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-slate-700 rounded w-2/3"></div>
      </div>
    ))}
  </>
);

// Loading skeleton for tables
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
    <table className="w-full">
      <thead className="bg-slate-700/50">
        <tr>
          {[...Array(cols)].map((_, i) => (
            <th key={i} className="px-6 py-4">
              <div className="h-3 bg-slate-600 rounded w-20 animate-pulse"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(rows)].map((_, rowIndex) => (
          <tr key={rowIndex} className="border-t border-slate-700">
            {[...Array(cols)].map((_, colIndex) => (
              <td key={colIndex} className="px-6 py-4">
                <div className="h-3 bg-slate-700 rounded w-full animate-pulse"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Loading skeleton for list items
export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-4 animate-pulse">
        <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

// Generic loading spinner
export const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };
  
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-indigo-500 border-t-transparent rounded-full animate-spin`}></div>
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  );
};

// Page loading overlay
export const PageLoader = () => (
  <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
);

export default {
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  LoadingSpinner,
  PageLoader
};
