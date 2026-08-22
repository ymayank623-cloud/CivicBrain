const express = require('express');
const router = express.Router();
const { createStaff } = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Only Commissioner can access this route
router.post('/create-staff', verifyToken, requireRole(['COMMISSIONER']), createStaff);

module.exports = router;
