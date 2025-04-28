import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';
import { Logger } from '../utils/logger';

const logger = new Logger();

// Create cache instance
const cache = new NodeCache({
  stdTTL: 600, // Default time to live in seconds (10 minutes)
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Disable cloning of cached values
});

// Cache middleware
export const cacheMiddleware = (duration: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const key = `cache:${req.originalUrl}`;

    // Try to get cached response
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      logger.info('Cache hit:', { key });
      return res.json(cachedResponse);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function (body: any) {
      cache.set(key, body, duration);
      logger.info('Cache set:', { key, duration });
      return originalJson.call(this, body);
    };

    next();
  };
};

// Clear cache middleware
export const clearCache = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Clear all cache
    cache.flushAll();
    logger.info('Cache cleared');
    next();
  } catch (error) {
    logger.error('Error clearing cache:', { error });
    next(error);
  }
};

// Cache stats middleware
export const cacheStats = (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = cache.getStats();
    res.json({
      hits: stats.hits,
      misses: stats.misses,
      keys: stats.keys,
      ksize: stats.ksize,
      vsize: stats.vsize
    });
  } catch (error) {
    logger.error('Error getting cache stats:', { error });
    next(error);
  }
}; 