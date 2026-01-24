const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { protectAny, protectAdmin } = require('../middleware/authMiddleware');

/**
 * ANNOUNCEMENT ROUTES
 * System-wide announcements and notifications
 */

// @route   GET /api/announcements/unread/count
// @desc    Get unread announcements count
// @access  Private
router.get('/unread/count', protectAny, announcementController.getUnreadCount);

// @route   GET /api/announcements
// @desc    Get all announcements
// @access  Private
router.get('/', protectAny, announcementController.getAnnouncements);

// @route   GET /api/announcements/:id
// @desc    Get single announcement (marks as read)
// @access  Private
router.get('/:id', protectAny, announcementController.getAnnouncement);

// @route   POST /api/announcements
// @desc    Create new announcement
// @access  Private (Admin only)
router.post('/', protectAdmin, announcementController.createAnnouncement);

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private (Admin only)
router.put('/:id', protectAdmin, announcementController.updateAnnouncement);

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private (Admin only)
router.delete('/:id', protectAdmin, announcementController.deleteAnnouncement);

module.exports = router;
