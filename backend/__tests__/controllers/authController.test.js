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

    it('devrait rejeter si un champ requis manque', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email, mot de passe et nom sont requis');
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

    it('devrait rejeter un compte désactivé', async () => {
      const user = await User.create({
        email: 'inactive@test.com',
        password: 'password123',
        name: 'Inactive User'
      });

      await User.delete(user.id);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Votre compte a été désactivé');
    });
  });

  describe('GET /api/auth/me', () => {
    it('devrait retourner le profil utilisateur', async () => {
      await User.create({
        email: 'profile@test.com',
        password: 'password123',
        name: 'Profile User'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'profile@test.com', password: 'password123' });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('profile@test.com');
    });

    it('devrait retourner 404 si utilisateur introuvable', async () => {
      const user = await User.create({
        email: 'removed@test.com',
        password: 'password123',
        name: 'Removed User'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'removed@test.com', password: 'password123' });

      await dbRun('DELETE FROM users WHERE id = ?', [user.id]);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Votre compte n\'existe plus');
    });
  });

  describe('PUT /api/auth/password', () => {
    it('devrait mettre à jour le mot de passe', async () => {
      await User.create({
        email: 'password@test.com',
        password: 'password123',
        name: 'Password User'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'password@test.com', password: 'password123' });

      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({ currentPassword: 'password123', newPassword: 'newpass456' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Mot de passe mis à jour avec succès');
    });

    it('devrait rejeter si mot de passe actuel incorrect', async () => {
      await User.create({
        email: 'wrongpass@test.com',
        password: 'password123',
        name: 'Wrong Pass'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrongpass@test.com', password: 'password123' });

      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({ currentPassword: 'badpass', newPassword: 'newpass456' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Le mot de passe actuel est incorrect');
    });

    it('devrait rejeter un nouveau mot de passe trop court', async () => {
      await User.create({
        email: 'shortpass@test.com',
        password: 'password123',
        name: 'Short Pass'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'shortpass@test.com', password: 'password123' });

      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .send({ currentPassword: 'password123', newPassword: '123' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Le nouveau mot de passe doit contenir au moins 6 caractères');
    });
  });
});
