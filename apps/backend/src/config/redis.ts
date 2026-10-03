import { createClient } from 'redis';
import { config } from './env';

export const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port
  }
});

redisClient.on('error', (err) => console.warn('Redis not available:', err.message));

export async function initRedis() {
  try {
    await redisClient.connect();
    console.log('Redis connected');
  } catch (error) {
    console.warn('Redis not available yet:', error);
  }
}
