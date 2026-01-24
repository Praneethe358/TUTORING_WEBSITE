const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: '' },
  timezone: { type: String, default: 'UTC' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  // Google OAuth linkage (login only; requires signup first)
  googleId: { type: String, index: true },
  googleEmail: { type: String, lowercase: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
