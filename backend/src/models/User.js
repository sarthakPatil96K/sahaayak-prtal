const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  aadhaarNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{12}$/, 'Please provide a valid 12-digit Aadhaar number']
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please provide a valid 10-digit mobile number']
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  address: {
    street: String,
    city: String,
    district: String,
    state: String,
    pincode: String
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  casteCategory: {
    type: String,
    enum: ['SC', 'ST', 'OBC', 'General', 'Other']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    documentType: String, // 'aadhaar', 'caste_certificate', 'address_proof'
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

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);