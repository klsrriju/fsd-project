import { redisClient } from '../config/redis';

export async function getCached<T>(key: string): Promise<T | null> {
  if (!redisClient.isOpen) {
    return null;
  }

  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) as T : null;
  } catch (error) {
    return null;
  }
}

export async function setCached<T>(key: string, value: T, ttlSeconds = 300) {
  if (!redisClient.isOpen) {
    return;
  }

  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.warn('Redis cache set failed:', error);
  }
}

export async function invalidateCache(key: string) {
  if (!redisClient.isOpen) {
    return;
  }

  try {
    await redisClient.del(key);
  } catch (error) {
    console.warn('Redis cache invalidation failed:', error);
  }
}
