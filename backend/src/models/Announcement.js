const mongoose = require('mongoose');
const { getIO } = require('../utils/socket');

/**
 * ANNOUNCEMENT MODEL
 * System-wide announcements from admin
 */
const announcementSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  
  // Target audience
  targetRole: { 
    type: String, 
    enum: ['all', 'student', 'tutor', 'admin'],
    default: 'all',
    index: true
  },
  
  // Priority
  priority: { 
    type: String, 
    enum: ['normal', 'urgent'],
    default: 'normal',
    index: true
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  
  // Creator
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin', 
    required: true 
  },
  
  // Publishing
  publishedAt: { type: Date },
  expiresAt: { type: Date },
  
  // Visibility
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isPinned: { 
    type: Boolean, 
    default: false 
  },
  
  // Attachments
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Read tracking
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId },
    role: { type: String, enum: ['student', 'tutor', 'admin'] },
    readAt: { type: Date, default: Date.now }
  }],
  
  // Categories
  category: { 
    type: String, 
    enum: ['general', 'maintenance', 'feature', 'policy', 'event', 'holiday', 'other'],
    default: 'general'
  },
  
  // Metadata
  viewCount: { type: Number, default: 0 }
  
}, { timestamps: true });

// Indexes
announcementSchema.index({ status: 1, publishedAt: -1 });
announcementSchema.index({ targetRole: 1, isActive: 1 });
announcementSchema.index({ expiresAt: 1 });

announcementSchema.post('save', function(doc) {
  try {
    const io = getIO();
    if (io) {
      io.emit('announcement:new', {
        id: doc._id,
        priority: doc.priority,
        targetRole: doc.targetRole,
        status: doc.status,
        createdAt: doc.createdAt
      });
      io.emit('announcements:updated', {});
    }
  } catch (_e) {}
});

announcementSchema.post('updateOne', function() {
  try {
    const io = getIO();
    if (io) io.emit('announcements:updated', {});
  } catch (_e) {}
});

announcementSchema.post('insertMany', function(docs) {
  try {
    const io = getIO();
    if (io) io.emit('announcements:updated', { count: docs?.length || 0 });
  } catch (_e) {}
});

module.exports = mongoose.model('Announcement', announcementSchema);
