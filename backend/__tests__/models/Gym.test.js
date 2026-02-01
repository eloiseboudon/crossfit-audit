const Gym = require('../../models/Gym');
const { dbRun } = require('../../config/database');

describe('Gym Model', () => {
  beforeEach(async () => {
    // Nettoyer la base de test
    await dbRun('DELETE FROM gyms');
  });

  describe('create()', () => {
    it('devrait créer une nouvelle salle avec toutes les données', async () => {
      const gymData = {
        name: 'CrossFit Test',
        city: 'Paris',
        postal_code: '75001',
        contact_name: 'John Doe',
        email: 'test@crossfit.com',
        founded_year: 2020,
        partners_count: 2
      };

      const gym = await Gym.create(gymData, 'user123');

      expect(gym).toBeDefined();
      expect(gym.id).toBeDefined();
      expect(gym.name).toBe('CrossFit Test');
      expect(gym.user_id).toBe('user123');
      expect(gym.city).toBe('Paris');
    });

    it('devrait créer une salle avec données minimales', async () => {
      const gymData = { name: 'Minimal Gym' };
      const gym = await Gym.create(gymData);

      expect(gym).toBeDefined();
      expect(gym.name).toBe('Minimal Gym');
      expect(gym.user_id).toBeNull();
    });

    it('devrait échouer sans nom', async () => {
      await expect(Gym.create({})).rejects.toThrow();
    });
  });

  describe('findById()', () => {
    it('devrait trouver une salle par ID', async () => {
      const created = await Gym.create({ name: 'Find Test' });
      const found = await Gym.findById(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Find Test');
    });

    it('devrait retourner null pour ID inexistant', async () => {
      const found = await Gym.findById('inexistant-id');
      expect(found).toBeNull();
    });
  });

  describe('update()', () => {
    it('devrait mettre à jour les champs spécifiés', async () => {
      const gym = await Gym.create({ name: 'Original', city: 'Paris' });

      const updated = await Gym.update(gym.id, {
        name: 'Updated',
        postal_code: '75002'
      });

      expect(updated.name).toBe('Updated');
      expect(updated.postal_code).toBe('75002');
      expect(updated.city).toBe('Paris'); // Inchangé
    });
  });

  describe('findAllForUser()', () => {
    it('devrait retourner les salles owned + accès partagé', async () => {
      const userId = 'user456';

      // Salle owned
      await Gym.create({ name: 'My Gym' }, userId);

      // Salle d'un autre avec accès
      const otherGym = await Gym.create({ name: 'Shared Gym' }, 'other-user');
      await dbRun(
        'INSERT INTO gym_user_access (id, gym_id, user_id, access_level, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        ['access1', otherGym.id, userId, 'read', new Date().toISOString(), new Date().toISOString()]
      );

      const gyms = await Gym.findAllForUser(userId);

      expect(gyms.length).toBe(2);
      expect(gyms.some(g => g.name === 'My Gym')).toBeTruthy();
      expect(gyms.some(g => g.name === 'Shared Gym')).toBeTruthy();
    });
  });
});
