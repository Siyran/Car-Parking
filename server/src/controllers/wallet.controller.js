import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

export const getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance name');
    res.json({ balance: user.walletBalance, name: user.name });
  } catch (error) {
    next(error);
  }
};

export const topUp = async (req, res, next) => {
  try {
    const { amount, method = 'upi' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (amount > 10000) {
      return res.status(400).json({ error: 'Maximum top-up is ₹10,000' });
    }

    const user = await User.findById(req.user._id);
    user.walletBalance += amount;
    await user.save();

    const now = new Date();
    await Transaction.create({
      user: user._id,
      amount,
      ownerShare: 0,
      platformShare: 0,
      type: 'wallet_topup',
      status: 'completed',
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      description: `Wallet top-up via ${method}`,
      paymentMethod: method
    });

    res.json({ balance: user.walletBalance, message: `₹${amount} added to wallet` });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const transactions = await Transaction.find({
      user: req.user._id,
      type: { $in: ['wallet_topup', 'wallet_debit', 'refund'] }
    })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({
      user: req.user._id,
      type: { $in: ['wallet_topup', 'wallet_debit', 'refund'] }
    });

    res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};
