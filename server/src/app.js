import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import { setupSocket } from './socket/availability.socket.js';

// Trigger commit for contribution heatmap

// Routes
import authRoutes from './routes/auth.routes.js';
import parkingRoutes from './routes/parking.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import billingRoutes from './routes/billing.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);
setupSocket(io);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests, please try again later' }
});

const origin = process.env.NODE_ENV === 'production' 
  ? (process.env.CLIENT_URL || 'http://localhost:5173')
  : [
      'http://localhost:5173', 
      'http://localhost', 
      'http://127.0.0.1:5173', 
      'http://127.0.0.1',
      'http://localhost:5000' // Self
    ];

app.use(cors({ origin, credentials: true }));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/spots', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

let isDBConnected = false;

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: isDBConnected ? 'connected' : 'connecting',
    timestamp: new Date().toISOString() 
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Auto-seed function
const autoSeed = async () => {
  try {
    const User = (await import('./models/User.js')).default;
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('📦 No data found. Auto-seeding sample data...');
      const { seedData } = await import('./seed/seeder.js');
      await seedData();
      console.log('✅ Sample data loaded!');
    }
  } catch (error) {
    console.error('❌ Auto-seeding failed:', error.message);
  }
};

// Start listening immediately
httpServer.listen(PORT, () => {
  console.log('');
  console.log('  🚀 ParkFlow Server running on port ' + PORT);
  console.log('  📡 Socket.io enabled');
  console.log('  🌍 Open http://localhost:5173 in your browser');
  console.log('');
  
  // Connect to DB and seed in the background
  connectDB().then(async () => {
    isDBConnected = true;
    await autoSeed();
  }).catch(err => {
    console.error('❌ Background DB connection failed:', err.message);
  });
});


export default app;
