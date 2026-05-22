/* ═══════════════════════════════════════════
   ReThread – Unified Application Logic
   ═══════════════════════════════════════════ */

// ── Data Store (localStorage backed) ──────
const Store = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  remove(key) { localStorage.removeItem(key); }
};

// ── Seed products if empty ────────────────
function seedProducts() {
  if (Store.get('products')) return;
  const products = [
    { id: 1, name: 'Midnight Velvet Blazer', price: 4999, category: 'Blazers', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop', rating: 4.5 },
    { id: 2, name: 'Amber Silk Shirt', price: 2499, category: 'Shirts', img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop', rating: 4.8 },
    { id: 3, name: 'Classic Navy Chinos', price: 1999, category: 'Trousers', img: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=600&fit=crop', rating: 4.3 },
    { id: 4, name: 'Gold Thread Kurta', price: 3499, category: 'Ethnic', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=600&fit=crop', rating: 4.7 },
    { id: 5, name: 'Slim Fit Denim Jacket', price: 3999, category: 'Jackets', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=600&fit=crop', rating: 4.6 },
    { id: 6, name: 'Linen Summer Shirt', price: 1799, category: 'Shirts', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=600&fit=crop', rating: 4.2 },
    { id: 7, name: 'Tailored Wool Trousers', price: 2999, category: 'Trousers', img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=600&fit=crop', rating: 4.4 },
    { id: 8, name: 'Embroidered Sherwani', price: 7999, category: 'Ethnic', img: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d44?w=500&h=600&fit=crop', rating: 4.9 },
  ];
  Store.set('products', products);
}

// ── Seed users ────────────────────────────
function seedUsers() {
  if (Store.get('users')) return;
  Store.set('users', {
    user:  { username: 'user',  password: 'user123',  role: 'user',  name: 'Arjun Mehta' },
    brand: { username: 'brand', password: 'brand123', role: 'brand', name: 'Luxe Fabrics' },
    admin: { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin' }
  });
}

// ── Init wallet ───────────────────────────
function initWallet() {
  if (Store.get('wallet') === null) Store.set('wallet', 0);
}

// ── Init submissions ──────────────────────
function initSubmissions() {
  if (!Store.get('submissions')) Store.set('submissions', []);
}

// ── Init cart ─────────────────────────────
function initCart() {
  if (!Store.get('cart')) Store.set('cart', []);
}

// ── Toast Notification ────────────────────
function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { info: '💎', success: '✅', error: '❌', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icons[type] || '💎'}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ── Auth helpers ──────────────────────────
function getCurrentUser() { return Store.get('currentUser'); }

function logout() {
  Store.remove('currentUser');
  window.location.href = 'login.html';
}

function requireAuth(allowedRoles = []) {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return null; }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

// ── Header scroll effect ─────────────────
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ── Update header UI for logged-in user ──
function updateHeaderAuth() {
  const authArea = document.getElementById('authArea');
  if (!authArea) return;
  const user = getCurrentUser();
  if (user) {
    const walletBal = Store.get('wallet', 0);
    authArea.innerHTML = `
      <span class="wallet-chip"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1z"/></svg> ₹${walletBal.toLocaleString()}</span>
      <div class="relative group">
        <button class="flex items-center gap-2 text-gray-600 hover:text-green-700 transition" id="userMenuBtn">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-200 to-green-400 flex items-center justify-center text-xs font-bold text-green-900">${user.name.charAt(0)}</div>
          <span class="text-sm font-medium hidden sm:inline text-gray-700">${user.name}</span>
        </button>
        <div class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <span class="block px-4 py-1.5 text-xs text-green-700 uppercase tracking-wider font-semibold">${user.role}</span>
          ${user.role === 'admin' ? '<a href="admin.html" class="block px-4 py-2 text-sm text-gray-600 hover:text-green-700 hover:bg-gray-50">Dashboard</a>' : ''}
          <button onclick="logout()" class="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-b-2xl">Sign Out</button>
        </div>
      </div>`;
  } else {
    authArea.innerHTML = `<a href="login.html" class="btn-gold text-sm flex items-center gap-2 no-underline"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> Sign In</a>`;
  }
}

// ── Fade-in Observer ──────────────────────
function initFadeAnimations() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
}

// ── Cart helpers ──────────────────────────
function addToCart(productId) {
  const products = Store.get('products', []);
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const cart = Store.get('cart', []);
  const existing = cart.find(c => c.id === productId);
  if (existing) { existing.qty++; }
  else { cart.push({ ...product, qty: 1 }); }
  Store.set('cart', cart);
  updateCartBadge();
  showToast(`${product.name} added to cart`, 'success');
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const cart = Store.get('cart', []);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

// ══════════════════════════════════════════
// PAGE-SPECIFIC LOGIC
// ══════════════════════════════════════════

// ── LOGIN PAGE ────────────────────────────
function initLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value.trim();
    const btn = form.querySelector('button[type="submit"]');

    if (!username || !password) { showToast('Please enter both username and password', 'warning'); return; }

    btn.disabled = true;
    btn.textContent = 'Signing In...';

    try {
      const port = window.location.port === '3000' || window.location.port === '5000' ? ':5000' : '';
      const baseUrl = window.location.protocol + '//' + window.location.hostname + port;

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      // Update the local storage with the user returned from backend
      Store.set('currentUser', data.user);
      if (data.token) Store.set('token', data.token);

      showToast(`Welcome, ${data.user.name || data.user.username}!`, 'success');
      setTimeout(() => {
        if (data.user.role === 'admin') window.location.href = 'admin.html';
        else if (data.user.role === 'brand') window.location.href = 'brand.html';
        else window.location.href = 'index.html';
      }, 600);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
}

// ── REGISTER PAGE ─────────────────────────
function initRegisterPage() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUser').value.trim();
    const password = document.getElementById('regPass').value.trim();
    const role = document.getElementById('regRole').value;
    const btn = document.getElementById('regBtn');

    if (!username || !password) { showToast('Please fill all fields', 'warning'); return; }

    btn.disabled = true;
    btn.textContent = 'Registering...';

    try {
      // Assuming server runs on the same origin (or port 5000 in dev)
      const port = window.location.port === '3000' || window.location.port === '5000' ? ':5000' : '';
      const baseUrl = window.location.protocol + '//' + window.location.hostname + port;

      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      // Update the local storage demo 'users' mock with the new user so login works locally
      const users = Store.get('users', {});
      // Create a mock name based on username since we removed it from form
      const name = username.charAt(0).toUpperCase() + username.slice(1);
      users[username] = { username, password, role, name };
      Store.set('users', users);

      showToast('Registration successful! Please sign in.', 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Register';
    }
  });
}

// ── SHOP PAGE ─────────────────────────────
function initShopPage() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const products = Store.get('products', []);
  const filterBtns = document.querySelectorAll('[data-filter]');

  function renderProducts(filter = 'All') {
    const filtered = filter === 'All' ? products : products.filter(p => p.category === filter);
    grid.innerHTML = filtered.map(p => `
      <div class="card fade-up visible group" id="product-${p.id}">
        <div class="overflow-hidden relative">
          <img src="${p.img}" alt="${p.name}" loading="lazy"/>
          <div class="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
            <button onclick="addToCart(${p.id})" class="btn-gold w-full text-sm">Add to Cart</button>
          </div>
        </div>
        <div class="p-5">
          <span class="text-xs text-green-700 font-semibold uppercase tracking-wider">${p.category}</span>
          <h3 class="text-gray-800 font-semibold mt-1">${p.name}</h3>
          <div class="flex items-center justify-between mt-3">
            <span class="text-lg font-bold text-gray-900">₹${p.price.toLocaleString()}</span>
            <span class="text-xs text-gray-400 flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              ${p.rating}
            </span>
          </div>
        </div>
      </div>
    `).join('');
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('bg-green-700', 'text-white'));
      filterBtns.forEach(b => b.classList.add('bg-gray-100', 'text-gray-600'));
      btn.classList.remove('bg-gray-100', 'text-gray-600');
      btn.classList.add('bg-green-700', 'text-white');
      renderProducts(btn.dataset.filter);
    });
  });

  renderProducts();
}

// ── SELL PAGE ─────────────────────────────
function initSellPage() {
  const form = document.getElementById('sellForm');
  if (!form) return;
  const zone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const preview = document.getElementById('imagePreview');
  let uploadedFile = null;

  zone.addEventListener('click', () => fileInput.click());
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault(); zone.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) { showToast('Please upload an image', 'error'); return; }
    uploadedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview" class="w-full h-48 object-cover rounded-lg"/>`;
      zone.querySelector('.zone-text').textContent = file.name;
    };
    reader.readAsDataURL(file);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) { showToast('Please login first', 'error'); return; }
    const submission = {
      id: Date.now(),
      userId: user.username,
      userName: user.name,
      itemName: document.getElementById('itemName').value,
      category: document.getElementById('itemCategory').value,
      condition: document.getElementById('itemCondition').value,
      description: document.getElementById('itemDesc').value,
      image: preview.querySelector('img')?.src || '',
      status: 'pending',
      price: null,
      submittedAt: new Date().toISOString()
    };
    const subs = Store.get('submissions', []);
    subs.push(submission);
    Store.set('submissions', subs);
    showToast('Item submitted for review!', 'success');
    form.reset();
    preview.innerHTML = '';
    zone.querySelector('.zone-text').textContent = 'Drop image here or click to browse';
  });
}

// ── ADMIN PAGE ────────────────────────────
function initAdminPage() {
  const user = requireAuth(['admin']);
  if (!user) return;
  renderAdminSubmissions();
}

function renderAdminSubmissions() {
  const container = document.getElementById('submissionsList');
  if (!container) return;
  const subs = Store.get('submissions', []);
  const stats = {
    total: subs.length,
    pending: subs.filter(s => s.status === 'pending').length,
    approved: subs.filter(s => s.status === 'approved').length,
    rejected: subs.filter(s => s.status === 'rejected').length
  };

  // Update stat cards
  const el = (id) => document.getElementById(id);
  if (el('statTotal')) el('statTotal').textContent = stats.total;
  if (el('statPending')) el('statPending').textContent = stats.pending;
  if (el('statApproved')) el('statApproved').textContent = stats.approved;
  if (el('statRejected')) el('statRejected').textContent = stats.rejected;

  if (subs.length === 0) {
    container.innerHTML = `<div class="text-center py-16 text-gray-400"><svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875V7.5"/></svg><p class="text-lg">No submissions yet</p></div>`;
    return;
  }

  container.innerHTML = subs.map(s => `
    <div class="w-full bg-white border border-gray-200 rounded-3xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center shadow-sm hover:shadow-md transition" id="sub-${s.id}">
      
      <!-- Image Wrapper -->
      <div class="md:col-span-3 flex justify-center md:justify-start">
        <div class="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
          ${s.image ? `<img src="${s.image}" alt="${s.itemName}" class="w-full h-full object-cover"/>` : '<span class="text-gray-400 text-xs">No Image</span>'}
        </div>
      </div>

      <!-- Item Details -->
      <div class="md:col-span-5 space-y-1 text-center md:text-left">
        <div class="flex items-center justify-center md:justify-start gap-3 mb-1 flex-wrap">
          <h3 class="font-semibold text-gray-800 text-lg truncate">${s.itemName}</h3>
          <span class="badge badge-${s.status}">${s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span>
        </div>
        <p class="text-xs text-gray-400 mb-2 truncate">By <span class="font-medium">${s.userName}</span> · ${s.category} · ${s.condition} · ${new Date(s.submittedAt).toLocaleDateString()}</p>
        <p class="text-sm text-gray-500 line-clamp-2">${s.description || 'No description'}</p>
      </div>

      <!-- Action Panel -->
      <div class="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-2 w-full max-w-xs mx-auto md:ml-auto">
        ${s.status === 'pending' ? `
          <input type="number" id="price-${s.id}" placeholder="Set price ₹" class="form-input w-full" min="0"/>
          <div class="flex gap-2 w-full">
            <button onclick="approveSubmission(${s.id})" class="btn-gold flex-1 text-sm py-2">Approve</button>
            <button onclick="rejectSubmission(${s.id})" class="btn-outline flex-1 text-sm !border-red-400 !text-red-500 hover:!bg-red-500 hover:!text-white py-2">Reject</button>
          </div>
        ` : s.status === 'approved' ? `
          <p class="text-green-700 font-semibold text-center md:text-right w-full mt-3 md:mt-0 text-lg">Approved at ₹${s.price?.toLocaleString()}</p>
        ` : `
          <p class="text-red-500 font-semibold text-center md:text-right w-full mt-3 md:mt-0 text-lg">Rejected</p>
        `}
      </div>
    </div>
  `).join('');
}

function approveSubmission(id) {
  const subs = Store.get('submissions', []);
  const sub = subs.find(s => s.id === id);
  if (!sub) return;
  const priceInput = document.getElementById(`price-${id}`);
  const price = parseInt(priceInput?.value);
  if (!price || price <= 0) { showToast('Enter a valid price', 'error'); return; }
  sub.status = 'approved';
  sub.price = price;
  Store.set('submissions', subs);
  // Add to wallet
  const wallet = Store.get('wallet', 0);
  Store.set('wallet', wallet + price);
  showToast(`Approved! ₹${price} added to user's wallet`, 'success');
  renderAdminSubmissions();
  updateHeaderAuth();
}

function rejectSubmission(id) {
  const subs = Store.get('submissions', []);
  const sub = subs.find(s => s.id === id);
  if (!sub) return;
  sub.status = 'rejected';
  Store.set('submissions', subs);
  showToast('Submission rejected', 'warning');
  renderAdminSubmissions();
}

// ── CHECKOUT PAGE ─────────────────────────
function initCheckoutPage() {
  const container = document.getElementById('checkoutItems');
  if (!container) return;
  const cart = Store.get('cart', []);
  const walletBal = Store.get('wallet', 0);

  if (cart.length === 0) {
    container.innerHTML = `<div class="text-center py-16"><p class="text-gray-400 text-lg">Your cart is empty</p><a href="shop.html" class="btn-gold inline-block mt-4 no-underline">Browse Shop</a></div>`;
    document.getElementById('orderSummary')?.remove();
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="flex items-center gap-4 py-5 border-b border-gray-100">
      <img src="${item.img}" alt="${item.name}" class="w-20 h-20 object-cover rounded-2xl"/>
      <div class="flex-1">
        <h4 class="font-semibold text-gray-800">${item.name}</h4>
        <p class="text-sm text-gray-400">${item.category}</p>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="updateQty(${item.id}, -1)" class="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-green-100 hover:text-green-800 transition text-sm">−</button>
        <span class="w-6 text-center font-semibold text-gray-700">${item.qty}</span>
        <button onclick="updateQty(${item.id}, 1)" class="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-green-100 hover:text-green-800 transition text-sm">+</button>
      </div>
      <span class="font-bold text-gray-900 w-24 text-right">₹${(item.price * item.qty).toLocaleString()}</span>
      <button onclick="removeFromCart(${item.id})" class="text-gray-300 hover:text-red-400 transition ml-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    </div>
  `).join('');

  calcBill();
  // Wallet toggle
  const walletEl = document.getElementById('walletBalance');
  if (walletEl) walletEl.textContent = `₹${walletBal.toLocaleString()}`;
  const toggle = document.getElementById('useCredit');
  if (toggle) toggle.addEventListener('change', calcBill);
}

function calcBill() {
  const cart = Store.get('cart', []);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 2000 ? 0 : 99;
  const walletBal = Store.get('wallet', 0);
  const useCredit = document.getElementById('useCredit')?.checked || false;
  const discount = useCredit ? Math.min(walletBal, subtotal + shipping) : 0;
  const total = subtotal + shipping - discount;

  const el = (id) => document.getElementById(id);
  if (el('subtotal')) el('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
  if (el('shipping')) el('shipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
  if (el('creditApplied')) el('creditApplied').textContent = `-₹${discount.toLocaleString()}`;
  if (el('creditRow')) el('creditRow').style.display = useCredit ? 'flex' : 'none';
  if (el('totalPayable')) el('totalPayable').textContent = `₹${total.toLocaleString()}`;
}

function updateQty(id, delta) {
  const cart = Store.get('cart', []);
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { Store.set('cart', cart.filter(c => c.id !== id)); }
  else { Store.set('cart', cart); }
  updateCartBadge();
  initCheckoutPage();
}

function removeFromCart(id) {
  Store.set('cart', Store.get('cart', []).filter(c => c.id !== id));
  updateCartBadge();
  initCheckoutPage();
  showToast('Item removed from cart', 'info');
}

function placeOrder() {
  const cart = Store.get('cart', []);
  if (!cart.length) return;
  const useCredit = document.getElementById('useCredit')?.checked || false;
  if (useCredit) {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal > 2000 ? 0 : 99;
    const walletBal = Store.get('wallet', 0);
    const discount = Math.min(walletBal, subtotal + shipping);
    Store.set('wallet', walletBal - discount);
  }
  Store.set('cart', []);
  showToast('Order placed successfully! 🎉', 'success');
  setTimeout(() => { window.location.href = 'index.html'; }, 1500);
}

// ── Global Init ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  seedProducts();
  seedUsers();
  initWallet();
  initSubmissions();
  initCart();
  initHeaderScroll();
  updateHeaderAuth();
  updateCartBadge();
  initFadeAnimations();

  // Page routers
  const page = document.body.dataset.page;
  if (page === 'login') initLoginPage();
  if (page === 'register') initRegisterPage();
  if (page === 'shop') initShopPage();
  if (page === 'sell') initSellPage();
  if (page === 'admin') initAdminPage();
  if (page === 'checkout') initCheckoutPage();
});
