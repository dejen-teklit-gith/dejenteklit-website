// backend/server.js
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './database.js';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });

// ---------------- CORS ----------------
app.use(cors({ origin: 'http://localhost:4200' }));

// ============================================================
// 📧 EMAIL SETUP
// ============================================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
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
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // {id, email}
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ✅ NEW: Attach guest orders (user_id NULL) to a user after login/register
function attachGuestOrdersToUser(userId, email) {
  if (!userId || !email) return;

  db.prepare(`
    UPDATE orders
    SET user_id = ?
    WHERE user_id IS NULL
      AND customer_email = ?
  `).run(userId, email);
}

// ============================================================
// 🔔 STRIPE WEBHOOK (RAW BODY MUST BE FIRST)
// ============================================================
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send('Webhook Error');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const items = JSON.parse(session.metadata.items || '[]');
    const total = session.amount_total / 100;
    const email = session.customer_details?.email || session.customer_email || null;
    const userId = session.metadata.user_id ? Number(session.metadata.user_id) : null;

    const existing = db.prepare('SELECT * FROM orders WHERE session_id = ?').get(session.id);
    if (existing) return res.status(200).send('Already processed');

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

    console.log('📝 Order saved to DB');

    // Email receipt
    if (email) {
      await transporter.sendMail({
        from: `"Dejen Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🎉 Payment Successful!',
        text: `
Thank you for your order!

Your Items:
${items.map(i => `${i.name} — $${i.price}`).join('\n')}

Total: $${total}

We appreciate your support!
        `,
      });

      console.log('📧 Confirmation email sent!');
    }
  }

  res.status(200).send('OK');
});

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

  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (String(password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const password_hash = await bcrypt.hash(password, 10);

  const result = db.prepare(`
    INSERT INTO users (first_name, last_name, email, password_hash, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(firstName || null, lastName || null, email, password_hash, new Date().toISOString());

  const user = { id: result.lastInsertRowid, email };

  // ✅ NEW: Merge guest orders into this new account
  attachGuestOrdersToUser(user.id, user.email);

  const token = createToken(user);

  res.json({ token, user });
});

// LOGIN
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  // ✅ NEW: Merge guest orders into this account on login
  attachGuestOrdersToUser(user.id, user.email);

  const token = createToken(user);

  res.json({ token, user: { id: user.id, email: user.email } });
});

// WHO AM I
app.get('/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, first_name, last_name FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// ============================================================
// 🛒 CREATE CHECKOUT SESSION
// IMPORTANT: If logged-in, pass user_id in metadata.
// ============================================================
app.post('/create-checkout-session', async (req, res) => {
  const { items, email, userId } = req.body;

  if (!items || !items.length) return res.status(400).send('No items in cart');

  try {
    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: email, // allow guest or user
      metadata: {
        items: JSON.stringify(items),
        user_id: userId ? String(userId) : '',
      },
      success_url: 'http://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:4200/cancel',
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Stripe error');
  }
});

// ============================================================
// 👤 USER ORDERS
// ============================================================
app.get('/my-orders', requireAuth, (req, res) => {
  const orders = db.prepare(`
    SELECT id, session_id, items, total_amount, created_at
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(req.user.id);

  const parsed = orders.map(o => ({ ...o, items: JSON.parse(o.items) }));
  res.json(parsed);
});

// ============================================================
// ✉️ SUBSCRIBE
// ============================================================
app.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  db.prepare(`INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, ?)`)
    .run(email, new Date().toISOString());

  await transporter.sendMail({
    from: `"Dejen Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Dejen Community 🎶',
    html: `<h2>Welcome!</h2><p>You’ll get updates on new music and merch.</p>`,
  });

  res.json({ message: 'Subscribed successfully' });
});

// ============================================================
// 🚀 START SERVER
// ============================================================
app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
