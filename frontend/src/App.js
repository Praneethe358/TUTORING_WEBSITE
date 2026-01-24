import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AuthLayout from './components/AuthLayout';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import TutorRegister from './pages/TutorRegister';
import TutorLogin from './pages/TutorLogin';
import ProtectedTutorRoute from './components/ProtectedTutorRoute';
import AdminLogin from './pages/AdminLogin';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { AdminProvider } from './context/AdminContext';
import HomePage from './pages/HomePage';
import ModernNavbar from './components/ModernNavbar';
import ModernTutorsList from './pages/ModernTutorsList';
import EnhancedTutorProfile from './pages/EnhancedTutorProfile';
import FavoriteTutors from './pages/FavoriteTutors';
import './styles/modern.css';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentBookings from './pages/StudentBookings';
import StudentMaterials from './pages/StudentMaterials';
import StudentMessages from './pages/StudentMessages';
import StudentSettings from './pages/StudentSettings';
import ClassCalendar from './pages/ClassCalendar';
import AttendanceViewer from './pages/AttendanceViewer';
import Announcements from './pages/Announcements';
import FavoriteTutors from './pages/FavoriteTutors';

// Tutor Pages
import EnhancedTutorDashboard from './pages/EnhancedTutorDashboard';
import TutorProfile from './pages/TutorProfile';
import TutorAvailability from './pages/TutorAvailability';
import TutorCourses from './pages/TutorCourses';
import TutorClasses from './pages/TutorClasses';
import TutorStudents from './pages/TutorStudents';
import TutorMarkAttendance from './pages/TutorMarkAttendance';
import TutorSchedule from './pages/TutorSchedule';
import TutorEarnings from './pages/TutorEarnings';
import TutorMaterials from './pages/TutorMaterials';
import TutorMessages from './pages/TutorMessages';
import TutorSettings from './pages/TutorSettings';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminTutors from './pages/AdminTutors';
import AdminStudents from './pages/AdminStudents';
import AdminBookings from './pages/AdminBookings';
import AdminCourses from './pages/AdminCourses';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminAnalytics from './pages/AdminAnalytics';

import { ThemeProvider } from './context/ThemeContext';

import './index.css';
import './styles/modern.css';

const RedirectIfAuthed = ({ children }) => {
  const { user, role } = useAuth();
  if (user && role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user && role === 'tutor') return <Navigate to="/tutor/dashboard" replace />;
  return children;
};

function App() {
  const router = createBrowserRouter([
    { path: '/', element: <HomePage /> },
    {
      path: '/register',
      element: (
        <RedirectIfAuthed>
          <AuthLayout><Register /></AuthLayout>
        </RedirectIfAuthed>
      )
    },
    {
      path: '/login',
      element: (
        <RedirectIfAuthed>
          <AuthLayout><Login /></AuthLayout>
        </RedirectIfAuthed>
      )
    },
    {
      path: '/forgot-password',
      element: (
        <RedirectIfAuthed>
          <AuthLayout><ForgotPassword /></AuthLayout>
        </RedirectIfAuthed>
      )
    },
    {
      path: '/reset-password',
      element: (
        <RedirectIfAuthed>
          <AuthLayout><ResetPassword /></AuthLayout>
        </RedirectIfAuthed>
      )
    },
    // Student Routes - Protected
    { path: '/student/dashboard', element: <ProtectedRoute><StudentDashboard /></ProtectedRoute> },
    { path: '/student/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
    { path: '/student/bookings', element: <ProtectedRoute><StudentBookings /></ProtectedRoute> },
    { path: '/student/favorites', element: <ProtectedRoute><FavoriteTutors /></ProtectedRoute> },
    { path: '/student/classes', element: <ProtectedRoute><ClassCalendar /></ProtectedRoute> },
    { path: '/student/attendance', element: <ProtectedRoute><AttendanceViewer /></ProtectedRoute> },
    { path: '/student/announcements', element: <ProtectedRoute><Announcements /></ProtectedRoute> },
    { path: '/student/materials', element: <ProtectedRoute><StudentMaterials /></ProtectedRoute> },
    { path: '/student/messages', element: <ProtectedRoute><StudentMessages /></ProtectedRoute> },
    { path: '/student/settings', element: <ProtectedRoute><StudentSettings /></ProtectedRoute> },
    { path: '/announcements', element: <ProtectedRoute><Announcements /></ProtectedRoute> },
    
    // Public Tutor Pages
    { path: '/tutors', element: <ModernTutorsList /> },
    { path: '/tutors/:id', element: <EnhancedTutorProfile /> },
    { path: '/student/favorites', element: <ProtectedRoute><FavoriteTutors /></ProtectedRoute> },
    
    // Tutor Auth Routes
    { path: '/tutor/register', element: <AuthLayout><TutorRegister /></AuthLayout> },
    { path: '/tutor/login', element: <AuthLayout><TutorLogin /></AuthLayout> },
    
    // Tutor Dashboard Routes - Protected
    { path: '/tutor/dashboard', element: <ProtectedTutorRoute><EnhancedTutorDashboard /></ProtectedTutorRoute> },
    { path: '/tutor/profile', element: <ProtectedTutorRoute><TutorProfile /></ProtectedTutorRoute> },
    { path: '/tutor/availability', element: <ProtectedTutorRoute><TutorAvailability /></ProtectedTutorRoute> },
    { path: '/tutor/courses', element: <ProtectedTutorRoute><TutorCourses /></ProtectedTutorRoute> },
    { path: '/tutor/manage-classes', element: <ProtectedTutorRoute><TutorClasses /></ProtectedTutorRoute> },
    { path: '/tutor/students', element: <ProtectedTutorRoute><TutorStudents /></ProtectedTutorRoute> },
    { path: '/tutor/schedule', element: <ProtectedTutorRoute><TutorSchedule /></ProtectedTutorRoute> },
    { path: '/tutor/mark-attendance', element: <ProtectedTutorRoute><TutorMarkAttendance /></ProtectedTutorRoute> },
    { path: '/tutor/earnings', element: <ProtectedTutorRoute><TutorEarnings /></ProtectedTutorRoute> },
    { path: '/tutor/materials', element: <ProtectedTutorRoute><TutorMaterials /></ProtectedTutorRoute> },
    { path: '/tutor/messages', element: <ProtectedTutorRoute><TutorMessages /></ProtectedTutorRoute> },
    { path: '/tutor/settings', element: <ProtectedTutorRoute><TutorSettings /></ProtectedTutorRoute> },
    
    // Admin Routes
    { path: '/admin/login', element: <AuthLayout><AdminLogin /></AuthLayout> },
    { path: '/admin/dashboard', element: <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute> },
    { path: '/admin/tutors', element: <ProtectedAdminRoute><AdminTutors /></ProtectedAdminRoute> },
    { path: '/admin/students', element: <ProtectedAdminRoute><AdminStudents /></ProtectedAdminRoute> },
    { path: '/admin/bookings', element: <ProtectedAdminRoute><AdminBookings /></ProtectedAdminRoute> },
    { path: '/admin/courses', element: <ProtectedAdminRoute><AdminCourses /></ProtectedAdminRoute> },
    { path: '/admin/audit-logs', element: <ProtectedAdminRoute><AdminAuditLogs /></ProtectedAdminRoute> },
    { path: '/admin/announcements', element: <ProtectedAdminRoute><AdminAnnouncements /></ProtectedAdminRoute> },
    { path: '/admin/analytics', element: <ProtectedAdminRoute><AdminAnalytics /></ProtectedAdminRoute> },
    
    { path: '*', element: <Navigate to="/login" replace /> }
  ], {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  });

  return (
    <ThemeProvider>
      <AdminProvider>
        <AuthProvider>
          <ModernNavbar />
          <RouterProvider router={router} />
        </AuthProvider>
      </AdminProvider>
    </ThemeProvider>
  );
}

export default App;
