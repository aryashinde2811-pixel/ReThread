require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Try connecting to MongoDB (non-blocking)
connectDB().catch(() => {});

// Middleware
app.use(cors({
  origin: [
    'https://rethread-ae7e7.web.app',
    'https://rethread-ae7e7.firebaseapp.com',
    'http://localhost:5000',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Serve static frontend files from public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/orders', require('./routes/orders'));

// Clean URL support: /shop -> /shop.html, etc.
const pages = ['shop', 'sell', 'login', 'register', 'checkout', 'admin', 'brand', 'wallet'];
pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    const filePath = path.join(__dirname, '..', 'public', `${page}.html`);
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.status(404).send('Page not found');
  });
});

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🌿 ReThread server running on http://localhost:${PORT}`);
});
