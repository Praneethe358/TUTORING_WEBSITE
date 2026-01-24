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
  timezone: { type: String, default: 'UTC' },
  availability: [availabilitySchema],
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  
  // Google Calendar Integration
  googleAuth: {
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenExpiry: { type: Date },
    isConnected: { type: Boolean, default: false },
    connectedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('Tutor', tutorSchema);
