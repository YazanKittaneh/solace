import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection configuration
interface DatabaseConfig {
  url: string;
  max?: number;
  idle_timeout?: number;
  connect_timeout?: number;
  ssl?: boolean | object;
  debug?: boolean;
}

// Enhanced connection pool configuration
const createDatabaseConnection = (config: DatabaseConfig) => {
  const {
    url,
    max = parseInt(process.env.DB_POOL_MAX || '20', 10),
    idle_timeout = parseInt(process.env.DB_IDLE_TIMEOUT || '30', 10),
    connect_timeout = parseInt(process.env.DB_CONNECT_TIMEOUT || '30', 10),
    ssl = process.env.NODE_ENV === 'production',
    debug = process.env.NODE_ENV === 'development' && process.env.DB_DEBUG === 'true',
  } = config;

  try {
    const client = postgres(url, {
      max,
      idle_timeout,
      connect_timeout,
      ssl,
      debug,
      // Enhanced connection settings for performance
      prepare: false, // Disable prepared statements for connection pooling
      transform: {
        undefined: null, // Transform undefined to null for PostgreSQL compatibility
      },
      // Connection retry settings
      connection: {
        application_name: 'solace_advocate_dashboard',
      },
      // Query timeout settings
      timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '60', 10),
    });

    return drizzle(client, { 
      schema,
      logger: debug, // Enable query logging in development
    });
  } catch (error) {
    console.error('Failed to create database connection:', error);
    throw error;
  }
};

// Database connection with fallback handling
let db: ReturnType<typeof drizzle> | null = null;
let connectionError: Error | null = null;

const initializeDatabase = () => {
  try {
    // Priority order: DATABASE_URL > POSTGRES_URL > default local
    const databaseUrl = 
      process.env.DATABASE_URL || 
      process.env.POSTGRES_URL || 
      'postgresql://postgres:password@localhost:5432/solaceassignment';

    if (!databaseUrl) {
      throw new Error('No database URL configured');
    }

    db = createDatabaseConnection({ url: databaseUrl });
    
    // Test connection in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Database connection initialized successfully');
      console.log('Connection pool settings:', {
        max: process.env.DB_POOL_MAX || '20',
        idle_timeout: process.env.DB_IDLE_TIMEOUT || '30',
        connect_timeout: process.env.DB_CONNECT_TIMEOUT || '30',
      });
    }
    
    connectionError = null;
  } catch (error) {
    connectionError = error as Error;
    console.warn('Database initialization failed:', error);
    console.warn('Application will run with limited functionality');
    db = null;
  }
};

// Initialize database connection
initializeDatabase();

// Health check function
export const isDatabaseConnected = (): boolean => {
  return db !== null && connectionError === null;
};

// Get database connection with validation
export const getDatabase = () => {
  if (!db) {
    if (connectionError) {
      throw new Error(`Database connection failed: ${connectionError.message}`);
    }
    throw new Error('Database not initialized');
  }
  return db;
};

// Graceful database connection retry
export const retryDatabaseConnection = async (): Promise<boolean> => {
  try {
    initializeDatabase();
    // Test the connection with a simple query
    if (db) {
      await db.execute(sql`SELECT 1`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Database retry failed:', error);
    return false;
  }
};

// Connection statistics for monitoring
export const getConnectionStats = () => {
  return {
    connected: isDatabaseConnected(),
    error: connectionError?.message || null,
    poolConfig: {
      max: process.env.DB_POOL_MAX || '20',
      idle_timeout: process.env.DB_IDLE_TIMEOUT || '30',
      connect_timeout: process.env.DB_CONNECT_TIMEOUT || '30',
    },
  };
};

// Export database instance (can be null)
export { db };

// Export all schema items
export * from './schema';

// Import sql helper for raw queries
import { sql } from 'drizzle-orm';
export { sql };

// Default export for compatibility
export default db;