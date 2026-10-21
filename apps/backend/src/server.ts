import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { connectMongoDB, getDbStatus } from './config/database';
import { seedMongoDB } from './db/seedMongo';
import { initRedis } from './config/redis';
import v1Router from './routes/v1';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.disable('x-powered-by');

// Root
app.get('/', (_req, res) => {
  const db = getDbStatus();
  res.json({
    success: true,
    message: 'SkillProof Recruitment Platform API',
    version: '1.0.0',
    database: db.connected ? 'MongoDB Atlas (Connected)' : 'In-Memory Demo Mode',
  });
});

// API v1 routes
app.use('/api/v1', v1Router);

// Legacy /api alias for compatibility
app.use('/api', v1Router);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  // 1. Connect to MongoDB Atlas & Seed initial data
  const connected = await connectMongoDB();
  if (connected) {
    await seedMongoDB();
  }

  // 2. Start Express HTTP Server
  const db = getDbStatus();
  app.listen(config.port, () => {
    console.log(`\n🚀 SkillProof Backend started`);
    console.log(`   → HTTP:     http://localhost:${config.port}`);
    console.log(`   → API:      http://localhost:${config.port}/api/v1`);
    console.log(`   → Database: ${db.connected ? '✅ MongoDB Atlas (persistent)' : '⚠️  In-Memory Demo Mode (not persistent)'}`);
    if (!db.connected) {
      console.log(`   → To enable persistence: whitelist your IP in MongoDB Atlas Network Access`);
    }
  });

  // 3. Try Redis in background (non-blocking)
  initRedis().catch(() => {}); // suppress Redis warnings — it's optional
}

start().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
