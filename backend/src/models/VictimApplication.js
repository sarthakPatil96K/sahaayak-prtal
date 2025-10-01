const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['discrimination', 'atrocity', 'land_rights', 'employment', 'education', 'other']
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    address: String,
    city: String,
    district: String,
    state: String,
    pincode: String
  },
  description: {
    type: String,
    required: true
  },
  witnesses: [{
    name: String,
    contact: String,
    address: String
  }],
  policeComplaint: {
    filed: Boolean,
    firNumber: String,
    policeStation: String,
    complaintDate: Date
  },
  evidenceDocuments: [{
    documentType: String,
    documentUrl: String,
    uploadedAt: Date
  }]
});

const bankSchema = new mongoose.Schema({
  accountHolderName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  ifscCode: {
    type: String,
    required: true,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please provide a valid IFSC code']
  },
  bankName: {
    type: String,
    required: true
  },
  branch: String,
  verified: {
    type: Boolean,
    default: false
  },
  verificationDate: Date
});

const victimApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalDetails: {
    fullName: String,
    aadhaarNumber: String,
    mobileNumber: String,
    email: String,
    address: {
      street: String,
      city: String,
      district: String,
      state: String,
      pincode: String
    }
  },
  incidentDetails: incidentSchema,
  bankDetails: bankSchema,
  status: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'approved', 'rejected', 'disbursed'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true,
    default: 50000
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Officer'
  },
  processingHistory: [{
    status: String,
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Officer'
    },
    comments: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  disbursementDetails: {
    disbursedAmount: Number,
    transactionId: String,
    disbursedAt: Date,
    utrNumber: String,
    bankResponse: String
  },
  rejectionReason: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
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

victimApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate application ID if new
  if (this.isNew) {
    const timestamp = Date.now().toString().slice(-8);
    this.applicationId = `VIC${timestamp}`;
  }
  
  next();
});

// Index for better query performance
victimApplicationSchema.index({ applicationId: 1 });
victimApplicationSchema.index({ user: 1 });
victimApplicationSchema.index({ status: 1 });
victimApplicationSchema.index({ createdAt: -1 });
victimApplicationSchema.index({ assignedOfficer: 1 });

module.exports = mongoose.model('VictimApplication', victimApplicationSchema);