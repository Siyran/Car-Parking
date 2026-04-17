import Redis from 'ioredis';
import Redlock from 'redlock';
import logger from './logger.js';

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

const redis = new Redis(redisConfig);

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error', (err) => logger.error(`❌ Redis error: ${err.message}`));

// Distributed Locking logic (Redlock)
// For PRODUCTION, use multiple redis instances in the Redlock constructor
const redlock = new Redlock(
  [redis],
  {
    driftFactor: 0.01,
    retryCount: 10,
    retryDelay: 200, // time in ms
    retryJitter: 200, // time in ms
    automaticExtensionThreshold: 500, // time in ms
  }
);

redlock.on('error', (error) => {
  // Ignore errors from the lock itself, they are handled in the try/catch of the logic
  if (error instanceof Redlock.LockError) return;
  logger.error(`❌ Redlock error: ${error.message}`);
});

export { redis, redlock };
export default redis;
