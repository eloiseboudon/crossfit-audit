const { resolveGymAccess } = require('../../utils/gymAccess');
const Gym = require('../../models/Gym');
const GymAccess = require('../../models/GymAccess');
const User = require('../../models/User');
const { dbRun } = require('../../config/database');
const { ACCESS_LEVELS, ROLES } = require('../../constants');

describe('gymAccess Utility', () => {
  let ownerUser, readUser, writeUser, otherUser, testGym;

  beforeEach(async () => {
    await dbRun('DELETE FROM gym_user_access');
    await dbRun('DELETE FROM gyms');
    await dbRun('DELETE FROM users');

    // Setup data
    ownerUser = await User.create({
      email: 'owner@gymaccess.test',
      password: 'password123',
      name: 'Owner User'
    });
    readUser = await User.create({
      email: 'read@gymaccess.test',
      password: 'password123',
      name: 'Read User'
    });
    writeUser = await User.create({
      email: 'write@gymaccess.test',
      password: 'password123',
      name: 'Write User'
    });
    otherUser = await User.create({
      email: 'other@gymaccess.test',
      password: 'password123',
      name: 'Other User'
    });

    testGym = await Gym.create({ name: 'Test Gym' }, ownerUser.id);

    await GymAccess.upsert(testGym.id, readUser.id, ACCESS_LEVELS.READ);
    await GymAccess.upsert(testGym.id, writeUser.id, ACCESS_LEVELS.WRITE);
  });

  it('owner devrait avoir canWrite = true', async () => {
    const access = await resolveGymAccess({ 
      gymId: testGym.id, 
      user: { id: ownerUser.id, role: ROLES.USER }
    });

    expect(access.canRead).toBe(true);
    expect(access.canWrite).toBe(true);
    expect(access.isOwner).toBe(true);
    expect(access.accessLevel).toBe(ACCESS_LEVELS.OWNER);
  });

  it('user avec read access devrait avoir canWrite = false', async () => {
    const access = await resolveGymAccess({ 
      gymId: testGym.id, 
      user: { id: readUser.id, role: ROLES.USER }
    });

    expect(access.canRead).toBe(true);
    expect(access.canWrite).toBe(false);
    expect(access.isOwner).toBe(false);
    expect(access.accessLevel).toBe(ACCESS_LEVELS.READ);
  });

  it('user avec write access devrait avoir canWrite = true', async () => {
    const access = await resolveGymAccess({ 
      gymId: testGym.id, 
      user: { id: writeUser.id, role: ROLES.USER }
    });

    expect(access.canRead).toBe(true);
    expect(access.canWrite).toBe(true);
    expect(access.accessLevel).toBe(ACCESS_LEVELS.WRITE);
  });

  it('user sans accès devrait avoir canRead/Write = false', async () => {
    const access = await resolveGymAccess({ 
      gymId: testGym.id, 
      user: { id: otherUser.id, role: ROLES.USER }
    });

    expect(access.canRead).toBe(false);
    expect(access.canWrite).toBe(false);
    expect(access.gym).toBeDefined();
  });

  it('admin devrait toujours avoir accès complet', async () => {
    const adminUser = { id: 'admin-000', role: ROLES.ADMIN };
    
    const access = await resolveGymAccess({ 
      gymId: testGym.id, 
      user: adminUser 
    });

    expect(access.canRead).toBe(true);
    expect(access.canWrite).toBe(true);
    expect(access.accessLevel).toBe(ROLES.ADMIN);
  });
});
