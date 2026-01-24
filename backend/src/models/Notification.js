const mongoose = require('mongoose');
const { getIO, getActiveSocketId } = require('../utils/socket');

/**
 * NOTIFICATION MODEL
 * User notifications for various events
 */
const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    index: true 
  },
  recipientRole: { 
    type: String, 
    enum: ['student', 'tutor', 'admin'],
    required: true,
    index: true
  },
  
  // Notification content
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  
  // Type & category
  type: { 
    type: String, 
    enum: [
      'class_scheduled', 
      'class_reminder', 
      'class_cancelled', 
      'class_rescheduled',
      'class_completed',
      'message_received',
      'material_uploaded',
      'attendance_marked',
      'tutor_approved',
      'tutor_rejected',
      'booking_confirmed',
      'payment_received',
      'announcement',
      'system',
      'other'
    ],
    required: true,
    index: true
  },
  
  // Status
  isRead: { 
    type: Boolean, 
    default: false,
    index: true
  },
  readAt: { type: Date },
  
  // Related entities
  relatedClass: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class' 
  },
  relatedUser: { 
    type: mongoose.Schema.Types.ObjectId 
  },
  relatedBooking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking' 
  },
  
  // Action link
  actionUrl: { type: String },
  actionLabel: { type: String },
  
  // Priority
  priority: { 
    type: String, 
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Expiry
  expiresAt: { type: Date },
  
  // Delivery channels
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date }
  }
  
}, { timestamps: true });

// Compound indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Emit socket events on create/update
notificationSchema.post('save', function(doc) {
  try {
    const io = getIO();
    if (io) {
      const receiverSocketId = getActiveSocketId(doc.recipient);
      const payload = {
        recipient: doc.recipient,
        recipientRole: doc.recipientRole,
        type: doc.type,
        id: doc._id,
        createdAt: doc.createdAt
      };
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('notification:new', payload);
      } else {
        io.emit('notification:new', payload);
      }
    }
  } catch (_e) {}
});

notificationSchema.post('updateOne', function() {
  try {
    const io = getIO();
    if (io) io.emit('notifications:updated', {});
  } catch (_e) {}
});

notificationSchema.post('insertMany', function(docs) {
  try {
    const io = getIO();
    if (io) io.emit('notifications:updated', { count: docs?.length || 0 });
  } catch (_e) {}
});

module.exports = mongoose.model('Notification', notificationSchema);
