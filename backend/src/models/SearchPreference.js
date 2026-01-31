const mongoose = require('mongoose');

const searchPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userModel' },
    userModel: { type: String, enum: ['Student', 'Tutor'], default: 'Student' },
    type: { type: String, enum: ['course', 'tutor'], required: true },
    query: { type: String },
    filters: { type: Object, default: {} },
    sort: { type: String },
    savedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

searchPreferenceSchema.index({ userId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('SearchPreference', searchPreferenceSchema);
