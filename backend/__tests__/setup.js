global.vi = jest;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const { initDatabase } = require('../scripts/initDatabase');

beforeAll(async () => {
  if (!global.__dbInitialized) {
    await initDatabase();
    global.__dbInitialized = true;
  }
});
