import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import spotsRoutes from './routes/spots.js';
import bookingsRoutes from './routes/bookings.js';
import paymentsRoutes from './routes/payments.js';
import healthRoutes from './routes/health.js';
import { initSocket } from './socket.js';
import { client as redisClient } from './utils/cache.js';
import { generalLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/spots', spotsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/health', healthRoutes);

app.get('/api/stats', async (req, res) => {
  // minimal stats for hero counters
  res.json({ totalSpots: 5000, cities: 54, users: 12000 });
});

const io = initSocket(server, redisClient);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`API listening on ${PORT}`);
});

export default app;
