import React from 'react';
import DashboardLayout from './DashboardLayout';
import StudentSidebar from './StudentSidebar';
import '../styles/student-theme.css';

const StudentDashboardLayout = ({ children }) => {
  return (
    <DashboardLayout sidebar={StudentSidebar} themeClass="student-theme">
      {children}
    </DashboardLayout>
  );
};

export default StudentDashboardLayout;
