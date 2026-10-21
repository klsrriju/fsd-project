import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try multiple candidate paths for .env to support any working directory
const candidatePaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'apps/backend/.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../apps/backend/.env'),
  path.resolve(__dirname, '../../../../.env'),
];

for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
dotenv.config(); // fallback to standard process environment

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const config = {
  port: Number(optional('PORT', '3001')),
  nodeEnv: optional('NODE_ENV', 'development'),
  jwtSecret: optional('JWT_SECRET', 'skillproof_dev_secret_do_not_use_in_prod'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '24h'),

  // MongoDB Atlas — must be set in .env; no hardcoded credentials here
  mongodbUri: optional(
    'MONGODB_URI',
    '' // Empty string — connection will fail gracefully and use in-memory fallback
  ),

  redis: {
    host: optional('REDIS_HOST', 'localhost'),
    port: Number(optional('REDIS_PORT', '6379')),
  },

  github: {
    clientId: optional('GITHUB_CLIENT_ID', ''),
    clientSecret: optional('GITHUB_CLIENT_SECRET', ''),
    callbackUrl: optional('GITHUB_CALLBACK_URL', 'http://localhost:3001/api/v1/auth/github/callback'),
  },

  twilio: {
    accountSid: optional('TWILIO_ACCOUNT_SID', ''),
    authToken: optional('TWILIO_AUTH_TOKEN', ''),
    fromNumber: optional('TWILIO_FROM_NUMBER', ''),
  },

  gemini: {
    apiKey: optional('GEMINI_API_KEY', ''),
  },
};

// Warn at startup if MongoDB URI is missing
if (!config.mongodbUri) {
  console.warn('⚠️  MONGODB_URI is not set. The server will run in in-memory demo mode.');
  console.warn('    Set MONGODB_URI in apps/backend/.env to enable persistent storage.');
}
