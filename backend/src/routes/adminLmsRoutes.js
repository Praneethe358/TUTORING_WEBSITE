const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');
const adminLmsController = require('../controllers/adminLmsController');

/**
 * ADMIN LMS ROUTES
 * All routes require admin authentication
 * Base route: /api/lms/admin
 */

// @route   GET /api/lms/admin/dashboard
// @desc    Get LMS overview dashboard (stats, top courses)
// @access  Admin only
router.get('/dashboard', protectAdmin, adminLmsController.getAdminLmsDashboard);

// @route   GET /api/lms/admin/courses
// @desc    Get all LMS courses with enrollment stats (can filter by category/status)
// @access  Admin only
router.get('/courses', protectAdmin, adminLmsController.getAdminCoursesList);

// @route   GET /api/lms/admin/courses/:courseId
// @desc    Get detailed course info with student breakdown
// @access  Admin only
router.get('/courses/:courseId', protectAdmin, adminLmsController.getAdminCourseDetail);

// @route   GET /api/lms/admin/students/:studentId/grades
// @desc    Get student's grades and performance across all courses
// @access  Admin only
router.get('/students/:studentId/grades', protectAdmin, adminLmsController.getStudentGrades);

// @route   GET /api/lms/admin/export/grades
// @desc    Export grades CSV (can filter by courseId)
// @access  Admin only
router.get('/export/grades', protectAdmin, adminLmsController.exportGradesCSV);

// @route   GET /api/lms/admin/export/progress
// @desc    Export student progress CSV (can filter by courseId)
// @access  Admin only
router.get('/export/progress', protectAdmin, adminLmsController.exportProgressCSV);

// @route   GET /api/lms/admin/export/course/:courseId/students
// @desc    Export enrolled students for a course
router.get('/export/course/:courseId/students', protectAdmin, adminLmsController.exportCourseStudentsCSV);

// @route   GET /api/lms/admin/reports
// @desc    Get comprehensive LMS reports (trends, analytics)
// @access  Admin only
router.get('/reports', protectAdmin, adminLmsController.getAdminReports);

// @route   GET /api/lms/admin/enrollment-stats
// @desc    Get enrollment stats summary
// @access  Admin only
router.get('/enrollment-stats', protectAdmin, adminLmsController.getEnrollmentStats);

module.exports = router;
