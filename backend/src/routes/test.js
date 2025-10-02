const express = require('express');
const VictimApplication = require('../models/VictimApplication');
const MarriageApplication = require('../models/MarriageApplication');
const router = express.Router();

// Test database connection
router.get('/db-test', async (req, res) => {
  try {
    // Test connection by counting documents
    const victimCount = await VictimApplication.countDocuments();
    const marriageCount = await MarriageApplication.countDocuments();
    
    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        victimApplications: victimCount,
        marriageApplications: marriageCount,
        totalApplications: victimCount + marriageCount,
        database: 'Connected',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Create a test victim application
router.post('/test-victim-application', async (req, res) => {
  try {
    const testApplication = new VictimApplication({
      applicationId: `VIC${Date.now()}`,
      personalDetails: {
        fullName: 'Test User',
        aadhaarNumber: '123456789012',
        mobileNumber: '9876543210',
        email: 'test@example.com',
        address: 'Test Address, Test City',
        pincode: '123456',
        state: 'Test State',
        district: 'Test District'
      },
      incidentDetails: {
        type: 'discrimination',
        date: new Date(),
        location: 'Test Location',
        description: 'Test incident description'
      },
      bankDetails: {
        accountNumber: '1234567890',
        ifscCode: 'TEST0000001',
        bankName: 'Test Bank',
        accountHolderName: 'Test User',
        branch: 'Test Branch'
      },
      status: 'pending',
      amount: 50000
    });

    const saved = await testApplication.save();
    
    res.json({
      success: true,
      message: 'Test victim application created successfully',
      data: saved
    });
  } catch (error) {
    console.error('Test victim application creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test victim application creation failed',
      error: error.message
    });
  }
});

// Create a test marriage application
router.post('/test-marriage-application', async (req, res) => {
  try {
    const testApplication = new MarriageApplication({
      applicationId: `MAR${Date.now()}`,
      coupleDetails: {
        husbandName: 'Test Husband',
        husbandAadhaar: '123456789012',
        husbandCaste: 'General',
        wifeName: 'Test Wife',
        wifeAadhaar: '987654321098',
        wifeCaste: 'SC',
        marriageDate: new Date(),
        marriageCertificateNumber: 'MC123456'
      },
      addressDetails: {
        address: 'Test Address, Test City',
        pincode: '123456',
        state: 'Test State',
        district: 'Test District',
        mobileNumber: '9876543210',
        email: 'test@example.com'
      },
      bankDetails: {
        accountNumber: '9876543210',
        ifscCode: 'TEST0000001',
        bankName: 'Test Bank',
        accountHolderName: 'Test Husband',
        branch: 'Test Branch'
      },
      status: 'pending',
      amount: 250000
    });

    const saved = await testApplication.save();
    
    res.json({
      success: true,
      message: 'Test marriage application created successfully',
      data: saved
    });
  } catch (error) {
    console.error('Test marriage application creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test marriage application creation failed',
      error: error.message
    });
  }
});

// Get all applications (both types)
router.get('/all-applications', async (req, res) => {
  try {
    const [victimApps, marriageApps] = await Promise.all([
      VictimApplication.find().sort({ createdAt: -1 }),
      MarriageApplication.find().sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      data: {
        victimApplications: victimApps,
        marriageApplications: marriageApps,
        totalCount: victimApps.length + marriageApps.length
      }
    });
  } catch (error) {
    console.error('Error fetching all applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// Clear all test data (for development)
router.delete('/clear-test-data', async (req, res) => {
  try {
    const [victimResult, marriageResult] = await Promise.all([
      VictimApplication.deleteMany({ applicationId: { $regex: /^(TEST|VIC)/ } }),
      MarriageApplication.deleteMany({ applicationId: { $regex: /^(TEST|MAR)/ } })
    ]);

    res.json({
      success: true,
      message: 'Test data cleared successfully',
      data: {
        victimApplicationsDeleted: victimResult.deletedCount,
        marriageApplicationsDeleted: marriageResult.deletedCount
      }
    });
  } catch (error) {
    console.error('Error clearing test data:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing test data',
      error: error.message
    });
  }
});

module.exports = router;