import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL as string;

export default defineConfig({
  out: './drizzle',
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL,
  },
});
