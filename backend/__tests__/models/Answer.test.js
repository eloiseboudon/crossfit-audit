const Answer = require('../../models/Answer');
const Audit = require('../../models/Audit');
const Gym = require('../../models/Gym');
const { dbRun } = require('../../config/database');

describe('Answer Model', () => {
  let testGym;
  let testAudit;

  beforeEach(async () => {
    await dbRun('DELETE FROM answers');
    await dbRun('DELETE FROM audits');
    await dbRun('DELETE FROM gyms');

    testGym = await Gym.create({ name: 'Test Gym' });
    testAudit = await Audit.create({
      gym_id: testGym.id,
      baseline_period: '2024-Q1'
    });
  });

  it('devrait insérer puis mettre à jour une réponse', async () => {
    const created = await Answer.upsert({
      audit_id: testAudit.id,
      block_code: 'financials',
      question_code: 'q1',
      value: 10
    });

    expect(created.value).toBe(10);

    const updated = await Answer.upsert({
      audit_id: testAudit.id,
      block_code: 'financials',
      question_code: 'q1',
      value: 20
    });

    expect(updated.value).toBe(20);
  });

  it('devrait retrouver les réponses par audit et par bloc', async () => {
    await Answer.bulkUpsert(testAudit.id, [
      { block_code: 'financials', question_code: 'q1', value: 10 },
      { block_code: 'financials', question_code: 'q2', value: 20 },
      { block_code: 'operations', question_code: 'q1', value: 30 }
    ]);

    const allAnswers = await Answer.findByAuditId(testAudit.id);
    const blockAnswers = await Answer.findByAuditAndBlock(testAudit.id, 'financials');

    expect(allAnswers).toHaveLength(3);
    expect(blockAnswers).toHaveLength(2);
    expect(blockAnswers.map((answer) => answer.question_code)).toEqual(['q1', 'q2']);
  });

  it('devrait insérer en lot avec bulkUpsert', async () => {
    const results = await Answer.bulkUpsert(testAudit.id, [
      { block_code: 'people', question_code: 'q1', value: 5 },
      { block_code: 'people', question_code: 'q2', value: 8 }
    ]);

    expect(results).toHaveLength(2);
    expect(results[0].block_code).toBe('people');
  });

  it('devrait supprimer une réponse spécifique', async () => {
    await Answer.upsert({
      audit_id: testAudit.id,
      block_code: 'financials',
      question_code: 'q1',
      value: 10
    });

    await Answer.delete(testAudit.id, 'financials', 'q1');

    const found = await Answer.findOne(testAudit.id, 'financials', 'q1');
    expect(found).toBeNull();
  });

  it('devrait supprimer toutes les réponses d’un audit', async () => {
    await Answer.bulkUpsert(testAudit.id, [
      { block_code: 'financials', question_code: 'q1', value: 10 },
      { block_code: 'operations', question_code: 'q1', value: 20 }
    ]);

    await Answer.deleteByAudit(testAudit.id);

    const answers = await Answer.findByAuditId(testAudit.id);
    expect(answers).toHaveLength(0);
  });
});
