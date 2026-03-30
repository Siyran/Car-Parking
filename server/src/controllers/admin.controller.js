import User from '../models/User.js';
import ParkingSpot from '../models/ParkingSpot.js';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getSpots = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const spots = await ParkingSpot.find(query)
      .populate('owner', 'name email phone')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ParkingSpot.countDocuments(query);
    res.json({ spots, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const approveSpot = async (req, res, next) => {
  try {
    const { action } = req.body;
    const spot = await ParkingSpot.findById(req.params.id);
    if (!spot) return res.status(404).json({ error: 'Spot not found' });

    spot.status = action === 'approve' ? 'approved' : 'rejected';
    await spot.save();

    res.json({ message: `Spot ${spot.status}`, spot });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const { type, month, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (month) query.month = month;

    const transactions = await Transaction.find(query)
      .populate('driver', 'name email')
      .populate('owner', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);
    res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalSpots = await ParkingSpot.countDocuments();
    const pendingSpots = await ParkingSpot.countDocuments({ status: 'pending' });
    const approvedSpots = await ParkingSpot.countDocuments({ status: 'approved' });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'active' });

    const revenueStats = await Transaction.aggregate([
      { $match: { type: 'booking', status: 'completed' } },
      { $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        platformRevenue: { $sum: '$platformShare' },
        ownerPayouts: { $sum: '$ownerShare' }
      }}
    ]);

    // Monthly revenue for chart
    const monthlyRevenue = await Transaction.aggregate([
      { $match: { type: 'booking' } },
      { $group: { _id: '$month', revenue: { $sum: '$amount' }, bookings: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    res.json({
      users: { total: totalUsers, drivers: totalDrivers, owners: totalOwners },
      spots: { total: totalSpots, pending: pendingSpots, approved: approvedSpots },
      bookings: { total: totalBookings, active: activeBookings },
      revenue: revenueStats[0] || { totalRevenue: 0, platformRevenue: 0, ownerPayouts: 0 },
      monthlyRevenue
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    next(error);
  }
};
