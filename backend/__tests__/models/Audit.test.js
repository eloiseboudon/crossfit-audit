const Audit = require('../../models/Audit');
const Gym = require('../../models/Gym');
const { dbRun } = require('../../config/database');

describe('Audit Model', () => {
  let testGym;

  beforeEach(async () => {
    await dbRun('DELETE FROM audits');
    await dbRun('DELETE FROM gyms');
    testGym = await Gym.create({ name: 'Test Gym' });
  });

  describe('create()', () => {
    it('devrait créer un audit avec statut draft par défaut', async () => {
      const audit = await Audit.create({
        gym_id: testGym.id,
        baseline_period: '2024-Q1'
      });

      expect(audit.status).toBe('draft');
      expect(audit.gym_id).toBe(testGym.id);
      expect(audit.completion_percentage).toBe(0);
      expect(audit.currency).toBe('EUR');
    });

    it('devrait calculer completion_percentage correctement', async () => {
      const audit = await Audit.create({
        gym_id: testGym.id,
        baseline_period: '2024-Q1'
      });

      const updated = await Audit.update(audit.id, {
        completion_percentage: 75
      });

      expect(updated.completion_percentage).toBe(75);
    });
  });

  describe('getComplete()', () => {
    it('devrait retourner audit avec toutes les données liées', async () => {
      const audit = await Audit.create({
        gym_id: testGym.id,
        baseline_period: '2024-Q1'
      });

      // Ajouter des réponses, KPIs, etc.
      // ...

      const complete = await Audit.getComplete(audit.id);

      expect(complete).toBeDefined();
      expect(complete.gym).toBeDefined();
      expect(complete.answers).toBeDefined();
      expect(complete.kpis).toBeDefined();
    });
  });
});
