// backend/server.js
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from './database.js';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

// ---------------- CORS ----------------
app.use(cors({ origin: 'http://localhost:4200' }));

// ============================================================
// 📧 EMAIL SETUP
// ============================================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(err => {
  if (err) console.log('❌ Email transporter error:', err.message);
  else console.log('✅ Email transporter ready');
});

// ============================================================
// 🔐 AUTH HELPERS
// ============================================================
function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Attach guest orders to user after login/register
function attachGuestOrdersToUser(userId, email) {
  if (!userId || !email) return;

  db.prepare(`
    UPDATE orders
    SET user_id = ?
    WHERE user_id IS NULL AND customer_email = ?
  `).run(userId, email);
}

// ============================================================
// 🔔 STRIPE WEBHOOK (RAW BODY FIRST)
// ============================================================
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log('❌ Webhook signature failed:', err.message);
      return res.status(400).send('Webhook Error');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const items = JSON.parse(session.metadata.items || '[]');
      const total = session.amount_total / 100;
      const email =
        session.customer_details?.email || session.customer_email || null;
      const userId = session.metadata.user_id
        ? Number(session.metadata.user_id)
        : null;

      const existing = db
        .prepare('SELECT id FROM orders WHERE session_id = ?')
        .get(session.id);
      if (existing) return res.sendStatus(200);

      db.prepare(`
        INSERT INTO orders (session_id, user_id, customer_email, items, total_amount, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        session.id,
        userId,
        email,
        JSON.stringify(items),
        total,
        new Date().toISOString()
      );

      console.log('📝 Order saved');
    }

    res.sendStatus(200);
  }
);

// ============================================================
// JSON middleware AFTER webhook
// ============================================================
app.use(express.json());

// ============================================================
// ✅ AUTH ROUTES
// ============================================================

// REGISTER
app.post('/auth/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  if (password.length < 8)
    return res
      .status(400)
      .json({ error: 'Password must be at least 8 characters' });

  const existing = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(email);
  if (existing)
    return res.status(409).json({ error: 'Email already registered' });

  const password_hash = await bcrypt.hash(password, 10);

  const result = db
    .prepare(
      `
    INSERT INTO users (first_name, last_name, email, password_hash, created_at)
    VALUES (?, ?, ?, ?, ?)
  `
    )
    .run(firstName || null, lastName || null, email, password_hash, new Date().toISOString());

  const user = {
    id: result.lastInsertRowid,
    email,
    first_name: firstName || null,
    last_name: lastName || null,
  };

  attachGuestOrdersToUser(user.id, user.email);

  res.json({ token: createToken(user), user });
});

// LOGIN ✅ FIXED
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  attachGuestOrdersToUser(user.id, user.email);

  res.json({
    token: createToken(user),
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    },
  });
});

// WHO AM I
app.get('/auth/me', requireAuth, (req, res) => {
  const user = db
    .prepare('SELECT id, email, first_name, last_name FROM users WHERE id = ?')
    .get(req.user.id);
  res.json(user);
});

// UPDATE PROFILE ✅ NEW
app.put('/auth/profile', requireAuth, (req, res) => {
  const { firstName, lastName, email } = req.body;

  db.prepare(`
    UPDATE users
    SET first_name = ?, last_name = ?, email = ?
    WHERE id = ?
  `).run(firstName, lastName, email, req.user.id);

  const updatedUser = db
    .prepare(
      'SELECT id, email, first_name, last_name FROM users WHERE id = ?'
    )
    .get(req.user.id);

  res.json(updatedUser);
});

// ============================================================
// 🔑 PASSWORD RESET (unchanged)
// ============================================================
// (your forgot/reset password code remains exactly as-is)

// ============================================================
// 👤 USER ORDERS
// ============================================================
app.get('/my-orders', requireAuth, (req, res) => {
  const orders = db
    .prepare(
      `
    SELECT id, items, total_amount, created_at
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
  `
    )
    .all(req.user.id);

  res.json(
    orders.map(o => ({ ...o, items: JSON.parse(o.items) }))
  );
});

// SINGLE ORDER
app.get('/orders/:id', requireAuth, (req, res) => {
  const order = db
    .prepare(
      `
    SELECT id, items, total_amount, created_at
    FROM orders
    WHERE id = ? AND user_id = ?
  `
    )
    .get(req.params.id, req.user.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.items = JSON.parse(order.items);
  res.json(order);
});

// ============================================================
// 🚀 START SERVER
// ============================================================
app.listen(3000, () =>
  console.log('✅ Server running on http://localhost:3000')
);
