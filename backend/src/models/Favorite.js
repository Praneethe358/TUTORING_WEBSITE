const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate favorites
favoriteSchema.index({ student: 1, tutor: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
