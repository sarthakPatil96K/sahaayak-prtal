const express = require('express');
const router = express.Router();

// Mock data for inter-caste marriage applications
let marriageApplications = [];

// POST new inter-caste marriage application
router.post('/', (req, res) => {
  try {
    console.log('📨 Received inter-caste marriage application:', req.body);
    
    const { coupleDetails, contactDetails, bankDetails } = req.body;

    // Basic validation
    if (!coupleDetails || !contactDetails || !bankDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Generate application ID
    const applicationId = `MAR${Date.now()}`;
    
    const newApplication = {
      id: applicationId,
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
      contactDetails: {
        address: contactDetails.address || '',
        mobileNumber: contactDetails.mobileNumber || '',
        email: contactDetails.email || '',
        pincode: contactDetails.pincode || '',
        district: contactDetails.district || '',
        state: contactDetails.state || ''
      },
      bankDetails: {
        accountNumber: bankDetails.accountNumber || '',
        ifscCode: bankDetails.ifscCode || '',
        bankName: bankDetails.bankName || '',
        accountHolderName: bankDetails.accountHolderName || '',
        jointAccount: bankDetails.jointAccount || false
      },
      status: 'pending',
      amount: 250000, // Fixed incentive amount
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    marriageApplications.push(newApplication);
    
    console.log('✅ Inter-caste marriage application created:', applicationId);
    
    res.json({
      success: true,
      message: 'Inter-caste marriage incentive application submitted successfully',
      data: newApplication
    });
    
  } catch (error) {
    console.error('❌ Error creating marriage application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating application'
    });
  }
});

// GET all marriage applications
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: marriageApplications,
    count: marriageApplications.length
  });
});

module.exports = router;