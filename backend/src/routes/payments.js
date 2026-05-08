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
