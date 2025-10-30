const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Mongoose model
const memberSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  company: String,
  role: String,
  bio: String,
  files: Array,
  registeredAt: Date,
  verified: { type: Boolean, default: false }
});
const Member = mongoose.models.Member || mongoose.model('Member', memberSchema);

// Nodemailer transporter (optional)
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
}

// POST /api/members  - create member
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    data.registeredAt = new Date();
    const member = new Member(data);
    await member.save();

    // Send welcome email if transporter configured
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: data.email,
          subject: 'Welcome to Widebrain Classic Network',
          text: `Hi ${data.fullName},\n\nThank you for registering with ${data.company}. We have received your registration.\n\nRegards,\nWidebrain Classic Team`
        });
      } catch(e) {
        console.error('Email send error', e.message);
      }
    }

    res.status(201).json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save member' });
  }
});

// GET /api/members - list members
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ registeredAt: -1 }).limit(1000);
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

module.exports = router;