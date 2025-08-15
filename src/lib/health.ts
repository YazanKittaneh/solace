import { getDatabase, isDatabaseConnected, getConnectionStats, retryDatabaseConnection } from '@/db';
import { getRedisClient, isRedisConnected, getRedisStats, retryRedisConnection } from '@/lib/redis';
import { sql } from 'drizzle-orm';

// Health check status enum
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

// Individual service health interface
export interface ServiceHealth {
  status: HealthStatus;
  lastChecked: Date;
  responseTime: number;
  error?: string;
  details?: Record<string, any>;
}

// Overall application health interface
export interface ApplicationHealth {
  status: HealthStatus;
  version: string;
  uptime: number;
  timestamp: Date;
  services: {
    database: ServiceHealth;
    cache: ServiceHealth;
    api: ServiceHealth;
  };
  checks: {
    database: boolean;
    cache: boolean;
    memory: boolean;
    disk: boolean;
  };
}

// Database health check with performance testing
export const checkDatabaseHealth = async (): Promise<ServiceHealth> => {
  const startTime = Date.now();
  
  try {
    // Basic connection check
    if (!isDatabaseConnected()) {
      return {
        status: HealthStatus.UNHEALTHY,
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
        error: 'Database connection not established',
        details: getConnectionStats(),
      };
    }

    const db = getDatabase();
    
    // Perform a simple query to test database responsiveness
    const testQuery = await db.execute(sql`SELECT 1 as test, NOW() as current_time`);
    
    // Test connection pool performance
    const poolStats = getConnectionStats();
    
    const responseTime = Date.now() - startTime;
    
    // Determine health status based on response time
    let status = HealthStatus.HEALTHY;
    if (responseTime > 1000) {
      status = HealthStatus.DEGRADED;
    }
    if (responseTime > 5000) {
      status = HealthStatus.UNHEALTHY;
    }
    
    return {
      status,
      lastChecked: new Date(),
      responseTime,
      details: {
        ...poolStats,
        queryResult: testQuery?.[0],
        performanceThresholds: {
          healthy: '<1000ms',
          degraded: '1000-5000ms',
          unhealthy: '>5000ms',
        },
      },
    };
    
  } catch (error) {
    return {
      status: HealthStatus.UNHEALTHY,
      lastChecked: new Date(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown database error',
      details: getConnectionStats(),
    };
  }
};

// Redis health check with performance testing
export const checkCacheHealth = async (): Promise<ServiceHealth> => {
  const startTime = Date.now();
  
  try {
    // Basic connection check
    if (!isRedisConnected()) {
      return {
        status: HealthStatus.DEGRADED, // Cache failure is degraded, not unhealthy
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
        error: 'Redis connection not available',
        details: getRedisStats(),
      };
    }

    const redis = getRedisClient();
    
    // Perform ping test
    const pingResult = await redis.ping();
    
    // Test cache operations
    const testKey = `health_check_${Date.now()}`;
    const testValue = 'health_test';
    
    await redis.set(testKey, testValue, 'EX', 60); // Expire in 60 seconds
    const retrievedValue = await redis.get(testKey);
    await redis.del(testKey);
    
    const responseTime = Date.now() - startTime;
    
    // Verify cache operations worked correctly
    if (pingResult !== 'PONG' || retrievedValue !== testValue) {
      return {
        status: HealthStatus.DEGRADED,
        lastChecked: new Date(),
        responseTime,
        error: 'Cache operations failed verification',
        details: getRedisStats(),
      };
    }
    
    // Determine health status based on response time
    let status = HealthStatus.HEALTHY;
    if (responseTime > 500) {
      status = HealthStatus.DEGRADED;
    }
    if (responseTime > 2000) {
      status = HealthStatus.UNHEALTHY;
    }
    
    return {
      status,
      lastChecked: new Date(),
      responseTime,
      details: {
        ...getRedisStats(),
        pingResult,
        performanceThresholds: {
          healthy: '<500ms',
          degraded: '500-2000ms',
          unhealthy: '>2000ms',
        },
      },
    };
    
  } catch (error) {
    return {
      status: HealthStatus.DEGRADED, // Cache failure is degraded, not unhealthy
      lastChecked: new Date(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown cache error',
      details: getRedisStats(),
    };
  }
};

// API health check (basic service availability)
export const checkApiHealth = async (): Promise<ServiceHealth> => {
  const startTime = Date.now();
  
  try {
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    };
    
    // Check uptime
    const uptime = process.uptime();
    
    const responseTime = Date.now() - startTime;
    
    // Determine health based on memory usage (simple heuristic)
    let status = HealthStatus.HEALTHY;
    if (memoryUsageMB.heapUsed > 500) {
      status = HealthStatus.DEGRADED;
    }
    if (memoryUsageMB.heapUsed > 1000) {
      status = HealthStatus.UNHEALTHY;
    }
    
    return {
      status,
      lastChecked: new Date(),
      responseTime,
      details: {
        memoryUsage: memoryUsageMB,
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
    };
    
  } catch (error) {
    return {
      status: HealthStatus.UNHEALTHY,
      lastChecked: new Date(),
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown API error',
    };
  }
};

// Comprehensive application health check
export const checkApplicationHealth = async (): Promise<ApplicationHealth> => {
  // Run all health checks in parallel for better performance
  const [databaseHealth, cacheHealth, apiHealth] = await Promise.all([
    checkDatabaseHealth(),
    checkCacheHealth(),
    checkApiHealth(),
  ]);
  
  // Determine overall application health
  const services = {
    database: databaseHealth,
    cache: cacheHealth,
    api: apiHealth,
  };
  
  // Overall status logic:
  // - Unhealthy if database or API is unhealthy
  // - Degraded if any service is degraded or cache is unavailable
  // - Healthy if all critical services are healthy
  let overallStatus = HealthStatus.HEALTHY;
  
  if (databaseHealth.status === HealthStatus.UNHEALTHY || apiHealth.status === HealthStatus.UNHEALTHY) {
    overallStatus = HealthStatus.UNHEALTHY;
  } else if (
    databaseHealth.status === HealthStatus.DEGRADED ||
    cacheHealth.status === HealthStatus.DEGRADED ||
    apiHealth.status === HealthStatus.DEGRADED ||
    cacheHealth.status === HealthStatus.UNHEALTHY
  ) {
    overallStatus = HealthStatus.DEGRADED;
  }
  
  return {
    status: overallStatus,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date(),
    services,
    checks: {
      database: databaseHealth.status !== HealthStatus.UNHEALTHY,
      cache: cacheHealth.status !== HealthStatus.UNHEALTHY,
      memory: apiHealth.status !== HealthStatus.UNHEALTHY,
      disk: true, // Placeholder for future disk space check
    },
  };
};

// Attempt to recover unhealthy services
export const attemptServiceRecovery = async (): Promise<{
  database: boolean;
  cache: boolean;
}> => {
  const results = {
    database: false,
    cache: false,
  };
  
  try {
    // Attempt database recovery
    if (!isDatabaseConnected()) {
      console.log('Attempting database connection recovery...');
      results.database = await retryDatabaseConnection();
      if (results.database) {
        console.log('Database connection recovered successfully');
      }
    } else {
      results.database = true;
    }
    
    // Attempt cache recovery
    if (!isRedisConnected()) {
      console.log('Attempting Redis connection recovery...');
      results.cache = await retryRedisConnection();
      if (results.cache) {
        console.log('Redis connection recovered successfully');
      }
    } else {
      results.cache = true;
    }
    
  } catch (error) {
    console.error('Service recovery failed:', error);
  }
  
  return results;
};

// Health check middleware for API endpoints
export const healthCheckMiddleware = async () => {
  const health = await checkApplicationHealth();
  
  // Return appropriate HTTP status based on health
  const httpStatus = {
    [HealthStatus.HEALTHY]: 200,
    [HealthStatus.DEGRADED]: 200, // Still functional
    [HealthStatus.UNHEALTHY]: 503, // Service unavailable
  }[health.status];
  
  return {
    status: httpStatus,
    data: health,
  };
};

// Scheduled health monitoring (for background health checks)
export const scheduleHealthMonitoring = (intervalMinutes: number = 5) => {
  if (process.env.NODE_ENV === 'production') {
    setInterval(async () => {
      try {
        const health = await checkApplicationHealth();
        
        if (health.status === HealthStatus.UNHEALTHY) {
          console.error('Application health check failed:', health);
          
          // Attempt service recovery
          const recovery = await attemptServiceRecovery();
          console.log('Service recovery attempt results:', recovery);
        } else if (health.status === HealthStatus.DEGRADED) {
          console.warn('Application health degraded:', health);
        }
        
      } catch (error) {
        console.error('Health monitoring error:', error);
      }
    }, intervalMinutes * 60 * 1000);
    
    console.log(`Health monitoring scheduled every ${intervalMinutes} minutes`);
  }
};

// Note: Functions are already exported inline above