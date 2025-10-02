const mongoose = require('mongoose');

const marriageApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  coupleDetails: {
    husbandName: { 
      type: String, 
      required: [true, 'Husband name is required'],
      trim: true
    },
    husbandAadhaar: { 
      type: String, 
      required: [true, 'Husband Aadhaar is required'],
      validate: {
        validator: function(v) {
          return /^\d{12}$/.test(v);
        },
        message: 'Husband Aadhaar must be 12 digits'
      }
    },
    husbandCaste: { 
      type: String, 
      required: [true, 'Husband caste is required'],
      trim: true
    },
    wifeName: { 
      type: String, 
      required: [true, 'Wife name is required'],
      trim: true
    },
    wifeAadhaar: { 
      type: String, 
      required: [true, 'Wife Aadhaar is required'],
      validate: {
        validator: function(v) {
          return /^\d{12}$/.test(v);
        },
        message: 'Wife Aadhaar must be 12 digits'
      }
    },
    wifeCaste: { 
      type: String, 
      required: [true, 'Wife caste is required'],
      trim: true
    },
    marriageDate: { 
      type: Date, 
      required: [true, 'Marriage date is required'] 
    },
    marriageCertificateNumber: { 
      type: String, 
      required: [true, 'Marriage certificate number is required'],
      trim: true
    }
  },
  addressDetails: {
    address: { 
      type: String, 
      required: [true, 'Address is required'],
      trim: true
    },
    pincode: { 
      type: String,
      required: [true, 'Pincode is required'],
      validate: {
        validator: function(v) {
          return /^\d{6}$/.test(v);
        },
        message: 'Pincode must be 6 digits'
      }
    },
    state: { 
      type: String, 
      required: [true, 'State is required'],
      trim: true
    },
    district: { 
      type: String, 
      required: [true, 'District is required'],
      trim: true
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
    }
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
    default: 250000 // Different amount for marriage applications
  },
  applicationType: {
    type: String,
    default: 'marriage',
    immutable: true
  }
}, {
  timestamps: true
});

// Compound indexes
marriageApplicationSchema.index({ status: 1, createdAt: -1 });
marriageApplicationSchema.index({ 'coupleDetails.husbandAadhaar': 1 });
marriageApplicationSchema.index({ 'coupleDetails.wifeAadhaar': 1 });
marriageApplicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MarriageApplication', marriageApplicationSchema);