// routes/requests.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const { Request } = require('../models'); // Import Request from models/index.js

// Configure multer for file uploads (using memory storage for demonstration)
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /api/requests
 * Returns a list of requests.
 * - Requestors see only their own requests.
 * - Administrators and Reviewers see all requests.
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    let requests;
    if (req.user.role === 'requestor') {
      // Assuming req.user.userId is set by your authMiddleware
      requests = await Request.findAll({ where: { userId: req.user.userId } });
    } else {
      requests = await Request.findAll();
    }
    res.json({ requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/requests
 * Submits a new request. Supports file uploads.
 */
router.post('/', authMiddleware, upload.any(), async (req, res) => {
  try {
    // Extract form fields from the request body
    const { requestType, requestTitle, submissionDate, details, responseDeadline, internalDeadline, auditPeriodFrom, auditPeriodTo, additionalParams } = req.body;

    // Process attachments if any exist
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        data: file.buffer.toString('base64')
      }));
    }

    // Create new request using Sequelize
    const newRequest = await Request.create({
      userId: req.user.userId, // Associate with the signed-in user
      requestType,
      requestTitle,
      submissionDate,
      details,
      responseDeadline,
      internalDeadline,
      auditPeriodFrom: auditPeriodFrom || null,
      auditPeriodTo: auditPeriodTo || null,
      additionalParams: additionalParams || null,
      attachments: attachments.length > 0 ? JSON.stringify(attachments) : null,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Request submitted successfully', request: newRequest });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
