const mongoose = require('mongoose');

/**
 * TUTOR ASSIGNMENT MODEL
 * Admin-controlled mapping between tutors and students.
 * Only admins can create, update, or remove assignments.
 */
const tutorAssignmentSchema = new mongoose.Schema({
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true,
    index: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  subject: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  }
}, { timestamps: true });

// Prevent duplicate tutor-student assignments
tutorAssignmentSchema.index({ tutor: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('TutorAssignment', tutorAssignmentSchema);
