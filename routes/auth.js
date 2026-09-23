const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const protect = require('../middleware/auth');

const router     = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_production';

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user  = await User.create({ email, password });
    const token = signToken(user._id);

    res.status(201).json({ success: true, token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user._id);
    res.json({ success: true, token, user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /auth/me  (protected)
router.get('/me', protect, (req, res) => {
  res.json({ success: true, data: { id: req.user._id, email: req.user.email } });
});

module.exports = router;
