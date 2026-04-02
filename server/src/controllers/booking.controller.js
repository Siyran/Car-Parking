import Booking from '../models/Booking.js';
import ParkingSpot from '../models/ParkingSpot.js';
import Transaction from '../models/Transaction.js';

export const startSession = async (req, res, next) => {
  try {
    const { spotId } = req.body;

    const spot = await ParkingSpot.findById(spotId);
    if (!spot) return res.status(404).json({ error: 'Parking spot not found' });
    if (spot.status !== 'approved') return res.status(400).json({ error: 'Spot not approved' });
    if (spot.availableSlots <= 0) return res.status(400).json({ error: 'No available slots' });

    // Check if user already has an active session
    const activeBooking = await Booking.findOne({ user: req.user._id, status: 'active' });
    if (activeBooking) return res.status(400).json({ error: 'You already have an active parking session' });

    // Decrease available slots
    spot.availableSlots -= 1;
    await spot.save();

    const now = new Date();
    const booking = await Booking.create({
      user: req.user._id,
      spot: spot._id,
      startTime: now,
      billingMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    });

    await booking.populate('spot', 'title address pricePerHour location photos');

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('spotUpdate', { spotId: spot._id, availableSlots: spot.availableSlots });
    }

    res.status(201).json({ booking });
  } catch (error) {
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
    const totalAmount = durationHours * spot.pricePerHour;

    booking.endTime = endTime;
    booking.duration = durationMinutes;
    booking.totalAmount = totalAmount;
    booking.status = 'completed';
    await booking.save();

    // Increase available slots
    spot.availableSlots = Math.min(spot.availableSlots + 1, spot.totalSlots);
    await spot.save();

    // Create transaction with 60/40 split
    await Transaction.create({
      booking: booking._id,
      user: req.user._id,
      owner: spot.owner,
      amount: totalAmount,
      ownerShare: Math.round(totalAmount * 0.6 * 100) / 100,
      platformShare: Math.round(totalAmount * 0.4 * 100) / 100,
      type: 'booking',
      status: 'completed',
      month: booking.billingMonth,
      description: `Parking at ${spot.title} for ${durationMinutes} mins`
    });

    // Emit socket event
    if (req.app.get('io')) {
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
    const totalAmount = durationHours * spot.pricePerHour;

    booking.endTime = endTime;
    booking.duration = durationMinutes;
    booking.totalAmount = totalAmount;
    booking.status = 'completed';
    await booking.save();

    // Increase available slots
    spot.availableSlots = Math.min(spot.availableSlots + 1, spot.totalSlots);
    await spot.save();

    // Create transaction with 60/40 split
    await Transaction.create({
      booking: booking._id,
      user: req.user._id,
      owner: spot.owner,
      amount: totalAmount,
      ownerShare: Math.round(totalAmount * 0.6 * 100) / 100,
      platformShare: Math.round(totalAmount * 0.4 * 100) / 100,
      type: 'booking',
      status: 'completed',
      month: booking.billingMonth,
      description: `Parking at ${spot.title} for ${durationMinutes} mins`
    });

    // Emit socket event
    if (req.app.get('io')) {
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

    res.json({ message: 'Booking cancelled', booking });
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
