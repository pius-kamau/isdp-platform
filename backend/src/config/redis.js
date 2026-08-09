const { Redis } = require('@upstash/redis');
const logger = require('./logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConfigured = false;
  }

  async connect() {
    try {
      // Check for Upstash environment variables
      const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
      const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

      if (upstashUrl && upstashToken) {
        // Connect using Upstash REST API
        this.client = new Redis({
          url: upstashUrl,
          token: upstashToken,
        });
        this.isConfigured = true;
        logger.info('✅ Upstash Redis connected successfully via REST API');
        
        // Test the connection
        await this.client.ping();
        return this.client;
      }

      // Fallback to standard Redis URL (for local development)
      const redisUrl = process.env.REDIS_URL;
      if (redisUrl) {
        const Redis = require('ioredis');
        this.client = new Redis(redisUrl);
        this.isConfigured = true;
        logger.info('✅ Redis connected successfully via URL');
        return this.client;
      }

      logger.warn('⚠️ No Redis configuration found. Running without cache.');
      return null;
      
    } catch (error) {
      logger.warn('⚠️ Redis connection failed:', error.message);
      this.isConfigured = false;
      return null;
    }
  }

  getClient() {
    return this.client;
  }

  async set(key, value, ttl = 3600) {
    if (!this.isConfigured || !this.client) return null;
    try {
      await this.client.set(key, JSON.stringify(value), { ex: ttl });
    } catch (error) {
      logger.error('Redis set error:', error);
    }
  }

  async get(key) {
    if (!this.isConfigured || !this.client) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  async del(key) {
    if (!this.isConfigured || !this.client) return null;
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis delete error:', error);
    }
  }

  async disconnect() {
    if (this.client) {
      // Upstash client doesn't have a quit method, but we can set it to null
      this.client = null;
      this.isConfigured = false;
      logger.info('Redis disconnected');
    }
  }
}

module.exports = new RedisClient();