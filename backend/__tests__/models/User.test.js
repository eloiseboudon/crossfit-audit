const User = require('../../models/User');
const { dbRun } = require('../../config/database');
const { ROLES } = require('../../constants');

describe('User Model', () => {
  beforeEach(async () => {
    await dbRun('DELETE FROM users');
  });

  it('devrait créer un utilisateur avec mot de passe hashé', async () => {
    const user = await User.create({
      email: 'user@test.com',
      password: 'password123',
      name: 'Test User'
    });

    expect(user.email).toBe('user@test.com');
    expect(user.role).toBe(ROLES.USER);

    const stored = await User.findByEmail('user@test.com');
    expect(stored.password).not.toBe('password123');
    await expect(User.verifyPassword('password123', stored.password)).resolves.toBe(true);
  });

  it('devrait empêcher la création avec un email déjà utilisé', async () => {
    await User.create({
      email: 'duplicate@test.com',
      password: 'password123',
      name: 'Original'
    });

    await expect(
      User.create({
        email: 'duplicate@test.com',
        password: 'password456',
        name: 'Duplicate'
      })
    ).rejects.toThrow('Cet email est déjà utilisé');
  });

  it('devrait lister uniquement les utilisateurs actifs', async () => {
    const active = await User.create({
      email: 'active@test.com',
      password: 'password123',
      name: 'Active User'
    });
    const inactive = await User.create({
      email: 'inactive@test.com',
      password: 'password123',
      name: 'Inactive User'
    });

    await User.delete(inactive.id);

    const users = await User.findAll();
    const ids = users.map((user) => user.id);

    expect(ids).toContain(active.id);
    expect(ids).not.toContain(inactive.id);
  });

  it('devrait mettre à jour le nom et le rôle', async () => {
    const user = await User.create({
      email: 'update@test.com',
      password: 'password123',
      name: 'Old Name'
    });

    const updated = await User.update(user.id, { name: 'New Name', role: ROLES.ADMIN });

    expect(updated.name).toBe('New Name');
    expect(updated.role).toBe(ROLES.ADMIN);
  });

  it('devrait mettre à jour le mot de passe', async () => {
    const user = await User.create({
      email: 'password@test.com',
      password: 'password123',
      name: 'Password User'
    });

    await User.updatePassword(user.id, 'newpassword456');
    const stored = await User.findByEmail('password@test.com');

    await expect(User.verifyPassword('newpassword456', stored.password)).resolves.toBe(true);
  });

  it('devrait désactiver un utilisateur', async () => {
    const user = await User.create({
      email: 'delete@test.com',
      password: 'password123',
      name: 'Delete User'
    });

    await User.delete(user.id);
    const stored = await User.findById(user.id);

    expect(stored.is_active).toBe(0);
  });

  it('devrait vérifier un mot de passe incorrect', async () => {
    const user = await User.create({
      email: 'verify@test.com',
      password: 'password123',
      name: 'Verify User'
    });

    const stored = await User.findByEmail('verify@test.com');
    await expect(User.verifyPassword('wrongpassword', stored.password)).resolves.toBe(false);
  });
});
