const mongoose = require('mongoose');

/**
 * Quiz Model - Course quizzes
 */
const quizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'LMSCourse', required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  
  // Quiz questions
  questions: [{
    questionText: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'true-false'], required: true },
    options: [{ type: String }], // For MCQ
    correctAnswer: { type: String, required: true }, // Answer text or 'true'/'false'
    points: { type: Number, default: 1 }
  }],
  
  // Quiz settings
  timeLimit: { type: Number }, // Time limit in minutes
  passingScore: { type: Number, default: 60 }, // Percentage
  maxAttempts: { type: Number, default: 3 },
  
  // Instructor
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  
}, { timestamps: true });

// Index
quizSchema.index({ courseId: 1 });
quizSchema.index({ moduleId: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
