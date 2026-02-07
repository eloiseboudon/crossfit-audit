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
 * Calcule les scores par pilier (finance, clientèle, exploitation) et le score global.
 * Chaque pilier est pondéré et noté de 0 à 100 selon des seuils métier.
 *
 * @param {object} kpis - KPIs calculés (marge_ebitda, loyer_ratio, arpm, churn, etc.).
 * @returns {{ scores: object[], globalScore: number }} Scores par pilier avec détails et score global pondéré.
 */
function calculateScores(kpis) {
  const scores = [];

  let score_rentabilite = 50;
  if (kpis.marge_ebitda >= 25) score_rentabilite = 100;
  else if (kpis.marge_ebitda >= 20) score_rentabilite = 90;
  else if (kpis.marge_ebitda >= 15) score_rentabilite = 75;
  else if (kpis.marge_ebitda >= 10) score_rentabilite = 60;
  else if (kpis.marge_ebitda >= 5) score_rentabilite = 40;
  else if (kpis.marge_ebitda >= 0) score_rentabilite = 25;
  else score_rentabilite = 10;

  let score_loyer = 50;
  if (kpis.loyer_ratio <= 12) score_loyer = 100;
  else if (kpis.loyer_ratio <= 15) score_loyer = 85;
  else if (kpis.loyer_ratio <= 18) score_loyer = 70;
  else if (kpis.loyer_ratio <= 22) score_loyer = 50;
  else if (kpis.loyer_ratio <= 25) score_loyer = 30;
  else score_loyer = 10;

  let score_ms = 50;
  if (kpis.masse_salariale_ratio >= 30 && kpis.masse_salariale_ratio <= 40) score_ms = 100;
  else if (kpis.masse_salariale_ratio >= 25 && kpis.masse_salariale_ratio <= 45) score_ms = 85;
  else if (kpis.masse_salariale_ratio >= 20 && kpis.masse_salariale_ratio <= 50) score_ms = 70;
  else if (kpis.masse_salariale_ratio < 20) score_ms = 50;
  else if (kpis.masse_salariale_ratio <= 55) score_ms = 50;
  else score_ms = 25;

  let score_ca_m2 = 50;
  if (kpis.ca_par_m2 >= 400) score_ca_m2 = 100;
  else if (kpis.ca_par_m2 >= 300) score_ca_m2 = 85;
  else if (kpis.ca_par_m2 >= 250) score_ca_m2 = 75;
  else if (kpis.ca_par_m2 >= 200) score_ca_m2 = 60;
  else if (kpis.ca_par_m2 >= 150) score_ca_m2 = 40;
  else score_ca_m2 = 25;

  const financeScore = clamp(
    score_rentabilite * 0.4 + score_loyer * 0.2 + score_ms * 0.2 + score_ca_m2 * 0.2,
    0,
    100
  );

  scores.push({
    code: 'finance',
    name: 'Finance',
    score: Math.round(financeScore),
    weight: 0.3,
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

  let score_recurrence = 50;
  if (kpis.pourcent_recurrent >= 90) score_recurrence = 100;
  else if (kpis.pourcent_recurrent >= 85) score_recurrence = 90;
  else if (kpis.pourcent_recurrent >= 80) score_recurrence = 80;
  else if (kpis.pourcent_recurrent >= 70) score_recurrence = 65;
  else if (kpis.pourcent_recurrent >= 60) score_recurrence = 45;
  else score_recurrence = 25;

  let score_arpm = 50;
  if (kpis.arpm >= 110) score_arpm = 100;
  else if (kpis.arpm >= 95) score_arpm = 90;
  else if (kpis.arpm >= 85) score_arpm = 80;
  else if (kpis.arpm >= 75) score_arpm = 65;
  else if (kpis.arpm >= 65) score_arpm = 50;
  else score_arpm = 30;

  let score_churn = 50;
  if (kpis.churn_mensuel <= 2) score_churn = 100;
  else if (kpis.churn_mensuel <= 3) score_churn = 90;
  else if (kpis.churn_mensuel <= 5) score_churn = 75;
  else if (kpis.churn_mensuel <= 7) score_churn = 55;
  else if (kpis.churn_mensuel <= 10) score_churn = 35;
  else score_churn = 15;

  const clienteleScore = clamp(
    score_recurrence * 0.4 + score_arpm * 0.35 + score_churn * 0.25,
    0,
    100
  );

  scores.push({
    code: 'clientele',
    name: 'Commercial & rétention',
    score: Math.round(clienteleScore),
    weight: 0.35,
    details: {
      pourcent_recurrent: kpis.pourcent_recurrent,
      arpm: kpis.arpm,
      churn_mensuel: kpis.churn_mensuel,
      score_recurrence,
      score_arpm,
      score_churn
    }
  });

  let score_occupation = 50;
  if (kpis.occupation_moyenne >= 85) score_occupation = 100;
  else if (kpis.occupation_moyenne >= 75) score_occupation = 90;
  else if (kpis.occupation_moyenne >= 70) score_occupation = 80;
  else if (kpis.occupation_moyenne >= 65) score_occupation = 70;
  else if (kpis.occupation_moyenne >= 55) score_occupation = 55;
  else if (kpis.occupation_moyenne >= 45) score_occupation = 40;
  else score_occupation = 25;

  let score_conversion = 50;
  if (kpis.conversion_essai >= 60) score_conversion = 100;
  else if (kpis.conversion_essai >= 50) score_conversion = 90;
  else if (kpis.conversion_essai >= 40) score_conversion = 75;
  else if (kpis.conversion_essai >= 30) score_conversion = 55;
  else if (kpis.conversion_essai >= 20) score_conversion = 35;
  else score_conversion = 20;

  const exploitationScore = clamp(
    score_occupation * 0.6 + score_conversion * 0.4,
    0,
    100
  );

  scores.push({
    code: 'exploitation',
    name: 'Organisation & pilotage',
    score: Math.round(exploitationScore),
    weight: 0.35,
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

  if (kpis.marge_ebitda < 15) {
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

  if (kpis.loyer_ratio > 18) {
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

  if (kpis.arpm < 80) {
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

  if (kpis.churn_mensuel > 5) {
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

  if (kpis.occupation_moyenne < 65) {
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

  if (kpis.conversion_essai < 40) {
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

  if (kpis.pourcent_recurrent < 80) {
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
