const express = require('express');
const multer = require('multer');
const path = require('path');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// POST /api/submissions — user submits trade-in
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { itemName, category, condition, description } = req.body;
    if (!itemName || !category || !condition) {
      return res.status(400).json({ message: 'Item name, category, and condition are required' });
    }
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';
    const submission = await Submission.create({
      user: req.user._id,
      itemName, category, condition, description,
      image: imagePath
    });
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/submissions — admin lists all
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const subs = await Submission.find()
      .populate('user', 'name username')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/submissions/mine — user's own
router.get('/mine', protect, async (req, res) => {
  try {
    const subs = await Submission.find({ user: req.user._id }).sort({ submittedAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/submissions/:id/approve — admin approves
router.put('/:id/approve', protect, requireRole('admin'), async (req, res) => {
  try {
    const { price } = req.body;
    if (!price || price <= 0) {
      return res.status(400).json({ message: 'A valid price is required' });
    }
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    if (sub.status !== 'pending') {
      return res.status(400).json({ message: 'Submission already reviewed' });
    }

    sub.status = 'approved';
    sub.approvedPrice = price;
    sub.reviewedBy = req.user._id;
    sub.reviewedAt = new Date();
    await sub.save();

    // Credit wallet
    const seller = await User.findById(sub.user);
    seller.walletBalance += price;
    seller.walletHistory.push({
      type: 'credit',
      amount: price,
      description: `Trade-in approved: ${sub.itemName}`
    });
    await seller.save();

    res.json({ submission: sub, newBalance: seller.walletBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/submissions/:id/reject — admin rejects
router.put('/:id/reject', protect, requireRole('admin'), async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    if (sub.status !== 'pending') {
      return res.status(400).json({ message: 'Submission already reviewed' });
    }

    sub.status = 'rejected';
    sub.reviewedBy = req.user._id;
    sub.reviewedAt = new Date();
    await sub.save();

    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
