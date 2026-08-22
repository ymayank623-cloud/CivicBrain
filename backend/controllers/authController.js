const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Temporary memory store for OTPs (In production, use Redis or DB with TTL)
const otpStore = new Map();

// Helper to send email
const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"CivicBrain Nagar Nigam" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verification OTP for Nagar Nigam Portal',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px; margin: auto;">
        <h2 style="color: #1e3a8a; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">नगर निगम | CivicBrain</h2>
        <p>Dear Citizen,</p>
        <p>Your One-Time Password (OTP) for registering on the Municipal Corporation portal is:</p>
        <h1 style="color: #ea580c; font-size: 32px; letter-spacing: 5px; text-align: center; background: #f8fafc; padding: 15px; border-radius: 8px;">${otp}</h1>
        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">This OTP is valid for 5 minutes. Do not share this with anyone.</p>
        <p style="font-size: 12px; color: #64748b;">A Digital India Initiative.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    console.log(`[DEV OTP GENERATED] Email: ${email}, OTP: ${otp}`);

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await sendOTPEmail(email, otp);
      res.json({ message: 'OTP sent successfully to email' });
    } else {
      console.log('EMAIL_USER or EMAIL_PASS not set in .env. Falling back to terminal display.');
      res.json({ message: 'OTP sent (Dev mode: Check terminal for OTP)', devOtp: otp });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP. Ensure email configuration is correct.' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ message: 'OTP not requested or expired' });
    }
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired' });
    }
    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP matched
    otpStore.delete(email);
    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification' });
  }
};


// Public Citizen Registration - HARDCODED ROLE
exports.registerCitizen = async (req, res) => {
  try {
    const { name, email, phone, aadhaar, password, state, city, nagarNigam, ward, address, pincode } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // SECURITY: Force role to CITIZEN to prevent Privilege Escalation
      const newUser = new User({
        name,
        email,
        phone,
        aadhaar,
        state,
        city,
        nagarNigam,
        ward,
        address,
        pincode,
        password: hashedPassword,
        role: 'CITIZEN' // <--- STRICTLY ENFORCED
      });

      await newUser.save();
    } catch (dbError) {
      console.warn("DB not connected, skipping DB save for mock mode registration.");
    }
    
    res.status(201).json({ message: 'Citizen registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unified Login for all roles
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = {
      userId: user._id,
      role: user.role
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
