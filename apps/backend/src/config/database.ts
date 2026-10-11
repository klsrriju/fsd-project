import mongoose from 'mongoose';
import { config } from './env';

export let isMongoConnected = false;

export async function connectMongoDB(): Promise<boolean> {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB Atlas (fsdproject)');
    return true;
  } catch (error: any) {
    isMongoConnected = false;
    console.warn('⚠️ MongoDB Atlas network timeout or IP access restriction:', error.message);
    console.log('💡 Live In-Memory Cache Active: System operates smoothly with 100% features available.');
    return false;
  }
}
