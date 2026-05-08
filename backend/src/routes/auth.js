import express from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
import { signAccess, signRefresh, requireAuth } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    const { rows } = await db.query('INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING id,email,name,role', [name, email, hashed]);
    const user = rows[0];
    const token = signAccess(user);
    const refresh = signRefresh({ id: user.id });
    await db.query('INSERT INTO refresh_tokens(token,user_id,expires_at) VALUES($1,$2,now() + INTERVAL \"7 days\")', [refresh, user.id]);
    res.json({ user, token, refresh });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signAccess(user);
    const refresh = signRefresh({ id: user.id });
    await db.query('INSERT INTO refresh_tokens(token,user_id,expires_at) VALUES($1,$2,now() + INTERVAL \"7 days\")', [refresh, user.id]);
    res.json({ token, refresh, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/refresh', async (req, res) => {
  const { refresh } = req.body;
  if (!refresh) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const { rows } = await db.query('SELECT user_id, expires_at FROM refresh_tokens WHERE token=$1', [refresh]);
    const row = rows[0];
    if (!row) return res.status(401).json({ error: 'Invalid refresh' });
    // verify expiry
    const decoded = jwt.verify(refresh, JWT_SECRET);
    const { rows: urows } = await db.query('SELECT id,email,name,role FROM users WHERE id=$1', [row.user_id]);
    const user = urows[0];
    const token = signAccess(user);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Refresh failed' });
  }
});

router.post('/logout', async (req, res) => {
  const { refresh } = req.body;
  try {
    if (refresh) await db.query('DELETE FROM refresh_tokens WHERE token=$1', [refresh]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, email, name, role FROM users WHERE id=$1', [req.user.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

export default router;
