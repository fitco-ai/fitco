import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { reset } from 'drizzle-seed';
import * as schema from './src/schema';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL as string;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}
const database = drizzle(DATABASE_URL);

export * from 'drizzle-orm';
export * from 'drizzle-seed';
export * from './src/schema';
export * from './src/types';
export * from './src/const';
export { database };

export async function resetDatabase() {
  const db = drizzle(DATABASE_URL);
  await reset(db, schema);
}
