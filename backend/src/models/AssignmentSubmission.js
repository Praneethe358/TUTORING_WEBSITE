const mongoose = require('mongoose');

/**
 * Assignment Submission Model - Student submissions
 */
const assignmentSubmissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  
  // Submission file
  submissionUrl: { type: String, required: true },
  
  // Submission text (optional)
  submissionText: { type: String },
  
  // Grading
  score: { type: Number },
  feedback: { type: String },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' },
  gradedAt: { type: Date },
  
  // Status
  status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
  
}, { timestamps: true });

// Index
assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 });
assignmentSubmissionSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
