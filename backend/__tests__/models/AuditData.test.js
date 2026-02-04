const { KPI, Score, Recommendation } = require('../../models/AuditData');
const Audit = require('../../models/Audit');
const Gym = require('../../models/Gym');
const { dbRun } = require('../../config/database');

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
  });

  describe('Recommendation', () => {
    it('devrait créer une recommandation et la retrouver', async () => {
      const rec = await Recommendation.create({
        audit_id: testAudit.id,
        rec_code: 'R1',
        title: 'Optimiser',
        priority: 'high'
      });

      expect(rec.title).toBe('Optimiser');

      const stored = await Recommendation.findById(rec.id);
      expect(stored.rec_code).toBe('R1');
    });

    it('devrait trier les recommandations par priorité et impact', async () => {
      await Recommendation.bulkCreate(testAudit.id, [
        { rec_code: 'R1', title: 'Low', priority: 'low', expected_impact_eur: 1000 },
        { rec_code: 'R2', title: 'Critical', priority: 'critical', expected_impact_eur: 500 },
        { rec_code: 'R3', title: 'High', priority: 'high', expected_impact_eur: 2000 }
      ]);

      const recs = await Recommendation.findByAuditId(testAudit.id);

      expect(recs[0].priority).toBe('critical');
      expect(recs[1].priority).toBe('high');
      expect(recs[2].priority).toBe('low');
    });

    it('devrait remplacer les recommandations via bulkCreate', async () => {
      await Recommendation.bulkCreate(testAudit.id, [
        { rec_code: 'R1', title: 'Old', priority: 'low' }
      ]);

      const results = await Recommendation.bulkCreate(testAudit.id, [
        { rec_code: 'R2', title: 'New', priority: 'high' }
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
        priority: 'medium'
      });

      await Recommendation.delete(rec.id);
      const found = await Recommendation.findById(rec.id);
      expect(found).toBeNull();
    });
  });
});
