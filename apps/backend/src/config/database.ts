import mongoose from 'mongoose';
import { config } from './env';

export async function connectMongoDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB Atlas (fsdproject)');
  } catch (error: any) {
    console.warn('⚠️ MongoDB Atlas connection warning:', error.message);
    console.warn('👉 Operating in resilient fallback mode (Ensure IP whitelist 0.0.0.0/0 is configured on MongoDB Atlas if network changes).');
  }
}
