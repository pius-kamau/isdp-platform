const redis = require('../config/redis');
const logger = require('../config/logger');

/**
 * Cache middleware - caches GET requests
 * @param {number} ttl - Time to live in seconds (default: 300)
 */
const cache = (ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache for authenticated user-specific requests
    if (req.userId) {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const client = redis.getClient();
      if (!client) {
        return next();
      }

      const cachedData = await redis.get(key);
      if (cachedData) {
        logger.debug(`Cache HIT: ${key}`);
        return res.json(cachedData);
      }

      // Store original send function
      const originalSend = res.json.bind(res);

      // Override json method to cache response
      res.json = function(data) {
        // Cache the response
        redis.set(key, data, ttl).catch(err => {
          logger.error('Cache set error:', err);
        });
        logger.debug(`Cache MISS: ${key}`);
        return originalSend(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Clear cache for a specific key or pattern
 */
const clearCache = async (pattern) => {
  try {
    const client = redis.getClient();
    if (!client) return;

    const keys = await client.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await client.del(keys);
      logger.info(`Cache cleared: ${keys.length} keys`);
    }
  } catch (error) {
    logger.error('Clear cache error:', error);
  }
};

/**
 * Invalidate cache for a specific key
 */
const invalidateCache = (key) => {
  return async (req, res, next) => {
    try {
      const client = redis.getClient();
      if (client) {
        await client.del(`cache:${key}`);
        logger.debug(`Cache invalidated: ${key}`);
      }
      next();
    } catch (error) {
      logger.error('Invalidate cache error:', error);
      next();
    }
  };
};

module.exports = {
  cache,
  clearCache,
  invalidateCache,
};