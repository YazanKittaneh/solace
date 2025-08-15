import type { Config } from 'drizzle-kit';
import { loadEnvConfig } from '@next/env';

// Load environment variables in the same way Next.js does
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const config: Config = {
  // Database configuration
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  
  // Database credentials with fallback
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgresql://postgres:password@localhost:5432/solaceassignment',
  },
  
  // Migration settings
  migrations: {
    prefix: 'timestamp',
    table: 'drizzle_migrations',
    schema: 'public',
  },
  
  // Performance and debugging
  verbose: process.env.NODE_ENV === 'development',
  strict: true,
  
  // Connection pool settings for migrations
  extensionsFilters: ['postgis'],
  schemaFilter: ['public'],
  tablesFilter: ['*'],
  
  // Additional Drizzle Kit configuration
  breakpoints: true,
  introspect: {
    casing: 'camel',
  },
};

// Validate configuration
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgresql://postgres:password@localhost:5432/solaceassignment';
if (!dbUrl) {
  throw new Error(
    'Database URL is required. Please set DATABASE_URL or POSTGRES_URL environment variable.'
  );
}

// Log configuration in development
if (process.env.NODE_ENV === 'development' && config.verbose) {
  console.log('Drizzle Config:', {
    dialect: config.dialect,
    schema: config.schema,
    migrations: config.out,
    url: dbUrl.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
  });
}

export default config;
