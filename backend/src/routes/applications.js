const express = require('express');
const router = express.Router();

// Mock data - in real app, this would come from database
// In backend/src/routes/applications.js, replace the let applications with:
let applications = require('../seedData');

// GET all applications
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: applications,
      count: applications.length,
      message: `${applications.length} applications found`
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
});

// POST new application
router.post('/', (req, res) => {
  try {
    console.log('📨 Received application submission:', req.body);
    
    // Basic validation
    if (!req.body.personalDetails || !req.body.incidentDetails || !req.body.bankDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const { personalDetails, incidentDetails, bankDetails } = req.body;

    // Validate required fields
    if (!personalDetails.fullName || !personalDetails.aadhaarNumber || !personalDetails.mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required personal details'
      });
    }

    // Generate application ID
    const applicationId = `APP${Date.now()}`;
    
    const newApplication = {
      id: applicationId,
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
      amount: 50000, // Default amount
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    applications.push(newApplication);
    
    console.log('✅ Application created successfully:', applicationId);
    
    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: newApplication,
      trackingId: applicationId
    });
    
  } catch (error) {
    console.error('❌ Error creating application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating application'
    });
  }
});

// GET application by ID
router.get('/:id', (req, res) => {
  try {
    const application = applications.find(app => app.id === req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: `Application with ID ${req.params.id} not found`
      });
    }
    
    res.json({
      success: true,
      data: application
    });
    
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application'
    });
  }
});

// UPDATE application status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const application = applications.find(app => app.id === req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    application.status = status;
    application.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
    
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application'
    });
  }
});

// DELETE application
router.delete('/:id', (req, res) => {
  try {
    const applicationIndex = applications.findIndex(app => app.id === req.params.id);
    
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    applications.splice(applicationIndex, 1);
    
    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting application'
    });
  }
});

module.exports = router;