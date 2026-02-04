const { Competitor, MarketZone, GymOffer } = require('../../models/Market');
const Audit = require('../../models/Audit');
const Gym = require('../../models/Gym');
const { dbRun } = require('../../config/database');

describe('Market Models', () => {
  let testGym;
  let testAudit;

  beforeEach(async () => {
    await dbRun('DELETE FROM competitors');
    await dbRun('DELETE FROM market_zones');
    await dbRun('DELETE FROM gym_offers');
    await dbRun('DELETE FROM audits');
    await dbRun('DELETE FROM gyms');

    testGym = await Gym.create({ name: 'Test Gym' });
    testAudit = await Audit.create({
      gym_id: testGym.id,
      baseline_period: '2024-Q1'
    });
  });

  describe('Competitor', () => {
    it('devrait créer, mettre à jour et désactiver un concurrent', async () => {
      const competitor = await Competitor.create({
        gym_id: testGym.id,
        name: 'Competitor One',
        distance_km: 2
      });

      expect(competitor.name).toBe('Competitor One');

      const updated = await Competitor.update(competitor.id, { city: 'Paris' });
      expect(updated.city).toBe('Paris');

      await Competitor.delete(competitor.id);
      const stored = await Competitor.findById(competitor.id);
      expect(stored.is_active).toBe(0);
    });

    it('devrait lister les concurrents actifs par salle', async () => {
      await Competitor.create({
        gym_id: testGym.id,
        name: 'Competitor One',
        distance_km: 1
      });
      const competitor = await Competitor.create({
        gym_id: testGym.id,
        name: 'Competitor Two',
        distance_km: 2
      });
      await Competitor.delete(competitor.id);

      const competitors = await Competitor.findByGymId(testGym.id);
      expect(competitors).toHaveLength(1);
    });
  });

  describe('MarketZone', () => {
    it('devrait créer, mettre à jour et désactiver une zone', async () => {
      const zone = await MarketZone.create({
        name: 'Centre',
        description: 'Zone centrale',
        price_level: 'premium',
        avg_subscription_min: 80,
        avg_subscription_max: 120
      });

      expect(zone.name).toBe('Centre');

      const updated = await MarketZone.update(zone.id, { description: 'Zone premium' });
      expect(updated.description).toBe('Zone premium');

      await MarketZone.delete(zone.id);
      const stored = await MarketZone.findById(zone.id);
      expect(stored.is_active).toBe(0);
    });

    it('devrait lister les zones actives', async () => {
      await MarketZone.create({
        name: 'Centre',
        price_level: 'premium',
        avg_subscription_min: 80,
        avg_subscription_max: 120
      });

      const zones = await MarketZone.findAll();
      expect(zones.length).toBeGreaterThan(0);
    });
  });

  describe('GymOffer', () => {
    it('devrait créer, mettre à jour et désactiver une offre', async () => {
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

      expect(offer.offer_name).toBe('Unlimited');

      const updated = await GymOffer.update(offer.id, { price: 160 });
      expect(updated.price).toBe(160);

      await GymOffer.delete(offer.id);
      const stored = await GymOffer.findById(offer.id);
      expect(stored.is_active).toBe(0);
    });

    it('devrait lister les offres par salle et audit', async () => {
      await GymOffer.create({
        gym_id: testGym.id,
        audit_id: testAudit.id,
        offer_type: 'membership',
        offer_name: 'Unlimited',
        price: 150,
        currency: 'EUR',
        duration_months: 12,
        commitment_months: 3
      });

      const byGym = await GymOffer.findByGymId(testGym.id);
      const byAudit = await GymOffer.findByAuditId(testAudit.id);

      expect(byGym).toHaveLength(1);
      expect(byAudit).toHaveLength(1);
    });
  });
});
