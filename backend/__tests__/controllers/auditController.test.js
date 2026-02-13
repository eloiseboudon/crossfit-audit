const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Gym = require('../../models/Gym');
const Audit = require('../../models/Audit');
const { dbRun } = require('../../config/database');
const { ROLES, AUDIT_STATUS, RECOMMENDATION_PRIORITY, EFFORT_LEVEL, CONFIDENCE_LEVEL } = require('../../constants');

describe('Audit Controller', () => {
  let authToken;
  let userId;
  let gymId;

  beforeEach(async () => {
    await dbRun('DELETE FROM recommendations');
    await dbRun('DELETE FROM scores');
    await dbRun('DELETE FROM kpis');
    await dbRun('DELETE FROM answers');
    await dbRun('DELETE FROM audits');
    await dbRun('DELETE FROM gym_user_access');
    await dbRun('DELETE FROM gyms');
    await dbRun('DELETE FROM users');

    const user = await User.create({
      email: 'audit@test.com',
      password: 'password123',
      name: 'Audit Tester',
    });
    userId = user.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'audit@test.com', password: 'password123' });
    authToken = loginRes.body.token;

    const gym = await Gym.create({ name: 'Test Box' }, userId);
    gymId = gym.id;
  });

  // =========================================================================
  // GET /api/audits
  // =========================================================================
  describe('GET /api/audits', () => {
    it('devrait retourner la liste des audits', async () => {
      await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .get('/api/audits')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it('devrait filtrer par gym_id', async () => {
      await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .get(`/api/audits?gym_id=${gymId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((a) => a.gym_id === gymId)).toBe(true);
    });

    it('devrait fonctionner sans authentification', async () => {
      await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app).get('/api/audits');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // GET /api/audits/:id
  // =========================================================================
  describe('GET /api/audits/:id', () => {
    it('devrait retourner un audit existant', async () => {
      const audit = await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .get(`/api/audits/${audit.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(audit.id);
    });

    it('devrait retourner 404 si audit inexistant', async () => {
      const res = await request(app)
        .get('/api/audits/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  // =========================================================================
  // GET /api/audits/:id/complete
  // =========================================================================
  describe('GET /api/audits/:id/complete', () => {
    it('devrait retourner un audit complet', async () => {
      const audit = await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .get(`/api/audits/${audit.id}/complete`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  // =========================================================================
  // POST /api/audits
  // =========================================================================
  describe('POST /api/audits', () => {
    it('devrait créer un audit avec gym_id', async () => {
      const res = await request(app)
        .post('/api/audits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ gym_id: gymId });

      expect(res.status).toBe(201);
      expect(res.body.data.gym_id).toBe(gymId);
      expect(res.body.data.status).toBe(AUDIT_STATUS.DRAFT);
    });

    it('devrait retourner 400 sans gym_id', async () => {
      const res = await request(app)
        .post('/api/audits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('devrait créer un audit sans authentification', async () => {
      const res = await request(app)
        .post('/api/audits')
        .send({ gym_id: gymId });

      expect(res.status).toBe(201);
      expect(res.body.data.gym_id).toBe(gymId);
    });
  });

  // =========================================================================
  // PUT /api/audits/:id
  // =========================================================================
  describe('PUT /api/audits/:id', () => {
    it('devrait mettre à jour un audit', async () => {
      const audit = await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .put(`/api/audits/${audit.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: AUDIT_STATUS.IN_PROGRESS });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(AUDIT_STATUS.IN_PROGRESS);
    });

    it('devrait retourner 404 si audit inexistant', async () => {
      const res = await request(app)
        .put('/api/audits/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: AUDIT_STATUS.IN_PROGRESS });

      expect(res.status).toBe(404);
    });
  });

  // =========================================================================
  // DELETE /api/audits/:id
  // =========================================================================
  describe('DELETE /api/audits/:id', () => {
    it('devrait supprimer un audit', async () => {
      const audit = await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .delete(`/api/audits/${audit.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // =========================================================================
  // POST /api/audits/:id/answers
  // =========================================================================
  describe('POST /api/audits/:id/answers', () => {
    it('devrait enregistrer des réponses', async () => {
      const audit = await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .post(`/api/audits/${audit.id}/answers`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          answers: [
            { block_code: 'identite_legale', question_code: 'raison_sociale', value: 'Test Box' },
            { block_code: 'identite_legale', question_code: 'annee_ouverture', value: '2020' },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('devrait retourner 400 si answers n\'est pas un tableau', async () => {
      const audit = await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .post(`/api/audits/${audit.id}/answers`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ answers: 'not-an-array' });

      expect(res.status).toBe(400);
    });
  });

  // =========================================================================
  // GET /api/audits/:id/answers
  // =========================================================================
  describe('GET /api/audits/:id/answers', () => {
    it('devrait retourner les réponses d\'un audit', async () => {
      const audit = await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .get(`/api/audits/${audit.id}/answers`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // =========================================================================
  // POST /api/audits/:id/kpis
  // =========================================================================
  describe('POST /api/audits/:id/kpis', () => {
    it('devrait enregistrer des KPIs', async () => {
      const audit = await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .post(`/api/audits/${audit.id}/kpis`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          kpis: [
            { kpi_code: 'ca_total', value: 240000, unit: 'EUR' },
            { kpi_code: 'marge_nette_pct', value: 12.5, unit: '%' },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('devrait retourner 400 si kpis n\'est pas un tableau', async () => {
      const audit = await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .post(`/api/audits/${audit.id}/kpis`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ kpis: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  // =========================================================================
  // POST /api/audits/:id/scores
  // =========================================================================
  describe('POST /api/audits/:id/scores', () => {
    it('devrait enregistrer des scores', async () => {
      const audit = await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .post(`/api/audits/${audit.id}/scores`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scores: [
            { pillar_code: 'finance', pillar_name: 'Finance', score: 75, weight: 0.3 },
            { pillar_code: 'commercial', pillar_name: 'Commercial', score: 68, weight: 0.35 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });
  });

  // =========================================================================
  // GET /api/audits/:id/global-score
  // =========================================================================
  describe('GET /api/audits/:id/global-score', () => {
    it('devrait retourner 404 si aucun score calculé', async () => {
      const audit = await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .get(`/api/audits/${audit.id}/global-score`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('devrait retourner le score global après enregistrement', async () => {
      const audit = await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      // Enregistrer des scores
      await request(app)
        .post(`/api/audits/${audit.id}/scores`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scores: [
            { pillar_code: 'finance', pillar_name: 'Finance', score: 80, weight: 0.3 },
            { pillar_code: 'commercial', pillar_name: 'Commercial', score: 70, weight: 0.35 },
            { pillar_code: 'organisation', pillar_name: 'Organisation', score: 60, weight: 0.35 },
          ],
        });

      const res = await request(app)
        .get(`/api/audits/${audit.id}/global-score`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.global_score).toBeDefined();
      expect(res.body.data.pillars.length).toBe(3);
    });
  });

  // =========================================================================
  // POST /api/audits/:id/recommendations
  // =========================================================================
  describe('POST /api/audits/:id/recommendations', () => {
    it('devrait enregistrer des recommandations', async () => {
      const audit = await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .post(`/api/audits/${audit.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recommendations: [
            { rec_code: 'R1', title: 'Optimiser les tarifs', priority: RECOMMENDATION_PRIORITY.HIGH, effort_level: EFFORT_LEVEL.MEDIUM, confidence: CONFIDENCE_LEVEL.HIGH },
            { rec_code: 'R2', title: 'Réduire le churn', priority: RECOMMENDATION_PRIORITY.MEDIUM, effort_level: EFFORT_LEVEL.EASY, confidence: CONFIDENCE_LEVEL.MEDIUM },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });
  });

  // =========================================================================
  // GET /api/audits/:id/recommendations
  // =========================================================================
  describe('GET /api/audits/:id/recommendations', () => {
    it('devrait retourner les recommandations', async () => {
      const audit = await Audit.create({ gym_id: gymId, status: AUDIT_STATUS.DRAFT });

      const res = await request(app)
        .get(`/api/audits/${audit.id}/recommendations`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
