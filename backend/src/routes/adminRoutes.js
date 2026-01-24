const express = require('express');
const { body } = require('express-validator');
const {
  login, profile, logout, dashboardStats,
  getTutors, approveTutor, rejectTutor, blockTutor,
  getStudents, deleteUser,
  getBookings, cancelBooking,
  getCourses, approveCourse, rejectCourse,
  getAuditLogs
} = require('../controllers/adminController');
const {
  getPlatformAnalytics,
  getTutorAnalytics,
  getStudentAnalytics,
  getClassTrends
} = require('../controllers/analyticsController');
const { protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Auth (no protection needed)
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], login);

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
router.get('/courses', getCourses);
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/reject', [
  body('reason').optional()
], rejectCourse);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

// Analytics
router.get('/analytics/platform', getPlatformAnalytics);
router.get('/analytics/tutors', getTutorAnalytics);
router.get('/analytics/students', getStudentAnalytics);
router.get('/analytics/trends', getClassTrends);

module.exports = router;
