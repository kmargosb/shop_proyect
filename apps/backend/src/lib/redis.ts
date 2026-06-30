import Redis from 'ioredis';

const isTest = process.env.NODE_ENV === 'test';

export const redis = new Redis(process.env.REDIS_URL!, {
  lazyConnect: isTest,
  enableOfflineQueue: !isTest,
  maxRetriesPerRequest: isTest ? 0 : null,
});

redis.on('connect', () => {
  console.log('🧠 Redis connected');
});

redis.on('error', (err) => {
  if (!isTest) {
    console.error('Redis error:', err);
  }
});
