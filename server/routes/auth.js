const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if user already exists
    const exists = await User.findOne({ username: username.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Only allow user/brand registration (admin is seeded only)
    const allowedRoles = ['user', 'brand', 'admin'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    // Create user — password is hashed automatically by the pre-save hook in User model
    const user = await User.create({
      username,
      password,
      role: userRole,
      name: username,
      walletBalance: 0
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        walletBalance: user.walletBalance
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('--- LOGIN ATTEMPT START ---');
    console.log('1. What the frontend form sent (req.body):', req.body);

    const { username, password } = req.body;

    if (!username || !password) {
      console.log('--- LOGIN ATTEMPT END (Missing fields) ---');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    console.log('2. Database search result (User found?):', user ? 'YES' : 'NO');

    if (user) {
      console.log('3. Password from form:', password);
      console.log('4. Encrypted password in DB:', user.password);
      
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('5. Does Bcrypt say they match?:', isMatch);

      if (!isMatch) {
        console.log('--- LOGIN ATTEMPT END (Invalid password) ---');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);

      console.log('--- LOGIN ATTEMPT END (Success) ---');
      res.json({
        success: true,
        role: user.role,
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          walletBalance: user.walletBalance,
          walletHistory: user.walletHistory
        }
      });
    } else {
      console.log('--- LOGIN ATTEMPT END (User not found) ---');
      return res.status(400).json({ message: 'This account does not exist. Please register first.' });
    }
  } catch (err) {
    console.error('Login error:', err);
    console.log('--- LOGIN ATTEMPT END (Error) ---');
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      walletBalance: user.walletBalance,
      walletHistory: user.walletHistory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
