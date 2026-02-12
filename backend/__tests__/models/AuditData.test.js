const { KPI, Score, Recommendation } = require('../../models/AuditData');
const Audit = require('../../models/Audit');
const Gym = require('../../models/Gym');
const { dbRun } = require('../../config/database');
const {
  CONFIDENCE_LEVEL,
  EFFORT_LEVEL,
  RECOMMENDATION_PRIORITY
} = require('../../constants');

describe('Audit Data Models', () => {
  let testGym;
  let testAudit;

  beforeEach(async () => {
    await dbRun('DELETE FROM recommendations');
    await dbRun('DELETE FROM scores');
    await dbRun('DELETE FROM kpis');
    await dbRun('DELETE FROM audits');
    await dbRun('DELETE FROM gyms');

    testGym = await Gym.create({ name: 'Test Gym' });
    testAudit = await Audit.create({
      gym_id: testGym.id,
      baseline_period: '2024-Q1'
    });
  });

  describe('KPI', () => {
    it('devrait créer puis mettre à jour un KPI', async () => {
      const created = await KPI.upsert({
        audit_id: testAudit.id,
        kpi_code: 'revenue',
        value: 100,
        unit: 'EUR'
      });

      expect(created.value).toBe(100);

      const updated = await KPI.upsert({
        audit_id: testAudit.id,
        kpi_code: 'revenue',
        value: 120,
        unit: 'EUR'
      });

      expect(updated.value).toBe(120);
    });

    it('devrait insérer des KPIs en lot', async () => {
      const results = await KPI.bulkUpsert(testAudit.id, [
        { kpi_code: 'kpi1', value: 10 },
        { kpi_code: 'kpi2', value: 20 }
      ]);

      expect(results).toHaveLength(2);
    });

    it('devrait supprimer les KPIs par audit', async () => {
      await KPI.bulkUpsert(testAudit.id, [
        { kpi_code: 'kpi1', value: 10 },
        { kpi_code: 'kpi2', value: 20 }
      ]);

      await KPI.deleteByAudit(testAudit.id);

      const results = await KPI.findByAuditId(testAudit.id);
      expect(results).toHaveLength(0);
    });
  });

  describe('Score', () => {
    it('devrait créer puis mettre à jour un score', async () => {
      const created = await Score.upsert({
        audit_id: testAudit.id,
        pillar_code: 'growth',
        pillar_name: 'Growth',
        score: 80,
        weight: 1
      });

      expect(created.score).toBe(80);

      const updated = await Score.upsert({
        audit_id: testAudit.id,
        pillar_code: 'growth',
        pillar_name: 'Growth',
        score: 90,
        weight: 1
      });

      expect(updated.score).toBe(90);
    });

    it('devrait calculer le score global pondéré', async () => {
      await Score.bulkUpsert(testAudit.id, [
        { pillar_code: 'finance', pillar_name: 'Finance', score: 80, weight: 2 },
        { pillar_code: 'ops', pillar_name: 'Ops', score: 60, weight: 1 }
      ]);

      const global = await Score.getGlobalScore(testAudit.id);

      expect(global).not.toBeNull();
      expect(global.global_score).toBeCloseTo((80 * 2 + 60 * 1) / 3, 2);
      expect(global.pillars).toHaveLength(2);
    });

    it('devrait retourner null si aucun score', async () => {
      const global = await Score.getGlobalScore(testAudit.id);
      expect(global).toBeNull();
    });

    it('devrait sérialiser details objet en JSON string', async () => {
      const details = { marge_ebitda: 0.15, loyer_ratio: 0.12 };
      const created = await Score.upsert({
        audit_id: testAudit.id,
        pillar_code: 'finance',
        pillar_name: 'Finance',
        score: 75,
        weight: 0.3,
        details
      });

      expect(created).not.toBeNull();
      expect(created.score).toBe(75);
      const parsed = JSON.parse(created.details);
      expect(parsed.marge_ebitda).toBe(0.15);
      expect(parsed.loyer_ratio).toBe(0.12);
    });

    it('devrait accepter details null ou undefined', async () => {
      const withNull = await Score.upsert({
        audit_id: testAudit.id,
        pillar_code: 'p1',
        pillar_name: 'Pillar 1',
        score: 60,
        weight: 1,
        details: null
      });
      expect(withNull.details).toBeNull();

      const withUndefined = await Score.upsert({
        audit_id: testAudit.id,
        pillar_code: 'p2',
        pillar_name: 'Pillar 2',
        score: 70,
        weight: 1
      });
      expect(withUndefined.details).toBeNull();
    });

    it('devrait accepter details string directement', async () => {
      const created = await Score.upsert({
        audit_id: testAudit.id,
        pillar_code: 'finance',
        pillar_name: 'Finance',
        score: 80,
        weight: 0.3,
        details: '{"already":"serialized"}'
      });

      expect(JSON.parse(created.details)).toEqual({ already: 'serialized' });
    });

    it('devrait bulk upsert avec details objet sans erreur', async () => {
      const results = await Score.bulkUpsert(testAudit.id, [
        {
          pillar_code: 'finance',
          pillar_name: 'Finance',
          score: 80,
          weight: 0.3,
          details: { marge_ebitda: 0.2, ca_par_m2: 150 }
        },
        {
          pillar_code: 'clientele',
          pillar_name: 'Commercial & rétention',
          score: 65,
          weight: 0.35,
          details: { churn_mensuel: 0.05, arpm: 55 }
        },
        {
          pillar_code: 'exploitation',
          pillar_name: 'Organisation & pilotage',
          score: 70,
          weight: 0.35,
          details: { occupation_moyenne: 0.6 }
        }
      ]);

      expect(results).toHaveLength(3);
      results.forEach(r => {
        expect(r).not.toBeNull();
        const parsed = JSON.parse(r.details);
        expect(typeof parsed).toBe('object');
      });
    });
  });

  describe('Recommendation', () => {
    it('devrait créer une recommandation et la retrouver', async () => {
      const rec = await Recommendation.create({
        audit_id: testAudit.id,
        rec_code: 'R1',
        title: 'Optimiser',
        priority: RECOMMENDATION_PRIORITY.HIGH,
        effort_level: EFFORT_LEVEL.MEDIUM,
        confidence: CONFIDENCE_LEVEL.HIGH
      });

      expect(rec.title).toBe('Optimiser');

      const stored = await Recommendation.findById(rec.id);
      expect(stored.rec_code).toBe('R1');
    });

    it('devrait trier les recommandations par priorité et impact', async () => {
      await Recommendation.bulkCreate(testAudit.id, [
        { rec_code: 'R1', title: 'Low', priority: RECOMMENDATION_PRIORITY.LOW, expected_impact_eur: 1000, effort_level: EFFORT_LEVEL.EASY, confidence: CONFIDENCE_LEVEL.MEDIUM },
        { rec_code: 'R2', title: 'High', priority: RECOMMENDATION_PRIORITY.HIGH, expected_impact_eur: 500, effort_level: EFFORT_LEVEL.HARD, confidence: CONFIDENCE_LEVEL.HIGH },
        { rec_code: 'R3', title: 'Medium', priority: RECOMMENDATION_PRIORITY.MEDIUM, expected_impact_eur: 2000, effort_level: EFFORT_LEVEL.MEDIUM, confidence: CONFIDENCE_LEVEL.HIGH }
      ]);

      const recs = await Recommendation.findByAuditId(testAudit.id);

      expect(recs[0].priority).toBe(RECOMMENDATION_PRIORITY.HIGH);
      expect(recs[1].priority).toBe(RECOMMENDATION_PRIORITY.MEDIUM);
      expect(recs[2].priority).toBe(RECOMMENDATION_PRIORITY.LOW);
    });

    it('devrait remplacer les recommandations via bulkCreate', async () => {
      await Recommendation.bulkCreate(testAudit.id, [
        {
          rec_code: 'R1',
          title: 'Old',
          priority: RECOMMENDATION_PRIORITY.LOW,
          effort_level: EFFORT_LEVEL.EASY,
          confidence: CONFIDENCE_LEVEL.MEDIUM
        }
      ]);

      const results = await Recommendation.bulkCreate(testAudit.id, [
        {
          rec_code: 'R2',
          title: 'New',
          priority: RECOMMENDATION_PRIORITY.HIGH,
          effort_level: EFFORT_LEVEL.MEDIUM,
          confidence: CONFIDENCE_LEVEL.HIGH
        }
      ]);

      expect(results).toHaveLength(1);
      const recs = await Recommendation.findByAuditId(testAudit.id);
      expect(recs[0].rec_code).toBe('R2');
    });

    it('devrait supprimer une recommandation', async () => {
      const rec = await Recommendation.create({
        audit_id: testAudit.id,
        rec_code: 'R3',
        title: 'Delete',
        priority: RECOMMENDATION_PRIORITY.MEDIUM,
        effort_level: EFFORT_LEVEL.MEDIUM,
        confidence: CONFIDENCE_LEVEL.MEDIUM
      });

      await Recommendation.delete(rec.id);
      const found = await Recommendation.findById(rec.id);
      expect(found).toBeNull();
    });
  });
});
