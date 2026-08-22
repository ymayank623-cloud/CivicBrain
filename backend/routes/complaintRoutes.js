const express = require('express');
const router = express.Router();
const { createComplaint, getCitizenDashboard } = require('../controllers/complaintController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Citizen protected routes
router.post('/new', verifyToken, requireRole(['CITIZEN']), createComplaint);
router.get('/dashboard', verifyToken, requireRole(['CITIZEN']), getCitizenDashboard);

module.exports = router;
