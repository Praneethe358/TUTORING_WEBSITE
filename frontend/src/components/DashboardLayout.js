/**
 * DASHBOARD LAYOUT COMPONENT
 * 
 * Reusable layout wrapper for all dashboard pages
 * - Accepts sidebar component as prop
 * - Provides consistent spacing and structure
 * - Mobile responsive
 */
import NotificationBell from './NotificationBell';

const DashboardLayout = ({ sidebar: Sidebar, children }) => {
  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-64 flex-1">
        {/* Top Header */}
        <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
            <div className="text-slate-200 font-semibold">Dashboard</div>
            <NotificationBell />
          </div>
        </div>
        {/* Page Content */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
