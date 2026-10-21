import mongoose from 'mongoose';
import { config } from './env';

export let isMongoConnected = false;
export let mongoMode: 'atlas' | 'demo' = 'demo';

export async function connectMongoDB(): Promise<boolean> {
  if (!config.mongodbUri) {
    console.warn('⚠️  [DB] No MONGODB_URI configured — running in in-memory demo mode.');
    console.warn('    ➜  Set MONGODB_URI in apps/backend/.env to enable persistent storage.');
    isMongoConnected = false;
    mongoMode = 'demo';
    return false;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  [DB] MongoDB disconnected. API will fall back to in-memory store.');
      isMongoConnected = false;
      mongoMode = 'demo';
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ [DB] MongoDB reconnected.');
      isMongoConnected = true;
      mongoMode = 'atlas';
    });

    isMongoConnected = true;
    mongoMode = 'atlas';
    console.log('✅ [DB] Connected to MongoDB Atlas (database: fsdproject)');
    return true;
  } catch (error: any) {
    isMongoConnected = false;
    mongoMode = 'demo';

    const msg: string = error?.message || '';
    if (msg.includes('IP') || msg.includes('whitelist') || msg.includes('ENOTFOUND') || msg.includes('timeout')) {
      console.warn('⚠️  [DB] MongoDB Atlas connection failed — network or IP whitelist issue.');
      console.warn('    ➜  To fix: Go to MongoDB Atlas > Network Access > Add IP Address');
      console.warn(`    ➜  Your current public IP must be whitelisted, or add 0.0.0.0/0 for unrestricted access.`);
    } else {
      console.warn('⚠️  [DB] MongoDB Atlas connection failed:', msg);
    }

    console.log('💡 [DB] In-memory demo mode active. Data will not persist across restarts.');
    return false;
  }
}

export function getDbStatus(): { connected: boolean; mode: string } {
  return {
    connected: isMongoConnected,
    mode: mongoMode,
  };
}
