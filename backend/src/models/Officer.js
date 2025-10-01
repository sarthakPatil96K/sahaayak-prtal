const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const officerSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  department: {
    type: String,
    required: true,
    enum: ['social_welfare', 'revenue', 'police', 'administration']
  },
  designation: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['officer', 'supervisor', 'admin'],
    default: 'officer'
  },
  permissions: [{
    module: String, // 'victim_applications', 'marriage_applications', 'reports'
    canView: Boolean,
    canEdit: Boolean,
    canApprove: Boolean
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    userAgent: String
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

// Hash password before saving
officerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  this.updatedAt = Date.now();
  next();
});

// Compare password method
officerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate employee ID
officerSchema.pre('save', function(next) {
  if (this.isNew && !this.employeeId) {
    const timestamp = Date.now().toString().slice(-6);
    this.employeeId = `OFF${this.department.slice(0, 3).toUpperCase()}${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Officer', officerSchema);