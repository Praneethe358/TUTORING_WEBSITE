const mongoose = require('mongoose');

/**
 * Module Model - Represents a section/module within a course
 */
const moduleSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'LMSCourse', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  order: { type: Number, required: true, default: 0 }, // For drag & drop ordering
  
}, { timestamps: true });

// Index for efficient querying
moduleSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model('Module', moduleSchema);
