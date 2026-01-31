const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // General Settings
  platformName: {
    type: String,
    default: 'HOPE Online Tuitions'
  },
  supportEmail: {
    type: String,
    default: 'hopetuitionbygd@gmail.com'
  },
  maxClassDuration: {
    type: Number,
    default: 120
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },

  // Email Settings
  emailEnabled: {
    type: Boolean,
    default: true
  },
  emailProvider: {
    type: String,
    enum: ['smtp', 'sendgrid', 'mailgun', 'ses'],
    default: 'smtp'
  },
  notifyNewEnrollments: {
    type: Boolean,
    default: true
  },
  notifyClassReminders: {
    type: Boolean,
    default: true
  },
  notifyAssignmentDue: {
    type: Boolean,
    default: true
  },

  // Security Settings
  sessionTimeout: {
    type: Number,
    default: 30
  },
  maxLoginAttempts: {
    type: Number,
    default: 5
  },
  passwordMinLength: {
    type: Number,
    default: 8
  },
  requireEmailVerification: {
    type: Boolean,
    default: true
  },
  twoFactorAuth: {
    type: Boolean,
    default: false
  },

  // Feature Toggles
  enableMessaging: {
    type: Boolean,
    default: true
  },
  enableVideoChat: {
    type: Boolean,
    default: true
  },
  enableAssignments: {
    type: Boolean,
    default: true
  },
  enableQuizzes: {
    type: Boolean,
    default: true
  },
  enableCertificates: {
    type: Boolean,
    default: true
  },
  enableDiscussions: {
    type: Boolean,
    default: true
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
