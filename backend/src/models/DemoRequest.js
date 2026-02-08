const mongoose = require('mongoose');

/**
 * DEMO REQUEST MODEL
 * Stores free demo class requests from visitors (no login required)
 */
const demoRequestSchema = new mongoose.Schema(
  {
    // Student details (collected from form)
    studentName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    classGrade: {
      type: String,
      required: true,
      trim: true
    },
    subjects: {
      type: String,
      required: true,
      trim: true
    },
    preferredTimeSlot: {
      type: String,
      required: true,
      trim: true
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true
    },
    whatsapp: {
      type: String,
      trim: true
    },

    // Admin-managed fields
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'converted', 'rejected'],
      default: 'pending',
      index: true
    },
    assignedTutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tutor'
    },
    scheduledDate: {
      type: Date
    },
    scheduledTime: {
      type: String
    },
    adminNotes: {
      type: String,
      maxlength: 1000
    },

    // Tutor feedback after demo
    tutorFeedback: {
      type: String,
      maxlength: 2000
    },
    demoCompletedAt: {
      type: Date
    },

    // Conversion tracking
    convertedStudentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    convertedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Indexes
demoRequestSchema.index({ contactPhone: 1 });
demoRequestSchema.index({ contactEmail: 1 });
demoRequestSchema.index({ assignedTutor: 1, status: 1 });
demoRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DemoRequest', demoRequestSchema);
