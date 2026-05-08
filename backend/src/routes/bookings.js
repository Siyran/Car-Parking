import express from 'express';
import db from '../db.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, bookingLimiter, async (req, res) => {
  try {
    const { spotId, hours, paymentMethod } = req.body;
    // Basic availability check
    const { rows: srows } = await db.query('SELECT available_slots, price_per_hour FROM spots WHERE id=$1', [spotId]);
    const spot = srows[0];
    if (!spot) return res.status(404).json({ error: 'Spot not found' });
    if (spot.available_slots <= 0) return res.status(409).json({ error: 'No slots' });
    const userId = req.user.id;
    const start = new Date();
    const end = new Date(Date.now() + (hours || 1) * 3600 * 1000);
    const total = Number(spot.price_per_hour) * (hours || 1);
    const { rows } = await db.query('INSERT INTO bookings (user_id,spot_id,start_time,end_time,status,total_amount) VALUES($1,$2,$3,$4,$5,$6) RETURNING *', [userId, spotId, start, end, 'reserved', total]);
    // decrement slot (simple)
    await db.query('UPDATE spots SET available_slots = GREATEST(0, available_slots - 1) WHERE id=$1', [spotId]);
    res.json({ booking: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Booking failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM bookings WHERE user_id=$1 ORDER BY created_at DESC LIMIT 200', [req.user.id]);
    res.json({ bookings: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM bookings WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ booking: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

router.patch('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const { rows } = await db.query('UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *', ['cancelled', id]);
    // increment slot
    if (rows[0]) {
      await db.query('UPDATE spots SET available_slots = available_slots + 1 WHERE id=$1', [rows[0].spot_id]);
    }
    res.json({ booking: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cancel failed' });
  }
});

export default router;
