import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

console.log('Stripe key:', process.env.STRIPE_SECRET_KEY);

// ✅ CORS first
app.use(cors());

/**
 * ✅ WEBHOOK — MUST BE BEFORE express.json()
 * and MUST use express.raw()
 */
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log('✅ Payment confirmed by Stripe!');
        console.log('💰 Amount:', session.amount_total / 100, 'USD');
        console.log('📧 Customer email:', session.customer_details.email);
      }

      res.json({ received: true });
    } catch (err) {
      console.log('❌ Webhook signature failed:', err.message);
      res.sendStatus(400);
    }
  }
);

/**
 * ✅ AFTER webhook, now we can use json parser
 */
app.use(express.json());

/**
 * ✅ Checkout session route
 */
app.post('/create-checkout-session', async (req, res) => {
  const { items } = req.body;

  if (!items || !items.length) {
    return res.status(400).send('No items in cart');
  }

  try {
    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',

      customer_creation: 'always',
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },

      success_url: 'http://localhost:4200/success',
      cancel_url: 'http://localhost:4200/cancel',
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () =>
  console.log('✅ Stripe server running on http://localhost:3000')
);
