const mongoose = require('mongoose');

/**
 * MATERIAL SCHEMA
 * Stores tutor-uploaded study materials and resources
 */
const materialSchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    description: {
      type: String,
      maxlength: 1000
    },
    category: {
      type: String,
      enum: ['Math', 'Science', 'English', 'History', 'Other'],
      default: 'Other'
    },
    fileName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'assigned'],
      default: 'assigned'
    },
    sharedWith: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student'
        },
        access: {
          type: String,
          enum: ['view', 'download'],
          default: 'view'
        }
      }
    ],
    downloads: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student'
        },
        downloadedAt: Date
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index for faster queries
materialSchema.index({ tutor: 1, category: 1 });
materialSchema.index({ tutor: 1, isActive: 1 });

module.exports = mongoose.model('Material', materialSchema);
