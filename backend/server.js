import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import db from './database.js';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

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
// 🌍 CORS
// ============================================================
app.use(cors({ origin: 'http://localhost:4200' }));

// ============================================================
// 🔔 STRIPE WEBHOOK (MUST BE FIRST, BEFORE express.json)
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
      console.log('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ PAYMENT SUCCESS
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const items = JSON.parse(session.metadata.items || '[]');
      const total = session.amount_total / 100;
      const email = session.customer_details?.email || null;

      console.log('✅ Payment confirmed by Stripe!');
      console.log('📧 Customer email:', email);

      // 💾 Save to DB
      db.prepare(`
        INSERT INTO orders (session_id, customer_email, items, total_amount, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        session.id,
        email,
        JSON.stringify(items),
        total,
        new Date().toISOString()
      );

      console.log('📝 Order saved to DB!');

      // 📧 SEND CONFIRMATION EMAIL
      await transporter.sendMail({
        from: `"Dejen Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🎉 Thank you for your purchase!',
        html: `
          <h2>Payment Successful 🎉</h2>
          <p>Thank you for your order!</p>

          <h3>Your Items:</h3>
          <ul>
            ${items
          .map(
            (item) =>
              `<li>${item.name} — $${item.price}</li>`
          )
          .join('')}
          </ul>

          <p><strong>Total:</strong> $${total}</p>

          <p>We appreciate your support!</p>
        `,
      });

      console.log('📧 Confirmation email sent!');
    }

    res.status(200).send('OK');
  }
);

// ============================================================
// AFTER WEBHOOK — now JSON is safe
// ============================================================
app.use(express.json());

// ============================================================
// 🛒 CREATE CHECKOUT SESSION
// ============================================================
app.post('/create-checkout-session', async (req, res) => {
  const { items, email } = req.body;

  try {
    const line_items = items.map((item) => ({
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
      },
      success_url:
        'http://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:4200/cancel',
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Stripe error');
  }
});

// ============================================================
// 📦 GET ORDER (optional now, only for admin/debug)
// ============================================================
app.get('/order/:sessionId', (req, res) => {
  const order = db
    .prepare(`SELECT * FROM orders WHERE session_id = ?`)
    .get(req.params.sessionId);

  res.json(order);
});

// ============================================================
// 🚀 START SERVER
// ============================================================
app.listen(3000, () =>
  console.log('✅ Server running on http://localhost:3000')
);
