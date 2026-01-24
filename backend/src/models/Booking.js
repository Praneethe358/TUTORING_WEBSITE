const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  date: { type: Date, required: true },
  status: { type: String, enum: ['booked', 'cancelled', 'completed'], default: 'booked' }
}, { timestamps: true });

bookingSchema.index({ tutor: 1, date: 1 }, { unique: true }); // prevent double booking same slot

module.exports = mongoose.model('Booking', bookingSchema);
