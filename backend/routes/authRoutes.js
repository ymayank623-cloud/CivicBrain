const express = require('express');
const router = express.Router();
const { registerCitizen, login, sendOtp, verifyOtp } = require('../controllers/authController');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', registerCitizen);
router.post('/login', login);

module.exports = router;
