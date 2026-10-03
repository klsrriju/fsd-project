import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { initRedis } from './config/redis';
import v1Router from './routes/v1';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by');

// Root
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'AI Recruitment Platform API', version: '1.0.0' });
});

// API v1 routes
app.use('/api/v1', v1Router);

// Legacy /api alias for compatibility
app.use('/api', v1Router);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  // Start server immediately (Redis/DB are optional)
  app.listen(config.port, () => {
    console.log(`✅ Recruitment backend running at http://localhost:${config.port}`);
    console.log(`📚 API available at http://localhost:${config.port}/api/v1`);
  });

  // Try Redis in background (non-blocking)
  initRedis().catch((err) => console.warn('⚠️  Redis unavailable (cache disabled):', err.message));
}

start().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
