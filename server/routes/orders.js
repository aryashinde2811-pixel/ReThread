const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — place order
router.post('/', protect, async (req, res) => {
  try {
    const { items, subtotal, shipping, useWallet } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let walletUsed = 0;
    const user = await User.findById(req.user._id);

    if (useWallet && user.walletBalance > 0) {
      walletUsed = Math.min(user.walletBalance, subtotal + shipping);
      user.walletBalance -= walletUsed;
      user.walletHistory.push({
        type: 'debit',
        amount: walletUsed,
        description: `Used wallet credit for order`
      });
      await user.save();
    }

    const total = subtotal + shipping - walletUsed;

    const order = await Order.create({
      user: req.user._id,
      items,
      subtotal,
      shipping,
      walletUsed,
      total
    });

    res.status(201).json({ order, newBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/mine — user's orders
router.get('/mine', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders — admin: all orders
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name username').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status — admin updates status
router.put('/:id/status', protect, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
