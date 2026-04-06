import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const _upiId = 'siyranabrar12345@okaxis';

let _razorpay = null;
function getRazorpay() {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
}

export const getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance name email');
    res.json({ balance: user.walletBalance, name: user.name, email: user.email });
  } catch (error) {
    next(error);
  }
};

export const getKeyId = async (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID, upiId: _upiId });
};

export const verifyManual = async (req, res, next) => {
  try {
    const { amount, type, description } = req.body; // type: 'wallet_topup' or 'parking_payment'

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const user = await User.findById(req.user._id);

    // If it's a top-up, credit the wallet
    if (type === 'wallet_topup') {
      user.walletBalance += parseFloat(amount);
      await user.save();

      const now = new Date();
      await Transaction.create({
        user: user._id,
        amount: parseFloat(amount),
        type: 'wallet_topup',
        status: 'completed',
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        description: description || `Wallet top-up via Direct UPI`,
        paymentMethod: `upi:manual`
      });
    }

    res.json({
      balance: user.walletBalance,
      message: type === 'wallet_topup' ? `₹${amount} added to wallet (pending verification)` : 'Payment recorded',
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (amount > 10000) {
      return res.status(400).json({ error: 'Maximum top-up is ₹10,000' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay uses paise (₹1 = 100 paise)
      currency: 'INR',
      receipt: `wallet_${req.user._id}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        purpose: 'wallet_topup'
      }
    };

    const order = await getRazorpay().orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification data' });
    }

    // Verify the payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
    }

    // Signature is valid — credit the wallet
    const creditAmount = amount / 100; // Convert paise back to rupees
    const user = await User.findById(req.user._id);
    user.walletBalance += creditAmount;
    await user.save();

    // Record the transaction
    const now = new Date();
    await Transaction.create({
      user: user._id,
      amount: creditAmount,
      ownerShare: 0,
      platformShare: 0,
      type: 'wallet_topup',
      status: 'completed',
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      description: `Wallet top-up via Razorpay`,
      paymentMethod: `razorpay:${razorpay_payment_id}`
    });

    res.json({
      balance: user.walletBalance,
      message: `₹${creditAmount} added to wallet`,
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    next(error);
  }
};

export const createParkingOrder = async (req, res, next) => {
  try {
    const { amount, spotId, hours } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `parking_${req.user._id}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        spotId: spotId,
        hours: hours?.toString(),
        purpose: 'parking_payment'
      }
    };

    const order = await getRazorpay().orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Razorpay parking order creation failed:', error);
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
