const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  subject: { type: String, required: true },

  durationMinutes: { type: Number, required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
