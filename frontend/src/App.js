import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import StudentTutorAvailability from './pages/StudentTutorAvailability';
import AdminTutorAvailability from './pages/AdminTutorAvailability';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AuthLayout from './components/AuthLayout';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import TutorRegister from './pages/TutorRegister';
import TutorLogin from './pages/TutorLogin';
import ProtectedTutorRoute from './components/ProtectedTutorRoute';
import AdminLogin from './pages/AdminLogin';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { AdminProvider } from './context/AdminContext';
import AttractiveHomePage from './pages/AttractiveHomePage';
import ModernNavbar from './components/ModernNavbar';
import ModernTutorsList from './pages/ModernTutorsList';
import EnhancedTutorProfile from './pages/EnhancedTutorProfile';

import './styles/modern.css';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentMaterials from './pages/StudentMaterials';
import StudentMessages from './pages/StudentMessages';
import StudentSettings from './pages/StudentSettings';
import TutorsAvailability from './pages/TutorsAvailability';
import StudentCourseCatalog from './pages/StudentCourseCatalog';
import ClassCalendar from './pages/ClassCalendar';
import AttendanceViewer from './pages/AttendanceViewer';
import Announcements from './pages/Announcements';
import FavoriteTutors from './pages/FavoriteTutors';


import TutorDashboardLayout from './components/TutorDashboardLayout';
// Tutor Pages
import EnhancedTutorDashboard from './pages/EnhancedTutorDashboard';
import TutorProfile from './pages/TutorProfile';
import TutorAvailability from './pages/TutorAvailability';
import TutorCourses from './pages/TutorCourses';
import TutorClasses from './pages/TutorClasses';
import TutorMarkAttendance from './pages/TutorMarkAttendance';
import TutorSchedule from './pages/TutorSchedule';
import TutorEarnings from './pages/TutorEarnings';
import TutorMaterials from './pages/TutorMaterials';
import TutorMessages from './pages/TutorMessages';
import TutorSettings from './pages/TutorSettings';
import TutorLmsCourses from './pages/TutorLmsCourses';
import TutorLmsCourseEdit from './pages/TutorLmsCourseEdit';
import TutorLmsModules from './pages/TutorLmsModules';
import TutorLmsAssignments from './pages/TutorLmsAssignments';
import TutorLmsQuizzes from './pages/TutorLmsQuizzes';
import TutorLmsGrading from './pages/TutorLmsGrading';

// Student LMS Pages - NEW
import StudentLmsDashboard from './pages/StudentLmsDashboard';
import StudentCoursePlayer from './pages/StudentCoursePlayer';
import StudentAssignmentsAll from './pages/StudentAssignmentsAll';
import StudentQuizzesAll from './pages/StudentQuizzesAll';
import StudentCertificates from './pages/StudentCertificates';
import StudentDiscussions from './pages/StudentDiscussions';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminTutors from './pages/AdminTutors';
import AdminTutorCVs from './pages/AdminTutorCVs';
import AdminStudents from './pages/AdminStudents';
import AdminCourses from './pages/AdminCourses';
import AdminEnrollments from './pages/AdminEnrollments';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminAnalytics from './pages/AdminAnalytics';

import AdminAssignments from './pages/AdminAssignments';
import AdminDemoRequests from './pages/AdminDemoRequests';
import StudentMyTutors from './pages/StudentMyTutors';

// Admin LMS Pages - NEW
import AdminLmsDashboard from './pages/AdminLmsDashboard';
import AdminLmsCoursesMonitor from './pages/AdminLmsCoursesMonitor';
import AdminLmsCourseDetail from './pages/AdminLmsCourseDetail';
import AdminLmsGrades from './pages/AdminLmsGrades';
import AdminLmsReports from './pages/AdminLmsReports';
import AdminPasswordResetRequests from './pages/AdminPasswordResetRequests';

import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import './index.css';
import './styles/modern.css';

const RedirectIfAuthed = ({ children }) => {
  const { user, role } = useAuth();
  if (user && role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user && role === 'tutor') return <Navigate to="/tutor/dashboard" replace />;
  return children;
};

// Main Layout with Navbar
const MainLayout = ({ children }) => {
  return (
    <>
      <ModernNavbar />
      {children}
    </>
  );
};

function App() {
  const router = createBrowserRouter([
    { path: '/', element: <AttractiveHomePage /> },
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
    { path: '/student/tutors-availability', element: <ProtectedRoute><TutorsAvailability /></ProtectedRoute> },
    { path: '/student/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
    { path: '/student/favorites', element: <ProtectedRoute><FavoriteTutors /></ProtectedRoute> },
    { path: '/student/classes', element: <ProtectedRoute><ClassCalendar /></ProtectedRoute> },
    { path: '/student/attendance', element: <ProtectedRoute><AttendanceViewer /></ProtectedRoute> },
    { path: '/student/announcements', element: <ProtectedRoute><Announcements /></ProtectedRoute> },
    { path: '/student/materials', element: <ProtectedRoute><StudentMaterials /></ProtectedRoute> },
    { path: '/student/messages', element: <ProtectedRoute><StudentMessages /></ProtectedRoute> },
    { path: '/student/settings', element: <ProtectedRoute><StudentSettings /></ProtectedRoute> },
    { path: '/student/courses', element: <ProtectedRoute><StudentCourseCatalog /></ProtectedRoute> },
    { path: '/student/browse-tutors', element: <ProtectedRoute><StudentTutorAvailability /></ProtectedRoute> },
    { path: '/student/my-tutors', element: <ProtectedRoute><StudentMyTutors /></ProtectedRoute> },
    { path: '/announcements', element: <ProtectedRoute><Announcements /></ProtectedRoute> },
    
    // Student LMS Routes - NEW
    { path: '/student/lms/dashboard', element: <ProtectedRoute><StudentLmsDashboard /></ProtectedRoute> },
    { path: '/student/lms/player/:courseId', element: <ProtectedRoute><StudentCoursePlayer /></ProtectedRoute> },
    { path: '/student/lms/assignments', element: <ProtectedRoute><StudentAssignmentsAll /></ProtectedRoute> },
    { path: '/student/lms/quizzes', element: <ProtectedRoute><StudentQuizzesAll /></ProtectedRoute> },
    { path: '/student/lms/certificates', element: <ProtectedRoute><StudentCertificates /></ProtectedRoute> },
    { path: '/student/lms/discussions/:courseId', element: <ProtectedRoute><StudentDiscussions /></ProtectedRoute> },
    
    // Public Tutor Pages
    { path: '/tutors', element: <MainLayout><ModernTutorsList /></MainLayout> },
    { path: '/tutors/:id', element: <MainLayout><EnhancedTutorProfile /></MainLayout> },
    { path: '/student/favorites', element: <ProtectedRoute><FavoriteTutors /></ProtectedRoute> },
    
    // Tutor Auth Routes
    { path: '/tutor/register', element: <AuthLayout><TutorRegister /></AuthLayout> },
    { path: '/tutor/login', element: <AuthLayout><TutorLogin /></AuthLayout> },
    
    // Email Verification Route (public)
    { path: '/verify-email', element: <VerifyEmail /> },
    
    // Tutor Dashboard Routes - Protected
    { path: '/tutor/dashboard', element: <ProtectedTutorRoute><TutorDashboardLayout><EnhancedTutorDashboard /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/profile', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorProfile /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/availability', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorAvailability /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/courses', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorCourses /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/manage-classes', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorClasses /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/schedule', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorSchedule /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/mark-attendance', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorMarkAttendance /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/earnings', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorEarnings /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/materials', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorMaterials /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/messages', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorMessages /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/settings', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorSettings /></TutorDashboardLayout></ProtectedTutorRoute> },
    // LMS Routes - NEW
    { path: '/tutor/lms/courses', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorLmsCourses /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/lms/courses/:courseId/edit', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorLmsCourseEdit /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/lms/courses/:courseId/modules', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorLmsModules /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/lms/courses/:courseId/assignments', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorLmsAssignments /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/lms/courses/:courseId/quizzes', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorLmsQuizzes /></TutorDashboardLayout></ProtectedTutorRoute> },
    { path: '/tutor/lms/courses/:courseId/grading', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorLmsGrading /></TutorDashboardLayout></ProtectedTutorRoute> },
    
    // Admin Routes
    { path: '/admin/login', element: <AuthLayout><AdminLogin /></AuthLayout> },
    { path: '/admin/dashboard', element: <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute> },
    { path: '/admin/tutors', element: <ProtectedAdminRoute><AdminTutors /></ProtectedAdminRoute> },
    { path: '/admin/tutor-cvs', element: <ProtectedAdminRoute><AdminTutorCVs /></ProtectedAdminRoute> },
    { path: '/admin/students', element: <ProtectedAdminRoute><AdminStudents /></ProtectedAdminRoute> },
    { path: '/admin/enrollments', element: <ProtectedAdminRoute><AdminEnrollments /></ProtectedAdminRoute> },
    { path: '/admin/audit-logs', element: <ProtectedAdminRoute><AdminAuditLogs /></ProtectedAdminRoute> },
    { path: '/admin/announcements', element: <ProtectedAdminRoute><AdminAnnouncements /></ProtectedAdminRoute> },
    { path: '/admin/courses', element: <ProtectedAdminRoute><AdminCourses /></ProtectedAdminRoute> },
    { path: '/admin/analytics', element: <ProtectedAdminRoute><AdminAnalytics /></ProtectedAdminRoute> },

    { path: '/admin/tutor-availability', element: <ProtectedAdminRoute><AdminTutorAvailability /></ProtectedAdminRoute> },
    { path: '/admin/assignments', element: <ProtectedAdminRoute><AdminAssignments /></ProtectedAdminRoute> },
    { path: '/admin/demo-requests', element: <ProtectedAdminRoute><AdminDemoRequests /></ProtectedAdminRoute> },
    
    // Admin LMS Routes - NEW
    { path: '/admin/lms/dashboard', element: <ProtectedAdminRoute><AdminLmsDashboard /></ProtectedAdminRoute> },
    { path: '/admin/lms/courses', element: <ProtectedAdminRoute><AdminLmsCoursesMonitor /></ProtectedAdminRoute> },
    { path: '/admin/lms/courses/:courseId', element: <ProtectedAdminRoute><AdminLmsCourseDetail /></ProtectedAdminRoute> },
    { path: '/admin/lms/grades', element: <ProtectedAdminRoute><AdminLmsGrades /></ProtectedAdminRoute> },
    { path: '/admin/lms/reports', element: <ProtectedAdminRoute><AdminLmsReports /></ProtectedAdminRoute> },
    
    // Admin Password Reset Requests
    { path: '/admin/password-reset-requests', element: <ProtectedAdminRoute><AdminPasswordResetRequests /></ProtectedAdminRoute> },
    
    { path: '*', element: <Navigate to="/login" replace /> }
  ], {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  });

  return (
    <HelmetProvider>
      <ThemeProvider>
        <ToastProvider>
          <AdminProvider>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </AdminProvider>
        </ToastProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;



