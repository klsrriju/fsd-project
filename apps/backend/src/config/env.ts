import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'development_secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  mongodbUri: process.env.MONGODB_URI || 'mongodb+srv://klsrriju_db_user:fsdproject@cluster0.9eabqvy.mongodb.net/fsdproject?retryWrites=true&w=majority',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379)
  }
};
