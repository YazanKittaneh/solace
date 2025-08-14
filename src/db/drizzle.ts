import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

let db: ReturnType<typeof drizzle> | null = null;

if (process.env.POSTGRES_URL) {
  try {
    const client = postgres(process.env.POSTGRES_URL, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: false,
    });
    
    db = drizzle(client, { schema });
  } catch (error) {
    console.warn('Failed to connect to database:', error);
    console.warn('Application will run with limited functionality');
  }
} else {
  console.warn('POSTGRES_URL not configured - database features disabled');
}

export { db };
export default db;