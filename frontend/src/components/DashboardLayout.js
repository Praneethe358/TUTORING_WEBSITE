/**
 * DASHBOARD LAYOUT COMPONENT
 * Coursera-style light, airy layout for all dashboard pages
 * Mobile responsive with hamburger menu
 */
import { useState } from 'react';
import NotificationBell from './NotificationBell';
import { colors, spacing, typography, shadows } from '../theme/designSystem';
import Logo from './Logo';

const DashboardLayout = ({ sidebar: Sidebar, children, themeClass = '' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className={themeClass}
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: colors.bgSecondary,
        fontFamily: typography.fontFamily.base,
        overflow: 'hidden',
      }}
    >
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 45,
          }}
          className="block md:hidden"
        />
      )}

      {/* Sidebar - Desktop (always visible) */}
      <div className="hidden md:block" style={{ width: 260, flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Sidebar - Mobile (toggleable) */}
      <div
        className="block md:hidden"
        style={{
          width: 260,
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 50,
        }}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} className="w-full">
        {/* Top Header */}
        <div
          className="dashboard-header"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backgroundColor: colors.white,
            boxShadow: shadows.md,
            borderBottom: `1px solid ${colors.gray200}`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            className="dashboard-header-inner"
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: `${spacing.md} ${spacing.lg}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.md,
            }}
          >
            <div className="dashboard-header-brand" style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
              {/* Hamburger Menu - Mobile Only */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-black p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Toggle menu"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </button>
              {/* Brand Logo */}
              <Logo size={56} withText={true} />
            </div>
            <NotificationBell />
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="p-4 md:p-8">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
