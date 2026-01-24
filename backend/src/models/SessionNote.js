const mongoose = require('mongoose');

const sessionNoteSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'authorModel'
  },
  authorModel: {
    type: String,
    required: true,
    enum: ['Student', 'Tutor']
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  isPrivate: {
    type: Boolean,
    default: false // if true, only visible to author
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

sessionNoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SessionNote', sessionNoteSchema);
