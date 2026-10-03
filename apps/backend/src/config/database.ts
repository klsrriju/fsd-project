import { Pool } from 'pg';
import { config } from './env';

export const db = new Pool({
  host: config.postgres.host,
  port: config.postgres.port,
  user: config.postgres.user,
  password: config.postgres.password,
  database: config.postgres.database
});

export async function initDatabase() {
  try {
    await db.query('SELECT 1');
    console.log('PostgreSQL connected');
  } catch (error) {
    console.warn('PostgreSQL not available yet:', error);
  }
}
