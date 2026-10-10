import mongoose from 'mongoose';
import { config } from './env';

export async function connectMongoDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB Atlas (fsdproject)');
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error);
    process.exit(1);
  }
}
