const path = require('path');
const fs = require('fs');

global.vi = globalThis.jest || globalThis.vi;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const workerId = process.env.JEST_WORKER_ID || '0';
const dbFile = `test-${workerId}.db`;
const dbPath = path.join(__dirname, '..', 'database', dbFile);

process.env.DB_PATH = dbPath;

if (fs.existsSync(dbPath)) {
  fs.rmSync(dbPath);
}

const { initDatabase } = require('../scripts/initDatabase');

beforeAll(async () => {
  await initDatabase();
});
