import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { redis } from '../utils/redis.js';
import logger from '../utils/logger.js';

class PaymentService {
  /**
   * Check if MongoDB supports transactions (replica set or mongos)
   */
  _supportsTransactions() {
    try {
      const topologyType = mongoose.connection.client?.topology?.description?.type;
      return topologyType && topologyType !== 'Single' && topologyType !== 'Standalone';
    } catch {
      return false;
    }
  }

  /**
   * Safe Redis get — returns null if Redis is down
   */
  async _safeRedisGet(key) {
    try {
      return await redis.get(key);
    } catch (err) {
      logger.warn({ key, error: err.message }, '⚠️ Redis GET failed, skipping idempotency cache');
      return null;
    }
  }

  /**
   * Safe Redis set — silently fails if Redis is down
   */
  async _safeRedisSet(key, value, ...args) {
    try {
      await redis.set(key, value, ...args);
    } catch (err) {
      logger.warn({ key, error: err.message }, '⚠️ Redis SET failed, skipping cache');
    }
  }

  /**
   * Credits wallet with idempotency check.
   * Ensures the same payment ID is never processed twice.
   */
  async creditWallet({ userId, amount, paymentId, method, description }) {
    const idempotencyKey = `idemp:payment:${paymentId}`;
    
    // 1. Check if already processed
    const existing = await this._safeRedisGet(idempotencyKey);
    if (existing) {
      logger.warn({ paymentId, userId }, '⚠️ Payment already processed (idempotency hit)');
      return JSON.parse(existing);
    }

    const useTransactions = this._supportsTransactions();
    let session = null;

    if (useTransactions) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
      } catch (err) {
        logger.warn({ error: err.message }, '⚠️ Transaction start failed, falling back to non-transactional');
        session = null;
      }
    }

    const opts = session ? { session } : {};

    try {
      // 2. Atomic Balance Update
      const user = session
        ? await User.findById(userId).session(session)
        : await User.findById(userId);
      if (!user) throw new Error('User not found');

      user.walletBalance += parseFloat(amount);
      await user.save(opts);

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
      }], opts);

      // 4. Commit and Cache Success
      if (session) {
        await session.commitTransaction();
        session.endSession();
      }

      const result = { balance: user.walletBalance, transactionId: transaction[0]._id };
      await this._safeRedisSet(idempotencyKey, JSON.stringify(result), 'EX', 86400 * 7); // Cache for 7 days

      logger.info({ userId, amount, paymentId }, '✅ Wallet credited successfully');
      return result;

    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      logger.error({ error: error.message, paymentId, userId }, '❌ Payment processing failed');
      throw error;
    }
  }

  /**
   * Deducts wallet with atomicity.
   */
  async deductWallet({ userId, amount, description, session }) {
    const user = session
      ? await User.findById(userId).session(session)
      : await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.walletBalance < amount) {
      throw new Error(`Insufficient funds. Required: ${amount}, Available: ${user.walletBalance}`);
    }

    user.walletBalance -= amount;
    const opts = session ? { session } : {};
    await user.save(opts);

    return user.walletBalance;
  }
}

export default new PaymentService();
