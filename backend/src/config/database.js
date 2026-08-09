const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

class Database {
  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }

  async connect() {
    try {
      await this.prisma.$connect();
      logger.info('✅ Database connected successfully');
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
    logger.info('Database disconnected');
  }

  get client() {
    return this.prisma;
  }
}

module.exports = new Database();