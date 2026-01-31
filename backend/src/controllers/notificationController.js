const Notification = require('../models/Notification');

/**
 * NOTIFICATION CONTROLLER
 * Manages user notifications
 */

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { isRead, type, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = {
      recipient: userId,
      recipientRole: req.user.role
    };
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    
    if (type) {
      query.type = type;
    }
    
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate('relatedClass', 'topic scheduledAt')
        .populate('relatedUser', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      count: notifications.length,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const count = await Notification.countDocuments({
      recipient: userId,
      recipientRole: req.user.role,
      isRead: false
    });
    
    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }
    
    const userId = req.user.id || req.user._id;
    if (notification.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const result = await Notification.updateMany(
      { 
        recipient: userId, 
        recipientRole: req.user.role,
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }
    
    const userId = req.user.id || req.user._id;
    if (notification.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    await notification.deleteOne();
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/read
// @access  Private
exports.deleteAllRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const result = await Notification.deleteMany({
      recipient: userId,
      recipientRole: req.user.role,
      isRead: true
    });
    
    res.json({
      success: true,
      message: `${result.deletedCount} notifications deleted`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

module.exports = exports;
