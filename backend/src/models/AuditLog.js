const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'approve', 'reject']
  },
  module: {
    type: String,
    required: true,
    enum: ['user', 'victim_application', 'marriage_application', 'officer', 'grievance']
  },
  entityId: String,
  description: String,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Officer'
  },
  userAgent: String,
  ipAddress: String,
  changes: mongoose.Schema.Types.Mixed, // Stores the changes made
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ module: 1, entityId: 1 });
auditLogSchema.index({ performedBy: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);