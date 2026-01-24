const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const { protectAny, protectTutor, protectAdmin } = require('../middleware/authMiddleware');

/**
 * AVAILABILITY ROUTES
 * Manages tutor availability and booking slots
 */

// @route   GET /api/availability/schedule/:tutorId
// @route   GET /api/availability/schedule
// @desc    Get tutor weekly schedule
// @access  Public/Private
router.get('/schedule/:tutorId', availabilityController.getWeeklySchedule);
router.get('/schedule', availabilityController.getWeeklySchedule);

// @route   GET /api/availability/:tutorId
// @route   GET /api/availability
// @desc    Get tutor availability slots
// @access  Public (for browsing), Private (for own)
router.get('/:tutorId', availabilityController.getAvailability);
router.get('/', availabilityController.getAvailability);

// @route   POST /api/availability
// @desc    Create availability slot
// @access  Private (Tutor/Admin)
router.post('/', protectAny, availabilityController.createAvailability);

// @route   POST /api/availability/:id/book
// @desc    Book an availability slot
// @access  Private (Student/Admin)
router.post('/:id/book', protectAny, availabilityController.bookSlot);

// @route   PUT /api/availability/:id
// @desc    Update availability slot
// @access  Private (Tutor/Admin)
router.put('/:id', protectAny, availabilityController.updateAvailability);

// @route   DELETE /api/availability/:id
// @desc    Delete availability slot
// @access  Private (Tutor/Admin)
router.delete('/:id', protectAny, availabilityController.deleteAvailability);

module.exports = router;
