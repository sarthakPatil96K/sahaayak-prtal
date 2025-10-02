const express = require('express');
const VictimApplication = require('../models/VictimApplication');
const router = express.Router();

// POST new victim application
router.post('/', async (req, res) => {
  try {
    console.log('📨 Received VICTIM application submission:', JSON.stringify(req.body, null, 2));
    
    // Basic validation
    if (!req.body.personalDetails || !req.body.incidentDetails || !req.body.bankDetails) {
      console.log('❌ Missing required fields for victim application');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: personalDetails, incidentDetails, or bankDetails'
      });
    }

    const { personalDetails, incidentDetails, bankDetails } = req.body;

    // Validate required fields
    if (!personalDetails.fullName || !personalDetails.aadhaarNumber || !personalDetails.mobileNumber) {
      console.log('❌ Missing required personal details');
      return res.status(400).json({
        success: false,
        message: 'Missing required personal details: fullName, aadhaarNumber, or mobileNumber'
      });
    }

    // Generate application ID
    const applicationId = `VIC${Date.now()}`;
    console.log('🆔 Generated Victim Application ID:', applicationId);
    
    // Create new victim application
    const newApplication = new VictimApplication({
      applicationId: applicationId,
      personalDetails: {
        fullName: personalDetails.fullName || '',
        aadhaarNumber: personalDetails.aadhaarNumber || '',
        mobileNumber: personalDetails.mobileNumber || '',
        email: personalDetails.email || '',
        address: personalDetails.address || '',
        pincode: personalDetails.pincode || '',
        state: personalDetails.state || '',
        district: personalDetails.district || ''
      },
      incidentDetails: {
        type: incidentDetails.type || '',
        date: incidentDetails.date || '',
        location: incidentDetails.location || '',
        description: incidentDetails.description || '',
        witnesses: incidentDetails.witnesses || '',
        policeComplaint: incidentDetails.policeComplaint || false,
        complaintNumber: incidentDetails.complaintNumber || ''
      },
      bankDetails: {
        accountNumber: bankDetails.accountNumber || '',
        ifscCode: bankDetails.ifscCode || '',
        bankName: bankDetails.bankName || '',
        accountHolderName: bankDetails.accountHolderName || personalDetails.fullName || '',
        branch: bankDetails.branch || ''
      },
      status: 'pending',
      amount: 50000
    });

    console.log('💾 Saving victim application to database...');
    
    // Save to database
    const savedApplication = await newApplication.save();
    
    console.log('✅ Victim application saved successfully:', savedApplication.applicationId);
    
    res.json({
      success: true,
      message: 'Victim application submitted successfully',
      data: savedApplication,
      trackingId: applicationId
    });
    
  } catch (error) {
    console.error('❌ Error creating victim application:', error);
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
      message: 'Internal server error while creating application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET all victim applications
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching all VICTIM applications...');
    const applications = await VictimApplication.find().sort({ createdAt: -1 });
    
    console.log(`✅ Found ${applications.length} victim applications`);
    
    res.json({
      success: true,
      data: applications,
      count: applications.length,
      message: `${applications.length} victim applications found`
    });
  } catch (error) {
    console.error('❌ Error fetching victim applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching victim applications'
    });
  }
});

// GET victim application by ID
router.get('/:id', async (req, res) => {
  try {
    const application = await VictimApplication.findOne({ applicationId: req.params.id });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Victim application with ID ${req.params.id} not found`
      });
    }
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching victim application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching victim application'
    });
  }
});

// UPDATE victim application status
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

    const application = await VictimApplication.findOneAndUpdate(
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
        message: `Victim application with ID ${applicationId} not found`
      });
    }

    res.json({
      success: true,
      message: `Victim application status updated to ${status}`,
      data: application
    });
  } catch (error) {
    console.error('Error updating victim application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating victim application status'
    });
  }
});

module.exports = router;