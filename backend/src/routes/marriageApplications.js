const express = require('express');
const MarriageApplication = require('../models/MarriageApplication');
const router = express.Router();

// POST new marriage application
router.post('/', async (req, res) => {
  try {
    console.log('📨 Received MARRIAGE application submission:', JSON.stringify(req.body, null, 2));
    
    // Basic validation
    if (!req.body.coupleDetails || !req.body.addressDetails || !req.body.bankDetails) {
      console.log('❌ Missing required fields for marriage application');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: coupleDetails, addressDetails, or bankDetails'
      });
    }

    const { coupleDetails, addressDetails, bankDetails } = req.body;

    // Validate required fields
    if (!coupleDetails.husbandName || !coupleDetails.husbandAadhaar || !coupleDetails.wifeName || !coupleDetails.wifeAadhaar) {
      console.log('❌ Missing required couple details');
      return res.status(400).json({
        success: false,
        message: 'Missing required couple details: husbandName, husbandAadhaar, wifeName, or wifeAadhaar'
      });
    }

    // Generate application ID
    const applicationId = `MAR${Date.now()}`;
    console.log('🆔 Generated Marriage Application ID:', applicationId);
    
    // Create new marriage application
    const newApplication = new MarriageApplication({
      applicationId: applicationId,
      coupleDetails: {
        husbandName: coupleDetails.husbandName || '',
        husbandAadhaar: coupleDetails.husbandAadhaar || '',
        husbandCaste: coupleDetails.husbandCaste || '',
        wifeName: coupleDetails.wifeName || '',
        wifeAadhaar: coupleDetails.wifeAadhaar || '',
        wifeCaste: coupleDetails.wifeCaste || '',
        marriageDate: coupleDetails.marriageDate || '',
        marriageCertificateNumber: coupleDetails.marriageCertificateNumber || ''
      },
      addressDetails: {
        address: addressDetails.address || '',
        pincode: addressDetails.pincode || '',
        state: addressDetails.state || '',
        district: addressDetails.district || '',
        mobileNumber: addressDetails.mobileNumber || '',
        email: addressDetails.email || ''
      },
      bankDetails: {
        accountNumber: bankDetails.accountNumber || '',
        ifscCode: bankDetails.ifscCode || '',
        bankName: bankDetails.bankName || '',
        accountHolderName: bankDetails.accountHolderName || coupleDetails.husbandName || '',
        branch: bankDetails.branch || ''
      },
      status: 'pending',
      amount: 250000
    });

    console.log('💾 Saving marriage application to database...');
    
    // Save to database
    const savedApplication = await newApplication.save();
    
    console.log('✅ Marriage application saved successfully:', savedApplication.applicationId);
    
    res.json({
      success: true,
      message: 'Marriage application submitted successfully',
      data: savedApplication,
      trackingId: applicationId
    });
    
  } catch (error) {
    console.error('❌ Error creating marriage application:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Application ID already exists. Please try again.'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + errors.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating marriage application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET all marriage applications
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching all MARRIAGE applications...');
    const applications = await MarriageApplication.find().sort({ createdAt: -1 });
    
    console.log(`✅ Found ${applications.length} marriage applications`);
    
    res.json({
      success: true,
      data: applications,
      count: applications.length,
      message: `${applications.length} marriage applications found`
    });
  } catch (error) {
    console.error('❌ Error fetching marriage applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching marriage applications'
    });
  }
});

// GET marriage application by ID
router.get('/:id', async (req, res) => {
  try {
    const application = await MarriageApplication.findOne({ applicationId: req.params.id });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Marriage application with ID ${req.params.id} not found`
      });
    }
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching marriage application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching marriage application'
    });
  }
});

// UPDATE marriage application status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    // Validate status
    const validStatuses = ['pending', 'verified', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, verified, approved, rejected'
      });
    }

    const application = await MarriageApplication.findOneAndUpdate(
      { applicationId: applicationId },
      { 
        status: status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Marriage application with ID ${applicationId} not found`
      });
    }

    res.json({
      success: true,
      message: `Marriage application status updated to ${status}`,
      data: application
    });
  } catch (error) {
    console.error('Error updating marriage application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating marriage application status'
    });
  }
});

module.exports = router;