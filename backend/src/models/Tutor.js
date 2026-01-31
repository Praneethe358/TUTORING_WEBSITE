const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  day: String,
  slots: [String] // e.g., "09:00-10:00"
}, { _id: false });

const tutorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'tutor' },
  qualifications: { type: String, required: true },
  subjects: [{ type: String, required: true }],
  experienceYears: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'blocked'], default: 'pending' },
  isActive: { type: Boolean, default: false },
  profileImage: { type: String },
  avatar: { type: String, default: '' },
  cvPath: { type: String }, // NEW: Path to uploaded CV file
  timezone: { type: String, default: 'UTC' },
  availability: [availabilitySchema],
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  
  // Email verification
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  
  // Password reset
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Tutor', tutorSchema);
