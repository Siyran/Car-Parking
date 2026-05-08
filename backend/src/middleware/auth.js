import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const signAccess = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });
export const signRefresh = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });

export const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid auth' });
  try {
    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default {
  signAccess,
  signRefresh,
  requireAuth
};
