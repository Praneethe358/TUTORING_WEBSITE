const mongoose = require('mongoose');

/**
 * Course Enrollment Model - Track student enrollment and overall progress
 */
const courseEnrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'LMSCourse', required: true },
  
  // Progress tracking
  progress: { type: Number, default: 0 }, // Overall course progress percentage
  completedLessons: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  
  // Current lesson (for resume functionality)
  lastLessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  
  // Tracking
  lastActivityAt: { type: Date }, // Last time student accessed course
  completionTime: { type: Number }, // Time to complete course in hours
  certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' }, // Auto-issued on completion
  
  // Status
  status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
  
  // Timestamps
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  
}, { timestamps: true });

// Compound index
courseEnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
courseEnrollmentSchema.index({ courseId: 1, status: 1 });

module.exports = mongoose.model('CourseEnrollment', courseEnrollmentSchema);
