const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { protectAny, protectStudent, protectTutor, protectAdmin } = require('../middleware/authMiddleware');

/**
 * CLASS ROUTES
 * Manages tutoring class scheduling and management
 */

// @route   GET /api/classes
// @desc    Get all classes for current user
// @access  Private
router.get('/', protectAny, classController.getClasses);

// @route   GET /api/classes/stats
// @desc    Get class statistics
// @access  Private
router.get('/stats', protectAny, classController.getClassStats);

// @route   GET /api/classes/:id
// @desc    Get single class details
// @access  Private
router.get('/:id', protectAny, classController.getClass);

// @route   POST /api/classes
// @desc    Create/schedule new class
// @access  Private (Student/Tutor/Admin)
router.post('/', protectAny, classController.createClass);

// @route   PUT /api/classes/:id
// @desc    Update class details or reschedule
// @access  Private (Student/Tutor/Admin)
router.put('/:id', protectAny, classController.updateClass);

// @route   DELETE /api/classes/:id
// @desc    Cancel class
// @access  Private (Student/Tutor/Admin)
router.delete('/:id', protectAny, classController.cancelClass);

module.exports = router;
