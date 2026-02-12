const mongoose = require('mongoose');

const passwordResetRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
  reason: { type: String, default: '' }, // Reason for reset request
  adminNotes: { type: String, default: '' }, // Admin notes on approval/denial
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  deniedAt: { type: Date },
  deniedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  resetToken: { type: String }, // Generated when approved
  resetTokenExpires: { type: Date }, // Expires in 1 hour after approval
  resetCompletedAt: { type: Date }, // When user actually reset password
  expiresAtSelf: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // Request expires in 7 days
}, { timestamps: true });

module.exports = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);
