const mongoose = require('mongoose');

/**
 * ATTENDANCE MODEL
 * Tracks class attendance and progress
 */
const attendanceSchema = new mongoose.Schema({
  class: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true,
    index: true 
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true,
    index: true 
  },
  tutor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tutor', 
    required: true,
    index: true 
  },
  
  // Attendance status
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'excused'], 
    required: true,
    default: 'present',
    index: true
  },
  
  // Timing
  markedAt: { 
    type: Date, 
    default: Date.now 
  },
  markedBy: { 
    type: String, 
    enum: ['tutor', 'student', 'admin', 'system'],
    default: 'tutor'
  },
  
  // Late arrival
  arrivalTime: { type: Date },
  minutesLate: { type: Number, default: 0 },
  
  // Progress tracking
  participationLevel: { 
    type: String, 
    enum: ['excellent', 'good', 'average', 'poor', 'none'],
    default: 'good'
  },
  
  // Tutor feedback
  tutorRemarks: { type: String },
  topicsCovered: [{ type: String }],
  homeworkAssigned: { type: String },
  
  // Performance ratings (1-5)
  attentiveness: { type: Number, min: 1, max: 5 },
  understanding: { type: Number, min: 1, max: 5 },
  preparation: { type: Number, min: 1, max: 5 },
  
  // Student notes
  studentNotes: { type: String },
  studentFeedback: { type: String },
  
  // Admin notes
  adminNotes: { type: String },
  
  // Metadata
  duration: { type: Number }, // Actual duration in minutes
  isVerified: { type: Boolean, default: false },
  verifiedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  },
  verifiedAt: { type: Date }
  
}, { timestamps: true });

// Compound indexes
attendanceSchema.index({ class: 1, student: 1 }, { unique: true });
attendanceSchema.index({ student: 1, status: 1 });
attendanceSchema.index({ tutor: 1, createdAt: -1 });

// Virtual for overall rating
attendanceSchema.virtual('overallRating').get(function() {
  if (!this.attentiveness || !this.understanding || !this.preparation) {
    return null;
  }
  return ((this.attentiveness + this.understanding + this.preparation) / 3).toFixed(1);
});

module.exports = mongoose.model('Attendance', attendanceSchema);
