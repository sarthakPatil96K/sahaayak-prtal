const mongoose = require('mongoose');

const coupleSchema = new mongoose.Schema({
  husband: {
    name: {
      type: String,
      required: true
    },
    aadhaarNumber: {
      type: String,
      required: true,
      match: [/^\d{12}$/, 'Please provide a valid 12-digit Aadhaar number']
    },
    dateOfBirth: Date,
    casteCategory: {
      type: String,
      required: true,
      enum: ['SC', 'ST', 'OBC', 'General', 'Other']
    },
    fatherName: String
  },
  wife: {
    name: {
      type: String,
      required: true
    },
    aadhaarNumber: {
      type: String,
      required: true,
      match: [/^\d{12}$/, 'Please provide a valid 12-digit Aadhaar number']
    },
    dateOfBirth: Date,
    casteCategory: {
      type: String,
      required: true,
      enum: ['SC', 'ST', 'OBC', 'General', 'Other']
    },
    fatherName: String
  }
});

const marriageDetailsSchema = new mongoose.Schema({
  marriageDate: {
    type: Date,
    required: true
  },
  marriageCertificateNumber: String,
  certificateDocument: {
    url: String,
    verified: Boolean,
    verifiedAt: Date
  },
  placeOfMarriage: {
    address: String,
    city: String,
    district: String,
    state: String
  },
  witness1: {
    name: String,
    aadhaar: String,
    address: String
  },
  witness2: {
    name: String,
    aadhaar: String,
    address: String
  }
});

const marriageApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true
  },
  couple: coupleSchema,
  contactDetails: {
    address: {
      street: String,
      city: String,
      district: String,
      state: String,
      pincode: String
    },
    mobileNumber: {
      type: String,
      required: true
    },
    email: String
  },
  bankDetails: {
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
      required: true
    },
    bankName: {
      type: String,
      required: true
    },
    branch: String,
    jointAccount: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'approved', 'rejected', 'disbursed'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true,
    default: 250000
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
    utrNumber: String
  },
  rejectionReason: String,
  documents: [{
    documentType: String, // 'caste_certificate_husband', 'caste_certificate_wife', 'marriage_certificate'
    documentUrl: String,
    verified: Boolean,
    verifiedAt: Date
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

marriageApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.isNew) {
    const timestamp = Date.now().toString().slice(-8);
    this.applicationId = `MAR${timestamp}`;
  }
  
  next();
});

// Indexes
marriageApplicationSchema.index({ applicationId: 1 });
marriageApplicationSchema.index({ 'couple.husband.aadhaarNumber': 1 });
marriageApplicationSchema.index({ 'couple.wife.aadhaarNumber': 1 });
marriageApplicationSchema.index({ status: 1 });
marriageApplicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MarriageApplication', marriageApplicationSchema);