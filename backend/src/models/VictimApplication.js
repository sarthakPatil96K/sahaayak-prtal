const mongoose = require('mongoose');

const victimApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  personalDetails: {
    fullName: { 
      type: String, 
      required: [true, 'Full name is required'],
      trim: true
    },
    aadhaarNumber: { 
      type: String, 
      required: [true, 'Aadhaar number is required'],
      validate: {
        validator: function(v) {
          return /^\d{12}$/.test(v);
        },
        message: 'Aadhaar number must be 12 digits'
      }
    },
    mobileNumber: { 
      type: String, 
      required: [true, 'Mobile number is required'],
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v);
        },
        message: 'Mobile number must be 10 digits'
      }
    },
    email: { 
      type: String,
      lowercase: true,
      validate: {
        validator: function(v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    address: { 
      type: String, 
      required: [true, 'Address is required'],
      trim: true
    },
    pincode: { 
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\d{6}$/.test(v);
        },
        message: 'Pincode must be 6 digits'
      }
    },
    state: { type: String, trim: true },
    district: { type: String, trim: true }
  },
  incidentDetails: {
    type: { 
      type: String, 
      required: [true, 'Incident type is required'],
      enum: ['discrimination', 'atrocity', 'land_rights', 'employment', 'education', 'other']
    },
    date: { 
      type: Date, 
      required: [true, 'Incident date is required'] 
    },
    location: { 
      type: String, 
      required: [true, 'Incident location is required'],
      trim: true
    },
    description: { 
      type: String, 
      required: [true, 'Incident description is required'],
      trim: true
    },
    witnesses: { type: String, trim: true },
    policeComplaint: { type: Boolean, default: false },
    complaintNumber: { type: String, trim: true }
  },
  bankDetails: {
    accountNumber: { 
      type: String, 
      required: [true, 'Account number is required'],
      trim: true
    },
    ifscCode: { 
      type: String, 
      required: [true, 'IFSC code is required'],
      trim: true,
      uppercase: true
    },
    bankName: { 
      type: String, 
      required: [true, 'Bank name is required'],
      trim: true
    },
    accountHolderName: { 
      type: String, 
      required: [true, 'Account holder name is required'],
      trim: true
    },
    branch: { type: String, trim: true }
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  amount: {
    type: Number,
    default: 50000
  },
  applicationType: {
    type: String,
    default: 'victim',
    immutable: true
  }
}, {
  timestamps: true
});

// Compound indexes
victimApplicationSchema.index({ status: 1, createdAt: -1 });
victimApplicationSchema.index({ 'personalDetails.aadhaarNumber': 1 });
victimApplicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('VictimApplication', victimApplicationSchema);