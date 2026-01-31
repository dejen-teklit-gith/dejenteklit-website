// backend/server.js
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import db from './database.js'; // Import the database

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });

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

// ============================================================
// 🔔 STRIPE WEBHOOK (must be before express.json)
// ============================================================
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const items = JSON.parse(session.metadata.items || '[]');
    const total = session.amount_total / 100;
    const email = session.customer_details?.email;

    const existing = db.prepare('SELECT * FROM orders WHERE session_id = ?').get(session.id);
    if (existing) return res.status(200).send('Already processed');

    db.prepare(`
      INSERT INTO orders (session_id, customer_email, items, total_amount, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(session.id, email, JSON.stringify(items), total, new Date().toISOString());

    console.log('📝 Order saved to DB');

    await transporter.sendMail({
      from: `"Dejen Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Payment Successful!',
      html: `
        <h2>Payment Successful 🎉</h2>
        <p>Thank you for your order!</p>
        <h3>Your Items:</h3>
        <ul>${items.map(i => `<li>${i.name} — $${i.price}</li>`).join('')}</ul>
        <p><strong>Total:</strong> $${total}</p>
        <p>We appreciate your support!</p>
      `,
    });

    console.log('📧 Confirmation email sent!');
  }

  res.status(200).send('OK');
});

// ============================================================
// AFTER WEBHOOK — now safe to use middleware
// ============================================================
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// ============================================================
// 🛒 CREATE CHECKOUT SESSION
// ============================================================
app.post('/create-checkout-session', async (req, res) => {
  const { items, email } = req.body;
  try {
    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: email,
      metadata: { items: JSON.stringify(items) },
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
// ✉️ SUBSCRIBE
// ============================================================
app.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    db.prepare(`INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, ?)`).run(
      email,
      new Date().toISOString()
    );

    await transporter.sendMail({
      from: `"Dejen Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Dejen Community 🎶',
      html: `
        <h2>Welcome!</h2>
        <p>Thank you for subscribing. You'll get updates on new music and merch!</p>
      `,
    });

    res.json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Subscription failed' });
  }
});

// ============================================================
// 🚀 START SERVER
// ============================================================
app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));

