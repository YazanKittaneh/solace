import { Redis } from 'ioredis';

// Redis connection configuration interface
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  maxRetriesPerRequest?: number;
  enableOfflineQueue?: boolean;
  lazyConnect?: boolean;
  connectTimeout?: number;
  commandTimeout?: number;
}

// Enhanced Redis connection with failover and performance optimization
let redis: Redis | null = null;
let connectionError: Error | null = null;

const createRedisConnection = (config: RedisConfig): Redis => {
  try {
    // Build configuration object, excluding password if not provided
    const redisOptions: any = {
      host: config.host,
      port: config.port,
      db: config.db || 0,
      
      // Connection settings
      maxRetriesPerRequest: config.maxRetriesPerRequest || 3,
      enableOfflineQueue: config.enableOfflineQueue ?? false,
      lazyConnect: config.lazyConnect ?? true,
      connectTimeout: config.connectTimeout || 10000,
      commandTimeout: config.commandTimeout || 5000,
      
      // Performance optimization
      keepAlive: 30000,
      family: 4,
      
      // Reconnection strategy
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        return err.message.includes(targetError);
      },
      
      // Retry strategy
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    // Only add password if it's provided
    if (config.password) {
      redisOptions.password = config.password;
    }

    const client = new Redis(redisOptions);

    // Event handlers for monitoring
    client.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Redis connection established successfully');
      }
      connectionError = null;
    });

    client.on('error', (error) => {
      console.error('Redis connection error:', error);
      connectionError = error;
    });

    client.on('reconnecting', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Reconnecting to Redis...');
      }
    });

    client.on('close', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Redis connection closed');
      }
    });

    return client;
  } catch (error) {
    console.error('Failed to create Redis connection:', error);
    throw error;
  }
};

// Initialize Redis connection with environment configuration
const initializeRedis = (): void => {
  try {
    // Skip Redis initialization if explicitly disabled
    if (process.env.REDIS_ENABLED === 'false') {
      console.log('Redis caching disabled by configuration');
      return;
    }

    // Redis connection configuration from environment
    const redisConfig: RedisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      db: parseInt(process.env.REDIS_DB || '0', 10),
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
      enableOfflineQueue: process.env.REDIS_OFFLINE_QUEUE === 'true',
      lazyConnect: process.env.REDIS_LAZY_CONNECT !== 'false',
      connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
      commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || '5000', 10),
    };

    // Add password only if provided
    if (process.env.REDIS_PASSWORD) {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }

    // Validate required configuration
    if (!redisConfig.host) {
      throw new Error('Redis host is required but not configured');
    }

    redis = createRedisConnection(redisConfig);
    
    // Log connection details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Redis configuration initialized:', {
        host: redisConfig.host,
        port: redisConfig.port,
        db: redisConfig.db,
        lazyConnect: redisConfig.lazyConnect,
      });
    }
    
    connectionError = null;
  } catch (error) {
    connectionError = error as Error;
    console.warn('Redis initialization failed:', error);
    console.warn('Application will run without caching');
    redis = null;
  }
};

// Initialize Redis connection
initializeRedis();

// Redis health check function
export const isRedisConnected = (): boolean => {
  return redis !== null && redis.status === 'ready' && connectionError === null;
};

// Get Redis connection with validation
export const getRedisClient = (): Redis => {
  if (!redis) {
    if (connectionError) {
      throw new Error(`Redis connection failed: ${connectionError.message}`);
    }
    throw new Error('Redis not initialized or disabled');
  }
  
  if (redis.status !== 'ready') {
    throw new Error(`Redis not ready (status: ${redis.status})`);
  }
  
  return redis;
};

// Graceful Redis connection retry
export const retryRedisConnection = async (): Promise<boolean> => {
  try {
    if (redis) {
      await redis.disconnect();
    }
    
    initializeRedis();
    
    if (redis && redis.status === 'ready') {
      // Test the connection with a simple ping
      await redis.ping();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Redis retry failed:', error);
    return false;
  }
};

// Cache utility functions
export const cache = {
  // Get value from cache
  async get<T = string>(key: string): Promise<T | null> {
    try {
      if (!isRedisConnected()) {
        return null;
      }
      
      const client = getRedisClient();
      const value = await client.get(key);
      
      if (value === null) {
        return null;
      }
      
      // Try to parse JSON, fallback to raw string
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Set value in cache with optional TTL
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      if (!isRedisConnected()) {
        return false;
      }
      
      const client = getRedisClient();
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttlSeconds) {
        await client.setex(key, ttlSeconds, serializedValue);
      } else {
        await client.set(key, serializedValue);
      }
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Delete value from cache
  async del(key: string): Promise<boolean> {
    try {
      if (!isRedisConnected()) {
        return false;
      }
      
      const client = getRedisClient();
      const result = await client.del(key);
      return result > 0;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      if (!isRedisConnected()) {
        return false;
      }
      
      const client = getRedisClient();
      const result = await client.exists(key);
      return result > 0;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  },

  // Set multiple values with pipeline
  async mset(keyValuePairs: Record<string, any>, ttlSeconds?: number): Promise<boolean> {
    try {
      if (!isRedisConnected()) {
        return false;
      }
      
      const client = getRedisClient();
      const pipeline = client.pipeline();
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttlSeconds) {
          pipeline.setex(key, ttlSeconds, serializedValue);
        } else {
          pipeline.set(key, serializedValue);
        }
      });
      
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  },

  // Get multiple values
  async mget(keys: string[]): Promise<(any | null)[]> {
    try {
      if (!isRedisConnected() || keys.length === 0) {
        return keys.map(() => null);
      }
      
      const client = getRedisClient();
      const values = await client.mget(...keys);
      
      return values.map(value => {
        if (value === null) {
          return null;
        }
        
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  },

  // Clear all cache (use with caution)
  async flush(): Promise<boolean> {
    try {
      if (!isRedisConnected()) {
        return false;
      }
      
      const client = getRedisClient();
      await client.flushdb();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  },
};

// Connection statistics for monitoring
export const getRedisStats = () => {
  return {
    connected: isRedisConnected(),
    status: redis?.status || 'not_initialized',
    error: connectionError?.message || null,
    config: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || '6379',
      db: process.env.REDIS_DB || '0',
    },
  };
};

// Graceful shutdown
export const disconnectRedis = async (): Promise<void> => {
  if (redis) {
    try {
      await redis.quit();
      redis = null;
    } catch (error) {
      console.error('Error during Redis disconnect:', error);
    }
  }
};

// Export Redis client instance (can be null)
export { redis };

// Default export for compatibility
export default redis;