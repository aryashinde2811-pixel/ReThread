const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  price:       { type: Number, required: true, min: 0 },
  category:    { type: String, required: true, trim: true },
  image:       { type: String, default: '' },
  description: { type: String, default: '' },
  rating:      { type: Number, default: 4.0, min: 0, max: 5 },
  brand:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status:      { type: String, enum: ['active', 'pending', 'archived'], default: 'active' },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
