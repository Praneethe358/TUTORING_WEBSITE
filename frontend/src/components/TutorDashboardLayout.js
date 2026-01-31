import React from 'react';
import DashboardLayout from './DashboardLayout';
import TutorSidebar from './TutorSidebar';
import '../styles/tutor-theme.css';

// Wrapper to apply the tutor beige/brown theme across all tutor-auth pages
const TutorDashboardLayout = ({ children }) => {
  return (
    <DashboardLayout sidebar={TutorSidebar} themeClass="tutor-theme">
      {children}
    </DashboardLayout>
  );
};

export default TutorDashboardLayout;
