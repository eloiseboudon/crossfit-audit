/**
 * @module utils/calculations
 * @description Fonctions de calcul des KPIs, scores par pilier et recommandations
 * pour les audits CrossFit. Contient la logique métier de scoring.
 */

const { extractAllData } = require('./extractData');
const {
  CONFIDENCE_LEVEL,
  EFFORT_LEVEL,
  RECOMMENDATION_PRIORITY
} = require('../constants');
const {
  MARGE_EBITDA, MARGE_EBITDA_DEFAULT,
  LOYER_RATIO, LOYER_RATIO_DEFAULT,
  MASSE_SALARIALE, MASSE_SALARIALE_DEFAULT,
  CA_PAR_M2, CA_PAR_M2_DEFAULT,
  RECURRENCE, RECURRENCE_DEFAULT,
  ARPM, ARPM_DEFAULT,
  CHURN, CHURN_DEFAULT,
  OCCUPATION, OCCUPATION_DEFAULT,
  CONVERSION, CONVERSION_DEFAULT,
  PILLAR_WEIGHTS,
  GLOBAL_WEIGHTS,
  RECOMMENDATION_TRIGGERS,
} = require('../constants/scoringThresholds');

/**
 * Calcule les KPIs à partir des réponses d'un audit.
 * Extrait les données financières, membres et opérationnelles puis les agrège en indicateurs clés.
 *
 * @param {object[]} answers - Tableau des réponses d'audit (block_code, question_code, value).
 * @returns {object} KPIs calculés incluant CA, ARPM, ratios, EBITDA, churn, conversion, occupation.
 */
function calculateKPIs(answers) {
  const data = extractAllData(answers);

  return {
    ca_total_12m: data.finance.revenus.ca_total,
    ca_recurrent_12m: data.finance.revenus.ca_recurrent,
    pourcent_recurrent: data.finance.revenus.pourcent_recurrent,
    arpm: data.membres.arpm,
    loyer_ratio: data.finance.ratios.loyer_ca_ratio,
    ca_par_m2: data.operations.ca_par_m2,
    masse_salariale_ratio: data.finance.ratios.ms_ca_ratio,
    ebitda_estime: data.finance.resultat.ebitda,
    marge_ebitda: data.finance.resultat.marge_ebitda,
    churn_mensuel: data.operations.taux_churn_pct,
    conversion_essai: data.operations.taux_conversion_pct,
    occupation_moyenne: data.operations.taux_occupation_global_pct,
    loyer_net_annuel: data.finance.charges.loyer_annuel_total
  };
}

/**
 * Restreint une valeur numérique entre un minimum et un maximum.
 *
 * @param {number} value - Valeur à contraindre.
 * @param {number} min - Borne inférieure.
 * @param {number} max - Borne supérieure.
 * @returns {number} Valeur contrainte dans l'intervalle [min, max].
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Évalue un score à partir de seuils "plus c'est mieux" (min décroissants).
 *
 * @param {number} value - Valeur à évaluer.
 * @param {{ min: number, score: number }[]} thresholds - Seuils triés par min décroissant.
 * @param {number} defaultScore - Score par défaut si aucun seuil ne correspond.
 * @returns {number} Score correspondant.
 */
function scoreHigherIsBetter(value, thresholds, defaultScore) {
  for (const t of thresholds) {
    if (value >= t.min) return t.score;
  }
  return defaultScore;
}

/**
 * Évalue un score à partir de seuils "moins c'est mieux" (max croissants).
 *
 * @param {number} value - Valeur à évaluer.
 * @param {{ max: number, score: number }[]} thresholds - Seuils triés par max croissant.
 * @param {number} defaultScore - Score par défaut si aucun seuil ne correspond.
 * @returns {number} Score correspondant.
 */
function scoreLowerIsBetter(value, thresholds, defaultScore) {
  for (const t of thresholds) {
    if (value <= t.max) return t.score;
  }
  return defaultScore;
}

/**
 * Évalue un score à partir de seuils à zone optimale (min/max).
 *
 * @param {number} value - Valeur à évaluer.
 * @param {{ min: number, max: number, score: number }[]} thresholds - Seuils de zone.
 * @param {number} defaultScore - Score par défaut.
 * @returns {number} Score correspondant.
 */
function scoreInRange(value, thresholds, defaultScore) {
  for (const t of thresholds) {
    if (value >= t.min && value <= t.max) return t.score;
  }
  return defaultScore;
}

/**
 * Calcule les scores par pilier (finance, clientèle, exploitation) et le score global.
 * Chaque pilier est pondéré et noté de 0 à 100 selon des seuils métier.
 *
 * @param {object} kpis - KPIs calculés (marge_ebitda, loyer_ratio, arpm, churn, etc.).
 * @returns {{ scores: object[], globalScore: number }} Scores par pilier avec détails et score global pondéré.
 */
function calculateScores(kpis) {
  const scores = [];

  // --- Finance ---
  const score_rentabilite = scoreHigherIsBetter(kpis.marge_ebitda, MARGE_EBITDA, MARGE_EBITDA_DEFAULT);
  const score_loyer = scoreLowerIsBetter(kpis.loyer_ratio, LOYER_RATIO, LOYER_RATIO_DEFAULT);
  const score_ms = scoreInRange(kpis.masse_salariale_ratio, MASSE_SALARIALE, MASSE_SALARIALE_DEFAULT);
  const score_ca_m2 = scoreHigherIsBetter(kpis.ca_par_m2, CA_PAR_M2, CA_PAR_M2_DEFAULT);

  const fw = PILLAR_WEIGHTS.finance;
  const financeScore = clamp(
    score_rentabilite * fw.rentabilite + score_loyer * fw.loyer + score_ms * fw.masse_salariale + score_ca_m2 * fw.ca_m2,
    0,
    100
  );

  scores.push({
    code: 'finance',
    name: 'Finance',
    score: Math.round(financeScore),
    weight: GLOBAL_WEIGHTS.finance,
    details: {
      marge_ebitda: kpis.marge_ebitda,
      loyer_ratio: kpis.loyer_ratio,
      masse_salariale_ratio: kpis.masse_salariale_ratio,
      ca_par_m2: kpis.ca_par_m2,
      score_rentabilite,
      score_loyer,
      score_ms,
      score_ca_m2
    }
  });

  // --- Clientèle ---
  const score_recurrence = scoreHigherIsBetter(kpis.pourcent_recurrent, RECURRENCE, RECURRENCE_DEFAULT);
  const score_arpm = scoreHigherIsBetter(kpis.arpm, ARPM, ARPM_DEFAULT);
  const score_churn = scoreLowerIsBetter(kpis.churn_mensuel, CHURN, CHURN_DEFAULT);

  const cw = PILLAR_WEIGHTS.clientele;
  const clienteleScore = clamp(
    score_recurrence * cw.recurrence + score_arpm * cw.arpm + score_churn * cw.churn,
    0,
    100
  );

  scores.push({
    code: 'clientele',
    name: 'Commercial & rétention',
    score: Math.round(clienteleScore),
    weight: GLOBAL_WEIGHTS.clientele,
    details: {
      pourcent_recurrent: kpis.pourcent_recurrent,
      arpm: kpis.arpm,
      churn_mensuel: kpis.churn_mensuel,
      score_recurrence,
      score_arpm,
      score_churn
    }
  });

  // --- Exploitation ---
  const score_occupation = scoreHigherIsBetter(kpis.occupation_moyenne, OCCUPATION, OCCUPATION_DEFAULT);
  const score_conversion = scoreHigherIsBetter(kpis.conversion_essai, CONVERSION, CONVERSION_DEFAULT);

  const ew = PILLAR_WEIGHTS.exploitation;
  const exploitationScore = clamp(
    score_occupation * ew.occupation + score_conversion * ew.conversion,
    0,
    100
  );

  scores.push({
    code: 'exploitation',
    name: 'Organisation & pilotage',
    score: Math.round(exploitationScore),
    weight: GLOBAL_WEIGHTS.exploitation,
    details: {
      occupation_moyenne: kpis.occupation_moyenne,
      conversion_essai: kpis.conversion_essai,
      score_occupation,
      score_conversion
    }
  });

  const globalScore = Math.round(scores.reduce((sum, s) => sum + s.score * s.weight, 0));

  return { scores, globalScore };
}

/**
 * Génère des recommandations d'amélioration basées sur les KPIs et les réponses.
 * Analyse chaque indicateur par rapport à ses seuils cibles et produit des recommandations
 * triées par priorité (P1 > P2 > P3), limitées à 6 maximum.
 *
 * @param {object} kpis - KPIs calculés de l'audit.
 * @param {object[]} answers - Réponses brutes de l'audit.
 * @returns {object[]} Recommandations triées par priorité et impact attendu (max 6).
 */
function generateRecommendations(kpis, answers) {
  const recommendations = [];
  const data = extractAllData(answers);
  const triggers = RECOMMENDATION_TRIGGERS;

  if (kpis.marge_ebitda < triggers.marge_ebitda) {
    recommendations.push({
      rec_code: 'improve_margins',
      title: 'Améliorer la rentabilité',
      description: `Votre marge EBITDA est de ${kpis.marge_ebitda.toFixed(1)}%, en dessous de la cible de 15-20%. Analysez vos charges fixes et optimisez votre structure de coûts.`,
      priority: RECOMMENDATION_PRIORITY.HIGH,
      expected_impact_eur: data.finance.revenus.ca_total * 0.05,
      effort_level: EFFORT_LEVEL.MEDIUM,
      confidence: CONFIDENCE_LEVEL.HIGH,
      category: 'finance',
      computed_at: new Date().toISOString()
    });
  }

  if (kpis.loyer_ratio > triggers.loyer_ratio) {
    recommendations.push({
      rec_code: 'optimize_rent',
      title: 'Ratio loyer trop élevé',
      description: `Votre loyer représente ${kpis.loyer_ratio.toFixed(1)}% du CA (cible: < 15%). Envisagez une renégociation ou sous-location d'espaces non utilisés.`,
      priority: RECOMMENDATION_PRIORITY.HIGH,
      expected_impact_eur: ((kpis.loyer_ratio - 15) * data.finance.revenus.ca_total) / 100,
      effort_level: EFFORT_LEVEL.HARD,
      confidence: CONFIDENCE_LEVEL.MEDIUM,
      category: 'finance',
      computed_at: new Date().toISOString()
    });
  }

  if (kpis.arpm < triggers.arpm) {
    const potentialIncrease = (85 - kpis.arpm) * data.membres.nb_membres_actifs_total * 12;
    recommendations.push({
      rec_code: 'increase_arpm',
      title: 'Augmenter l\'ARPM',
      description: `Votre ARPM est de ${kpis.arpm.toFixed(0)}€ (cible: 85-100€). Travaillez votre stratégie tarifaire et vendez plus de services additionnels (PT, nutrition).`,
      priority: RECOMMENDATION_PRIORITY.HIGH,
      expected_impact_eur: potentialIncrease * 0.7,
      effort_level: EFFORT_LEVEL.MEDIUM,
      confidence: CONFIDENCE_LEVEL.HIGH,
      category: 'commercial',
      computed_at: new Date().toISOString()
    });
  }

  if (kpis.churn_mensuel > triggers.churn_mensuel) {
    recommendations.push({
      rec_code: 'reduce_churn',
      title: 'Réduire le churn',
      description: `Votre taux de churn est de ${kpis.churn_mensuel.toFixed(1)}% (cible: < 3%). Mettez en place des actions de rétention: onboarding, suivi personnalisé, événements communautaires.`,
      priority: RECOMMENDATION_PRIORITY.HIGH,
      expected_impact_eur: (kpis.churn_mensuel - 3) * data.membres.nb_membres_actifs_total * kpis.arpm * 6,
      effort_level: EFFORT_LEVEL.MEDIUM,
      confidence: CONFIDENCE_LEVEL.MEDIUM,
      category: 'commercial',
      computed_at: new Date().toISOString()
    });
  }

  if (kpis.occupation_moyenne < triggers.occupation_moyenne) {
    recommendations.push({
      rec_code: 'improve_occupation',
      title: 'Optimiser le taux d\'occupation',
      description: `Votre taux d'occupation est de ${kpis.occupation_moyenne.toFixed(0)}% (cible: 70-80%). Analysez votre planning pour identifier les créneaux sous-utilisés et ajustez.`,
      priority: RECOMMENDATION_PRIORITY.MEDIUM,
      expected_impact_eur: 0,
      effort_level: EFFORT_LEVEL.EASY,
      confidence: CONFIDENCE_LEVEL.MEDIUM,
      category: 'operations',
      computed_at: new Date().toISOString()
    });
  }

  if (kpis.conversion_essai < triggers.conversion_essai) {
    recommendations.push({
      rec_code: 'improve_conversion',
      title: 'Améliorer la conversion essais',
      description: `Votre taux de conversion est de ${kpis.conversion_essai.toFixed(0)}% (cible: > 50%). Optimisez votre processus d'essai et formation du personnel commercial.`,
      priority: RECOMMENDATION_PRIORITY.MEDIUM,
      expected_impact_eur: data.operations.essais_gratuits_mois * 12 * (50 - kpis.conversion_essai) / 100 * kpis.arpm * 12 * 0.5,
      effort_level: EFFORT_LEVEL.MEDIUM,
      confidence: CONFIDENCE_LEVEL.MEDIUM,
      category: 'commercial',
      computed_at: new Date().toISOString()
    });
  }

  if (kpis.pourcent_recurrent < triggers.pourcent_recurrent) {
    recommendations.push({
      rec_code: 'increase_recurring',
      title: 'Augmenter le CA récurrent',
      description: `Votre CA récurrent est de ${kpis.pourcent_recurrent.toFixed(0)}% (cible: > 85%). Privilégiez les abonnements mensuels aux cartes.`,
      priority: RECOMMENDATION_PRIORITY.MEDIUM,
      expected_impact_eur: 0,
      effort_level: EFFORT_LEVEL.MEDIUM,
      confidence: CONFIDENCE_LEVEL.MEDIUM,
      category: 'commercial',
      computed_at: new Date().toISOString()
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      rec_code: 'maintain_performance',
      title: 'Maintenir les performances',
      description: 'Vos indicateurs sont dans les cibles. Continuez vos efforts et suivez régulièrement vos KPIs.',
      priority: RECOMMENDATION_PRIORITY.LOW,
      expected_impact_eur: 0,
      effort_level: EFFORT_LEVEL.EASY,
      confidence: CONFIDENCE_LEVEL.HIGH,
      category: 'general',
      computed_at: new Date().toISOString()
    });
  }

  recommendations.sort((a, b) => {
    const priorityOrder = {
      [RECOMMENDATION_PRIORITY.HIGH]: 1,
      [RECOMMENDATION_PRIORITY.MEDIUM]: 2,
      [RECOMMENDATION_PRIORITY.LOW]: 3
    };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return (b.expected_impact_eur || 0) - (a.expected_impact_eur || 0);
  });

  return recommendations.slice(0, 6);
}

module.exports = {
  calculateKPIs,
  calculateScores,
  generateRecommendations
};
