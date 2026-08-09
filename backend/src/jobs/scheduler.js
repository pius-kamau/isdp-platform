const { Queue } = require('bullmq');
const logger = require('../config/logger');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

// Schedule recurring jobs
const scheduleCleanup = async (cleanupQueue) => {
  try {
    // Run cleanup every day at midnight
    await cleanupQueue.add(
      'daily-cleanup',
      {
        table: 'logs',
        olderThan: 30, // 30 days
      },
      {
        repeat: {
          pattern: '0 0 * * *', // Daily at midnight
        },
      }
    );
    
    logger.info('📅 Scheduled daily cleanup job');
  } catch (error) {
    logger.error('Failed to schedule cleanup job:', error);
  }
};

// Simple function to add a job to a queue
const addJob = async (queue, name, data, options = {}) => {
  try {
    const job = await queue.add(name, data, options);
    logger.debug(`✅ Job ${name} added to queue ${queue.name}`);
    return job;
  } catch (error) {
    logger.error(`Failed to add job ${name}:`, error);
    throw error;
  }
};

module.exports = {
  scheduleCleanup,
  addJob,
};