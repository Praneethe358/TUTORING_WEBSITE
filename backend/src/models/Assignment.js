const mongoose = require('mongoose');

/**
 * Assignment Model - Course assignments
 */
const assignmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'LMSCourse', required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  
  // Assignment file (PDF/Doc)
  attachmentUrl: { type: String },
  
  // Deadline
  deadline: { type: Date, required: true },
  
  // Points/Grade
  maxScore: { type: Number, default: 100 },
  
  // Instructor
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  
}, { timestamps: true });

// Index
assignmentSchema.index({ courseId: 1 });
assignmentSchema.index({ moduleId: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
