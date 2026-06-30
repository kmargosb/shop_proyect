import Redis from 'ioredis';

const isTest = process.env.NODE_ENV === 'test';

const redisUrl = process.env.REDIS_URL;

export const redis = redisUrl
  ? new Redis(redisUrl, {
      lazyConnect: isTest,
      enableOfflineQueue: !isTest,
      maxRetriesPerRequest: isTest ? 0 : null,
    })
  : null;

if (redis) {
  redis.on('connect', () => {
    console.log('🧠 Redis connected');
  });

  redis.on('error', (err) => {
    if (!isTest) {
      console.error('Redis error:', err);
    }
  });
} else {
  console.warn('⚠️ Redis disabled');
}
