const { Queue, Worker } = require('bullmq');
const logger = require('../config/logger');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

// Create mock queues and workers for test environment
const createMockQueue = () => ({
  add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
  on: jest.fn(),
});

const createMockWorker = () => ({
  on: jest.fn(),
  close: jest.fn(),
});

// Check if we're in test environment
const isTest = process.env.NODE_ENV === 'test';

// Email Queue
const emailQueue = isTest ? createMockQueue() : new Queue('email-queue', { connection });

// Email Worker with monitoring
const emailWorker = isTest ? createMockWorker() : new Worker('email-queue', async (job) => {
  const { to, subject, html, text } = job.data;
  
  logger.info(`📧 Processing email job ${job.id} to ${to}: ${subject}`);
  
  try {
    const mailService = require('../config/mail');
    const result = await mailService.sendEmail({
      to,
      subject,
      html,
      text,
    });
    
    logger.info(`✅ Email job ${job.id} completed successfully`);
    return { success: true, to, subject, result };
  } catch (error) {
    logger.error(`❌ Email job ${job.id} failed:`, error.message);
    throw error;
  }
}, { connection });

if (!isTest) {
  emailWorker.on('completed', (job) => {
    logger.info(`✅ Email job ${job.id} completed in ${job.finishedOn - job.processedOn}ms`);
  });

  emailWorker.on('failed', (job, err) => {
    logger.error(`❌ Email job ${job.id} failed after ${job.attemptsMade} attempts:`, err.message);
  });

  emailWorker.on('progress', (job, progress) => {
    logger.debug(`📊 Email job ${job.id} progress: ${progress}%`);
  });
}

// Notification Queue
const notificationQueue = isTest ? createMockQueue() : new Queue('notification-queue', { connection });

const notificationWorker = isTest ? createMockWorker() : new Worker('notification-queue', async (job) => {
  const { userId, type, title, message, link } = job.data;
  
  logger.info(`🔔 Sending notification to ${userId}: ${title}`);
  
  return { success: true, userId, type };
}, { connection });

if (!isTest) {
  notificationWorker.on('completed', (job) => {
    logger.info(`✅ Notification job ${job.id} completed`);
  });

  notificationWorker.on('failed', (job, err) => {
    logger.error(`❌ Notification job ${job.id} failed:`, err);
  });
}

// Cleanup queue
const cleanupQueue = isTest ? createMockQueue() : new Queue('cleanup-queue', { connection });

const cleanupWorker = isTest ? createMockWorker() : new Worker('cleanup-queue', async (job) => {
  const { table, olderThan } = job.data;
  
  logger.info(`🧹 Cleaning up ${table} older than ${olderThan} days`);
  
  return { success: true, table, olderThan };
}, { connection });

if (!isTest) {
  cleanupWorker.on('completed', (job) => {
    logger.info(`✅ Cleanup job ${job.id} completed`);
  });

  cleanupWorker.on('failed', (job, err) => {
    logger.error(`❌ Cleanup job ${job.id} failed:`, err);
  });
}

module.exports = {
  emailQueue,
  notificationQueue,
  cleanupQueue,
  emailWorker,
  notificationWorker,
  cleanupWorker,
};