const mongoose = require('mongoose');

/**
 * Quiz Attempt Model - Student quiz attempts
 */
const quizAttemptSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  
  // Answers
  answers: [{
    questionIndex: Number,
    answer: String
  }],
  
  // Scoring
  score: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  
  // Attempt tracking
  attemptNumber: { type: Number, required: true },
  timeSpent: { type: Number }, // Time in minutes
  
  // Timestamps
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: Date.now }
  
}, { timestamps: true });

// Index
quizAttemptSchema.index({ quizId: 1, studentId: 1 });
quizAttemptSchema.index({ studentId: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
