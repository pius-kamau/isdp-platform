const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = 5001;
process.env.REDIS_URL = 'redis://localhost:6379/1';

// Increase timeout for tests
jest.setTimeout(30000);

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

beforeAll(async () => {
  console.log('🧪 Test environment initialized');
});

afterAll(async () => {
  await prisma.$disconnect();
  console.log('🧪 Test environment cleaned up');
});

// Helper function to auto-verify a user
global.verifyUser = async (email) => {
  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });
};