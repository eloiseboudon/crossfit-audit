const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Gym = require('../../models/Gym');
const Audit = require('../../models/Audit');
const { Competitor, MarketZone, GymOffer } = require('../../models/Market');
const { dbRun } = require('../../config/database');
const { CURRENCY, PRICE_LEVEL } = require('../../constants');

describe('Market Controller', () => {
  let authToken;
  let testGym;
  let testAudit;

  beforeEach(async () => {
    await dbRun('DELETE FROM competitors');
    await dbRun('DELETE FROM market_zones');
    await dbRun('DELETE FROM gym_offers');
    await dbRun('DELETE FROM audits');
    await dbRun('DELETE FROM gyms');
    await dbRun('DELETE FROM users');

    const user = await User.create({
      email: 'market@test.com',
      password: 'password123',
      name: 'Market User'
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'market@test.com', password: 'password123' });

    authToken = loginRes.body.token;

    testGym = await Gym.create({ name: 'Market Gym' }, user.id);
    testAudit = await Audit.create({ gym_id: testGym.id, baseline_period: '2024-Q1' });
  });

  describe('Competitors routes', () => {
    it('devrait récupérer les concurrents pour une salle', async () => {
      await Competitor.create({ gym_id: testGym.id, name: 'Competitor 1', distance_km: 2 });

      const res = await request(app)
        .get('/api/competitors')
        .query({ gym_id: testGym.id });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('devrait créer un concurrent avec authentification', async () => {
      const res = await request(app)
        .post('/api/competitors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ gym_id: testGym.id, name: 'Competitor 2', distance_km: 1 });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Competitor 2');
    });

    it('devrait mettre à jour un concurrent', async () => {
      const competitor = await Competitor.create({ gym_id: testGym.id, name: 'Competitor 3' });

      const res = await request(app)
        .put(`/api/competitors/${competitor.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ city: 'Paris' });

      expect(res.status).toBe(200);
      expect(res.body.data.city).toBe('Paris');
    });

    it('devrait supprimer un concurrent', async () => {
      const competitor = await Competitor.create({ gym_id: testGym.id, name: 'Competitor 4' });

      const res = await request(app)
        .delete(`/api/competitors/${competitor.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Concurrent supprimé avec succès');
    });
  });

  describe('Market zones routes', () => {
    it('devrait lister les zones de marché', async () => {
      await MarketZone.create({
        name: 'Centre',
        price_level: PRICE_LEVEL.PREMIUM,
        avg_subscription_min: 80,
        avg_subscription_max: 120
      });

      const res = await request(app).get('/api/market-zones');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('devrait créer une zone de marché', async () => {
      const res = await request(app)
        .post('/api/market-zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Centre',
          price_level: PRICE_LEVEL.PREMIUM,
          avg_subscription_min: 80,
          avg_subscription_max: 120
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Centre');
    });

    it('devrait mettre à jour une zone de marché', async () => {
      const zone = await MarketZone.create({
        name: 'Centre',
        price_level: PRICE_LEVEL.PREMIUM,
        avg_subscription_min: 80,
        avg_subscription_max: 120
      });

      const res = await request(app)
        .put(`/api/market-zones/${zone.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Zone premium' });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe('Zone premium');
    });

    it('devrait supprimer une zone de marché', async () => {
      const zone = await MarketZone.create({
        name: 'Centre',
        price_level: PRICE_LEVEL.PREMIUM,
        avg_subscription_min: 80,
        avg_subscription_max: 120
      });

      const res = await request(app)
        .delete(`/api/market-zones/${zone.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Zone marché supprimée avec succès');
    });
  });

  describe('Gym offers routes', () => {
    it('devrait lister les offres par salle', async () => {
      await GymOffer.create({
        gym_id: testGym.id,
        audit_id: testAudit.id,
        offer_type: 'membership',
        offer_name: 'Unlimited',
        price: 150,
        currency: CURRENCY.EUR,
        duration_months: 12,
        commitment_months: 3
      });

      const res = await request(app)
        .get('/api/gym-offers')
        .query({ gym_id: testGym.id });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('devrait créer une offre commerciale', async () => {
      const res = await request(app)
        .post('/api/gym-offers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          gym_id: testGym.id,
          audit_id: testAudit.id,
          offer_type: 'membership',
          offer_name: 'Unlimited',
          price: 150,
          currency: CURRENCY.EUR,
          duration_months: 12,
          commitment_months: 3
        });

      expect(res.status).toBe(201);
      expect(res.body.data.offer_name).toBe('Unlimited');
    });

    it('devrait mettre à jour une offre commerciale', async () => {
      const offer = await GymOffer.create({
        gym_id: testGym.id,
        audit_id: testAudit.id,
        offer_type: 'membership',
        offer_name: 'Unlimited',
        price: 150,
        currency: CURRENCY.EUR,
        duration_months: 12,
        commitment_months: 3
      });

      const res = await request(app)
        .put(`/api/gym-offers/${offer.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ price: 160 });

      expect(res.status).toBe(200);
      expect(res.body.data.price).toBe(160);
    });

    it('devrait supprimer une offre commerciale', async () => {
      const offer = await GymOffer.create({
        gym_id: testGym.id,
        audit_id: testAudit.id,
        offer_type: 'membership',
        offer_name: 'Unlimited',
        price: 150,
        currency: 'EUR',
        duration_months: 12,
        commitment_months: 3
      });

      const res = await request(app)
        .delete(`/api/gym-offers/${offer.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Offre supprimée avec succès');
    });
  });
});
