const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import models
const VictimApplication = require('../models/VictimApplication');
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

// GET all applications with filtering and pagination
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
        { 'personalDetails.fullName': { $regex: search, $options: 'i' } },
        { 'personalDetails.aadhaarNumber': { $regex: search, $options: 'i' } },
        { 'personalDetails.mobileNumber': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const applications = await VictimApplication.find(filter)
      .populate('user', 'fullName aadhaarNumber mobileNumber email')
      .populate('assignedOfficer', 'fullName employeeId designation')
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await VictimApplication.countDocuments(filter);

    // Log the view action
    await logAudit(
      'read',
      'victim_application',
      'multiple',
      req.user?._id,
      `Viewed ${applications.length} victim applications`
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
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
});

// GET application by ID
router.get('/:id', async (req, res) => {
  try {
    const application = await VictimApplication.findOne({ applicationId: req.params.id })
      .populate('user', 'fullName aadhaarNumber mobileNumber email address casteCategory')
      .populate('assignedOfficer', 'fullName employeeId designation department')
      .populate('processingHistory.actionBy', 'fullName employeeId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Log view action
    await logAudit(
      'read',
      'victim_application',
      application._id,
      req.user?._id,
      `Viewed application details: ${application.applicationId}`
    );

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

// POST new victim application
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { personalDetails, incidentDetails, bankDetails, amount } = req.body;

    // Validate required fields
    if (!personalDetails || !incidentDetails || !bankDetails) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: personalDetails, incidentDetails, bankDetails'
      });
    }

    // Validate Aadhaar format
    if (!/^\d{12}$/.test(personalDetails.aadhaarNumber)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number format'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ aadhaarNumber: personalDetails.aadhaarNumber }).session(session);

    if (!user) {
      // Create new user
      user = new User({
        aadhaarNumber: personalDetails.aadhaarNumber,
        fullName: personalDetails.fullName,
        mobileNumber: personalDetails.mobileNumber,
        email: personalDetails.email,
        address: personalDetails.address,
        casteCategory: personalDetails.casteCategory
      });
      await user.save({ session });
    }

    // Check for duplicate pending application
    const existingApplication = await VictimApplication.findOne({
      user: user._id,
      status: { $in: ['pending', 'under_review', 'verified'] }
    }).session(session);

    if (existingApplication) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'You already have a pending application. Please wait for it to be processed.'
      });
    }

    // Create new application
    const application = new VictimApplication({
      user: user._id,
      personalDetails: {
        fullName: personalDetails.fullName,
        aadhaarNumber: personalDetails.aadhaarNumber,
        mobileNumber: personalDetails.mobileNumber,
        email: personalDetails.email,
        address: personalDetails.address
      },
      incidentDetails: {
        type: incidentDetails.type,
        date: incidentDetails.date,
        location: incidentDetails.location,
        description: incidentDetails.description,
        witnesses: incidentDetails.witnesses || [],
        policeComplaint: incidentDetails.policeComplaint || false,
        firNumber: incidentDetails.firNumber,
        evidenceDocuments: incidentDetails.evidenceDocuments || []
      },
      bankDetails: {
        accountHolderName: bankDetails.accountHolderName,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        bankName: bankDetails.bankName,
        branch: bankDetails.branch
      },
      amount: amount || 50000,
      priority: calculatePriority(incidentDetails)
    });

    // Add initial status to processing history
    application.processingHistory.push({
      status: 'pending',
      comments: 'Application submitted successfully',
      timestamp: new Date()
    });

    await application.save({ session });
    await session.commitTransaction();

    // Populate for response
    await application.populate('user', 'fullName aadhaarNumber mobileNumber');

    // Log the creation
    await logAudit(
      'create',
      'victim_application',
      application._id,
      req.user?._id || 'system',
      `New victim application created: ${application.applicationId}`,
      { applicationId: application.applicationId, status: application.status }
    );

    console.log('✅ Victim application created:', application.applicationId);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Error creating application:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating application'
    });
  } finally {
    session.endSession();
  }
});

// PATCH update application status
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
    const application = await VictimApplication.findOne({ applicationId }).session(session);
    if (!application) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Application not found'
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

    await application.save({ session });
    await session.commitTransaction();

    // Populate for response
    await application.populate('assignedOfficer', 'fullName employeeId designation');

    // Log status change
    await logAudit(
      'update',
      'victim_application',
      application._id,
      req.user?._id,
      `Application status changed from ${oldStatus} to ${status}`,
      { oldStatus, newStatus: status, comments }
    );

    console.log(`✅ Application ${applicationId} status updated to: ${status}`);

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      data: application
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status'
    });
  } finally {
    session.endSession();
  }
});

// PUT update application details
router.put('/:id', async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const applicationId = req.params.id;
    const updateData = req.body;

    const application = await VictimApplication.findOne({ applicationId }).session(session);
    if (!application) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Store old values for audit
    const oldValues = {
      incidentDetails: { ...application.incidentDetails.toObject() },
      bankDetails: { ...application.bankDetails.toObject() }
    };

    // Update fields
    if (updateData.incidentDetails) {
      application.incidentDetails = {
        ...application.incidentDetails.toObject(),
        ...updateData.incidentDetails
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
      comments: 'Application details updated',
      timestamp: new Date()
    });

    await application.save({ session });
    await session.commitTransaction();

    // Log update
    await logAudit(
      'update',
      'victim_application',
      application._id,
      req.user?._id,
      `Application details updated: ${application.applicationId}`,
      { oldValues, newValues: updateData }
    );

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: application
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application'
    });
  } finally {
    session.endSession();
  }
});

// DELETE application (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const application = await VictimApplication.findOne({ applicationId: req.params.id });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if application can be deleted (only pending applications)
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be deleted'
      });
    }

    await VictimApplication.deleteOne({ applicationId: req.params.id });

    // Log deletion
    await logAudit(
      'delete',
      'victim_application',
      application._id,
      req.user?._id,
      `Application deleted: ${application.applicationId}`
    );

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

// GET application statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await VictimApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalApplications = await VictimApplication.countDocuments();
    const totalDisbursed = await VictimApplication.aggregate([
      { $match: { status: 'disbursed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyStats = await VictimApplication.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      data: {
        statusDistribution: stats,
        totalApplications,
        totalDisbursed: totalDisbursed[0]?.total || 0,
        monthlyTrends: monthlyStats
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// Utility Functions

function calculatePriority(incidentDetails) {
  const incidentDate = new Date(incidentDetails.date);
  const daysSinceIncident = Math.floor((new Date() - incidentDate) / (1000 * 60 * 60 * 24));
  
  if (daysSinceIncident > 30) return 'high';
  if (daysSinceIncident > 15) return 'medium';
  return 'low';
}

function generateTransactionId() {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

function generateUTRNumber() {
  return `UTR${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}

// Middleware to protect routes (example - you can integrate your auth middleware)
const authenticateOfficer = async (req, res, next) => {
  try {
    // This is a placeholder - implement your actual authentication logic
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Verify token and get officer data
    // const officer = await verifyToken(token);
    // req.user = officer;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }
};

// Apply authentication middleware to protected routes
router.use(authenticateOfficer); // Apply to all routes or specific ones

module.exports = router;