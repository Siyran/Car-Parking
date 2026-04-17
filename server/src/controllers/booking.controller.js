import Booking from '../models/Booking.js';
import ParkingSpot from '../models/ParkingSpot.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { getActiveDrivers, fetchETAFromOSRM } from '../socket/availability.socket.js';

import BookingService from '../services/booking.service.js';

export const startSession = async (req, res, next) => {
  try {
    const { spotId, paymentMethod = 'wallet', hours = 1, userLocation } = req.body;

    const booking = await BookingService.startSession({
      user: req.user,
      spotId,
      paymentMethod,
      hours,
      userLocation
    });

    // Populate spot details for the response
    await booking.populate('spot', 'title address pricePerHour location photos');

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('spotUpdate', { 
        spotId: booking.spot._id, 
        availableSlots: booking.spot.availableSlots 
      });
    }

    res.status(201).json({ booking });
  } catch (error) {
    // If it's a known error message, send 400, otherwise let global error handler handle it
    const clientErrors = ['not found', 'not approved', 'No available slots', 'active parking session', 'balance'];
    if (clientErrors.some(msg => error.message.includes(msg))) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};


export const endSession = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id, status: 'active' });
    if (!booking) return res.status(404).json({ error: 'Active booking not found' });

    const spot = await ParkingSpot.findById(booking.spot);
    const endTime = new Date();
    const durationMs = endTime - booking.startTime;
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    const durationHours = Math.ceil(durationMinutes / 60);
    const totalAmount = durationHours * (spot?.pricePerHour || 0);

    booking.endTime = endTime;
    booking.duration = durationMinutes;
    booking.totalAmount = totalAmount;
    booking.status = 'completed';

    // Handle refund or extra charge
    if (booking.prepaidAmount > totalAmount) {
      // Refund excess to wallet
      const refundAmount = booking.prepaidAmount - totalAmount;
      booking.refundAmount = refundAmount;

      const user = await User.findById(req.user._id);
      user.walletBalance += refundAmount;
      await user.save();

      // Record refund transaction
      await Transaction.create({
        booking: booking._id,
        user: req.user._id,
        amount: refundAmount,
        ownerShare: 0,
        platformShare: 0,
        type: 'refund',
        status: 'completed',
        month: booking.billingMonth || `${endTime.getFullYear()}-${String(endTime.getMonth() + 1).padStart(2, '0')}`,
        description: `Refund for unused time at ${spot?.title || 'parking spot'}`,
        paymentMethod: 'wallet'
      });
    } else if (totalAmount > booking.prepaidAmount && booking.paymentMethod === 'wallet') {
      // Deduct extra from wallet
      const extraCharge = totalAmount - booking.prepaidAmount;
      const user = await User.findById(req.user._id);
      
      if (user.walletBalance >= extraCharge) {
        user.walletBalance -= extraCharge;
        await user.save();
        
        await Transaction.create({
          booking: booking._id,
          user: req.user._id,
          owner: spot?.owner,
          amount: extraCharge,
          ownerShare: 0,
          platformShare: 0,
          type: 'wallet_debit',
          status: 'completed',
          month: booking.billingMonth || `${endTime.getFullYear()}-${String(endTime.getMonth() + 1).padStart(2, '0')}`,
          description: `Extra charge for overtime at ${spot?.title || 'parking spot'}`,
          paymentMethod: 'wallet'
        });
      }
    }

    await booking.save();

    // Increase available slots if spot exists
    if (spot) {
      spot.availableSlots = Math.min(spot.availableSlots + 1, spot.totalSlots);
      await spot.save();
    }

    // Create booking transaction (revenue split)
    if (spot) {
      await Transaction.create({
        booking: booking._id,
        user: req.user._id,
        owner: spot.owner,
        amount: totalAmount,
        ownerShare: Math.round(totalAmount * 0.6 * 100) / 100,
        platformShare: Math.round(totalAmount * 0.4 * 100) / 100,
        type: 'booking',
        status: 'completed',
        month: booking.billingMonth || `${endTime.getFullYear()}-${String(endTime.getMonth() + 1).padStart(2, '0')}`,
        description: `Parking at ${spot.title} for ${durationMinutes} mins`
      });
    }

    // Emit socket event
    if (spot && req.app.get('io')) {
      req.app.get('io').emit('spotUpdate', { spotId: spot._id, availableSlots: spot.availableSlots });
    }

    await booking.populate('spot', 'title address pricePerHour');
    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('spot', 'title address pricePerHour photos location')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({ bookings, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getActiveSession = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ user: req.user._id, status: 'active' })
      .populate('spot', 'title address pricePerHour photos location');
    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

export const endActiveSession = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ user: req.user._id, status: 'active' });
    if (!booking) return res.json({ message: 'No active session' });

    const spot = await ParkingSpot.findById(booking.spot);
    const endTime = new Date();
    const durationMs = endTime - booking.startTime;
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    const durationHours = Math.ceil(durationMinutes / 60);
    const totalAmount = durationHours * (spot?.pricePerHour || 0);

    booking.endTime = endTime;
    booking.duration = durationMinutes;
    booking.totalAmount = totalAmount;
    booking.status = 'completed';

    // Handle refund or extra charge
    if (booking.prepaidAmount > totalAmount) {
      const refundAmount = booking.prepaidAmount - totalAmount;
      booking.refundAmount = refundAmount;

      const user = await User.findById(req.user._id);
      user.walletBalance += refundAmount;
      await user.save();

      await Transaction.create({
        booking: booking._id,
        user: req.user._id,
        amount: refundAmount,
        ownerShare: 0,
        platformShare: 0,
        type: 'refund',
        status: 'completed',
        month: booking.billingMonth || `${endTime.getFullYear()}-${String(endTime.getMonth() + 1).padStart(2, '0')}`,
        description: `Refund for unused time at ${spot?.title || 'parking spot'}`,
        paymentMethod: 'wallet'
      });
    } else if (totalAmount > booking.prepaidAmount && booking.paymentMethod === 'wallet') {
      const extraCharge = totalAmount - booking.prepaidAmount;
      const user = await User.findById(req.user._id);
      
      if (user.walletBalance >= extraCharge) {
        user.walletBalance -= extraCharge;
        await user.save();

        await Transaction.create({
          booking: booking._id,
          user: req.user._id,
          owner: spot?.owner,
          amount: extraCharge,
          ownerShare: 0,
          platformShare: 0,
          type: 'wallet_debit',
          status: 'completed',
          month: booking.billingMonth || `${endTime.getFullYear()}-${String(endTime.getMonth() + 1).padStart(2, '0')}`,
          description: `Extra charge for overtime at ${spot?.title || 'parking spot'}`,
          paymentMethod: 'wallet'
        });
      }
    }

    await booking.save();

    // Increase available slots
    if (spot) {
      spot.availableSlots = Math.min(spot.availableSlots + 1, spot.totalSlots);
      await spot.save();
    }

    // Create booking transaction
    if (spot) {
      await Transaction.create({
        booking: booking._id,
        user: req.user._id,
        owner: spot.owner,
        amount: totalAmount,
        ownerShare: Math.round(totalAmount * 0.6 * 100) / 100,
        platformShare: Math.round(totalAmount * 0.4 * 100) / 100,
        type: 'booking',
        status: 'completed',
        month: booking.billingMonth || `${endTime.getFullYear()}-${String(endTime.getMonth() + 1).padStart(2, '0')}`,
        description: `Parking at ${spot.title} for ${durationMinutes} mins`
      });
    }

    // Emit socket event
    if (spot && req.app.get('io')) {
      req.app.get('io').emit('spotUpdate', { spotId: spot._id, availableSlots: spot.availableSlots });
    }

    await booking.populate('spot', 'title address pricePerHour');
    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id, status: 'active' });
    if (!booking) return res.status(404).json({ error: 'Active booking not found' });

    // Refund prepaid amount to wallet
    if (booking.prepaidAmount > 0 && booking.paymentMethod === 'wallet') {
      const user = await User.findById(req.user._id);
      user.walletBalance += booking.prepaidAmount;
      await user.save();

      booking.refundAmount = booking.prepaidAmount;

      const now = new Date();
      await Transaction.create({
        booking: booking._id,
        user: req.user._id,
        amount: booking.prepaidAmount,
        ownerShare: 0,
        platformShare: 0,
        type: 'refund',
        status: 'completed',
        month: booking.billingMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        description: 'Full refund for cancelled booking',
        paymentMethod: 'wallet'
      });
    }

    booking.status = 'cancelled';
    booking.endTime = new Date();
    await booking.save();

    const spot = await ParkingSpot.findById(booking.spot);
    if (spot) {
      spot.availableSlots = Math.min(spot.availableSlots + 1, spot.totalSlots);
      await spot.save();
      if (req.app.get('io')) {
        req.app.get('io').emit('spotUpdate', { spotId: spot._id, availableSlots: spot.availableSlots });
      }
    }

    res.json({ message: 'Booking cancelled and refunded', booking });
  } catch (error) {
    next(error);
  }
};

export const getOwnerBookings = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const ownerId = req.user._id;

    // First find all spots owned by this user
    const ownerSpots = await ParkingSpot.find({ owner: ownerId }).select('_id');
    const spotIds = ownerSpots.map(s => s._id);

    // Then find bookings for those spots
    const bookings = await Booking.find({ spot: { $in: spotIds } })
      .populate('user', 'name email phone avatar')
      .populate('spot', 'title address pricePerHour')
      .sort('-createdAt')
      .limit(parseInt(limit));

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

// ─── Real-Time GPS: Update driver position ───
export const updateGPS = async (req, res, next) => {
  try {
    const { lat, lng, heading, speed } = req.body;
    if (lat == null || lng == null) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }

    const booking = await Booking.findOne({ user: req.user._id, status: 'active' })
      .populate('spot', 'location');
    if (!booking) return res.status(404).json({ error: 'No active booking' });

    const [destLng, destLat] = booking.spot.location.coordinates;

    // Store position in memory
    const drivers = getActiveDrivers();
    drivers.set(booking._id.toString(), {
      lat, lng, heading: heading || 0, speed: speed || 0,
      userId: req.user._id.toString(),
      spotId: booking.spot._id.toString(),
      updatedAt: Date.now()
    });

    // Broadcast via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`booking:${booking._id}`).emit('gps:position', {
        bookingId: booking._id.toString(), lat, lng, heading: heading || 0, speed: speed || 0
      });
      io.to(`spot:${booking.spot._id}`).emit('driver:position', {
        bookingId: booking._id.toString(), userId: req.user._id.toString(),
        lat, lng, heading: heading || 0, speed: speed || 0
      });
    }

    // Calculate ETA
    const eta = await fetchETAFromOSRM(lat, lng, destLat, destLng);

    res.json({
      position: { lat, lng, heading, speed },
      eta: eta ? { duration: eta.duration, distance: eta.distance } : null
    });
  } catch (error) {
    next(error);
  }
};

// ─── Real-Time GPS: Get ETA for booking ───
export const getBookingETA = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const booking = await Booking.findById(req.params.id)
      .populate('spot', 'location title address');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    let fromLat, fromLng;

    if (lat && lng) {
      // Use provided coordinates
      fromLat = parseFloat(lat);
      fromLng = parseFloat(lng);
    } else {
      // Try to get from in-memory driver positions
      const drivers = getActiveDrivers();
      const driverPos = drivers.get(booking._id.toString());
      if (!driverPos) {
        return res.status(400).json({ error: 'No GPS position available. Provide lat/lng query params.' });
      }
      fromLat = driverPos.lat;
      fromLng = driverPos.lng;
    }

    const [destLng, destLat] = booking.spot.location.coordinates;
    const eta = await fetchETAFromOSRM(fromLat, fromLng, destLat, destLng);

    if (!eta) return res.status(500).json({ error: 'ETA calculation failed' });

    res.json({
      bookingId: booking._id,
      spot: { title: booking.spot.title, address: booking.spot.address },
      eta: {
        duration: eta.duration,
        distance: eta.distance,
        geometry: eta.geometry
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Owner: Get active drivers for their spots ───
export const getActiveDriversForOwner = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const ownerSpots = await ParkingSpot.find({ owner: ownerId }).select('_id title location');
    const spotIds = ownerSpots.map(s => s._id.toString());

    const drivers = getActiveDrivers();
    const activeDriversList = [];

    for (const [bookingId, driver] of drivers.entries()) {
      if (spotIds.includes(driver.spotId)) {
        const booking = await Booking.findById(bookingId)
          .populate('user', 'name phone')
          .populate('spot', 'title address location');
        if (booking) {
          const [destLng, destLat] = booking.spot.location.coordinates;
          const eta = await fetchETAFromOSRM(driver.lat, driver.lng, destLat, destLng);
          activeDriversList.push({
            bookingId,
            user: booking.user,
            spot: booking.spot,
            position: { lat: driver.lat, lng: driver.lng, heading: driver.heading, speed: driver.speed },
            eta: eta ? { duration: eta.duration, distance: eta.distance } : null
          });
        }
      }
    }

    res.json({ drivers: activeDriversList });
  } catch (error) {
    next(error);
  }
};
