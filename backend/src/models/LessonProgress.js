const mongoose = require('mongoose');

/**
 * Lesson Progress Model - Track student progress through lessons
 */
const lessonProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'LMSCourse', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  
  // Progress tracking
  completed: { type: Boolean, default: false },
  progress: { type: Number, default: 0 }, // Percentage (0-100)
  
  // Timing
  timeSpent: { type: Number, default: 0 }, // Minutes spent on this lesson
  lastAccessedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  
}, { timestamps: true });

// Compound index to prevent duplicates and improve query performance
lessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
lessonProgressSchema.index({ studentId: 1, courseId: 1 });

module.exports = mongoose.model('LessonProgress', lessonProgressSchema);
