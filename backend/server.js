import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import db from './database.js';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });

// CORS
app.use(cors({ origin: 'http://localhost:4200' }));

// IMPORTANT: JSON for normal routes
app.use('/create-checkout-session', express.json());

// ---------------- CREATE CHECKOUT SESSION ----------------
app.post('/create-checkout-session', async (req, res) => {
  const { items, email } = req.body;

  if (!items || !items.length) {
    return res.status(400).send('No items in cart');
  }

  try {
    const line_items = items.map((item) => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: 1,
      };
    });

    console.log('Items received from frontend:', items);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_creation: 'always',
      metadata: {
        items: JSON.stringify(items), // 👈 VERY IMPORTANT
      },
      success_url: 'http://localhost:4200/success',
      cancel_url: 'http://localhost:4200/cancel',
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error('Stripe Error:', err);
    res.status(500).json({ error: 'Stripe checkout failed' });
  }
});

// ---------------- STRIPE WEBHOOK ----------------
// MUST be raw body (no json parser here!)
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
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

    console.log('✅ Payment confirmed by Stripe!');
    console.log('💰 Amount:', session.amount_total / 100, session.currency.toUpperCase());
    console.log('📧 Customer email:', session.customer_details.email);

    // -------- SAVE ORDER TO DATABASE --------
    const items = JSON.parse(session.metadata.items || '[]');
    const total = session.amount_total / 100;
    const email = session.customer_details.email;

    db.prepare(`
      INSERT INTO orders (customer_email, items, total_amount, created_at)
      VALUES (?, ?, ?, ?)
    `).run(
      email,
      JSON.stringify(items),
      total,
      new Date().toISOString()
    );

    console.log('📝 Order saved to database!');
  }

  res.status(200).send('Received webhook');
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Stripe server running on http://localhost:${PORT}`)
);
