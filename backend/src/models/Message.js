const mongoose = require('mongoose');

/**
 * MESSAGE SCHEMA
 * Stores real-time chat messages between students and tutors
 */
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    senderType: {
      type: String,
      enum: ['student', 'tutor'],
      required: true
    },
    receiverType: {
      type: String,
      enum: ['student', 'tutor'],
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Index for faster queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
