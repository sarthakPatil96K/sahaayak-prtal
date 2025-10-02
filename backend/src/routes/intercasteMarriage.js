const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import models
const MarriageApplication = require('../models/MarriageApplication');
const User = require('../models/User');
const Officer = require('../models/Officer');
const AuditLog = require('../models/AuditLog');

// Utility function for audit logging
const logAudit = async (action, module, entityId, performedBy, description, changes = null) => {
  try {
    await AuditLog.create({
      action,
      module,
      entityId,
      performedBy,
      description,
      changes,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

// GET all marriage applications with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { applicationId: { $regex: search, $options: 'i' } },
        { 'couple.husband.name': { $regex: search, $options: 'i' } },
        { 'couple.wife.name': { $regex: search, $options: 'i' } },
        { 'couple.husband.aadhaarNumber': { $regex: search, $options: 'i' } },
        { 'couple.wife.aadhaarNumber': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const applications = await MarriageApplication.find(filter)
      .populate('assignedOfficer', 'fullName employeeId designation')
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await MarriageApplication.countDocuments(filter);

    // Log the view action
    await logAudit(
      'read',
      'marriage_application',
      'multiple',
      req.user?._id,
      `Viewed ${applications.length} marriage applications`
    );

    res.json({
      success: true,
      data: applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching marriage applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching marriage applications'
    });
  }
});

// GET marriage application by ID
router.get('/:id', async (req, res) => {
  try {
    const application = await MarriageApplication.findOne({ applicationId: req.params.id })
      .populate('assignedOfficer', 'fullName employeeId designation department')
      .populate('processingHistory.actionBy', 'fullName employeeId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Marriage application not found'
      });
    }

    // Log view action
    await logAudit(
      'read',
      'marriage_application',
      application._id,
      req.user?._id,
      `Viewed marriage application details: ${application.applicationId}`
    );

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

// POST new inter-caste marriage application
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { coupleDetails, contactDetails, bankDetails } = req.body;

    // Validate required fields
    if (!coupleDetails || !contactDetails || !bankDetails) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: coupleDetails, contactDetails, bankDetails'
      });
    }

    // Validate Aadhaar formats
    if (!/^\d{12}$/.test(coupleDetails.husband.aadhaarNumber) || !/^\d{12}$/.test(coupleDetails.wife.aadhaarNumber)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number format for husband or wife'
      });
    }

    // Validate caste categories (must be different for inter-caste)
    if (coupleDetails.husband.casteCategory === coupleDetails.wife.casteCategory) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Both partners belong to same caste category. This scheme is for inter-caste marriages only.'
      });
    }

    // Check for duplicate applications (using husband or wife Aadhaar)
    const existingApplication = await MarriageApplication.findOne({
      $or: [
        { 'couple.husband.aadhaarNumber': coupleDetails.husband.aadhaarNumber },
        { 'couple.wife.aadhaarNumber': coupleDetails.wife.aadhaarNumber }
      ],
      status: { $in: ['pending', 'under_review', 'verified'] }
    }).session(session);

    if (existingApplication) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'One of the partners already has a pending marriage application.'
      });
    }

    // Create or find users for husband and wife
    let husband = await User.findOne({ aadhaarNumber: coupleDetails.husband.aadhaarNumber }).session(session);
    let wife = await User.findOne({ aadhaarNumber: coupleDetails.wife.aadhaarNumber }).session(session);

    if (!husband) {
      husband = new User({
        aadhaarNumber: coupleDetails.husband.aadhaarNumber,
        fullName: coupleDetails.husband.name,
        casteCategory: coupleDetails.husband.casteCategory,
        dateOfBirth: coupleDetails.husband.dateOfBirth
      });
      await husband.save({ session });
    }

    if (!wife) {
      wife = new User({
        aadhaarNumber: coupleDetails.wife.aadhaarNumber,
        fullName: coupleDetails.wife.name,
        casteCategory: coupleDetails.wife.casteCategory,
        dateOfBirth: coupleDetails.wife.dateOfBirth
      });
      await wife.save({ session });
    }

    // Create new marriage application
    const application = new MarriageApplication({
      couple: {
        husband: {
          name: coupleDetails.husband.name,
          aadhaarNumber: coupleDetails.husband.aadhaarNumber,
          dateOfBirth: coupleDetails.husband.dateOfBirth,
          casteCategory: coupleDetails.husband.casteCategory,
          fatherName: coupleDetails.husband.fatherName
        },
        wife: {
          name: coupleDetails.wife.name,
          aadhaarNumber: coupleDetails.wife.aadhaarNumber,
          dateOfBirth: coupleDetails.wife.dateOfBirth,
          casteCategory: coupleDetails.wife.casteCategory,
          fatherName: coupleDetails.wife.fatherName
        }
      },
      marriageDetails: {
        marriageDate: coupleDetails.marriageDate,
        marriageCertificateNumber: coupleDetails.marriageCertificateNumber,
        placeOfMarriage: coupleDetails.placeOfMarriage,
        witness1: coupleDetails.witness1,
        witness2: coupleDetails.witness2
      },
      contactDetails: {
        address: contactDetails.address,
        mobileNumber: contactDetails.mobileNumber,
        email: contactDetails.email
      },
      bankDetails: {
        accountHolderName: bankDetails.accountHolderName,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        bankName: bankDetails.bankName,
        branch: bankDetails.branch,
        jointAccount: bankDetails.jointAccount || false
      },
      amount: 250000 // Fixed incentive amount for inter-caste marriage
    });

    // Add initial status to processing history
    application.processingHistory.push({
      status: 'pending',
      comments: 'Inter-caste marriage application submitted successfully',
      timestamp: new Date()
    });

    await application.save({ session });
    await session.commitTransaction();

    // Log the creation
    await logAudit(
      'create',
      'marriage_application',
      application._id,
      req.user?._id || 'system',
      `New inter-caste marriage application created: ${application.applicationId}`,
      { 
        applicationId: application.applicationId, 
        husbandCaste: coupleDetails.husband.casteCategory,
        wifeCaste: coupleDetails.wife.casteCategory
      }
    );

    console.log('✅ Inter-caste marriage application created:', application.applicationId);

    res.status(201).json({
      success: true,
      message: 'Inter-caste marriage application submitted successfully',
      data: application
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Error creating marriage application:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating marriage application'
    });
  } finally {
    session.endSession();
  }
});

// PATCH update marriage application status
router.patch('/:id/status', async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const { status, comments, assignedOfficerId } = req.body;
    const applicationId = req.params.id;

    // Validate status
    const validStatuses = ['pending', 'under_review', 'verified', 'approved', 'rejected', 'disbursed'];
    if (!validStatuses.includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find application
    const application = await MarriageApplication.findOne({ applicationId }).session(session);
    if (!application) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Marriage application not found'
      });
    }

    const oldStatus = application.status;
    application.status = status;

    // Update assigned officer if provided
    if (assignedOfficerId) {
      const officer = await Officer.findById(assignedOfficerId).session(session);
      if (!officer) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: 'Officer not found'
        });
      }
      application.assignedOfficer = assignedOfficerId;
    }

    // Add to processing history
    application.processingHistory.push({
      status: status,
      actionBy: req.user?._id,
      comments: comments || `Status changed from ${oldStatus} to ${status}`,
      timestamp: new Date()
    });

    // Handle disbursement
    if (status === 'disbursed') {
      application.disbursementDetails = {
        disbursedAmount: application.amount,
        transactionId: generateTransactionId(),
        disbursedAt: new Date(),
        utrNumber: generateUTRNumber()
      };
    }

    // Handle rejection
    if (status === 'rejected' && req.body.rejectionReason) {
      application.rejectionReason = req.body.rejectionReason;
    }

    // Handle document verification
    if (status === 'verified' && req.body.verifiedDocuments) {
      application.documents = application.documents.map(doc => ({
        ...doc,
        verified: req.body.verifiedDocuments.includes(doc.documentType),
        verifiedAt: req.body.verifiedDocuments.includes(doc.documentType) ? new Date() : doc.verifiedAt
      }));
    }

    await application.save({ session });
    await session.commitTransaction();

    // Populate for response
    await application.populate('assignedOfficer', 'fullName employeeId designation');

    // Log status change
    await logAudit(
      'update',
      'marriage_application',
      application._id,
      req.user?._id,
      `Marriage application status changed from ${oldStatus} to ${status}`,
      { oldStatus, newStatus: status, comments }
    );

    console.log(`✅ Marriage application ${applicationId} status updated to: ${status}`);

    res.json({
      success: true,
      message: `Marriage application status updated to ${status}`,
      data: application
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating marriage application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating marriage application status'
    });
  } finally {
    session.endSession();
  }
});

// PUT update marriage application details
router.put('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const applicationId = req.params.id;
    const updateData = req.body;

    const application = await MarriageApplication.findOne({ applicationId }).session(session);
    if (!application) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Marriage application not found'
      });
    }

    // Store old values for audit
    const oldValues = {
      couple: { ...application.couple.toObject() },
      contactDetails: { ...application.contactDetails.toObject() },
      bankDetails: { ...application.bankDetails.toObject() }
    };

    // Update fields
    if (updateData.coupleDetails) {
      application.couple = {
        ...application.couple.toObject(),
        ...updateData.coupleDetails
      };
    }

    if (updateData.contactDetails) {
      application.contactDetails = {
        ...application.contactDetails.toObject(),
        ...updateData.contactDetails
      };
    }

    if (updateData.bankDetails) {
      application.bankDetails = {
        ...application.bankDetails.toObject(),
        ...updateData.bankDetails
      };
    }

    // Add to processing history
    application.processingHistory.push({
      status: application.status,
      actionBy: req.user?._id,
      comments: 'Marriage application details updated',
      timestamp: new Date()
    });

    await application.save({ session });
    await session.commitTransaction();

    // Log update
    await logAudit(
      'update',
      'marriage_application',
      application._id,
      req.user?._id,
      `Marriage application details updated: ${application.applicationId}`,
      { oldValues, newValues: updateData }
    );

    res.json({
      success: true,
      message: 'Marriage application updated successfully',
      data: application
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating marriage application:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating marriage application'
    });
  } finally {
    session.endSession();
  }
});

// GET marriage application statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await MarriageApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalApplications = await MarriageApplication.countDocuments();
    const totalDisbursed = await MarriageApplication.aggregate([
      { $match: { status: 'disbursed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Caste combination statistics
    const casteStats = await MarriageApplication.aggregate([
      {
        $group: {
          _id: {
            husbandCaste: '$couple.husband.casteCategory',
            wifeCaste: '$couple.wife.casteCategory'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusDistribution: stats,
        totalApplications,
        totalDisbursed: totalDisbursed[0]?.total || 0,
        casteCombinations: casteStats
      }
    });

  } catch (error) {
    console.error('Error fetching marriage statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching marriage statistics'
    });
  }
});

// Utility Functions
function generateTransactionId() {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

function generateUTRNumber() {
  return `UTR${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

module.exports = router;