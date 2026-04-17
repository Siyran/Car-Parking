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
let isRedisAvailable = false;

redis.on('connect', () => {
  logger.info('✅ Redis connected');
  isRedisAvailable = true;
});

redis.on('error', (err) => {
  logger.warn(`⚠️  Redis connection unavailable: ${err.message}. Running in fallback mode.`);
  isRedisAvailable = false;
});

// Distributed Locking logic (Redlock)
const redlockInstance = new Redlock(
  [redis],
  {
    driftFactor: 0.01,
    retryCount: 3, // Lower retry for dev stability
    retryDelay: 100,
  }
);

// Fallback wrapper for Redlock
const redlock = {
  acquire: async (resources, duration) => {
    if (!isRedisAvailable && process.env.NODE_ENV !== 'production') {
      logger.warn(`🛠️  Using Mock Lock for ${resources.join(', ')} (Redis unavailable)`);
      return { 
        release: async () => logger.info(`🔓 Mock Lock released for ${resources.join(', ')}`)
      };
    }
    return await redlockInstance.acquire(resources, duration);
  },
  on: (event, handler) => redlockInstance.on(event, handler)
};

export { redis, redlock };
export default redis;

