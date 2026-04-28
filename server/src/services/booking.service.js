import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import ParkingSpot from '../models/ParkingSpot.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { redlock } from '../utils/redis.js';
import logger from '../utils/logger.js';

// Module-level flag: once we know transactions don't work, skip them entirely
let transactionsDisabled = false;

class BookingService {
  /**
   * Starts a parking session with strong concurrency control and distance priority.
   * Ensures no double booking and handles wallet deductions atomically.
   * Gracefully falls back to non-transactional mode if MongoDB doesn't support transactions.
   */
  async startSession({ user, spotId, paymentMethod = 'wallet', hours = 1, userLocation }) {
    const lockKey = `lock:spot:${spotId}`;
    let lock;

    try {
      // 1. Acquire Distributed Lock (Gatekeeper)
      lock = await redlock.acquire([lockKey], 10000); 
      
      // Try transactional path first, fall back if needed
      if (!transactionsDisabled) {
        try {
          return await this._startSessionWithTransaction({ user, spotId, paymentMethod, hours, userLocation });
        } catch (err) {
          if (this._isTransactionError(err)) {
            logger.warn('⚠️ MongoDB transactions not supported — switching to non-transactional mode permanently');
            transactionsDisabled = true;
            // Fall through to non-transactional path
          } else {
            throw err; // Re-throw non-transaction errors
          }
        }
      }

      // Non-transactional fallback (still safe with distributed lock)
      return await this._startSessionWithoutTransaction({ user, spotId, paymentMethod, hours, userLocation });

    } catch (error) {
      throw error;
    } finally {
      if (lock) await lock.release();
    }
  }

  /**
   * Check if an error is related to MongoDB transaction support
   */
  _isTransactionError(err) {
    const msg = err.message || '';
    return (
      msg.includes('Transaction numbers are only allowed') ||
      msg.includes('Transaction is not supported') ||
      msg.includes('not a replica set') ||
      err.code === 20
    );
  }

  /**
   * Start session with MongoDB transactions (ACID)
   */
  async _startSessionWithTransaction({ user, spotId, paymentMethod, hours, userLocation }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await this._executeBooking({ user, spotId, paymentMethod, hours, userLocation, session });
      await session.commitTransaction();
      session.endSession();
      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Start session without transactions (fallback for standalone MongoDB)
   */
  async _startSessionWithoutTransaction({ user, spotId, paymentMethod, hours, userLocation }) {
    return await this._executeBooking({ user, spotId, paymentMethod, hours, userLocation, session: null });
  }

  /**
   * Core booking logic — works with or without a session
   */
  async _executeBooking({ user, spotId, paymentMethod, hours, userLocation, session }) {
    const opts = session ? { session } : {};
    const query = (model, filter) => session ? model.findOne(filter).session(session) : model.findOne(filter);
    const findById = (model, id) => session ? model.findById(id).session(session) : model.findById(id);

    const spot = await findById(ParkingSpot, spotId);
    if (!spot) throw new Error('Parking spot not found');
    if (spot.status !== 'approved') throw new Error('Spot not approved');
    if (spot.availableSlots <= 0) throw new Error('No available slots');

    // 🔥 DISTANCE PRIORITY LOGIC
    if (spot.availableSlots === 1 && userLocation) {
      const distance = this._calculateDistance(
        userLocation.lat, userLocation.lng,
        spot.location.coordinates[1], spot.location.coordinates[0]
      );
      logger.info({ userId: user._id, distance, spotId }, '📍 Priority distance check');
      if (distance > 10) {
        throw new Error('This spot is reserved for closer drivers due to high demand.');
      }
    }

    // Check if user already has an active session
    const activeBooking = await query(Booking, { user: user._id, status: 'active' });
    if (activeBooking) throw new Error('You already have an active parking session');

    const prepaidHours = Math.max(1, Math.ceil(hours));
    const prepaidAmount = prepaidHours * spot.pricePerHour;

    // Process Payment (Atomic with lock)
    if (paymentMethod === 'wallet') {
      const dbUser = await findById(User, user._id);
      if (dbUser.walletBalance < prepaidAmount) {
        throw new Error(`Insufficient wallet balance.`);
      }
      dbUser.walletBalance -= prepaidAmount;
      await dbUser.save(opts);
    }

    // Update Spot Availability
    spot.availableSlots -= 1;
    await spot.save(opts);

    // Create Booking Record
    const now = new Date();
    const booking = await Booking.create([{
      user: user._id,
      spot: spot._id,
      startTime: now,
      paymentMethod,
      prepaidAmount,
      isPaid: true,
      billingMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    }], opts);

    // Record wallet debit transaction (only for wallet payments)
    if (paymentMethod === 'wallet') {
      await Transaction.create([{
        booking: booking[0]._id,
        user: user._id,
        owner: spot.owner,
        amount: prepaidAmount,
        ownerShare: 0,
        platformShare: 0,
        type: 'wallet_debit',
        status: 'completed',
        month: booking[0].billingMonth,
        description: `Prepaid parking at ${spot.title}`,
        paymentMethod: 'wallet'
      }], opts);
    }

    logger.info({ bookingId: booking[0]._id, userId: user._id, transactional: !!session }, '✅ Booking confirmed');
    return booking[0];
  }

  /**
   * Helper: Calculate distance in KM between two points
   */
  _calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export default new BookingService();
