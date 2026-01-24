const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protectAny } = require('../middleware/authMiddleware');

/**
 * MESSAGE ROUTES
 * All routes require authentication (student or tutor)
 */

// Get conversations list
router.get('/conversations', protectAny, messageController.getConversations);

// Get conversation with specific user
router.get('/conversation/:userId', protectAny, messageController.getConversation);

// Save message (called after Socket.io sends)
router.post('/send', protectAny, messageController.saveMessage);

// Mark messages as read
router.put('/read/:conversationUserId', protectAny, messageController.markAsRead);

module.exports = router;
