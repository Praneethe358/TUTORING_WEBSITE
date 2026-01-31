const express = require('express');
const router = express.Router();
const { protectStudent } = require('../middleware/authMiddleware');
const studentLmsController = require('../controllers/studentLmsController');

/**
 * STUDENT LMS ROUTES
 * All routes require student authentication
 * Base route: /api/lms/student
 */

// @route   GET /api/lms/student/dashboard
// @desc    Get student LMS dashboard (all enrolled courses)
// @access  Student only
router.get('/dashboard', protectStudent, studentLmsController.getStudentDashboard);

// @route   GET /api/lms/student/resume
// @desc    Get resume point (last viewed lesson)
// @access  Student only
router.get('/resume', protectStudent, studentLmsController.getResumPoint);

// @route   GET /api/lms/student/assignments
// @desc    Get student's assignments (can filter by course)
// @access  Student only
router.get('/assignments', protectStudent, studentLmsController.getStudentAssignments);

// @route   GET /api/lms/student/quizzes
// @desc    Get student's quizzes (can filter by course)
// @access  Student only
router.get('/quizzes', protectStudent, studentLmsController.getStudentQuizzes);

// @route   GET /api/lms/student/certificates
// @desc    Get student's earned certificates
// @access  Student only
router.get('/certificates', protectStudent, studentLmsController.getStudentCertificates);

// @route   GET /api/lms/student/courses/:courseId/player
// @desc    Get course player data (modules, lessons, progress)
// @access  Student only (enrollment verified)
router.get('/courses/:courseId/player', protectStudent, studentLmsController.getCoursePlayer);

// @route   POST /api/lms/student/lessons/:lessonId/complete
// @desc    Mark lesson as complete, update progress, auto-complete course if all lessons done
// @access  Student only
router.post('/lessons/:lessonId/complete', protectStudent, studentLmsController.completeLesson);

module.exports = router;
