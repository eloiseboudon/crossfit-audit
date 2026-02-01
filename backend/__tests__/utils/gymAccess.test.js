const { resolveGymAccess } = require('../../utils/gymAccess');
const Gym = require('../../models/Gym');
const GymAccess = require('../../models/GymAccess');
const { dbRun } = require('../../config/database');

describe('gymAccess Utility', () => {
  let ownerUser, readUser, writeUser, otherUser, testGym;

  beforeEach(async () => {
    await dbRun('DELETE FROM gym_user_access');
    await dbRun('DELETE FROM gyms');

    // Setup data
    ownerUser = { id: 'owner-123', role: 'user' };
    readUser = { id: 'read-456', role: 'user' };
    writeUser = { id: 'write-789', role: 'user' };
    otherUser = { id: 'other-999', role: 'user' };

    testGym = await Gym.create({ name: 'Test Gym' }, ownerUser.id);

    await GymAccess.grant(testGym.id, readUser.id, 'read');
    await GymAccess.grant(testGym.id, writeUser.id, 'write');
  });

  it('owner devrait avoir canWrite = true', async () => {
    const access = await resolveGymAccess({
      gymId: testGym.id,
      user: ownerUser
    });

    expect(access.canRead).toBe(true);
    expect(access.canWrite).toBe(true);
    expect(access.isOwner).toBe(true);
    expect(access.accessLevel).toBe('owner');
  });

  it('user avec read access devrait avoir canWrite = false', async () => {
    const access = await resolveGymAccess({
      gymId: testGym.id,
      user: readUser
    });

    expect(access.canRead).toBe(true);
    expect(access.canWrite).toBe(false);
    expect(access.isOwner).toBe(false);
    expect(access.accessLevel).toBe('read');
  });

  it('user avec write access devrait avoir canWrite = true', async () => {
    const access = await resolveGymAccess({
      gymId: testGym.id,
      user: writeUser
    });

    expect(access.canRead).toBe(true);
    expect(access.canWrite).toBe(true);
    expect(access.accessLevel).toBe('write');
  });

  it('user sans accès devrait avoir canRead/Write = false', async () => {
    const access = await resolveGymAccess({
      gymId: testGym.id,
      user: otherUser
    });

    expect(access.canRead).toBe(false);
    expect(access.canWrite).toBe(false);
    expect(access.gym).toBeNull();
  });

  it('admin devrait toujours avoir accès complet', async () => {
    const adminUser = { id: 'admin-000', role: 'admin' };

    const access = await resolveGymAccess({
      gymId: testGym.id,
      user: adminUser
    });

    expect(access.canRead).toBe(true);
    expect(access.canWrite).toBe(true);
    expect(access.accessLevel).toBe('owner');
  });
});
