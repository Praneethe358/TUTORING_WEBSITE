const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const Admin = require('../models/Admin');

/**
 * ANNOUNCEMENT CONTROLLER
 * Manages system-wide announcements
 */

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = async (req, res) => {
  try {
    const { status, targetRole, priority, category, limit = 20 } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    } else {
      query.status = 'published'; // Default to published only
    }
    
    // Filter by target role
    if (targetRole) {
      query.targetRole = { $in: [targetRole, 'all'] };
    } else {
      query.targetRole = { $in: [req.user.role, 'all'] };
    }
    
    // Additional filters
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    // Only show active and non-expired
    query.isActive = true;
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gte: new Date() } }
    ];
    
    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email')
      .sort({ isPinned: -1, publishedAt: -1, createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
exports.getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }
    
    // Increment view count
    announcement.viewCount += 1;
    
    // Mark as read for current user
    const userId = req.user.id || req.user._id;
    const alreadyRead = announcement.readBy.some(
      r => r.user.toString() === userId.toString()
    );
    
    if (!alreadyRead) {
      announcement.readBy.push({
        user: userId,
        role: req.user.role,
        readAt: new Date()
      });
    }
    
    await announcement.save();
    
    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin only)
exports.createAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can create announcements' 
      });
    }
    
    const {
      title,
      content,
      targetRole,
      priority,
      category,
      expiresAt,
      isPinned,
      attachments,
      publishNow
    } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and content are required' 
      });
    }
    
    const announcement = await Announcement.create({
      title,
      content,
      targetRole: targetRole || 'all',
      priority: priority || 'medium',
      category: category || 'general',
      createdBy: req.user.id,
      status: publishNow ? 'published' : 'draft',
      publishedAt: publishNow ? new Date() : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isPinned: isPinned || false,
      isActive: true,
      attachments: attachments || []
    });
    
    // If publishing now and priority is high/urgent, create notifications
    if (publishNow && (priority === 'high' || priority === 'urgent')) {
      const roles = targetRole === 'all' ? ['student', 'tutor', 'admin'] : [targetRole];
      
      for (const role of roles) {
        let Model;
        if (role === 'student') Model = Student;
        else if (role === 'tutor') Model = Tutor;
        else if (role === 'admin') Model = Admin;
        
        const users = await Model.find({ isActive: true }).select('_id');
        
        const notifications = users.map(user => ({
          recipient: user._id,
          recipientRole: role,
          title: `New Announcement: ${title}`,
          message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          type: 'announcement',
          priority: priority,
          actionUrl: `/announcements/${announcement._id}`,
          actionLabel: 'View Announcement'
        }));
        
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      }
    }
    
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: populatedAnnouncement
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin only)
exports.updateAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can update announcements' 
      });
    }
    
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }
    
    const {
      title,
      content,
      targetRole,
      priority,
      category,
      status,
      expiresAt,
      isPinned,
      isActive
    } = req.body;
    
    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (targetRole) announcement.targetRole = targetRole;
    if (priority) announcement.priority = priority;
    if (category) announcement.category = category;
    if (expiresAt !== undefined) announcement.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isPinned !== undefined) announcement.isPinned = isPinned;
    if (isActive !== undefined) announcement.isActive = isActive;
    
    if (status) {
      announcement.status = status;
      if (status === 'published' && !announcement.publishedAt) {
        announcement.publishedAt = new Date();
      }
    }
    
    await announcement.save();
    
    const updatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name email');
    
    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: updatedAnnouncement
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can delete announcements' 
      });
    }
    
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }
    
    await announcement.deleteOne();
    
    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get unread announcements count
// @route   GET /api/announcements/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const count = await Announcement.countDocuments({
      status: 'published',
      isActive: true,
      targetRole: { $in: [req.user.role, 'all'] },
      'readBy.user': { $ne: userId },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gte: new Date() } }
      ]
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

module.exports = exports;
