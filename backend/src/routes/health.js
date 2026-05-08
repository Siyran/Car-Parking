import express from 'express';
import db from '../db.js';
import redis from '../utils/cache.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await db.query('SELECT 1');
    await redis.get('healthcheck');
    res.json({ ok: true, db: 'ok', redis: 'ok' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
