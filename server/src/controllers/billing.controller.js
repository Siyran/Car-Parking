import Transaction from '../models/Transaction.js';
import Booking from '../models/Booking.js';

export const getMonthlyBill = async (req, res, next) => {
  try {
    const { month } = req.query;
    const billingMonth = month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const bookings = await Booking.find({
      user: req.user._id,
      billingMonth,
      status: 'completed'
    }).populate('spot', 'title address pricePerHour');

    const totalAmount = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalDuration = bookings.reduce((sum, b) => sum + b.duration, 0);

    const transactions = await Transaction.find({
      user: req.user._id,
      month: billingMonth,
      type: 'booking'
    });

    const isPaid = transactions.length > 0 && transactions.every(t => t.status === 'completed');

    res.json({
      month: billingMonth,
      totalAmount,
      totalDuration,
      totalSessions: bookings.length,
      bookings,
      isPaid,
      walletBalance: req.user.walletBalance || 0
    });
  } catch (error) {
    next(error);
  }
};

export const simulatePayment = async (req, res, next) => {
  try {
    const { month, amount, paymentMethod = 'simulated' } = req.body;

    if (paymentMethod === 'wallet') {
      if ((req.user.walletBalance || 0) < amount) {
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }
      req.user.walletBalance -= amount;
      await req.user.save();
    }

    // Mark all pending transactions for this month as completed
    await Transaction.updateMany(
      { user: req.user._id, month, status: 'pending' },
      { status: 'completed', paymentMethod }
    );

    // Mark bookings as paid
    await Booking.updateMany(
      { user: req.user._id, billingMonth: month, status: 'completed' },
      { isPaid: true }
    );

    res.json({ message: 'Payment processed successfully', month, amount, paymentMethod, walletBalance: req.user.walletBalance });
  } catch (error) {
    next(error);
  }
};

export const addFunds = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    req.user.walletBalance = (req.user.walletBalance || 0) + Number(amount);
    await req.user.save();
    
    res.json({ message: 'Funds added successfully', walletBalance: req.user.walletBalance });
  } catch (error) {
    next(error);
  }
};

export const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    // Earnings this month
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const monthlyEarnings = await Transaction.aggregate([
      { $match: { owner: ownerId, type: 'booking', month: currentMonth } },
      { $group: { _id: null, total: { $sum: '$ownerShare' }, count: { $sum: 1 } } }
    ]);

    const totalEarnings = await Transaction.aggregate([
      { $match: { owner: ownerId, type: 'booking' } },
      { $group: { _id: null, total: { $sum: '$ownerShare' }, count: { $sum: 1 } } }
    ]);

    // Withdrawals
    const withdrawals = await Transaction.aggregate([
      { $match: { owner: ownerId, type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalEarned = totalEarnings[0]?.total || 0;
    const totalWithdrawn = withdrawals[0]?.total || 0;

    // Recent transactions
    const recentTransactions = await Transaction.find({ owner: ownerId })
      .sort('-createdAt')
      .limit(10)
      .populate('user', 'name');

    // Active bookings on owner's spots
    const ParkingSpot = (await import('../models/ParkingSpot.js')).default;
    const ownerSpots = await ParkingSpot.find({ owner: ownerId });
    const spotIds = ownerSpots.map(s => s._id);
    const activeBookings = await Booking.countDocuments({ spot: { $in: spotIds }, status: 'active' });

    res.json({
      monthlyEarnings: monthlyEarnings[0]?.total || 0,
      monthlyBookings: monthlyEarnings[0]?.count || 0,
      totalEarnings: totalEarned,
      totalBookings: totalEarnings[0]?.count || 0,
      availableBalance: totalEarned - totalWithdrawn,
      activeBookings,
      totalSpots: ownerSpots.length,
      recentTransactions
    });
  } catch (error) {
    next(error);
  }
};

export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const ownerId = req.user._id;

    // Calculate available balance
    const totalEarnings = await Transaction.aggregate([
      { $match: { owner: ownerId, type: 'booking', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$ownerShare' } } }
    ]);
    const withdrawals = await Transaction.aggregate([
      { $match: { owner: ownerId, type: 'withdrawal' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const available = (totalEarnings[0]?.total || 0) - (withdrawals[0]?.total || 0);
    if (amount > available) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const transaction = await Transaction.create({
      owner: ownerId,
      amount,
      ownerShare: amount,
      platformShare: 0,
      type: 'withdrawal',
      status: 'completed',
      month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      description: 'Withdrawal request'
    });

    res.json({ message: 'Withdrawal processed', transaction });
  } catch (error) {
    next(error);
  }
};

export const getOwnerEarnings = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    const ownerId = req.user._id;

    const earningsByMonth = await Transaction.aggregate([
      { $match: { owner: ownerId, type: 'booking' } },
      { $group: { _id: '$month', earnings: { $sum: '$ownerShare' }, sessions: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: parseInt(months) }
    ]);

    const transactions = await Transaction.find({ owner: ownerId })
      .sort('-createdAt')
      .limit(50)
      .populate('user', 'name')
      .populate('booking');

    res.json({ earningsByMonth, transactions });
  } catch (error) {
    next(error);
  }
};

export const getSpotBookings = async (req, res, next) => {
  try {
    const ParkingSpot = (await import('../models/ParkingSpot.js')).default;
    const spot = await ParkingSpot.findOne({ _id: req.params.spotId, owner: req.user._id });
    if (!spot) return res.status(404).json({ error: 'Spot not found' });

    const bookings = await Booking.find({ spot: spot._id })
      .populate('user', 'name phone')
      .sort('-createdAt')
      .limit(50);

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};
