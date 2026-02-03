const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Gym = require('../../models/Gym');
const { dbRun } = require('../../config/database');

describe('Gym Controller', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    await dbRun('DELETE FROM users');
    await dbRun('DELETE FROM gyms');
    await dbRun('DELETE FROM gym_user_access');

    // Créer user et récupérer token
    const user = await User.create({
      email: 'gym@test.com',
      password: 'password123',
      name: 'Gym Test'
    });
    userId = user.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'gym@test.com', password: 'password123' });

    authToken = loginRes.body.token;
  });

  describe('GET /api/gyms', () => {
    it('devrait retourner toutes les salles pour admin', async () => {
      const admin = await User.create({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin'
      });
      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' });

      const adminToken = adminLogin.body.token;

      await Gym.create({ name: 'Gym 1' }, userId);
      await Gym.create({ name: 'Gym 2' }, admin.id);

      const res = await request(app)
        .get('/api/gyms')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('devrait filtrer les salles par user', async () => {
      await Gym.create({ name: 'My Gym' }, userId);
      await Gym.create({ name: 'Other Gym' }, 'other-user');

      const res = await request(app)
        .get('/api/gyms')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body.data.every(g => g.user_id === userId)).toBe(true);
    });
  });

  describe('POST /api/gyms', () => {
    it('devrait créer une salle avec authentification', async () => {
      const res = await request(app)
        .post('/api/gyms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New CrossFit',
          city: 'Lyon',
          postal_code: '69001'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('New CrossFit');
      expect(res.body.data.user_id).toBe(userId);
    });

    it('devrait rejeter sans authentification', async () => {
      const res = await request(app)
        .post('/api/gyms')
        .send({ name: 'Test' });

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/gyms/:id', () => {
    it('devrait mettre à jour sa propre salle', async () => {
      const gym = await Gym.create({ name: 'Original' }, userId);

      const res = await request(app)
        .put(`/api/gyms/${gym.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('devrait rejeter modification salle autre user', async () => {
      const gym = await Gym.create({ name: 'Other' }, 'other-user');

      const res = await request(app)
        .put(`/api/gyms/${gym.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacked' });

      expect(res.status).toBe(403);
    });
  });
});
