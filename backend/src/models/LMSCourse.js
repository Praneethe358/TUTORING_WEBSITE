const mongoose = require('mongoose');

/**
 * LMS Course Model - Full course with modules and lessons
 * Extends the existing simple Course model for tutor approval
 */
const lmsCourseSchema = new mongoose.Schema({
  // Course metadata
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, trim: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  duration: { type: Number }, // Total duration in hours
  prerequisites: [{ type: String }],
  learningOutcomes: [{ type: String }],
  
  // Course ownership
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  
  // Course status + scheduling
  status: { type: String, enum: ['draft', 'scheduled', 'published', 'archived'], default: 'draft' },
  publishAt: { type: Date },
  publishedAt: { type: Date },
  archivedAt: { type: Date },
  
  // Course thumbnail/image
  thumbnail: { type: String },
  
  // Enrollment tracking
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  
  // Course settings
  isPublic: { type: Boolean, default: true },
  price: { type: Number, default: 0 }, // For future pricing feature

  // Templates and versioning
  templateKey: { type: String },
  version: { type: Number, default: 1 },
  versionHistory: [
    {
      version: Number,
      updatedAt: Date,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' },
      snapshot: {
        title: String,
        description: String,
        category: String,
        level: String,
        duration: Number,
        prerequisites: [String],
        learningOutcomes: [String],
        thumbnail: String,
        status: String,
        publishAt: Date
      }
    }
  ]
  
}, { timestamps: true });

// Index for better query performance
lmsCourseSchema.index({ instructor: 1, status: 1 });
lmsCourseSchema.index({ category: 1, level: 1 });
lmsCourseSchema.index({ publishAt: 1, status: 1 });

module.exports = mongoose.model('LMSCourse', lmsCourseSchema);
