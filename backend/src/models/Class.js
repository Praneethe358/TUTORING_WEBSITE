const mongoose = require('mongoose');

/**
 * CLASS MODEL
 * Represents scheduled tutoring sessions
 */
const classSchema = new mongoose.Schema({
  tutor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tutor', 
    required: true,
    index: true 
  },
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student',
    index: true 
  }],
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student',
    index: true 
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course',
    index: true 
  },
  
  // Scheduling
  scheduledAt: { 
    type: Date, 
    required: true,
    index: true 
  },
  duration: { 
    type: Number, 
    required: true, 
    default: 60 // minutes
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'rescheduled'], 
    default: 'scheduled',
    index: true
  },
  
  // Meeting details
  meetingLink: { type: String },
  meetingPlatform: { 
    type: String, 
    enum: ['zoom', 'meet', 'teams', 'other'],
    default: 'meet'
  },
  googleEventId: { type: String }, // Store Google Calendar event ID for updates/deletion
  
  // Recurring class settings
  isRecurring: { type: Boolean, default: false },
  recurrencePattern: {
    frequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly'] 
    },
    interval: { type: Number, default: 1 },
    endDate: { type: Date }
  },
  parentClassId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class' 
  },
  
  // Cancellation & rescheduling
  cancelledBy: { 
    type: String, 
    enum: ['student', 'tutor', 'admin'] 
  },
  cancellationReason: { type: String },
  cancelledAt: { type: Date },
  
  rescheduledFrom: { type: Date },
  rescheduledReason: { type: String },
  
  // Class content
  topic: { type: String, required: true },
  description: { type: String },
  
  // Resources
  materials: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Material' 
  }],
  recordingLink: { type: String },
  notes: { type: String },
  
  // Tutor remarks
  tutorRemarks: { type: String },
  completedAt: { type: Date },
  
  // Metadata
  timezone: { type: String, default: 'UTC' },
  notificationsSent: { type: Boolean, default: false }
  
}, { timestamps: true });

// Compound indexes for efficient queries
classSchema.index({ tutor: 1, scheduledAt: 1 });
classSchema.index({ student: 1, scheduledAt: 1 });
classSchema.index({ status: 1, scheduledAt: 1 });

// Virtual for duration in hours
classSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

module.exports = mongoose.model('Class', classSchema);
