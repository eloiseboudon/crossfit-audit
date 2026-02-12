// ============================================================================
// Seuils et benchmarks secteur CrossFit
// ============================================================================

// --- Types de brackets ---

export type MinBracket = ReadonlyArray<{ readonly min: number; readonly score: number }>;
export type MaxBracket = ReadonlyArray<{ readonly max: number; readonly score: number }>;
export type RangeBracket = ReadonlyArray<{ readonly min: number; readonly max: number; readonly score: number }>;

// --- Helpers de scoring ---

/** Retourne le score du premier bracket dont value >= min (brackets triés par min décroissant). */
export function scoreFromMinBrackets(value: number, brackets: MinBracket, fallback: number): number {
  for (const b of brackets) {
    if (value >= b.min) return b.score;
  }
  return fallback;
}

/** Retourne le score du premier bracket dont value <= max (brackets triés par max croissant). */
export function scoreFromMaxBrackets(value: number, brackets: MaxBracket, fallback: number): number {
  for (const b of brackets) {
    if (value <= b.max) return b.score;
  }
  return fallback;
}

/** Retourne le score du premier bracket dont min <= value <= max. */
export function scoreFromRangeBrackets(value: number, brackets: RangeBracket, fallback: number): number {
  for (const b of brackets) {
    if (value >= b.min && value <= b.max) return b.score;
  }
  return fallback;
}

// ============================================================================
// Financial Health Score — brackets par composante (/100)
// ============================================================================

// --- Rentabilite (40 pts) ---

export const HEALTH_EBITDA_BRACKETS: MinBracket = [
  { min: 25, score: 25 },
  { min: 20, score: 22 },
  { min: 15, score: 18 },
  { min: 10, score: 14 },
  { min: 5, score: 10 },
  { min: 0, score: 5 },
];
export const HEALTH_EBITDA_FALLBACK = 0;

export const HEALTH_MARGE_NETTE_BRACKETS: MinBracket = [
  { min: 15, score: 15 },
  { min: 10, score: 12 },
  { min: 5, score: 9 },
  { min: 0, score: 5 },
];
export const HEALTH_MARGE_NETTE_FALLBACK = 0;

// --- Tresorerie (30 pts) ---

export const HEALTH_JOURS_TRESORERIE_BRACKETS: MinBracket = [
  { min: 90, score: 20 },
  { min: 60, score: 16 },
  { min: 30, score: 12 },
  { min: 15, score: 7 },
];
export const HEALTH_JOURS_TRESORERIE_FALLBACK = 3;

export const HEALTH_LIQUIDITE_BRACKETS: MinBracket = [
  { min: 2, score: 10 },
  { min: 1.5, score: 8 },
  { min: 1, score: 6 },
  { min: 0.5, score: 3 },
];
export const HEALTH_LIQUIDITE_FALLBACK = 0;

// --- Structure (30 pts) ---

export const HEALTH_LOYER_BRACKETS: MaxBracket = [
  { max: 12, score: 10 },
  { max: 15, score: 8 },
  { max: 20, score: 6 },
  { max: 25, score: 3 },
];
export const HEALTH_LOYER_FALLBACK = 0;

export const HEALTH_MS_BRACKETS: RangeBracket = [
  { min: 30, max: 40, score: 10 },
  { min: 25, max: 45, score: 8 },
  { min: 20, max: 50, score: 5 },
];
export const HEALTH_MS_FALLBACK = 2;

export const HEALTH_ENDETTEMENT_BRACKETS: MaxBracket = [
  { max: 30, score: 10 },
  { max: 50, score: 8 },
  { max: 80, score: 5 },
  { max: 100, score: 3 },
];
export const HEALTH_ENDETTEMENT_FALLBACK = 0;

// ============================================================================
// Benchmarks secteur
// ============================================================================

export const BENCHMARK_MARGE_NETTE_SECTOR_PCT = 8;

export const PERCENTILE_RENTABILITE_BRACKETS: MinBracket = [
  { min: 15, score: 90 },
  { min: 10, score: 75 },
  { min: 5, score: 50 },
  { min: 0, score: 30 },
];
export const PERCENTILE_RENTABILITE_FALLBACK = 10;

// ============================================================================
// Sentinelles
// ============================================================================

export const MOIS_POINT_MORT_UNREACHABLE = 999;
