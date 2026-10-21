import { createClient } from 'redis';
import { config } from './env';

export const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
    reconnectStrategy: false, // Don't loop endlessly if Redis is not running
  },
});

let errorLogged = false;
redisClient.on('error', (err) => {
  if (!errorLogged) {
    console.log('ℹ️  [Redis] Optional cache not available (continuing with in-memory caching)');
    errorLogged = true;
  }
});

export async function initRedis() {
  try {
    await redisClient.connect();
    console.log('✅ [Redis] Cache connected');
  } catch {
    // Redis is optional — silently continue
  }
}
