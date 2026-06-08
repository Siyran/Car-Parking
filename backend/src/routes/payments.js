import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import db from '../db.js';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET || '', { apiVersion: '2024-08-01' });
const router = express.Router();

router.post('/intent', async (req, res) => {
  const { amount, currency = 'inr', bookingId } = req.body;
  try {
    if (!process.env.STRIPE_SECRET) return res.status(500).json({ error: 'Stripe not configured' });
    const paymentIntent = await stripe.paymentIntents.create({ amount: Math.round(Number(amount) * 100), currency });
    // persist placeholder payment
    await db.query('INSERT INTO payments (booking_id,stripe_payment_intent_id,status,amount) VALUES($1,$2,$3,$4)', [bookingId, paymentIntent.id, paymentIntent.status, amount]);
    res.json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment intent failed' });
  }
});

router.post('/confirm', async (req, res) => {
  // For card payments, the frontend confirms with Stripe; webhook will mark booking
  res.json({ ok: true });
});

// Create a Stripe Checkout session and return the redirect URL
router.post('/checkout', async (req, res) => {
  const { amount, currency = 'inr', month } = req.body;
  try {
    if (!process.env.STRIPE_SECRET) return res.status(500).json({ error: 'Stripe not configured' });
    const successUrl = process.env.STRIPE_SUCCESS_URL || `${req.protocol}://${req.get('host')}/payments/success`;
    const cancelUrl = process.env.STRIPE_CANCEL_URL || `${req.protocol}://${req.get('host')}/payments/cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: { name: `ParkFlow Billing ${month || ''}` },
          unit_amount: Math.round(Number(amount) * 100)
        },
        quantity: 1
      }],
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    // Optionally persist a placeholder payment row linking to the session
    await db.query('INSERT INTO payments (booking_id,stripe_payment_intent_id,status,amount) VALUES($1,$2,$3,$4)', [month || null, session.payment_intent || session.id, session.payment_status || 'open', amount]);

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Checkout session failed' });
  }
});

// Expose publishable key for frontend (optional)
router.get('/key', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE || '' });
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  try {
    let event;
    if (secret) {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } else {
      event = req.body; // unsafe if not configured
    }
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      // Mark payment and booking confirmed
      await db.query('UPDATE payments SET status=$1 WHERE stripe_payment_intent_id=$2', ['succeeded', intent.id]);
      // TODO: mark booking confirmed
    }
    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      await db.query('UPDATE payments SET status=$1 WHERE stripe_payment_intent_id=$2', ['failed', intent.id]);
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook failed', err);
    res.status(400).send(`Webhook error: ${err.message}`);
  }
});

export default router;
