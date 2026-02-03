const request = require('supertest');
const app = require('../../server'); // Export app depuis server.js
const User = require('../../models/User');
const { dbRun } = require('../../config/database');

describe('Auth Controller', () => {
  beforeEach(async () => {
    await dbRun('DELETE FROM users');
  });

  describe('POST /api/auth/register', () => {
    it('devrait créer un utilisateur et retourner un token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.password).toBeUndefined(); // Pas de mot de passe dans la réponse
    });

    it('devrait rejeter si email déjà utilisé', async () => {
      await User.create({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'newpass',
          name: 'New User'
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Email déjà utilisé');
    });

    it('devrait valider le mot de passe (min 6 caractères)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          name: 'Test'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Mot de passe trop court');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        email: 'login@test.com',
        password: 'password123',
        name: 'Login Test'
      });
    });

    it('devrait authentifier avec bonnes credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('devrait rejeter avec mauvais mot de passe', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
    });

    it('devrait rejeter email inexistant', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notfound@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
    });
  });
});
