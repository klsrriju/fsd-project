import { config } from '../config/env';

export async function migrate() {
  console.log('MongoDB Atlas connection active at:', config.mongodbUri);
  console.log('No SQL migrations required for MongoDB.');
}
