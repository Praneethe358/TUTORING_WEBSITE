const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protectAny, protectAdmin } = require('../middleware/authMiddleware');

/**
 * ATTENDANCE ROUTES
 * Manages class attendance and progress tracking
 */

// @route   GET /api/attendance
// @desc    Get attendance records
// @access  Private
router.get('/', protectAny, attendanceController.getAttendance);

// @route   GET /api/attendance/stats/:studentId
// @route   GET /api/attendance/stats
// @desc    Get attendance statistics
// @access  Private
router.get('/stats/:studentId', attendanceController.getAttendanceStats);
router.get('/stats', attendanceController.getAttendanceStats);

// @route   GET /api/attendance/:id
// @desc    Get single attendance record
// @access  Private
router.get('/:id', protectAny, attendanceController.getAttendanceById);

// @route   POST /api/attendance
// @desc    Mark attendance for a class
// @access  Private (Tutor/Admin)
router.post('/', protectAny, attendanceController.markAttendance);

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private (Tutor/Admin)
router.put('/:id', protectAny, attendanceController.updateAttendance);

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private (Admin only)
router.delete('/:id', protectAdmin, attendanceController.deleteAttendance);

module.exports = router;
