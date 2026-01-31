import React from 'react';
import DashboardLayout from './DashboardLayout';
import AdminSidebar from './AdminSidebar';
import '../styles/admin-theme.css';

/**
 * Admin Dashboard Layout Wrapper
 * Applies consistent beige/professional theme across all admin pages
 */
const AdminDashboardLayout = ({ children }) => {
  return (
    <DashboardLayout sidebar={AdminSidebar} themeClass="admin-theme">
      {children}
    </DashboardLayout>
  );
};

export default AdminDashboardLayout;
