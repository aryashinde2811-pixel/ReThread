const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:    { type: String, required: true },
  price:   { type: Number, required: true },
  qty:     { type: Number, required: true, min: 1 },
  image:   { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:      [orderItemSchema],
  subtotal:   { type: Number, required: true },
  shipping:   { type: Number, default: 0 },
  walletUsed: { type: Number, default: 0 },
  total:      { type: Number, required: true },
  status:     { type: String, enum: ['placed', 'processing', 'shipped', 'delivered'], default: 'placed' },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
