const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LMSCourse',
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    certificateNumber: {
      type: String,
      unique: true,
      required: true
    },
    issuedDate: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date
    },
    completionDate: {
      type: Date,
      required: true
    },
    finalScore: {
      type: Number,
      min: 0,
      max: 100
    },
    courseTitle: String,
    studentName: String,
    instructorName: String,
    certificateUrl: String // URL to downloadable/shareable certificate
  },
  { timestamps: true }
);

// Generate unique certificate number before saving
certificateSchema.pre('save', async function (next) {
  if (!this.certificateNumber) {
    const count = await mongoose.model('Certificate').countDocuments();
    const timestamp = Date.now().toString().slice(-8);
    this.certificateNumber = `CERT-${timestamp}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
