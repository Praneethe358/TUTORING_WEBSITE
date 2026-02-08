const express = require('express');
const { body } = require('express-validator');
const {
  login, profile, logout, dashboardStats,
  getTutors, approveTutor, rejectTutor, blockTutor,
  getStudents, deleteUser,
  getBookings, cancelBooking,
  getCourses, approveCourse, rejectCourse,
  getAuditLogs,
  getSettings, updateSettings,
  exportTutorsCSV,
  exportStudentsCSV,
  exportEnrollmentsCSV
} = require('../controllers/adminController');
const {
  getPlatformAnalytics,
  getTutorAnalytics,
  getStudentAnalytics,
  getClassTrends,
  exportAnalyticsReport
} = require('../controllers/analyticsController');
const {
  getAssignments,
  createAssignment,
  bulkCreateAssignments,
  updateAssignment,
  deleteAssignment
} = require('../controllers/tutorAssignmentController');
const {
  getAllDemoRequests,
  updateDemoRequest,
  convertToStudent,
  deleteDemoRequest
} = require('../controllers/demoRequestController');
const { protectAdmin } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

// Auth (no protection needed)
router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], login);

// Public endpoints (no admin auth)
// Make courses listing publicly accessible (read-only)
router.get('/courses', getCourses);

// Protected routes
router.use(protectAdmin);

router.post('/logout', logout);
router.get('/profile', profile);

// Dashboard
router.get('/dashboard-stats', dashboardStats);

// Tutors
router.get('/tutors', getTutors);
router.put('/tutors/:id/approve', approveTutor);
router.put('/tutors/:id/reject', [
  body('reason').optional()
], rejectTutor);
router.put('/tutors/:id/block', [
  body('reason').optional()
], blockTutor);

// Students
router.get('/students', getStudents);

// Users
router.delete('/users/:type/:id', deleteUser);

// Bookings
router.get('/bookings', getBookings);
router.put('/bookings/:id/cancel', [
  body('reason').optional()
], cancelBooking);

// Courses
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/reject', [
  body('reason').optional()
], rejectCourse);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

// Export CSV
router.get('/export/tutors', exportTutorsCSV);
router.get('/export/students', exportStudentsCSV);
router.get('/export/enrollments', exportEnrollmentsCSV);
router.get('/export/analytics-report', exportAnalyticsReport);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Analytics
router.get('/analytics/platform', getPlatformAnalytics);
router.get('/analytics/tutors', getTutorAnalytics);
router.get('/analytics/students', getStudentAnalytics);
router.get('/analytics/trends', getClassTrends);

// Tutor-Student Assignments (Admin-controlled)
router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);
router.post('/assignments/bulk', bulkCreateAssignments);
router.put('/assignments/:id', updateAssignment);
router.delete('/assignments/:id', deleteAssignment);

// Demo Requests
router.get('/demo-requests', getAllDemoRequests);
router.put('/demo-requests/:id', updateDemoRequest);
router.post('/demo-requests/:id/convert', convertToStudent);
router.delete('/demo-requests/:id', deleteDemoRequest);

module.exports = router;
