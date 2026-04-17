import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import ParkingSpot from '../models/ParkingSpot.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { redlock } from '../utils/redis.js';
import logger from '../utils/logger.js';

class BookingService {
  /**
   * Starts a parking session with strong concurrency control and distance priority.
   * Ensures no double booking and handles wallet deductions atomically.
   */
  async startSession({ user, spotId, paymentMethod = 'wallet', hours = 1, userLocation }) {
    const lockKey = `lock:spot:${spotId}`;
    let lock;

    try {
      // 1. Acquire Distributed Lock (Gatekeeper)
      lock = await redlock.acquire([lockKey], 10000); 
      
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const spot = await ParkingSpot.findById(spotId).session(session);
        if (!spot) throw new Error('Parking spot not found');
        if (spot.status !== 'approved') throw new Error('Spot not approved');
        if (spot.availableSlots <= 0) throw new Error('No available slots');

        // 🔥 DISTANCE PRIORITY LOGIC
        // If only 1 slot is left, we apply stricter distance priority
        if (spot.availableSlots === 1 && userLocation) {
          const distance = this._calculateDistance(
            userLocation.lat, userLocation.lng,
            spot.location.coordinates[1], spot.location.coordinates[0]
          );

          // If user is more than 5km away and it's the last slot, 
          // we check if a "Priority Zone" flag is active (could be added to Redis)
          // For now, we log the priority metadata
          logger.info({ userId: user._id, distance, spotId }, '📍 Priority distance check');
          
          if (distance > 10) { // Reject if too far for the last slot in a high-demand area
             throw new Error('This spot is reserved for closer drivers due to high demand.');
          }
        }

        // 2. Check if user already has an active session
        const activeBooking = await Booking.findOne({ user: user._id, status: 'active' }).session(session);
        if (activeBooking) throw new Error('You already have an active parking session');

        const prepaidHours = Math.max(1, Math.ceil(hours));
        const prepaidAmount = prepaidHours * spot.pricePerHour;

        // 3. Process Payment (Atomic)
        if (paymentMethod === 'wallet') {
          const dbUser = await User.findById(user._id).session(session);
          if (dbUser.walletBalance < prepaidAmount) {
            throw new Error(`Insufficient wallet balance.`);
          }
          dbUser.walletBalance -= prepaidAmount;
          await dbUser.save({ session });
        }

        // 4. Update Spot Availability
        spot.availableSlots -= 1;
        await spot.save({ session });

        // 5. Create Booking Record
        const now = new Date();
        const booking = await Booking.create([{
          user: user._id,
          spot: spot._id,
          startTime: now,
          paymentMethod,
          prepaidAmount,
          isPaid: true,
          billingMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        }], { session });

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
        }], { session });

        await session.commitTransaction();
        session.endSession();

        logger.info({ bookingId: booking[0]._id, userId: user._id, distancePriority: true }, '✅ Booking confirmed');
        return booking[0];

      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } catch (error) {
      throw error;
    } finally {
      if (lock) await lock.release();
    }
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


  // Other methods (endSession, etc.) would follow similar robust patterns
}

export default new BookingService();
