const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const walletEntrySchema = new mongoose.Schema({
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 4 },
  name:     { type: String, trim: true, default: '' },
  role:     { type: String, enum: ['user', 'brand', 'admin'], default: 'user' },
  walletBalance: { type: Number, default: 0 },
  walletHistory: [walletEntrySchema],
  createdAt: { type: Date, default: Date.now }
}, { autoIndex: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
