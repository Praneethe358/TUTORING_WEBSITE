const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protectAny } = require('../middleware/authMiddleware');

/**
 * NOTIFICATION ROUTES
 * User notification management
 */

// @route   GET /api/notifications/unread/count
// @desc    Get unread notification count
// @access  Private
router.get('/unread/count', protectAny, notificationController.getUnreadCount);

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', protectAny, notificationController.getNotifications);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protectAny, notificationController.markAllAsRead);

// @route   DELETE /api/notifications/read
// @desc    Delete all read notifications
// @access  Private
router.delete('/read', protectAny, notificationController.deleteAllRead);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protectAny, notificationController.markAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', protectAny, notificationController.deleteNotification);

module.exports = router;
