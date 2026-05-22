const express = require('express');
const Product = require('../models/Product');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/products — public listing
router.get('/', async (req, res) => {
  try {
    const { category, search, limit } = req.query;
    const filter = { status: 'active' };
    if (category && category !== 'All') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    let query = Product.find(filter).sort({ createdAt: -1 });
    if (limit) query = query.limit(parseInt(limit));

    const products = await query.populate('brand', 'name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('brand', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products — brand/admin creates product
router.post('/', protect, requireRole('brand', 'admin'), async (req, res) => {
  try {
    const { name, price, category, image, description, rating } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }
    const product = await Product.create({
      name, price, category, image, description,
      rating: rating || 4.0,
      brand: req.user.role === 'brand' ? req.user._id : null,
      status: req.user.role === 'admin' ? 'active' : 'pending'
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', protect, requireRole('brand', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Brands can only edit their own products
    if (req.user.role === 'brand' && String(product.brand) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your product' });
    }

    const updates = req.body;
    Object.assign(product, updates);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products/:id — admin only
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/brand/mine — brand's own products
router.get('/brand/mine', protect, requireRole('brand'), async (req, res) => {
  try {
    const products = await Product.find({ brand: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
