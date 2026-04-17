import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { redis } from '../utils/redis.js';
import logger from '../utils/logger.js';

class PaymentService {
  /**
   * Credits wallet with idempotency check.
   * Ensures the same payment ID is never processed twice.
   */
  async creditWallet({ userId, amount, paymentId, method, description }) {
    const idempotencyKey = `idemp:payment:${paymentId}`;
    
    // 1. Check if already processed
    const existing = await redis.get(idempotencyKey);
    if (existing) {
      logger.warn({ paymentId, userId }, '⚠️ Payment already processed (idempotency hit)');
      return JSON.parse(existing);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 2. Atomic Balance Update
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error('User not found');

      user.walletBalance += parseFloat(amount);
      await user.save({ session });

      // 3. Record Transaction
      const now = new Date();
      const transaction = await Transaction.create([{
        user: userId,
        amount: parseFloat(amount),
        type: 'wallet_topup',
        status: 'completed',
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        description: description || `Wallet top-up via ${method}`,
        paymentMethod: `${method}:${paymentId}`
      }], { session });

      // 4. Commit and Cache Success
      await session.commitTransaction();
      session.endSession();

      const result = { balance: user.walletBalance, transactionId: transaction[0]._id };
      await redis.set(idempotencyKey, JSON.stringify(result), 'EX', 86400 * 7); // Cache for 7 days

      logger.info({ userId, amount, paymentId }, '✅ Wallet credited successfully');
      return result;

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error({ error: error.message, paymentId, userId }, '❌ Payment processing failed');
      throw error;
    }
  }

  /**
   * Deducts wallet with atomicity.
   */
  async deductWallet({ userId, amount, description, session }) {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('User not found');
    if (user.walletBalance < amount) {
      throw new Error(`Insufficient funds. Required: ${amount}, Available: ${user.walletBalance}`);
    }

    user.walletBalance -= amount;
    await user.save({ session });

    return user.walletBalance;
  }
}

export default new PaymentService();
