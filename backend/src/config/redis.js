const Redis = require('ioredis');
const logger = require('./logger');

class RedisClient {
  constructor() {
    this.client = null;
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.client = new Redis(redisUrl);

      this.client.on('connect', () => {
        logger.info('✅ Redis connected successfully');
      });

      this.client.on('error', (error) => {
        logger.error('Redis error:', error);
      });

      await this.client.ping();
      return this.client;
    } catch (error) {
      logger.warn('⚠️ Redis connection failed. Running without cache.');
      return null;
    }
  }

  getClient() {
    return this.client;
  }

  async set(key, value, ttl = 3600) {
    if (!this.client) return null;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      logger.error('Redis set error:', error);
    }
  }

  async get(key) {
    if (!this.client) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  async del(key) {
    if (!this.client) return null;
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis delete error:', error);
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis disconnected');
    }
  }
}

module.exports = new RedisClient();