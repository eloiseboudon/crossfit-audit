/**
 * @module constants/scoringThresholds
 * @description Seuils de scoring et pondérations pour le calcul des scores par pilier.
 * Centralise les valeurs métier utilisées dans calculateScores et generateRecommendations.
 */

/**
 * Seuils de scoring par indicateur.
 * Chaque entrée est un tableau de { min, max, score } évalué dans l'ordre.
 * Pour les indicateurs "plus c'est mieux" : seuils décroissants.
 * Pour les indicateurs "moins c'est mieux" : seuils croissants.
 */

/** @type {{ min: number, score: number }[]} Marge EBITDA (%) - plus c'est mieux */
const MARGE_EBITDA = [
  { min: 25, score: 100 },
  { min: 20, score: 90 },
  { min: 15, score: 75 },
  { min: 10, score: 60 },
  { min: 5, score: 40 },
  { min: 0, score: 25 },
];
const MARGE_EBITDA_DEFAULT = 10;

/** @type {{ max: number, score: number }[]} Ratio loyer/CA (%) - moins c'est mieux */
const LOYER_RATIO = [
  { max: 12, score: 100 },
  { max: 15, score: 85 },
  { max: 18, score: 70 },
  { max: 22, score: 50 },
  { max: 25, score: 30 },
];
const LOYER_RATIO_DEFAULT = 10;

/** @type {{ min: number, max: number, score: number }[]} Masse salariale (%) - zone optimale */
const MASSE_SALARIALE = [
  { min: 30, max: 40, score: 100 },
  { min: 25, max: 45, score: 85 },
  { min: 20, max: 50, score: 70 },
  { min: 0, max: 55, score: 50 },
];
const MASSE_SALARIALE_DEFAULT = 25;

/** @type {{ min: number, score: number }[]} CA par m2 (EUR) - plus c'est mieux */
const CA_PAR_M2 = [
  { min: 400, score: 100 },
  { min: 300, score: 85 },
  { min: 250, score: 75 },
  { min: 200, score: 60 },
  { min: 150, score: 40 },
];
const CA_PAR_M2_DEFAULT = 25;

/** @type {{ min: number, score: number }[]} % CA récurrent - plus c'est mieux */
const RECURRENCE = [
  { min: 90, score: 100 },
  { min: 85, score: 90 },
  { min: 80, score: 80 },
  { min: 70, score: 65 },
  { min: 60, score: 45 },
];
const RECURRENCE_DEFAULT = 25;

/** @type {{ min: number, score: number }[]} ARPM (EUR) - plus c'est mieux */
const ARPM = [
  { min: 110, score: 100 },
  { min: 95, score: 90 },
  { min: 85, score: 80 },
  { min: 75, score: 65 },
  { min: 65, score: 50 },
];
const ARPM_DEFAULT = 30;

/** @type {{ max: number, score: number }[]} Churn mensuel (%) - moins c'est mieux */
const CHURN = [
  { max: 2, score: 100 },
  { max: 3, score: 90 },
  { max: 5, score: 75 },
  { max: 7, score: 55 },
  { max: 10, score: 35 },
];
const CHURN_DEFAULT = 15;

/** @type {{ min: number, score: number }[]} Occupation moyenne (%) - plus c'est mieux */
const OCCUPATION = [
  { min: 85, score: 100 },
  { min: 75, score: 90 },
  { min: 70, score: 80 },
  { min: 65, score: 70 },
  { min: 55, score: 55 },
  { min: 45, score: 40 },
];
const OCCUPATION_DEFAULT = 25;

/** @type {{ min: number, score: number }[]} Conversion essai (%) - plus c'est mieux */
const CONVERSION = [
  { min: 60, score: 100 },
  { min: 50, score: 90 },
  { min: 40, score: 75 },
  { min: 30, score: 55 },
  { min: 20, score: 35 },
];
const CONVERSION_DEFAULT = 20;

/** Pondérations internes des sous-scores par pilier */
const PILLAR_WEIGHTS = {
  finance: {
    rentabilite: 0.4,
    loyer: 0.2,
    masse_salariale: 0.2,
    ca_m2: 0.2,
  },
  clientele: {
    recurrence: 0.4,
    arpm: 0.35,
    churn: 0.25,
  },
  exploitation: {
    occupation: 0.6,
    conversion: 0.4,
  },
};

/** Pondérations globales des piliers pour le score final */
const GLOBAL_WEIGHTS = {
  finance: 0.3,
  clientele: 0.35,
  exploitation: 0.35,
};

/** Seuils déclencheurs pour les recommandations */
const RECOMMENDATION_TRIGGERS = {
  marge_ebitda: 15,
  loyer_ratio: 18,
  arpm: 80,
  churn_mensuel: 5,
  occupation_moyenne: 65,
  conversion_essai: 40,
  pourcent_recurrent: 80,
};

/** Cibles pour les descriptions de recommandations */
const RECOMMENDATION_TARGETS = {
  marge_ebitda: '15-20%',
  loyer_ratio: '< 15%',
  arpm: '85-100€',
  churn_mensuel: '< 3%',
  occupation_moyenne: '70-80%',
  conversion_essai: '> 50%',
  pourcent_recurrent: '> 85%',
};

module.exports = {
  MARGE_EBITDA,
  MARGE_EBITDA_DEFAULT,
  LOYER_RATIO,
  LOYER_RATIO_DEFAULT,
  MASSE_SALARIALE,
  MASSE_SALARIALE_DEFAULT,
  CA_PAR_M2,
  CA_PAR_M2_DEFAULT,
  RECURRENCE,
  RECURRENCE_DEFAULT,
  ARPM,
  ARPM_DEFAULT,
  CHURN,
  CHURN_DEFAULT,
  OCCUPATION,
  OCCUPATION_DEFAULT,
  CONVERSION,
  CONVERSION_DEFAULT,
  PILLAR_WEIGHTS,
  GLOBAL_WEIGHTS,
  RECOMMENDATION_TRIGGERS,
  RECOMMENDATION_TARGETS,
};
