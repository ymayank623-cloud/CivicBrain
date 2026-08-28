const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// In-memory OTP store (for demo - resets on server restart)
const otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/otp/send
router.post('/send', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // 10 min expiry

  const mailOptions = {
    from: `"CivicBrain - Nagar Nigam Portal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for CivicBrain Registration',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a3a6b; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 20px;">CivicBrain — Nagar Nigam Portal</h2>
          <p style="color: #aac8f0; font-size: 12px; margin: 4px 0 0;">Ministry of Housing & Urban Affairs | Digital India</p>
        </div>
        <div style="padding: 30px;">
          <p style="color: #333; font-size: 14px;">Dear Citizen,</p>
          <p style="color: #555; font-size: 13px;">Your One-Time Password (OTP) for Email Verification on CivicBrain Portal is:</p>
          <div style="background: #f0f4f8; border: 2px dashed #1a3a6b; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1a3a6b;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 12px;">This OTP is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>
          <p style="color: #888; font-size: 12px;">Government officials will <strong>never</strong> ask for your OTP.</p>
        </div>
        <div style="background: #f5f5f5; padding: 12px 20px; text-align: center; font-size: 11px; color: #999;">
          © 2025 CivicBrain | Ministry of Urban Development | Digital India
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ message: 'Failed to send OTP. Check email config.' });
  }
});

// POST /api/otp/verify
router.post('/verify', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record) return res.status(400).json({ message: 'OTP not found. Please request again.' });
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
  }
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
  delete otpStore[email];
  res.json({ success: true, message: 'Email verified successfully' });
});

module.exports = router;