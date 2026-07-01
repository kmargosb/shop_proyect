import { redis } from '@/lib/redis';

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
};

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }

  const ttl = await redis.ttl(key);

  return {
    allowed: current <= limit,
    remaining: Math.max(limit - current, 0),
    retryAfter: Math.max(ttl, 0),
  };
}
