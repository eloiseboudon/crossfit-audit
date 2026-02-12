import type { Answer, AdvancedFinancialKPIs, AdvancedClientKPIs, AdvancedOperationalKPIs, AdvancedHRKPIs, CalculatedKPIs, PillarScore, RecommendationOutput } from './types';
import { CONFIDENCE_LEVELS, EFFORT_LEVELS, RECOMMENDATION_PRIORITY } from './constants';
import { extractAllData, getAnswerValue } from './extractData';
import {
  scoreFromMinBrackets, scoreFromMaxBrackets, scoreFromRangeBrackets,
  HEALTH_EBITDA_BRACKETS, HEALTH_EBITDA_FALLBACK,
  HEALTH_MARGE_NETTE_BRACKETS, HEALTH_MARGE_NETTE_FALLBACK,
  HEALTH_JOURS_TRESORERIE_BRACKETS, HEALTH_JOURS_TRESORERIE_FALLBACK,
  HEALTH_LIQUIDITE_BRACKETS, HEALTH_LIQUIDITE_FALLBACK,
  HEALTH_LOYER_BRACKETS, HEALTH_LOYER_FALLBACK,
  HEALTH_MS_BRACKETS, HEALTH_MS_FALLBACK,
  HEALTH_ENDETTEMENT_BRACKETS, HEALTH_ENDETTEMENT_FALLBACK,
  BENCHMARK_MARGE_NETTE_SECTOR_PCT,
  PERCENTILE_RENTABILITE_BRACKETS, PERCENTILE_RENTABILITE_FALLBACK,
  MOIS_POINT_MORT_UNREACHABLE,
} from './benchmarks';

export function calculateKPIs(answers: Answer[]): CalculatedKPIs {
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateScores(
  kpis: CalculatedKPIs
): { scores: PillarScore[]; globalScore: number } {
  const scores: PillarScore[] = [];

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
    score_rentabilite * 0.40 + score_loyer * 0.20 + score_ms * 0.20 + score_ca_m2 * 0.20,
    0,
    100
  );

  scores.push({
    code: 'finance',
    name: 'Finance',
    score: Math.round(financeScore),
    weight: 0.30,
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
    score_recurrence * 0.40 + score_arpm * 0.35 + score_churn * 0.25,
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
    score_occupation * 0.60 + score_conversion * 0.40,
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

export function generateRecommendations(
  kpis: CalculatedKPIs,
  answers: Answer[]
): RecommendationOutput[] {
  const recommendations: RecommendationOutput[] = [];
  const data = extractAllData(answers);

  if (kpis.marge_ebitda < 15) {
    recommendations.push({
      rec_code: 'improve_margins',
      title: 'Améliorer la rentabilité',
      description: `Votre marge EBITDA est de ${kpis.marge_ebitda.toFixed(1)}%, en dessous de la cible de 15-20%. Analysez vos charges fixes et optimisez votre structure de coûts.`,
      priority: RECOMMENDATION_PRIORITY.HIGH,
      expected_impact_eur: data.finance.revenus.ca_total * 0.05,
      effort_level: EFFORT_LEVELS.MEDIUM,
      confidence: CONFIDENCE_LEVELS.HIGH,
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
      expected_impact_eur: (kpis.loyer_ratio - 15) * data.finance.revenus.ca_total / 100,
      effort_level: EFFORT_LEVELS.HARD,
      confidence: CONFIDENCE_LEVELS.MEDIUM,
      category: 'finance',
      computed_at: new Date().toISOString()
    });
  }

  if (kpis.arpm < 80) {
    const potential_increase = (85 - kpis.arpm) * data.membres.nb_membres_actifs_total * 12;
    recommendations.push({
      rec_code: 'increase_arpm',
      title: 'Augmenter l\'ARPM',
      description: `Votre ARPM est de ${kpis.arpm.toFixed(0)}€ (cible: 85-100€). Travaillez votre stratégie tarifaire et vendez plus de services additionnels (PT, nutrition).`,
      priority: RECOMMENDATION_PRIORITY.HIGH,
      expected_impact_eur: potential_increase * 0.7,
      effort_level: EFFORT_LEVELS.MEDIUM,
      confidence: CONFIDENCE_LEVELS.HIGH,
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
      effort_level: EFFORT_LEVELS.MEDIUM,
      confidence: CONFIDENCE_LEVELS.MEDIUM,
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
      effort_level: EFFORT_LEVELS.EASY,
      confidence: CONFIDENCE_LEVELS.MEDIUM,
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
      effort_level: EFFORT_LEVELS.MEDIUM,
      confidence: CONFIDENCE_LEVELS.MEDIUM,
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
      effort_level: EFFORT_LEVELS.MEDIUM,
      confidence: CONFIDENCE_LEVELS.MEDIUM,
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
      effort_level: EFFORT_LEVELS.EASY,
      confidence: CONFIDENCE_LEVELS.HIGH,
      category: 'general',
      computed_at: new Date().toISOString()
    });
  }

  recommendations.sort((a, b) => {
    const priorityOrder: Record<string, number> = {
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

// ============================================================================
// FONCTIONS DE CALCUL AVANCÉES
// ============================================================================

/**
 * Calcule les KPIs financiers avancés conformes à l'interface AdvancedFinancialKPIs.
 * Extrait toutes les données financières et calcule : CA par segment, marges, ratios,
 * point mort, trésorerie, endettement.
 */
export function calculateAdvancedFinancialKPIs(_kpis: CalculatedKPIs, answers: Answer[]): AdvancedFinancialKPIs {
  const data = extractAllData(answers);
  const rev = data.finance.revenus;
  const ch = data.finance.charges;
  const tres = data.finance.tresorerie;

  // CA par segment
  const ca_abonnements = rev.ca_abonnements_mensuels + rev.ca_abonnements_trimestriels +
                          rev.ca_abonnements_semestriels + rev.ca_abonnements_annuels;
  const ca_drop_in = rev.ca_cartes_10 + rev.ca_cartes_20 + rev.ca_seances_unitaires;
  const ca_personal_training = rev.ca_personal_training;
  const ca_merchandising = rev.ca_merchandising_vetements + rev.ca_merchandising_accessoires;
  const ca_nutrition = rev.ca_coaching_nutrition + rev.ca_complements;
  const ca_events = rev.ca_competitions_internes + rev.ca_competitions_externes +
                    rev.ca_seminaires + rev.ca_team_building;
  const ca_autres = rev.ca_frais_inscription + rev.ca_suivi_remote + rev.ca_cours_specialises +
                    rev.ca_boissons_snacks + rev.ca_sous_location + rev.ca_partenariats + rev.ca_sponsoring;
  const ca_total = rev.ca_total;

  // Structure CA en %
  const pct_ca_abonnements = ca_total > 0 ? (ca_abonnements / ca_total) * 100 : 0;
  const pct_ca_drop_in = ca_total > 0 ? (ca_drop_in / ca_total) * 100 : 0;
  const pct_ca_ancillary = ca_total > 0 ? ((ca_personal_training + ca_merchandising + ca_nutrition) / ca_total) * 100 : 0;

  // Charges
  const charges_fixes = ch.loyer_annuel_total + ch.masse_salariale_total + ch.assurances_total +
                         ch.services_exterieurs_total + ch.amortissements;
  const charges_variables = ch.energies_total + ch.marketing_total + ch.entretien_total +
                            ch.achats_marchandises + ch.achats_fournitures + ch.communication_total;
  const charges_totales = ch.charges_total;

  // Marges
  const ebitda = data.finance.resultat.ebitda;
  const resultat_net = data.finance.resultat.resultat_net;
  const marge_brute_pct = ca_total > 0 ? ((ca_total - ch.achats_marchandises - ch.variation_stock) / ca_total) * 100 : 0;
  const marge_nette_pct = data.finance.resultat.marge_nette;
  const marge_ebitda_pct = data.finance.resultat.marge_ebitda;

  // Seuil de rentabilité
  const charges_fixes_mensuelles = charges_fixes / 12;
  const taux_marge_variable = ca_total > 0 ? (ca_total - charges_variables) / ca_total : 0;
  const seuil_rentabilite_eur = taux_marge_variable > 0 ? charges_fixes_mensuelles / taux_marge_variable : 0;
  const arpm = data.membres.arpm;
  const seuil_rentabilite_membres = arpm > 0 ? Math.ceil(seuil_rentabilite_eur / arpm) : 0;

  // Ratios d'efficience
  const surface_totale = data.identite.surface_totale;
  const nb_coaches = data.rh.nombre_coaches;
  const nb_membres = data.membres.nb_membres_actifs_total;
  const ca_par_m2 = surface_totale > 0 ? ca_total / surface_totale : 0;
  const ca_par_coach = nb_coaches > 0 ? ca_total / nb_coaches : 0;
  const ca_par_membre = nb_membres > 0 ? (ca_total / 12) / nb_membres : 0;
  const charges_par_m2 = surface_totale > 0 ? charges_totales / surface_totale : 0;
  const charges_par_membre = nb_membres > 0 ? (charges_totales / 12) / nb_membres : 0;

  // Structure de coûts
  const ratio_loyer_ca_pct = data.finance.ratios.loyer_ca_ratio;
  const ratio_masse_salariale_ca_pct = data.finance.ratios.ms_ca_ratio;
  const ratio_marketing_ca_pct = data.finance.ratios.marketing_ca_ratio;
  const ratio_charges_fixes_ca_pct = ca_total > 0 ? (charges_fixes / ca_total) * 100 : 0;
  const ratio_charges_variables_ca_pct = ca_total > 0 ? (charges_variables / ca_total) * 100 : 0;

  // Trésorerie & liquidité
  const tresorerie_actuelle = tres.tresorerie_actuelle;
  const fonds_roulement = tresorerie_actuelle + tres.creances_clients - tres.dettes_fournisseurs;
  const bfr = tres.bfr_estime;
  const tresorerie_nette = fonds_roulement - bfr;
  const passif_ct = tres.dettes_fournisseurs + tres.echeance_mensuelle_emprunts * 12;
  const ratio_liquidite = passif_ct > 0 ? (tresorerie_actuelle + tres.creances_clients) / passif_ct : 0;
  const charges_mensuelles = charges_totales / 12;
  const jours_tresorerie = charges_mensuelles > 0 ? (tresorerie_actuelle / charges_mensuelles) * 30 : 0;
  const delai_paiement_moyen = ca_total > 0 ? (tres.creances_clients / (ca_total / 365)) : 0;

  // Endettement
  const dettes_sociales = getAnswerValue(answers, 'resultat_tresorerie', 'dettes_sociales_urssaf', 0);
  const dettes_fiscales = getAnswerValue(answers, 'resultat_tresorerie', 'dettes_fiscales', 0);
  const autres_dettes = getAnswerValue(answers, 'resultat_tresorerie', 'autres_dettes', 0);
  const total_dettes = tres.emprunts_capital_restant + tres.dettes_fournisseurs + dettes_sociales + dettes_fiscales + autres_dettes;
  const fonds_propres = ca_total > 0 ? ca_total * 0.3 : 0; // estimation : 30% du CA
  const ratio_endettement = fonds_propres > 0 ? (total_dettes / fonds_propres) * 100 : 0;
  const ebitda_mensuel = ebitda / 12;
  const capacite_remboursement = ebitda_mensuel > 0 ? total_dettes / ebitda_mensuel : 999;

  // Indicateurs complémentaires
  const ratio_energie_ca_pct = ca_total > 0 ? (ch.energies_total / ca_total) * 100 : 0;
  const ebe_euro = ebitda; // EBE ~= EBITDA
  const ebe_pourcent = marge_ebitda_pct;
  const rcai = resultat_net + ch.frais_financiers_total; // approx
  const caf = resultat_net + ch.amortissements;
  const ca_cartes_pct = pct_ca_drop_in;
  const ca_pt_pct = ca_total > 0 ? (ca_personal_training / ca_total) * 100 : 0;
  const echeances_annuelles = tres.echeance_mensuelle_emprunts * 12;
  const poids_echeances_ca_pct = ca_total > 0 ? (echeances_annuelles / ca_total) * 100 : 0;

  // Point mort
  const point_mort_mensuel = seuil_rentabilite_eur;
  const ca_mensuel = ca_total / 12;
  const mois_point_mort = ca_mensuel >= point_mort_mensuel ? 0 : MOIS_POINT_MORT_UNREACHABLE;

  // Benchmark secteur CrossFit
  const benchmark_marge_nette = BENCHMARK_MARGE_NETTE_SECTOR_PCT;
  const ecart_marge_vs_benchmark = marge_nette_pct - benchmark_marge_nette;
  const percentile = scoreFromMinBrackets(marge_nette_pct, PERCENTILE_RENTABILITE_BRACKETS, PERCENTILE_RENTABILITE_FALLBACK);

  // Data quality score
  const totalFields = 30;
  const filledFields = [
    ca_total > 0, charges_totales > 0, ch.loyer_annuel_total > 0, ch.masse_salariale_total > 0,
    ch.energies_total > 0, ch.marketing_total > 0, ch.assurances_total > 0,
    tresorerie_actuelle > 0 || tres.tresorerie_disponible > 0,
    ca_abonnements > 0, nb_membres > 0, surface_totale > 0, nb_coaches > 0,
    tres.emprunts_capital_restant >= 0, ch.entretien_total >= 0,
    ch.services_exterieurs_total >= 0, ch.communication_total >= 0,
    ca_personal_training >= 0, ca_merchandising >= 0, ca_events >= 0,
    ch.frais_financiers_total >= 0
  ].filter(Boolean).length;
  const data_quality_score = Math.round((filledFields / totalFields) * 100);

  const missing_data_fields: string[] = [];
  if (ca_total === 0) missing_data_fields.push('ca_total');
  if (charges_totales === 0) missing_data_fields.push('charges_totales');
  if (ch.loyer_annuel_total === 0) missing_data_fields.push('loyer');
  if (ch.masse_salariale_total === 0) missing_data_fields.push('masse_salariale');
  if (surface_totale === 0) missing_data_fields.push('surface_totale');
  if (nb_coaches === 0) missing_data_fields.push('nombre_coaches');
  if (nb_membres === 0) missing_data_fields.push('membres_actifs');

  return {
    audit_id: '',
    ca_total_annuel: ca_total,
    ca_abonnements,
    ca_drop_in,
    ca_personal_training,
    ca_merchandising,
    ca_nutrition,
    ca_events,
    ca_autres,
    pct_ca_abonnements,
    pct_ca_drop_in,
    pct_ca_ancillary,
    charges_totales_annuelles: charges_totales,
    charges_fixes_annuelles: charges_fixes,
    charges_variables_annuelles: charges_variables,
    cout_loyer_annuel: ch.loyer_annuel_total,
    cout_masse_salariale_annuelle: ch.masse_salariale_total,
    cout_marketing_annuel: ch.marketing_total,
    cout_utilities_annuel: ch.energies_total,
    cout_equipement_annuel: ch.entretien_total,
    cout_assurances_annuel: ch.assurances_total,
    cout_logiciels_annuel: ch.communication_total,
    ebitda,
    resultat_net,
    marge_brute_pct,
    marge_nette_pct,
    marge_ebitda_pct,
    seuil_rentabilite_eur,
    seuil_rentabilite_membres,
    ca_par_m2,
    ca_par_coach,
    ca_par_membre,
    charges_par_m2,
    charges_par_membre,
    ratio_loyer_ca_pct,
    ratio_masse_salariale_ca_pct,
    ratio_marketing_ca_pct,
    ratio_charges_fixes_ca_pct,
    ratio_charges_variables_ca_pct,
    tresorerie_actuelle,
    fonds_roulement,
    besoin_fonds_roulement: bfr,
    tresorerie_nette,
    ratio_liquidite_generale: ratio_liquidite,
    delai_paiement_moyen_jours: delai_paiement_moyen,
    total_dettes,
    ratio_endettement_pct: ratio_endettement,
    capacite_remboursement_mois: capacite_remboursement,
    charge_dette_mensuelle: tres.echeance_mensuelle_emprunts,
    point_mort_mensuel_euro: point_mort_mensuel,
    mois_point_mort,
    ratio_energie_ca_pct,
    ebe_euro,
    ebe_pourcent,
    resultat_courant_avant_impot: rcai,
    capacite_autofinancement: caf,
    ca_cartes_pct,
    ca_pt_pct,
    jours_tresorerie,
    poids_echeances_ca_pct,
    benchmark_marge_nette_sector_pct: benchmark_marge_nette,
    ecart_marge_vs_benchmark_pct: ecart_marge_vs_benchmark,
    percentile_rentabilite: percentile,
    computed_at: new Date().toISOString(),
    data_quality_score,
    missing_data_fields
  };
}

/**
 * Calcule les KPIs clientèle avancés.
 * Analyse l'acquisition, la rétention, la LTV, le churn et la segmentation.
 */
export function calculateAdvancedClientKPIs(answers: Answer[]): AdvancedClientKPIs {
  const data = extractAllData(answers);
  const m = data.membres;
  const ops = data.operations;

  const membres_actifs = m.nb_membres_actifs_total;
  const membres_illimites = m.nb_membres_illimite;
  const membres_limites = m.nb_membres_3x_semaine + m.nb_membres_2x_semaine + m.nb_membres_1x_semaine;
  const membres_premium = m.nb_membres_avec_pt + m.nb_membres_avec_nutrition;
  const membres_drop_in = m.nb_membres_cartes_10 + m.nb_membres_cartes_20;

  // Croissance (estimée: conversions - résiliations)
  const nouveaux_mois = getAnswerValue(answers, 'acquisition_conversion', 'nb_conversions_mois_actuel', 0);
  const resiliations_mois = getAnswerValue(answers, 'retention_churn', 'nb_resiliations_mois_actuel', 0);
  const croissance_mois = membres_actifs > 0 ? ((nouveaux_mois - resiliations_mois) / membres_actifs) * 100 : 0;
  const croissance_annee = croissance_mois * 12; // approximation linéaire

  // Acquisition & funnel
  const essais_mois = getAnswerValue(answers, 'acquisition_conversion', 'nb_essais_mois_actuel', 0);
  const leads_mois = essais_mois; // leads ≈ essais si pas de données leads séparées
  const conversion_lead_essai = 100; // si leads = essais
  const conversion_essai_membre = essais_mois > 0 ? (nouveaux_mois / essais_mois) * 100 : 0;
  const conversion_global = conversion_essai_membre;

  // Sources d'acquisition
  const pct_bouche_oreille = getAnswerValue(answers, 'acquisition_conversion', 'sources_bouche_oreille', 0);
  const pct_reseaux = getAnswerValue(answers, 'acquisition_conversion', 'sources_reseaux_sociaux', 0);
  const pct_google = getAnswerValue(answers, 'acquisition_conversion', 'sources_google', 0);
  const pct_parrainage = getAnswerValue(answers, 'acquisition_conversion', 'sources_partenariats', 0);
  const pct_events = 0;
  const pct_autres = getAnswerValue(answers, 'acquisition_conversion', 'sources_autres', 0) +
                     getAnswerValue(answers, 'acquisition_conversion', 'sources_passage', 0);

  // Économie unitaire
  const cac = m.cac || getAnswerValue(answers, 'acquisition_conversion', 'cout_acquisition_moyen', 0);
  const arpm = m.arpm;
  const ltv = m.ltv_estime;
  const ratio_ltv_cac = m.ltv_cac_ratio;
  const temps_retour_cac = arpm > 0 ? cac / arpm : 0;
  const revenu_annuel = arpm * 12;

  // Rétention & churn
  const churn_mensuel = ops.taux_churn_pct;
  const churn_annuel = Math.min(100, churn_mensuel * 12);
  const retention_mensuelle = 100 - churn_mensuel;
  const retention_annuelle = 100 - churn_annuel;
  const departs_mois = resiliations_mois;
  const anciennete_moyenne = getAnswerValue(answers, 'retention_churn', 'duree_moyenne_adhesion', 0);
  const taux_reactivation = 0; // non disponible dans le questionnaire

  // Analyse churn par ancienneté (estimations basées sur les données)
  const churn_0_3 = churn_mensuel * 2; // les nouveaux membres partent plus
  const churn_3_12 = churn_mensuel;
  const churn_12_plus = churn_mensuel * 0.5;

  // Top 3 motifs de départ
  const motifs: Array<{ label: string; pct: number }> = [
    { label: 'Prix', pct: getAnswerValue(answers, 'retention_churn', 'raisons_prix', 0) },
    { label: 'Déménagement', pct: getAnswerValue(answers, 'retention_churn', 'raisons_demenagement', 0) },
    { label: 'Blessure', pct: getAnswerValue(answers, 'retention_churn', 'raisons_blessure', 0) },
    { label: 'Manque de temps', pct: getAnswerValue(answers, 'retention_churn', 'raisons_temps', 0) },
    { label: 'Insatisfaction', pct: getAnswerValue(answers, 'retention_churn', 'raisons_insatisfaction', 0) }
  ];
  motifs.sort((a, b) => b.pct - a.pct);
  const motifs_top3 = motifs.slice(0, 3).filter(m => m.pct > 0).map(m => `${m.label} (${m.pct}%)`);

  // Engagement
  const frequentation = getAnswerValue(answers, 'engagement_satisfaction', 'frequentation_moyenne_semaine', 0);
  const nb_competitions = getAnswerValue(answers, 'evenements', 'nb_membres_participant_competitions', 0);
  const taux_participation_events = membres_actifs > 0 ? (nb_competitions / membres_actifs) * 100 : 0;
  const nps = getAnswerValue(answers, 'engagement_satisfaction', 'nps_score', 0);
  const satisfaction = getAnswerValue(answers, 'engagement_satisfaction', 'satisfaction_globale', 0);
  const avis_google_avg = getAnswerValue(answers, 'engagement_satisfaction', 'note_moyenne_google', 0);
  const avis_google_count = getAnswerValue(answers, 'engagement_satisfaction', 'nb_avis_google', 0);
  const taux_reponse = getAnswerValue(answers, 'engagement_satisfaction', 'taux_reponse_enquetes', 0);
  const taux_recommandation = taux_reponse > 0 ? taux_reponse : (nps > 0 ? 50 + nps / 2 : 0);

  // Segmentation
  const age_moyen = getAnswerValue(answers, 'demographie', 'age_moyen_membres', 0);
  const pct_femmes = getAnswerValue(answers, 'demographie', 'ratio_femmes', 0);
  const pct_hommes = getAnswerValue(answers, 'demographie', 'ratio_hommes', 0);
  const pct_debutants = membres_actifs > 0 ?
    ((m.nb_membres_sans_engagement) / membres_actifs) * 100 : 30;
  const pct_intermediaires = 40;
  const pct_avances = 100 - pct_debutants - pct_intermediaires;

  // Upsell
  const pct_pt = membres_actifs > 0 ? (m.nb_membres_avec_pt / membres_actifs) * 100 : 0;
  const pct_nutrition = membres_actifs > 0 ? (m.nb_membres_avec_nutrition / membres_actifs) * 100 : 0;
  const taux_upsell = pct_pt + pct_nutrition;
  const ca_ancillary = data.finance.revenus.ca_personal_training + data.finance.revenus.ca_coaching_nutrition +
                       data.finance.revenus.ca_merchandising_vetements + data.finance.revenus.ca_merchandising_accessoires;
  const revenu_ancillary = membres_actifs > 0 ? (ca_ancillary / 12) / membres_actifs : 0;

  // Rétention 3/6/12m
  const retention_3m = getAnswerValue(answers, 'retention_churn', 'taux_retention_3m', 0);
  const retention_6m = getAnswerValue(answers, 'retention_churn', 'taux_retention_6m', 0);
  const retention_12m = getAnswerValue(answers, 'retention_churn', 'taux_retention_12m', 0);

  // Délai conversion & pénétration premium
  const delai_conversion = getAnswerValue(answers, 'acquisition_conversion', 'delai_moyen_conversion', 0);
  const taux_penetration_premium = membres_actifs > 0 ? (membres_premium / membres_actifs) * 100 : 0;

  return {
    audit_id: '',
    membres_actifs_total: membres_actifs,
    membres_illimites,
    membres_limites,
    membres_premium,
    membres_drop_in,
    croissance_membres_mois_pct: croissance_mois,
    croissance_membres_annee_pct: croissance_annee,
    leads_mois,
    essais_gratuits_mois: essais_mois,
    taux_conversion_lead_essai_pct: conversion_lead_essai,
    taux_conversion_essai_membre_pct: conversion_essai_membre,
    taux_conversion_global_pct: conversion_global,
    nouveaux_membres_mois: nouveaux_mois,
    pct_acquisition_bouche_oreille: pct_bouche_oreille,
    pct_acquisition_reseaux_sociaux: pct_reseaux,
    pct_acquisition_google: pct_google,
    pct_acquisition_parrainage: pct_parrainage,
    pct_acquisition_events: pct_events,
    pct_acquisition_autres: pct_autres,
    cac_moyen: cac,
    ltv_moyen: ltv,
    ratio_ltv_cac,
    panier_moyen_mensuel: arpm,
    revenu_moyen_membre_annuel: revenu_annuel,
    temps_retour_cac_mois: temps_retour_cac,
    taux_retention_mensuel_pct: retention_mensuelle,
    taux_retention_annuel_pct: retention_annuelle,
    taux_churn_mensuel_pct: churn_mensuel,
    taux_churn_annuel_pct: churn_annuel,
    departs_mois,
    anciennete_moyenne_mois: anciennete_moyenne,
    taux_reactivation_pct: taux_reactivation,
    churn_0_3_mois_pct: churn_0_3,
    churn_3_12_mois_pct: churn_3_12,
    churn_12plus_mois_pct: churn_12_plus,
    motifs_depart_top3: motifs_top3,
    frequentation_moyenne_sem: frequentation,
    taux_participation_events_pct: taux_participation_events,
    nps_score: nps,
    satisfaction_score: satisfaction,
    taux_recommandation_pct: taux_recommandation,
    avis_google_avg,
    avis_google_count,
    age_moyen,
    pct_femmes,
    pct_hommes,
    pct_debutants,
    pct_intermediaires,
    pct_avances,
    taux_upsell_pct: taux_upsell,
    revenu_ancillary_par_membre: revenu_ancillary,
    pct_membres_pt: pct_pt,
    pct_membres_nutrition: pct_nutrition,
    delai_conversion_moyen_jours: delai_conversion,
    taux_retention_3m_pct: retention_3m,
    taux_retention_6m_pct: retention_6m,
    taux_retention_12m_pct: retention_12m,
    taux_penetration_premium_pct: taux_penetration_premium,
    computed_at: new Date().toISOString(),
    periode_analyse: new Date().getFullYear().toString()
  };
}

/**
 * Calcule les KPIs opérationnels avancés.
 * Analyse planning, occupation, productivité, types de cours, équipement.
 */
export function calculateAdvancedOperationalKPIs(answers: Answer[]): AdvancedOperationalKPIs {
  const data = extractAllData(answers);
  const rev = data.finance.revenus;
  const ch = data.finance.charges;

  // Infrastructure
  const surface_totale = data.identite.surface_totale;
  const surface_crossfit = data.identite.surface_crossfit || surface_totale;
  const capacite_max = getAnswerValue(answers, 'capacite_occupation', 'capacite_max_cours', 0);
  const participants_moyen = getAnswerValue(answers, 'capacite_occupation', 'participants_moyen_cours', 0);
  const nb_membres = data.membres.nb_membres_actifs_total;
  const ratio_m2_membre = nb_membres > 0 ? surface_totale / nb_membres : 0;
  const ratio_m2_poste = capacite_max > 0 ? surface_crossfit / capacite_max : 0;

  // Planning
  const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  let total_cours_semaine = 0;
  for (const jour of jours) {
    total_cours_semaine += getAnswerValue(answers, 'structure_planning', `nb_cours_${jour}`, 0);
  }
  const creneaux_jour_moyen = total_cours_semaine / 7;
  const seances_mois = total_cours_semaine * 4.33;

  // Heures d'ouverture (calculées depuis les horaires)
  const heures_ouverture_semaine = total_cours_semaine > 0 ? Math.min(total_cours_semaine * 1, 80) : 0; // approximation 1h par créneau

  // Occupation
  const occupation_global = capacite_max > 0 ? (participants_moyen / capacite_max) * 100 : 0;
  const occ_6_9 = getAnswerValue(answers, 'capacite_occupation', 'occupation_6h_9h', 0);
  const occ_9_12 = getAnswerValue(answers, 'capacite_occupation', 'occupation_9h_12h', 0);
  const occ_12_14 = getAnswerValue(answers, 'capacite_occupation', 'occupation_12h_14h', 0);
  const occ_14_17 = getAnswerValue(answers, 'capacite_occupation', 'occupation_14h_17h', 0);
  const occ_17_19 = getAnswerValue(answers, 'capacite_occupation', 'occupation_17h_19h', 0);
  const occ_19_21 = getAnswerValue(answers, 'capacite_occupation', 'occupation_19h_21h', 0);
  const occupation_peak = Math.max(occ_17_19, occ_19_21);
  const occupation_creuses = (occ_9_12 + occ_14_17) / 2;
  const occupation_weekend = 0; // non détaillé par jour dans les données
  const taux_remplissage = occupation_global;

  // Productivité
  const nb_coaches = data.rh.nombre_coaches;
  const seances_par_coach = nb_coaches > 0 ? total_cours_semaine / nb_coaches : 0;
  const membres_par_coach = nb_coaches > 0 ? nb_membres / nb_coaches : 0;
  const ca_total = rev.ca_total;
  const ca_par_heure = heures_ouverture_semaine > 0 ? ca_total / (heures_ouverture_semaine * 52) : 0;
  const ca_par_seance = seances_mois > 0 ? (ca_total / 12) / seances_mois : 0;
  const cout_par_seance = seances_mois > 0 ? (ch.charges_total / 12) / seances_mois : 0;
  const marge_par_seance = ca_par_seance - cout_par_seance;

  // Optimisation planning
  const nb_complets = getAnswerValue(answers, 'capacite_occupation', 'nb_cours_complets_semaine', 0);
  const nb_faible = getAnswerValue(answers, 'capacite_occupation', 'nb_cours_faible_remplissage', 0);
  const potentiel_add = Math.max(0, 5 - nb_complets); // potentiel additionnel
  const perte_ca = nb_faible > 0 ? nb_faible * ca_par_seance * 0.5 * 4.33 : 0;
  const gain_optimisation = perte_ca * 0.5;

  // Types de cours
  const cours_cf = getAnswerValue(answers, 'types_cours', 'nb_cours_crossfit_standard', 0) +
                   getAnswerValue(answers, 'types_cours', 'nb_cours_crossfit_scaled', 0) +
                   getAnswerValue(answers, 'types_cours', 'nb_cours_crossfit_rx_plus', 0);
  const cours_wl = getAnswerValue(answers, 'types_cours', 'nb_cours_weightlifting', 0);
  const cours_gym = getAnswerValue(answers, 'types_cours', 'nb_cours_gymnastics', 0);
  const cours_hyrox = getAnswerValue(answers, 'types_cours', 'nb_cours_hyrox', 0);
  const cours_open = getAnswerValue(answers, 'types_cours', 'creneaux_open_gym', 0);
  const cours_debutants = getAnswerValue(answers, 'types_cours', 'nb_cours_crossfit_scaled', 0);
  const cours_pt = getAnswerValue(answers, 'types_cours', 'seances_pt_semaine', 0);
  const total_typed = cours_cf + cours_wl + cours_gym + cours_hyrox + cours_open + cours_pt;
  const pct_cf = total_typed > 0 ? (cours_cf / total_typed) * 100 : 60;
  const pct_wl = total_typed > 0 ? (cours_wl / total_typed) * 100 : 0;
  const pct_gym = total_typed > 0 ? (cours_gym / total_typed) * 100 : 0;
  const pct_hyrox = total_typed > 0 ? (cours_hyrox / total_typed) * 100 : 0;
  const pct_open = total_typed > 0 ? (cours_open / total_typed) * 100 : 0;
  const pct_deb = total_typed > 0 ? (cours_debutants / total_typed) * 100 : 0;
  const pct_pt = total_typed > 0 ? (cours_pt / total_typed) * 100 : 0;

  // Événements
  const nb_comp_internes = getAnswerValue(answers, 'evenements', 'nb_competitions_internes_an', 0);
  const nb_comp_externes = getAnswerValue(answers, 'evenements', 'nb_competitions_externes_an', 0);
  const nb_events_communautaires = getAnswerValue(answers, 'evenements', 'nb_evenements_communautaires_an', 0);
  const events_par_mois = (nb_comp_internes + nb_comp_externes + nb_events_communautaires) / 12;
  const ca_events = rev.ca_competitions_internes + rev.ca_competitions_externes + rev.ca_seminaires + rev.ca_team_building;
  const nb_participants_comp = getAnswerValue(answers, 'evenements', 'nb_membres_participant_competitions', 0);
  const taux_part_events = nb_membres > 0 ? (nb_participants_comp / nb_membres) * 100 : 0;

  // Équipement
  const valeur_equip = data.identite.valeur_totale_materiel;
  const age_equip = data.identite.age_moyen_materiel;
  const cout_maintenance = ch.entretien_total;
  const dispo_equip = age_equip <= 3 ? 95 : age_equip <= 5 ? 85 : 75;
  const invest_prevu = 0;

  // Consommables
  const consommables_mois = (ch.achats_fournitures + ch.achats_marchandises) / 12;
  const consommables_par_membre = nb_membres > 0 ? consommables_mois / nb_membres : 0;

  // Compléments
  const loyer_mensuel = getAnswerValue(answers, 'charges_exploitation', 'loyer_mensuel_ht', 0);
  const cout_loyer_m2_mois = surface_totale > 0 ? loyer_mensuel / surface_totale : 0;
  const rentabilite_m2_an = surface_totale > 0 ? (ca_total - ch.charges_total) / surface_totale : 0;

  return {
    audit_id: '',
    surface_totale_m2: surface_totale,
    surface_entrainement_m2: surface_crossfit,
    capacite_maximale_seance: capacite_max,
    nombre_postes_wod: capacite_max,
    ratio_m2_par_membre: ratio_m2_membre,
    ratio_m2_par_poste: ratio_m2_poste,
    creneaux_semaine: total_cours_semaine,
    creneaux_jour_moyen: creneaux_jour_moyen,
    heures_ouverture_semaine,
    seances_mois,
    seances_par_creneau_moyen: participants_moyen,
    taux_occupation_global_pct: occupation_global,
    taux_occupation_heures_pleines_pct: occupation_peak,
    taux_occupation_heures_creuses_pct: occupation_creuses,
    taux_occupation_weekend_pct: occupation_weekend,
    participation_moyenne_seance: participants_moyen,
    taux_remplissage_moyen_pct: taux_remplissage,
    occupation_6h_9h_pct: occ_6_9,
    occupation_9h_12h_pct: occ_9_12,
    occupation_12h_14h_pct: occ_12_14,
    occupation_14h_17h_pct: occ_14_17,
    occupation_17h_20h_pct: Math.max(occ_17_19, occ_19_21),
    occupation_20h_22h_pct: occ_19_21,
    seances_par_coach_semaine: seances_par_coach,
    membres_par_coach,
    ca_par_heure_ouverture: ca_par_heure,
    ca_par_seance,
    cout_par_seance,
    marge_par_seance,
    creneaux_satures_count: nb_complets,
    creneaux_sous_utilises_count: nb_faible,
    potentiel_creneaux_additionnels: potentiel_add,
    perte_ca_creneaux_vides_eur: perte_ca,
    gain_potentiel_optimisation_eur: gain_optimisation,
    pct_cours_crossfit_classic: pct_cf,
    pct_cours_weightlifting: pct_wl,
    pct_cours_gymnastics: pct_gym,
    pct_cours_hyrox: pct_hyrox,
    pct_cours_open_gym: pct_open,
    pct_cours_debutants: pct_deb,
    pct_personal_training: pct_pt,
    events_par_mois,
    competitions_par_an: nb_comp_internes + nb_comp_externes,
    taux_participation_events_pct: taux_part_events,
    ca_events_annuel: ca_events,
    valeur_equipement_total: valeur_equip,
    age_moyen_equipement_annees: age_equip,
    cout_maintenance_annuel: cout_maintenance,
    taux_disponibilite_equipement_pct: dispo_equip,
    investissement_equipement_prevu: invest_prevu,
    cout_consommables_mois: consommables_mois,
    cout_consommables_par_membre: consommables_par_membre,
    cout_loyer_par_m2_mois: cout_loyer_m2_mois,
    rentabilite_m2_an,
    computed_at: new Date().toISOString(),
    periode_analyse: new Date().getFullYear().toString()
  };
}

/**
 * Calcule les KPIs RH avancés.
 * Analyse structure équipe, coûts, certifications, turnover, qualité coaching.
 */
export function calculateAdvancedHRKPIs(answers: Answer[]): AdvancedHRKPIs {
  const data = extractAllData(answers);
  const rh = data.rh;
  const rev = data.finance.revenus;
  const ch = data.finance.charges;

  const nb_coaches = rh.nombre_coaches || getAnswerValue(answers, 'structure_equipe', 'nb_total_coachs', 0);
  const tp = rh.coaches_temps_plein || getAnswerValue(answers, 'structure_equipe', 'nb_coachs_temps_plein', 0);
  const tpar = rh.coaches_temps_partiel || getAnswerValue(answers, 'structure_equipe', 'nb_coachs_temps_partiel', 0);
  const freelance = rh.coaches_freelance || (getAnswerValue(answers, 'structure_equipe', 'nb_freelance_reguliers', 0) +
                    getAnswerValue(answers, 'structure_equipe', 'nb_freelance_ponctuels', 0));
  const benevoles = 0;
  const effectif_total = tp + tpar + freelance + benevoles;
  const ratio_tp = effectif_total > 0 ? (tp / effectif_total) * 100 : 0;

  // Coûts RH
  const ms_annuelle = ch.masse_salariale_total;
  const ms_mensuelle = ms_annuelle / 12;
  const cout_moyen_coach = nb_coaches > 0 ? ms_annuelle / nb_coaches : 0;
  const heures_coaching_par_coach = 20; // estimation standard
  const cout_coach_heure = heures_coaching_par_coach > 0 && nb_coaches > 0 ?
    cout_moyen_coach / (heures_coaching_par_coach * 52) : 0;
  const total_cours_semaine = getAnswerValue(answers, 'structure_planning', 'nb_cours_lundi', 0) +
    getAnswerValue(answers, 'structure_planning', 'nb_cours_mardi', 0) +
    getAnswerValue(answers, 'structure_planning', 'nb_cours_mercredi', 0) +
    getAnswerValue(answers, 'structure_planning', 'nb_cours_jeudi', 0) +
    getAnswerValue(answers, 'structure_planning', 'nb_cours_vendredi', 0) +
    getAnswerValue(answers, 'structure_planning', 'nb_cours_samedi', 0) +
    getAnswerValue(answers, 'structure_planning', 'nb_cours_dimanche', 0);
  const seances_mois = total_cours_semaine * 4.33;
  const cout_coach_seance = seances_mois > 0 ? ms_mensuelle / seances_mois : 0;
  const charges_sociales = ch.charges_sociales_patronales + ch.cotisations_sociales_tns;
  const ca_total = rev.ca_total;
  const ratio_ms_ca = ca_total > 0 ? (ms_annuelle / ca_total) * 100 : 0;

  // Certifications
  const l1 = rh.coaches_cf_l1 || getAnswerValue(answers, 'certifications', 'nb_coachs_cf_level_1', 0);
  const l2 = rh.coaches_cf_l2 || getAnswerValue(answers, 'certifications', 'nb_coachs_cf_level_2', 0);
  const l3 = rh.coaches_cf_l3 || getAnswerValue(answers, 'certifications', 'nb_coachs_cf_level_3', 0);
  const l4 = rh.coaches_cf_l4 || getAnswerValue(answers, 'certifications', 'nb_coachs_cf_level_4', 0);
  const haltero = getAnswerValue(answers, 'certifications', 'nb_coachs_weightlifting', 0);
  const gymnastics = getAnswerValue(answers, 'certifications', 'nb_coachs_gymnastics', 0);
  const nutrition = getAnswerValue(answers, 'certifications', 'nb_coachs_nutrition', 0);

  // Score qualifications: pondéré L1=25, L2=50, L3=80, L4=100
  const score_qual = nb_coaches > 0 ?
    ((l1 * 25 + l2 * 50 + l3 * 80 + l4 * 100) / (nb_coaches * 100)) * 100 : 0;
  const taux_certif_avancee = nb_coaches > 0 ? ((l2 + l3 + l4) / nb_coaches) * 100 : 0;

  // Formation
  const budget_formation = rh.budget_formation_annuel || getAnswerValue(answers, 'formation_developpement', 'budget_formation_annuel', 0);
  const budget_par_coach = nb_coaches > 0 ? budget_formation / nb_coaches : 0;
  const heures_formation = rh.heures_formation_coach_an;
  const formations_suivies = getAnswerValue(answers, 'formation_developpement', 'nb_formations_12m', 0);
  const taux_participation_formation = nb_coaches > 0 ? Math.min(100, (formations_suivies / nb_coaches) * 100) : 0;

  // Organisation
  const seances_par_coach = nb_coaches > 0 ? total_cours_semaine / nb_coaches : 0;
  const nb_membres = data.membres.nb_membres_actifs_total;
  const membres_par_coach = nb_coaches > 0 ? nb_membres / nb_coaches : 0;
  const charge_travail = seances_par_coach > 25 ? 30 : seances_par_coach > 20 ? 50 :
    seances_par_coach > 15 ? 70 : seances_par_coach > 10 ? 85 : 95;
  const utilisation_capacite = seances_par_coach > 0 ? Math.min(100, (seances_par_coach / 25) * 100) : 0;

  // Turnover
  const anciennete = rh.anciennete_moyenne_coaches_mois || getAnswerValue(answers, 'turnover_stabilite', 'anciennete_moyenne_coachs', 0);
  const departs = getAnswerValue(answers, 'turnover_stabilite', 'nb_departs_coachs_12m', 0);
  const arrivees = getAnswerValue(answers, 'turnover_stabilite', 'nb_arrivees_coachs_12m', 0);
  const turnover = nb_coaches > 0 ? (departs / nb_coaches) * 100 : 0;
  const retention_coaches = 100 - turnover;
  const stabilite_score = turnover <= 10 ? 90 : turnover <= 20 ? 70 : turnover <= 30 ? 50 : 30;

  // Satisfaction (estimations)
  const satisfaction_coaches = 7; // par défaut
  const engagement_coaches = 70;
  const absenteisme = 3;
  const recommandation_employeur = 70;

  // Qualité coaching
  const note_qualite = getAnswerValue(answers, 'qualite_coaching', 'note_qualite_coaching', 0);
  const nps_coaching = rh.nps_coaching;
  const satisfaction_coaching = rh.satisfaction_coaching_10;
  const plaintes = 0;
  const ratio_certifie = nb_coaches > 0 ? ((l1 + l2 + l3 + l4) / nb_coaches) * 100 : 0;

  // Productivité commerciale
  const ca_par_coach = nb_coaches > 0 ? ca_total / nb_coaches : 0;
  const resultat = data.finance.resultat.resultat_net;
  const marge_par_coach = nb_coaches > 0 ? resultat / nb_coaches : 0;
  const nouveaux_mois = getAnswerValue(answers, 'acquisition_conversion', 'nb_conversions_mois_actuel', 0);
  const nouveaux_par_coach = nb_coaches > 0 ? nouveaux_mois / nb_coaches : 0;
  const essais = getAnswerValue(answers, 'acquisition_conversion', 'nb_essais_mois_actuel', 0);
  const conversion_par_coach = essais > 0 ? (nouveaux_mois / essais) * 100 : 0;

  // Communication
  const reunions_regulieres = getAnswerValue(answers, 'organisation', 'reunions_equipe_regulieres', false);
  const freq_reunions = reunions_regulieres ? 4 : 0; // estimation mensuelle si oui
  const score_culture = reunions_regulieres ? 70 : 40;
  const cohesion = reunions_regulieres ? 75 : 50;

  // Taux externalisation
  const taux_externalisation = effectif_total > 0 ? (freelance / effectif_total) * 100 : 0;

  // Certifications moyennes par coach
  const total_certifs = l1 + l2 + l3 + l4 + haltero + gymnastics + nutrition +
    getAnswerValue(answers, 'certifications', 'nb_coachs_hyrox_certified', 0) +
    getAnswerValue(answers, 'certifications', 'nb_coachs_bpjeps', 0) +
    getAnswerValue(answers, 'certifications', 'nb_coachs_staps', 0);
  const certif_par_coach = nb_coaches > 0 ? total_certifs / nb_coaches : 0;

  // Double coaching
  const double_coaching = getAnswerValue(answers, 'qualite_coaching', 'double_coaching', false);
  const nb_double = getAnswerValue(answers, 'qualite_coaching', 'nb_cours_double_coaching', 0);
  const taux_double = total_cours_semaine > 0 && double_coaching ? (nb_double / total_cours_semaine) * 100 : 0;

  return {
    audit_id: '',
    effectif_total,
    nombre_coaches: nb_coaches,
    nombre_salaries_temps_plein: tp,
    nombre_salaries_temps_partiel: tpar,
    nombre_auto_entrepreneurs: freelance,
    nombre_benevoles_associes: benevoles,
    ratio_temps_plein_pct: ratio_tp,
    masse_salariale_annuelle: ms_annuelle,
    masse_salariale_mensuelle: ms_mensuelle,
    cout_moyen_coach_annuel: cout_moyen_coach,
    cout_coach_par_heure: cout_coach_heure,
    cout_coach_par_seance: cout_coach_seance,
    charges_sociales_annuelles: charges_sociales,
    ratio_masse_salariale_ca_pct: ratio_ms_ca,
    coaches_cf_l1: l1,
    coaches_cf_l2: l2,
    coaches_cf_l3: l3,
    coaches_cf_l4: l4,
    coaches_haltero_certifies: haltero,
    coaches_gymnastics_certifies: gymnastics,
    coaches_nutrition_certifies: nutrition,
    score_qualifications_moyen: score_qual,
    taux_certification_avancee_pct: taux_certif_avancee,
    budget_formation_annuel: budget_formation,
    budget_formation_par_coach: budget_par_coach,
    heures_formation_par_coach_an: heures_formation,
    formations_suivies_annee: formations_suivies,
    taux_participation_formation_pct: taux_participation_formation,
    heures_coaching_hebdo_par_coach: heures_coaching_par_coach,
    seances_hebdo_par_coach: seances_par_coach,
    membres_par_coach_ratio: membres_par_coach,
    charge_travail_score: charge_travail,
    taux_utilisation_capacite_pct: utilisation_capacite,
    anciennete_moyenne_coaches_mois: anciennete,
    taux_turnover_annuel_pct: turnover,
    departs_annee: departs,
    arrivees_annee: arrivees,
    taux_retention_coaches_pct: retention_coaches,
    stabilite_equipe_score: stabilite_score,
    satisfaction_coaches_score: satisfaction_coaches,
    engagement_coaches_score: engagement_coaches,
    taux_absenteisme_pct: absenteisme,
    taux_recommandation_employeur_pct: recommandation_employeur,
    evaluation_qualite_coaching: note_qualite || satisfaction_coaching,
    nps_coaching,
    taux_satisfaction_membres_coaching_pct: satisfaction_coaching > 0 ? satisfaction_coaching * 10 : 0,
    plaintes_coaching_mois: plaintes,
    ratio_coach_certifie_pct: ratio_certifie,
    ca_par_coach_annuel: ca_par_coach,
    marge_par_coach_annuel: marge_par_coach,
    nouveaux_membres_par_coach_mois: nouveaux_par_coach,
    taux_conversion_essais_par_coach_pct: conversion_par_coach,
    frequence_reunions_equipe_mois: freq_reunions,
    utilisation_outils_com_pct: 60,
    score_culture_entreprise: score_culture,
    taux_cohesion_equipe_pct: cohesion,
    taux_externalisation_pct: taux_externalisation,
    nb_certifications_moyennes_par_coach: certif_par_coach,
    taux_double_coaching_pct: taux_double,
    computed_at: new Date().toISOString(),
    periode_analyse: new Date().getFullYear().toString()
  };
}

/**
 * Calcule le score de santé financière /100.
 * Pondération : Rentabilité (40 pts), Trésorerie (30 pts), Structure (30 pts)
 */
export function calculateFinancialHealthScore(financialKPIs: AdvancedFinancialKPIs): {
  score: number;
  rentabilite: { score: number; marge_ebitda_score: number; marge_nette_score: number };
  tresorerie: { score: number; jours_tresorerie_score: number; ratio_liquidite_score: number };
  structure: { score: number; ratio_loyer_score: number; ratio_ms_score: number; ratio_endettement_score: number };
} {
  // === RENTABILITÉ (40 pts) ===
  const marge_ebitda_score = scoreFromMinBrackets(financialKPIs.marge_ebitda_pct, HEALTH_EBITDA_BRACKETS, HEALTH_EBITDA_FALLBACK);
  const marge_nette_score = scoreFromMinBrackets(financialKPIs.marge_nette_pct, HEALTH_MARGE_NETTE_BRACKETS, HEALTH_MARGE_NETTE_FALLBACK);
  const rentabilite_score = marge_ebitda_score + marge_nette_score;

  // === TRÉSORERIE (30 pts) ===
  const jours_tresorerie_score = scoreFromMinBrackets(financialKPIs.jours_tresorerie, HEALTH_JOURS_TRESORERIE_BRACKETS, HEALTH_JOURS_TRESORERIE_FALLBACK);
  const ratio_liquidite_score = scoreFromMinBrackets(financialKPIs.ratio_liquidite_generale, HEALTH_LIQUIDITE_BRACKETS, HEALTH_LIQUIDITE_FALLBACK);
  const tresorerie_score = jours_tresorerie_score + ratio_liquidite_score;

  // === STRUCTURE (30 pts) ===
  const ratio_loyer_score = scoreFromMaxBrackets(financialKPIs.ratio_loyer_ca_pct, HEALTH_LOYER_BRACKETS, HEALTH_LOYER_FALLBACK);
  const ratio_ms_score = scoreFromRangeBrackets(financialKPIs.ratio_masse_salariale_ca_pct, HEALTH_MS_BRACKETS, HEALTH_MS_FALLBACK);
  const ratio_endettement_score = scoreFromMaxBrackets(financialKPIs.ratio_endettement_pct, HEALTH_ENDETTEMENT_BRACKETS, HEALTH_ENDETTEMENT_FALLBACK);
  const structure_score = ratio_loyer_score + ratio_ms_score + ratio_endettement_score;

  const total = rentabilite_score + tresorerie_score + structure_score;

  return {
    score: clamp(total, 0, 100),
    rentabilite: { score: rentabilite_score, marge_ebitda_score, marge_nette_score },
    tresorerie: { score: tresorerie_score, jours_tresorerie_score, ratio_liquidite_score },
    structure: { score: structure_score, ratio_loyer_score, ratio_ms_score, ratio_endettement_score }
  };
}

/**
 * Génère une heat map de l'occupation par tranche horaire et par jour.
 * Retourne une matrice avec niveaux : saturé (>90%), bon (60-90%), moyen (30-60%), faible (<30%)
 */
export function generateScheduleHeatMap(answers: Answer[]): {
  timeSlots: string[];
  days: string[];
  data: Array<{ day: string; slot: string; value: number; level: 'saturé' | 'bon' | 'moyen' | 'faible' }>;
} {
  const timeSlots = ['6h-9h', '9h-12h', '12h-14h', '14h-17h', '17h-19h', '19h-21h'];
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Get global occupation rates by time slot
  const occ_6_9 = getAnswerValue(answers, 'capacite_occupation', 'occupation_6h_9h', 0);
  const occ_9_12 = getAnswerValue(answers, 'capacite_occupation', 'occupation_9h_12h', 0);
  const occ_12_14 = getAnswerValue(answers, 'capacite_occupation', 'occupation_12h_14h', 0);
  const occ_14_17 = getAnswerValue(answers, 'capacite_occupation', 'occupation_14h_17h', 0);
  const occ_17_19 = getAnswerValue(answers, 'capacite_occupation', 'occupation_17h_19h', 0);
  const occ_19_21 = getAnswerValue(answers, 'capacite_occupation', 'occupation_19h_21h', 0);

  const slotValues = [occ_6_9, occ_9_12, occ_12_14, occ_14_17, occ_17_19, occ_19_21];

  // Get courses per day for weighting
  const coursesPerDay = days.map((_, i) => {
    const dayNames = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    return getAnswerValue(answers, 'structure_planning', `nb_cours_${dayNames[i]}`, 0) as number;
  });
  const maxCourses = Math.max(...coursesPerDay, 1);

  const getLevel = (value: number): 'saturé' | 'bon' | 'moyen' | 'faible' => {
    if (value > 90) return 'saturé';
    if (value >= 60) return 'bon';
    if (value >= 30) return 'moyen';
    return 'faible';
  };

  const heatData: Array<{ day: string; slot: string; value: number; level: 'saturé' | 'bon' | 'moyen' | 'faible' }> = [];

  for (let d = 0; d < days.length; d++) {
    const dayFactor = coursesPerDay[d] / maxCourses;
    for (let s = 0; s < timeSlots.length; s++) {
      // Weekend has different patterns
      const isWeekend = d >= 5;
      let value = slotValues[s] * dayFactor;
      if (isWeekend) {
        // Weekend: more morning activity, less evening
        if (s <= 2) value *= 1.1;
        else value *= 0.7;
      }
      value = clamp(value, 0, 100);
      heatData.push({ day: days[d], slot: timeSlots[s], value: Math.round(value), level: getLevel(value) });
    }
  }

  return { timeSlots, days, data: heatData };
}

/**
 * Analyse le risque de churn basé sur plusieurs facteurs.
 * Retourne un scoring et des actions recommandées.
 */
export function analyzeChurnRisk(answers: Answer[]): {
  risk_level: 'faible' | 'modéré' | 'élevé' | 'critique';
  risk_score: number;
  factors: Array<{ name: string; score: number; impact: string }>;
  actions: string[];
} {
  const data = extractAllData(answers);
  const factors: Array<{ name: string; score: number; impact: string }> = [];

  // Factor 1: Churn rate
  const churn = data.operations.taux_churn_pct;
  let churnScore = 0;
  if (churn > 8) churnScore = 30;
  else if (churn > 5) churnScore = 20;
  else if (churn > 3) churnScore = 10;
  else churnScore = 0;
  factors.push({ name: 'Taux de churn mensuel', score: churnScore, impact: `${churn.toFixed(1)}%` });

  // Factor 2: Fréquentation
  const frequentation = getAnswerValue(answers, 'engagement_satisfaction', 'frequentation_moyenne_semaine', 0);
  let freqScore = 0;
  if (frequentation < 1) freqScore = 25;
  else if (frequentation < 2) freqScore = 15;
  else if (frequentation < 3) freqScore = 5;
  else freqScore = 0;
  factors.push({ name: 'Fréquentation moyenne', score: freqScore, impact: `${frequentation} séances/sem` });

  // Factor 3: Inactivité
  const inactifs = getAnswerValue(answers, 'engagement_satisfaction', 'nb_membres_inactifs_30j', 0);
  const total = data.membres.nb_membres_actifs_total;
  const pctInactifs = total > 0 ? (inactifs / total) * 100 : 0;
  let inactifScore = 0;
  if (pctInactifs > 20) inactifScore = 20;
  else if (pctInactifs > 10) inactifScore = 12;
  else if (pctInactifs > 5) inactifScore = 5;
  else inactifScore = 0;
  factors.push({ name: 'Membres inactifs >30j', score: inactifScore, impact: `${pctInactifs.toFixed(0)}%` });

  // Factor 4: NPS
  const nps = getAnswerValue(answers, 'engagement_satisfaction', 'nps_score', 0);
  let npsScore = 0;
  if (nps < 0) npsScore = 15;
  else if (nps < 20) npsScore = 10;
  else if (nps < 40) npsScore = 5;
  else npsScore = 0;
  factors.push({ name: 'NPS Score', score: npsScore, impact: `${nps}` });

  // Factor 5: % sans engagement
  const sansEngagement = data.membres.nb_membres_sans_engagement;
  const pctSansEngagement = total > 0 ? (sansEngagement / total) * 100 : 0;
  let engagementScore = 0;
  if (pctSansEngagement > 50) engagementScore = 10;
  else if (pctSansEngagement > 30) engagementScore = 5;
  else engagementScore = 0;
  factors.push({ name: '% sans engagement', score: engagementScore, impact: `${pctSansEngagement.toFixed(0)}%` });

  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
  const risk_level = totalScore >= 60 ? 'critique' : totalScore >= 40 ? 'élevé' :
    totalScore >= 20 ? 'modéré' : 'faible';

  // Actions recommandées
  const actions: string[] = [];
  if (churnScore >= 20) actions.push('Mettre en place un programme de rétention avec suivi personnalisé des membres à risque');
  if (freqScore >= 15) actions.push('Lancer des challenges et programmes de fidélisation pour augmenter la fréquentation');
  if (inactifScore >= 12) actions.push('Contacter les membres inactifs avec des offres de réactivation');
  if (npsScore >= 10) actions.push('Réaliser des enquêtes de satisfaction et adresser les points d\'insatisfaction');
  if (engagementScore >= 5) actions.push('Proposer des offres d\'engagement avec avantages (réduction, services inclus)');
  if (actions.length === 0) actions.push('Maintenir les actions de fidélisation actuelles et suivre les indicateurs mensuellement');

  return { risk_level, risk_score: clamp(totalScore, 0, 100), factors, actions };
}

/**
 * Calcule le positionnement tarifaire de la salle.
 * Compare les prix vs la zone de marché et positionne dans une matrice qualité/prix.
 */
export function calculatePricingPosition(answers: Answer[]): {
  position: 'P1' | 'P2' | 'P3' | 'P4';
  position_label: string;
  prix_moyen_salle: number;
  prix_moyen_zone: number;
  ecart_pct: number;
  qualite_score: number;
  recommandation: string;
} {
  const data = extractAllData(answers);

  // Prix moyen de la salle (tarif illimité sans engagement)
  const prix_illimite = getAnswerValue(answers, 'tarification_detaillee', 'prix_illimite_sans_engagement', 0);
  const prix_3x = getAnswerValue(answers, 'tarification_detaillee', 'prix_3x_semaine', 0);
  const prix_salle = prix_illimite || prix_3x || data.membres.arpm;

  // Prix zone de marché (estimation basée sur la zone)
  const zone = getAnswerValue(answers, 'localisation', 'revenus_moyens_zone', '');
  let prix_zone = 150; // défaut standard
  if (typeof zone === 'string') {
    if (zone.includes('Très élevés')) prix_zone = 200;
    else if (zone.includes('Élevés')) prix_zone = 180;
    else if (zone.includes('Moyens')) prix_zone = 150;
    else if (zone.includes('Faibles')) prix_zone = 120;
  }

  const ecart = prix_zone > 0 ? ((prix_salle - prix_zone) / prix_zone) * 100 : 0;

  // Score qualité (basé sur certifications, équipement, satisfaction)
  const note_google = getAnswerValue(answers, 'engagement_satisfaction', 'note_moyenne_google', 0);
  const nps = getAnswerValue(answers, 'engagement_satisfaction', 'nps_score', 0);
  const etat_materiel = getAnswerValue(answers, 'infrastructure_detaillee', 'etat_general_materiel', '');
  const certif_score = data.rh.coaches_cf_l2 + data.rh.coaches_cf_l3 * 2 + data.rh.coaches_cf_l4 * 3;

  let qualite_score = 50;
  if (note_google >= 4.5) qualite_score += 15;
  else if (note_google >= 4) qualite_score += 10;
  else if (note_google >= 3.5) qualite_score += 5;

  if (nps >= 50) qualite_score += 15;
  else if (nps >= 30) qualite_score += 10;
  else if (nps >= 10) qualite_score += 5;

  if (typeof etat_materiel === 'string') {
    if (etat_materiel === 'Excellent') qualite_score += 10;
    else if (etat_materiel === 'Bon') qualite_score += 7;
    else if (etat_materiel === 'Moyen') qualite_score += 3;
  }

  if (certif_score >= 5) qualite_score += 10;
  else if (certif_score >= 3) qualite_score += 5;

  qualite_score = clamp(qualite_score, 0, 100);

  // Matrice qualité/prix
  // P1: Qualité haute + Prix élevé (premium justifié)
  // P2: Qualité haute + Prix bas (excellente valeur)
  // P3: Qualité basse + Prix bas (entrée de gamme)
  // P4: Qualité basse + Prix élevé (danger)
  const qualiteHaute = qualite_score >= 60;
  const prixElevé = ecart >= 0; // au-dessus de la moyenne zone

  let position: 'P1' | 'P2' | 'P3' | 'P4';
  let position_label: string;
  let recommandation: string;

  if (qualiteHaute && prixElevé) {
    position = 'P1';
    position_label = 'Premium justifié';
    recommandation = 'Votre positionnement premium est cohérent avec votre qualité. Maintenez et communiquez sur votre valeur ajoutée.';
  } else if (qualiteHaute && !prixElevé) {
    position = 'P2';
    position_label = 'Excellente valeur';
    recommandation = 'Votre qualité est supérieure à votre prix. Envisagez une augmentation tarifaire progressive pour mieux valoriser votre offre.';
  } else if (!qualiteHaute && !prixElevé) {
    position = 'P3';
    position_label = 'Entrée de gamme';
    recommandation = 'Investissez dans la qualité (certifications, équipement) pour monter en gamme, ou assumez un positionnement accessible.';
  } else {
    position = 'P4';
    position_label = 'Prix élevé / Qualité insuffisante';
    recommandation = 'Attention: vos prix sont élevés mais la qualité perçue est insuffisante. Améliorez rapidement l\'expérience client ou ajustez vos tarifs.';
  }

  return {
    position,
    position_label,
    prix_moyen_salle: prix_salle,
    prix_moyen_zone: prix_zone,
    ecart_pct: ecart,
    qualite_score,
    recommandation
  };
}
