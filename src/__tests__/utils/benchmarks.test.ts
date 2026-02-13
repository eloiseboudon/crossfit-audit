import { describe, expect, it } from 'vitest';
import {
  scoreFromMinBrackets,
  scoreFromMaxBrackets,
  scoreFromRangeBrackets,
  type MinBracket,
  type MaxBracket,
  type RangeBracket,
  HEALTH_EBITDA_BRACKETS, HEALTH_EBITDA_FALLBACK,
  HEALTH_MARGE_NETTE_BRACKETS, HEALTH_MARGE_NETTE_FALLBACK,
  HEALTH_JOURS_TRESORERIE_BRACKETS, HEALTH_JOURS_TRESORERIE_FALLBACK,
  HEALTH_LIQUIDITE_BRACKETS, HEALTH_LIQUIDITE_FALLBACK,
  HEALTH_LOYER_BRACKETS, HEALTH_LOYER_FALLBACK,
  HEALTH_MS_BRACKETS, HEALTH_MS_FALLBACK,
  HEALTH_ENDETTEMENT_BRACKETS, HEALTH_ENDETTEMENT_FALLBACK,
  PERCENTILE_RENTABILITE_BRACKETS, PERCENTILE_RENTABILITE_FALLBACK,
  BENCHMARK_MARGE_NETTE_SECTOR_PCT,
  MOIS_POINT_MORT_UNREACHABLE,
} from '../../lib/benchmarks';

// ===========================================================================
// scoreFromMinBrackets
// ===========================================================================
describe('scoreFromMinBrackets', () => {
  const brackets: MinBracket = [
    { min: 20, score: 100 },
    { min: 10, score: 50 },
    { min: 0, score: 10 },
  ];

  it('returns highest bracket score when value exceeds top min', () => {
    expect(scoreFromMinBrackets(25, brackets, 0)).toBe(100);
  });

  it('returns exact bracket score at boundary', () => {
    expect(scoreFromMinBrackets(20, brackets, 0)).toBe(100);
    expect(scoreFromMinBrackets(10, brackets, 0)).toBe(50);
    expect(scoreFromMinBrackets(0, brackets, 0)).toBe(10);
  });

  it('returns middle bracket for in-between values', () => {
    expect(scoreFromMinBrackets(15, brackets, 0)).toBe(50);
    expect(scoreFromMinBrackets(5, brackets, 0)).toBe(10);
  });

  it('returns fallback when below all brackets', () => {
    expect(scoreFromMinBrackets(-1, brackets, 0)).toBe(0);
    expect(scoreFromMinBrackets(-100, brackets, 42)).toBe(42);
  });
});

// ===========================================================================
// scoreFromMaxBrackets
// ===========================================================================
describe('scoreFromMaxBrackets', () => {
  const brackets: MaxBracket = [
    { max: 10, score: 100 },
    { max: 20, score: 50 },
    { max: 30, score: 10 },
  ];

  it('returns first bracket score when value is below lowest max', () => {
    expect(scoreFromMaxBrackets(5, brackets, 0)).toBe(100);
  });

  it('returns exact bracket score at boundary', () => {
    expect(scoreFromMaxBrackets(10, brackets, 0)).toBe(100);
    expect(scoreFromMaxBrackets(20, brackets, 0)).toBe(50);
    expect(scoreFromMaxBrackets(30, brackets, 0)).toBe(10);
  });

  it('returns middle bracket for in-between values', () => {
    expect(scoreFromMaxBrackets(15, brackets, 0)).toBe(50);
    expect(scoreFromMaxBrackets(25, brackets, 0)).toBe(10);
  });

  it('returns fallback when above all brackets', () => {
    expect(scoreFromMaxBrackets(31, brackets, 0)).toBe(0);
    expect(scoreFromMaxBrackets(999, brackets, 77)).toBe(77);
  });
});

// ===========================================================================
// scoreFromRangeBrackets
// ===========================================================================
describe('scoreFromRangeBrackets', () => {
  const brackets: RangeBracket = [
    { min: 30, max: 40, score: 100 },
    { min: 20, max: 50, score: 50 },
    { min: 10, max: 60, score: 10 },
  ];

  it('returns first matching bracket (narrowest range first)', () => {
    expect(scoreFromRangeBrackets(35, brackets, 0)).toBe(100);
  });

  it('returns exact bracket score at boundaries', () => {
    expect(scoreFromRangeBrackets(30, brackets, 0)).toBe(100);
    expect(scoreFromRangeBrackets(40, brackets, 0)).toBe(100);
  });

  it('falls through to wider bracket when outside narrow range', () => {
    expect(scoreFromRangeBrackets(25, brackets, 0)).toBe(50);
    expect(scoreFromRangeBrackets(45, brackets, 0)).toBe(50);
    expect(scoreFromRangeBrackets(55, brackets, 0)).toBe(10);
  });

  it('returns fallback when outside all ranges', () => {
    expect(scoreFromRangeBrackets(5, brackets, 0)).toBe(0);
    expect(scoreFromRangeBrackets(65, brackets, 99)).toBe(99);
  });
});

// ===========================================================================
// Bracket data integrity
// ===========================================================================
describe('bracket data integrity', () => {
  describe('MinBrackets are sorted by min descending', () => {
    const minBracketSets: [string, MinBracket][] = [
      ['HEALTH_EBITDA', HEALTH_EBITDA_BRACKETS],
      ['HEALTH_MARGE_NETTE', HEALTH_MARGE_NETTE_BRACKETS],
      ['HEALTH_JOURS_TRESORERIE', HEALTH_JOURS_TRESORERIE_BRACKETS],
      ['HEALTH_LIQUIDITE', HEALTH_LIQUIDITE_BRACKETS],
      ['PERCENTILE_RENTABILITE', PERCENTILE_RENTABILITE_BRACKETS],
    ];

    it.each(minBracketSets)('%s — min values are strictly descending', (_name, brackets) => {
      for (let i = 1; i < brackets.length; i++) {
        expect(brackets[i - 1].min).toBeGreaterThan(brackets[i].min);
      }
    });
  });

  describe('MaxBrackets are sorted by max ascending', () => {
    const maxBracketSets: [string, MaxBracket][] = [
      ['HEALTH_LOYER', HEALTH_LOYER_BRACKETS],
      ['HEALTH_ENDETTEMENT', HEALTH_ENDETTEMENT_BRACKETS],
    ];

    it.each(maxBracketSets)('%s — max values are strictly ascending', (_name, brackets) => {
      for (let i = 1; i < brackets.length; i++) {
        expect(brackets[i].max).toBeGreaterThan(brackets[i - 1].max);
      }
    });
  });

  describe('RangeBrackets have valid ranges', () => {
    it('HEALTH_MS — each bracket has min < max', () => {
      for (const b of HEALTH_MS_BRACKETS) {
        expect(b.max).toBeGreaterThan(b.min);
      }
    });
  });

  describe('all scores are non-negative', () => {
    const allBrackets = [
      ...HEALTH_EBITDA_BRACKETS,
      ...HEALTH_MARGE_NETTE_BRACKETS,
      ...HEALTH_JOURS_TRESORERIE_BRACKETS,
      ...HEALTH_LIQUIDITE_BRACKETS,
      ...HEALTH_LOYER_BRACKETS,
      ...HEALTH_MS_BRACKETS,
      ...HEALTH_ENDETTEMENT_BRACKETS,
      ...PERCENTILE_RENTABILITE_BRACKETS,
    ];

    it('no bracket has a negative score', () => {
      for (const b of allBrackets) {
        expect(b.score).toBeGreaterThanOrEqual(0);
      }
    });

    it('all fallbacks are non-negative', () => {
      const fallbacks = [
        HEALTH_EBITDA_FALLBACK, HEALTH_MARGE_NETTE_FALLBACK,
        HEALTH_JOURS_TRESORERIE_FALLBACK, HEALTH_LIQUIDITE_FALLBACK,
        HEALTH_LOYER_FALLBACK, HEALTH_MS_FALLBACK,
        HEALTH_ENDETTEMENT_FALLBACK, PERCENTILE_RENTABILITE_FALLBACK,
      ];
      for (const f of fallbacks) {
        expect(f).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

// ===========================================================================
// Health score brackets — max points per pillar
// ===========================================================================
describe('health score bracket point totals', () => {
  it('rentabilité brackets sum to max 40 pts', () => {
    const maxEbitda = HEALTH_EBITDA_BRACKETS[0].score;    // 25
    const maxMarge = HEALTH_MARGE_NETTE_BRACKETS[0].score; // 15
    expect(maxEbitda + maxMarge).toBe(40);
  });

  it('trésorerie brackets sum to max 30 pts', () => {
    const maxJours = HEALTH_JOURS_TRESORERIE_BRACKETS[0].score; // 20
    const maxLiq = HEALTH_LIQUIDITE_BRACKETS[0].score;           // 10
    expect(maxJours + maxLiq).toBe(30);
  });

  it('structure brackets sum to max 30 pts', () => {
    const maxLoyer = HEALTH_LOYER_BRACKETS[0].score;        // 10
    const maxMS = HEALTH_MS_BRACKETS[0].score;               // 10
    const maxEndet = HEALTH_ENDETTEMENT_BRACKETS[0].score;   // 10
    expect(maxLoyer + maxMS + maxEndet).toBe(30);
  });

  it('total max = 100 pts', () => {
    const maxTotal =
      HEALTH_EBITDA_BRACKETS[0].score +
      HEALTH_MARGE_NETTE_BRACKETS[0].score +
      HEALTH_JOURS_TRESORERIE_BRACKETS[0].score +
      HEALTH_LIQUIDITE_BRACKETS[0].score +
      HEALTH_LOYER_BRACKETS[0].score +
      HEALTH_MS_BRACKETS[0].score +
      HEALTH_ENDETTEMENT_BRACKETS[0].score;
    expect(maxTotal).toBe(100);
  });
});

// ===========================================================================
// Constants
// ===========================================================================
describe('benchmark constants', () => {
  it('BENCHMARK_MARGE_NETTE_SECTOR_PCT is 8%', () => {
    expect(BENCHMARK_MARGE_NETTE_SECTOR_PCT).toBe(8);
  });

  it('MOIS_POINT_MORT_UNREACHABLE is a high sentinel', () => {
    expect(MOIS_POINT_MORT_UNREACHABLE).toBeGreaterThanOrEqual(100);
  });
});
