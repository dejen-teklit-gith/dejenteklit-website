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

// Optional but helpful: verify transporter on startup
transporter.verify((err) => {
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
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // {id, email}
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ✅ Attach guest orders (user_id NULL) to a user after login/register
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
      try {
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
      } catch (err) {
        console.log('❌ Receipt email send failed:', err.message);
      }
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

  // ✅ merge guest orders
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

  // ✅ merge guest orders
  attachGuestOrdersToUser(user.id, user.email);

  const token = createToken(user);
  res.json({ token, user: { id: user.id, email: user.email } });
});

// WHO AM I
app.get('/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, first_name, last_name FROM users WHERE id = ?')
    .get(req.user.id);
  res.json(user);
});

// ============================================================
// 🔑 FORGOT PASSWORD (ONE VERSION ONLY)
// ============================================================
app.post('/auth/forgot-password', async (req, res) => {
  console.log('🚨 FORGOT PASSWORD ROUTE HIT');
  console.log('📩 BODY:', req.body);
  const { email } = req.body;

  // Always return same message (security)
  const safeMsg = { message: 'If that email exists, a reset link was sent.' };
  if (!email) return res.json(safeMsg);

  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
  if (!user) return res.json(safeMsg);

  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30 minutes

    db.prepare(`
      INSERT INTO password_resets (user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(user.id, token, expiresAt, new Date().toISOString());

    const resetLink = `http://localhost:4200/reset-password?token=${token}`;

    console.log('🔐 Password reset requested for:', user.email);
    console.log('🔗 RESET LINK (debug):', resetLink); // helpful while testing

    await transporter.sendMail({
      from: `"Dejen Store" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Reset your password',
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetLink}">Reset your password</a></p>
        <p>This link expires in 30 minutes.</p>
      `,
    });

    console.log('📧 Reset email sent to:', user.email);
    return res.json(safeMsg);
  } catch (err) {
    console.log('❌ Reset email failed:', err.message);
    // still return safe msg to frontend
    return res.json(safeMsg);
  }
});

// ============================================================
// 🔁 RESET PASSWORD
// ============================================================
app.post('/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) return res.status(400).json({ error: 'Invalid request' });
  if (String(password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const row = db.prepare(`
    SELECT * FROM password_resets
    WHERE token = ? AND used = 0
  `).get(token);

  if (!row) return res.status(400).json({ error: 'Invalid or expired token' });

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return res.status(400).json({ error: 'Token expired' });
  }

  const hash = await bcrypt.hash(password, 10);

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, row.user_id);
  db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(row.id);

  res.json({ message: 'Password updated successfully' });
});

// ============================================================
// 🛒 CREATE CHECKOUT SESSION
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
      customer_email: email,
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
// 👤 SINGLE ORDER (only owner can view)
app.get('/orders/:id', requireAuth, (req, res) => {
  const order = db.prepare(`
    SELECT id, items, total_amount, created_at
    FROM orders
    WHERE id = ? AND user_id = ?
  `).get(req.params.id, req.user.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.items = JSON.parse(order.items);
  res.json(order);
});
// 👁️ GET SINGLE ORDER (by id)
app.get('/orders/:id', requireAuth, (req, res) => {
  const order = db.prepare(`
    SELECT id, items, total_amount, created_at
    FROM orders
    WHERE id = ? AND user_id = ?
  `).get(req.params.id, req.user.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.items = JSON.parse(order.items);
  res.json(order);
});

// ============================================================
// ✉️ SUBSCRIBE
// ============================================================
app.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  db.prepare(`INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, ?)`)
    .run(email, new Date().toISOString());

  try {
    await transporter.sendMail({
      from: `"Dejen Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Dejen Community 🎶',
      html: `<h2>Welcome!</h2><p>You’ll get updates on new music and merch.</p>`,
    });
  } catch (err) {
    console.log('❌ Subscribe email failed:', err.message);
  }

  res.json({ message: 'Subscribed successfully' });
});

// ============================================================
// 🚀 START SERVER
// ============================================================
app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
