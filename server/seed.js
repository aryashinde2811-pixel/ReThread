require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rethread';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing users and products');

    // Seed users
    const users = await User.create([
      {
        username: 'user',
        email: 'user@rethread.com',
        password: 'user123',
        name: 'Arjun Mehta',
        role: 'user',
        walletBalance: 500,
        walletHistory: [{ type: 'credit', amount: 500, description: 'Welcome bonus' }]
      },
      {
        username: 'brand',
        email: 'brand@rethread.com',
        password: 'brand123',
        name: 'Luxe Fabrics',
        role: 'brand',
        walletBalance: 0,
        walletHistory: []
      },
      {
        username: 'admin',
        email: 'admin@rethread.com',
        password: 'admin123',
        name: 'Admin',
        role: 'admin',
        walletBalance: 0,
        walletHistory: []
      }
    ]);
    console.log(`👤 Seeded ${users.length} users`);

    const brand = users.find(u => u.role === 'brand');

    // Seed products
    const products = await Product.create([
      { name: 'Midnight Velvet Blazer',  price: 4999, category: 'Blazers',  image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop', rating: 4.5, brand: brand._id },
      { name: 'Amber Silk Shirt',        price: 2499, category: 'Shirts',   image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop', rating: 4.8, brand: brand._id },
      { name: 'Classic Navy Chinos',     price: 1999, category: 'Trousers', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=600&fit=crop', rating: 4.3, brand: brand._id },
      { name: 'Gold Thread Kurta',       price: 3499, category: 'Ethnic',   image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=600&fit=crop', rating: 4.7, brand: brand._id },
      { name: 'Slim Fit Denim Jacket',   price: 3999, category: 'Jackets',  image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=600&fit=crop', rating: 4.6, brand: brand._id },
      { name: 'Linen Summer Shirt',      price: 1799, category: 'Shirts',   image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=600&fit=crop', rating: 4.2, brand: brand._id },
      { name: 'Tailored Wool Trousers',  price: 2999, category: 'Trousers', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=600&fit=crop', rating: 4.4, brand: brand._id },
      { name: 'Embroidered Sherwani',    price: 7999, category: 'Ethnic',   image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=500&h=600&fit=crop', rating: 4.9, brand: brand._id },
    ]);
    console.log(`🛍️  Seeded ${products.length} products`);

    console.log('\n🌟 Seed complete! Demo credentials:');
    console.log('   User:  user / user123');
    console.log('   Brand: brand / brand123');
    console.log('   Admin: admin / admin123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedData();
