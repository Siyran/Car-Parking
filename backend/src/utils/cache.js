import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL);

export const get = async (key) => {
  const v = await redis.get(key);
  return v ? JSON.parse(v) : null;
};

export const set = async (key, value, ttl = 60) => {
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
};

export const del = async (key) => redis.del(key);

export const client = redis;

export default redis;
