process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const workerId = process.env.JEST_WORKER_ID || '0';
process.env.DB_PATH = process.env.DB_PATH || `database/test-${workerId}.db`;

const { initDatabase } = require('../scripts/initDatabase');

beforeAll(async () => {
  await initDatabase();
});
