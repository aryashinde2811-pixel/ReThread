const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName:      { type: String, required: true, trim: true },
  category:      { type: String, required: true },
  condition:     { type: String, enum: ['Like New', 'Good', 'Fair'], required: true },
  description:   { type: String, default: '' },
  image:         { type: String, default: '' },
  status:        { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedPrice: { type: Number, default: null },
  reviewedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  submittedAt:   { type: Date, default: Date.now },
  reviewedAt:    { type: Date, default: null }
});

module.exports = mongoose.model('Submission', submissionSchema);
