import { describe, expect, it } from 'vitest';
import { calculateScores, generateRecommendations } from '../../lib/calculations';
import type { CalculatedKPIs, Answer } from '../../lib/types';

const goodKpis: CalculatedKPIs = {
  ca_total_12m: 200000,
  ca_recurrent_12m: 180000,
  pourcent_recurrent: 85,
  arpm: 95,
  loyer_ratio: 12,
  ca_par_m2: 300,
  masse_salariale_ratio: 35,
  ebitda_estime: 50000,
  marge_ebitda: 20,
  churn_mensuel: 3,
  conversion_essai: 40,
  occupation_moyenne: 75,
  loyer_net_annuel: 24000
};

describe('calculateScores', () => {
  it('calcule les scores par pilier et le score global', () => {
    const { scores, globalScore } = calculateScores(goodKpis);

    expect(scores).toHaveLength(3);
    expect(scores.find((score) => score.code === 'finance')?.score).toBe(93);
    expect(scores.find((score) => score.code === 'clientele')?.score).toBe(90);
    expect(scores.find((score) => score.code === 'exploitation')?.score).toBe(84);
    expect(globalScore).toBe(89);
  });

  it('calcule des scores faibles pour des KPIs dégradés', () => {
    const badKpis: CalculatedKPIs = {
      ...goodKpis,
      marge_ebitda: -5,
      loyer_ratio: 30,
      masse_salariale_ratio: 60,
      ca_par_m2: 100,
      pourcent_recurrent: 50,
      arpm: 50,
      churn_mensuel: 15,
      occupation_moyenne: 30,
      conversion_essai: 10
    };

    const { scores, globalScore } = calculateScores(badKpis);

    expect(scores.find((s) => s.code === 'finance')?.score).toBeLessThan(30);
    expect(scores.find((s) => s.code === 'clientele')?.score).toBeLessThan(30);
    expect(scores.find((s) => s.code === 'exploitation')?.score).toBeLessThan(30);
    expect(globalScore).toBeLessThan(30);
  });

  it('retourne des scores entre 0 et 100', () => {
    const { scores, globalScore } = calculateScores(goodKpis);

    scores.forEach((s) => {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
    });
    expect(globalScore).toBeGreaterThanOrEqual(0);
    expect(globalScore).toBeLessThanOrEqual(100);
  });

  it('inclut les détails de chaque pilier', () => {
    const { scores } = calculateScores(goodKpis);

    const finance = scores.find((s) => s.code === 'finance');
    expect(finance?.details).toBeDefined();
    expect(finance?.details.marge_ebitda).toBe(20);

    const clientele = scores.find((s) => s.code === 'clientele');
    expect(clientele?.details).toBeDefined();
    expect(clientele?.details.arpm).toBe(95);

    const exploitation = scores.find((s) => s.code === 'exploitation');
    expect(exploitation?.details).toBeDefined();
    expect(exploitation?.details.occupation_moyenne).toBe(75);
  });
});

describe('generateRecommendations', () => {
  const emptyAnswers: Answer[] = [];

  it('génère des recommandations pour des KPIs dégradés', () => {
    const badKpis: CalculatedKPIs = {
      ...goodKpis,
      marge_ebitda: 10,
      loyer_ratio: 25,
      arpm: 60,
      churn_mensuel: 8,
      occupation_moyenne: 50,
      conversion_essai: 15,
      pourcent_recurrent: 60
    };

    const recs = generateRecommendations(badKpis, emptyAnswers);

    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(6);

    const recCodes = recs.map((r) => r.rec_code);
    expect(recCodes).toContain('improve_margins');
    expect(recCodes).toContain('optimize_rent');
    expect(recCodes).toContain('increase_arpm');
    expect(recCodes).toContain('reduce_churn');
  });

  it('retourne une recommandation de maintien si tout va bien', () => {
    const greatKpis: CalculatedKPIs = {
      ...goodKpis,
      marge_ebitda: 30,
      loyer_ratio: 10,
      arpm: 120,
      churn_mensuel: 1,
      occupation_moyenne: 90,
      conversion_essai: 70,
      pourcent_recurrent: 95
    };

    const recs = generateRecommendations(greatKpis, emptyAnswers);

    expect(recs).toHaveLength(1);
    expect(recs[0].rec_code).toBe('maintain_performance');
  });

  it('trie les recommandations par priorité', () => {
    const badKpis: CalculatedKPIs = {
      ...goodKpis,
      marge_ebitda: 5,
      occupation_moyenne: 40,
      conversion_essai: 10,
      pourcent_recurrent: 50
    };

    const recs = generateRecommendations(badKpis, emptyAnswers);

    const priorities = recs.map((r) => r.priority);
    const highIndex = priorities.indexOf('P1');
    const mediumIndex = priorities.lastIndexOf('P2');

    if (highIndex !== -1 && mediumIndex !== -1) {
      expect(highIndex).toBeLessThan(mediumIndex);
    }
  });

  it('limite à 6 recommandations maximum', () => {
    const terribleKpis: CalculatedKPIs = {
      ...goodKpis,
      marge_ebitda: 0,
      loyer_ratio: 30,
      arpm: 40,
      churn_mensuel: 15,
      occupation_moyenne: 30,
      conversion_essai: 10,
      pourcent_recurrent: 40
    };

    const recs = generateRecommendations(terribleKpis, emptyAnswers);

    expect(recs.length).toBeLessThanOrEqual(6);
  });
});
