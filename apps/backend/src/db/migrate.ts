import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

export async function migrateSchema() {
  const pool = new Pool({
    host: config.postgres.host,
    port: config.postgres.port,
    user: config.postgres.user,
    password: config.postgres.password,
    database: config.postgres.database
  });

  const sql = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  await pool.end();
  console.log('Database schema migrated');
}
