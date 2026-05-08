import express from 'express';
import db from '../db.js';
import { get, set } from '../utils/cache.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/spots?lat=&lng=&radius=&available=&price_max=
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 5000, available, price_max } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat & lng required' });
    const cacheKey = `spots:${lat}:${lng}:${radius}:${available || ''}:${price_max || ''}`;
    const cached = await get(cacheKey);
    if (cached) return res.json({ spots: cached });

    const params = [lng, lat, radius];
    let q = `SELECT id, title, address, price_per_hour, total_slots, available_slots, ST_X(location::geometry) AS lng, ST_Y(location::geometry) AS lat, ST_Distance(location, ST_SetSRID(ST_MakePoint($1,$2),4326)) AS distance FROM spots WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($1,$2),4326), $3)`;
    let idx = 4;
    if (available === '1') { q += ` AND available_slots > 0`; }
    if (price_max) { q += ` AND price_per_hour <= $${idx}`; params.push(price_max); idx++; }
    q += ` ORDER BY distance LIMIT 200`;
    const { rows } = await db.query(q, params);
    await set(cacheKey, rows, 30);
    res.json({ spots: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch spots' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const cacheKey = `spot:${id}`;
    const cached = await get(cacheKey);
    if (cached) return res.json({ spot: cached });
    const { rows } = await db.query('SELECT *,(ST_X(location::geometry)) AS lng,(ST_Y(location::geometry)) AS lat FROM spots WHERE id=$1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    await set(cacheKey, rows[0], 60);
    res.json({ spot: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

router.get('/:id/availability', async (req, res) => {
  // simple availability grid stub — backend should compute based on bookings
  try {
    const { id } = req.params;
    const slots = [];
    const now = Date.now();
    for (let i = 0; i < 24; i++) {
      slots.push({ hour: i, available: Math.random() > 0.2 });
    }
    res.json({ availability: slots });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, address, description, price_per_hour, total_slots, lat, lng } = req.body;
    const ownerId = req.user.id;
    const { rows } = await db.query('INSERT INTO spots (owner_id,title,address,description,price_per_hour,total_slots,available_slots,location) VALUES ($1,$2,$3,$4,$5,$6,$6,ST_SetSRID(ST_MakePoint($7,$8),4326)) RETURNING *', [ownerId, title, address, description, price_per_hour || 0, total_slots || 1, lng, lat]);
    res.json({ spot: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Create failed' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const fields = req.body;
    // very simple update builder
    const sets = [];
    const params = [];
    let idx = 1;
    for (const k of ['title','address','description','price_per_hour','total_slots','available_slots']){
      if (fields[k] !== undefined) { sets.push(`${k}=$${idx}`); params.push(fields[k]); idx++; }
    }
    if (fields.lat && fields.lng) {
      sets.push(`location=ST_SetSRID(ST_MakePoint($${idx+1},$${idx}),4326)`);
      params.push(fields.lat); params.push(fields.lng);
      idx += 2;
    }
    if (sets.length === 0) return res.status(400).json({ error: 'No fields' });
    params.push(id);
    const q = `UPDATE spots SET ${sets.join(',')} WHERE id=$${idx} RETURNING *`;
    const { rows } = await db.query(q, params);
    await set(`spot:${id}`, rows[0], 60);
    res.json({ spot: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM spots WHERE id=$1', [id]);
    await del(`spot:${id}`);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
