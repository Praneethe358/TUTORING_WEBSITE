const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  action: { type: String, required: true }, // e.g., 'approve_tutor', 'block_user', 'delete_user'
  targetType: { type: String, required: true }, // e.g., 'Tutor', 'Student', 'Course'
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetEmail: { type: String },
  details: { type: mongoose.Schema.Types.Mixed }, // e.g., { reason: 'Inappropriate content' }
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Auto-expire logs after 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
