import { describe, expect, it } from 'vitest';
import { calculateScores } from '../../lib/calculations';
import type { CalculatedKPIs } from '../../lib/types';

describe('calculateScores', () => {
  it('calcule les scores par pilier et le score global', () => {
    const kpis: CalculatedKPIs = {
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

    const { scores, globalScore } = calculateScores(kpis);

    expect(scores).toHaveLength(3);
    expect(scores.find((score) => score.code === 'finance')?.score).toBe(93);
    expect(scores.find((score) => score.code === 'clientele')?.score).toBe(90);
    expect(scores.find((score) => score.code === 'exploitation')?.score).toBe(84);
    expect(globalScore).toBe(89);
  });
});
