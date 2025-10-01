const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  grievanceId: {
    type: String,
    required: true,
    unique: true
  },
  applicationId: {
    type: String,
    required: true
  },
  applicationType: {
    type: String,
    enum: ['victim', 'marriage'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: ['delay', 'verification', 'payment', 'officer', 'document', 'other']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Officer'
  },
  resolution: {
    description: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Officer'
    },
    resolvedAt: Date,
    actionsTaken: [String]
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    submittedAt: Date
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

grievanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.isNew) {
    const timestamp = Date.now().toString().slice(-8);
    this.grievanceId = `GRV${timestamp}`;
  }
  
  next();
});

module.exports = mongoose.model('Grievance', grievanceSchema);