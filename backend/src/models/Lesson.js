const mongoose = require('mongoose');

/**
 * Lesson Model - Represents individual lessons within a module
 */
const lessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'LMSCourse', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  order: { type: Number, required: true, default: 0 }, // For ordering within module
  
  // Lesson type and content
  type: { type: String, enum: ['video', 'pdf', 'ppt', 'text', 'resource'], required: true },
  
  // Content URLs (for video, pdf, ppt)
  contentUrl: { type: String }, // Video URL or file path
  
  // Text content
  textContent: { type: String }, // Rich text or markdown
  
  // Resource links
  resourceLinks: [{
    title: String,
    url: String
  }],
  
  // Lesson settings
  duration: { type: Number }, // Duration in minutes
  isFree: { type: Boolean, default: false }, // Allow preview
  isLocked: { type: Boolean, default: true }, // Lock until previous completed

  // Versioning
  version: { type: Number, default: 1 },
  versionHistory: [
    {
      version: Number,
      updatedAt: Date,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' },
      snapshot: {
        title: String,
        description: String,
        order: Number,
        type: String,
        contentUrl: String,
        textContent: String,
        resourceLinks: [{ title: String, url: String }],
        duration: Number,
        isFree: Boolean,
        isLocked: Boolean
      }
    }
  ],

  // Attachments
  attachments: [
    {
      fileName: String,
      mimeType: String,
      size: Number,
      url: String,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' },
      uploadedAt: { type: Date, default: Date.now }
    }
  ]
  
}, { timestamps: true });

// Index for efficient querying
lessonSchema.index({ moduleId: 1, order: 1 });
lessonSchema.index({ courseId: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
