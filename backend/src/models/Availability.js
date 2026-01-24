const mongoose = require('mongoose');

/**
 * AVAILABILITY MODEL
 * Manages tutor availability slots
 */
const availabilitySchema = new mongoose.Schema({
  tutor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tutor', 
    required: true,
    index: true 
  },
  
  // Day of week (0-6, 0 = Sunday)
  dayOfWeek: { 
    type: Number, 
    required: true,
    min: 0,
    max: 6,
    index: true
  },
  
  // Time slots
  startTime: { 
    type: String, 
    required: true // Format: "HH:MM" (24-hour)
  },
  endTime: { 
    type: String, 
    required: true // Format: "HH:MM"
  },
  
  // Specific date override (optional)
  specificDate: { 
    type: Date,
    index: true
  },
  
  // Status
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // Booking status
  isBooked: { 
    type: Boolean, 
    default: false 
  },
  bookedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  },
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class' 
  },
  
  // Recurring availability
  isRecurring: { 
    type: Boolean, 
    default: true 
  },
  validFrom: { 
    type: Date, 
    default: Date.now 
  },
  validUntil: { type: Date },
  
  // Timezone
  timezone: { 
    type: String, 
    default: 'UTC' 
  },
  
  // Notes
  notes: { type: String }
  
}, { timestamps: true });

// Compound indexes
availabilitySchema.index({ tutor: 1, dayOfWeek: 1, isActive: 1 });
availabilitySchema.index({ tutor: 1, specificDate: 1 });
availabilitySchema.index({ tutor: 1, isBooked: 1 });

// Prevent overlapping slots for same tutor
availabilitySchema.index(
  { tutor: 1, dayOfWeek: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { specificDate: null } }
);

module.exports = mongoose.model('Availability', availabilitySchema);
