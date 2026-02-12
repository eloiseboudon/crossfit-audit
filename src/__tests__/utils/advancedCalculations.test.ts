import { describe, expect, it } from 'vitest';
import {
  calculateKPIs,
  calculateScores,
  calculateAdvancedFinancialKPIs,
  calculateAdvancedClientKPIs,
  calculateAdvancedOperationalKPIs,
  calculateAdvancedHRKPIs,
  calculateFinancialHealthScore,
  generateScheduleHeatMap,
  analyzeChurnRisk,
  calculatePricingPosition
} from '../../lib/calculations';
import type { Answer, AdvancedFinancialKPIs } from '../../lib/types';

// ===========================================================================
// Helpers — données réalistes simulant la base de données (valeurs string)
// ===========================================================================

function makeStringAnswer(blockCode: string, questionCode: string, value: string): Answer {
  return { id: '1', audit_id: 'a1', block_code: blockCode, question_code: questionCode, value, created_at: '', updated_at: '' };
}

/** Jeu de données réaliste d'une box CrossFit (toutes les valeurs en string comme en DB) */
function buildRealisticAnswers(): Answer[] {
  return [
    // Produits d'exploitation
    makeStringAnswer('produits_exploitation', 'ca_abonnements_mensuels', '9500'),
    makeStringAnswer('produits_exploitation', 'ca_abonnements_trimestriels', '2800'),
    makeStringAnswer('produits_exploitation', 'ca_abonnements_semestriels', '1500'),
    makeStringAnswer('produits_exploitation', 'ca_abonnements_annuels', '3000'),
    makeStringAnswer('produits_exploitation', 'ca_cartes_10', '800'),
    makeStringAnswer('produits_exploitation', 'ca_cartes_20', '400'),
    makeStringAnswer('produits_exploitation', 'ca_seances_unitaires', '300'),
    makeStringAnswer('produits_exploitation', 'ca_personal_training', '1200'),
    makeStringAnswer('produits_exploitation', 'ca_coaching_nutrition', '350'),
    makeStringAnswer('produits_exploitation', 'ca_boissons_snacks', '300'),
    makeStringAnswer('produits_exploitation', 'ca_merchandising_vetements', '400'),
    makeStringAnswer('produits_exploitation', 'ca_partenariats', '200'),
    // Charges (utilisant les codes exacts de extractData.ts)
    makeStringAnswer('charges_exploitation', 'loyer_mensuel_ht', '2200'),
    makeStringAnswer('charges_exploitation', 'charges_locatives_mensuelles', '350'),
    makeStringAnswer('charges_exploitation', 'taxe_fonciere', '1800'),
    makeStringAnswer('charges_exploitation', 'electricite_annuel', '4200'),
    makeStringAnswer('charges_exploitation', 'eau_annuel', '800'),
    makeStringAnswer('charges_exploitation', 'gaz_chauffage_annuel', '1200'),
    makeStringAnswer('charges_exploitation', 'google_ads', '2000'),
    makeStringAnswer('charges_exploitation', 'facebook_instagram_ads', '2500'),
    makeStringAnswer('charges_exploitation', 'publicite_locale', '1500'),
    makeStringAnswer('charges_exploitation', 'salaires_bruts_gerant', '3000'),
    makeStringAnswer('charges_exploitation', 'salaires_bruts_coachs', '7500'),
    makeStringAnswer('charges_exploitation', 'salaires_bruts_administratif', '1800'),
    makeStringAnswer('charges_exploitation', 'charges_sociales_patronales', '5500'),
    makeStringAnswer('charges_exploitation', 'charges_freelance', '1200'),
    makeStringAnswer('charges_exploitation', 'assurance_rc_pro', '1200'),
    makeStringAnswer('charges_exploitation', 'assurance_locaux', '1800'),
    makeStringAnswer('charges_exploitation', 'honoraires_comptable', '3600'),
    makeStringAnswer('charges_exploitation', 'affiliation_crossfit_annuel', '3500'),
    makeStringAnswer('charges_exploitation', 'telephone_internet', '1200'),
    makeStringAnswer('charges_exploitation', 'logiciel_planning', '1800'),
    makeStringAnswer('charges_exploitation', 'entretien_locaux', '2400'),
    makeStringAnswer('charges_exploitation', 'frais_bancaires', '800'),
    makeStringAnswer('charges_exploitation', 'interets_emprunts', '2400'),
    // Trésorerie
    makeStringAnswer('resultat_tresorerie', 'tresorerie_actuelle', '25000'),
    makeStringAnswer('resultat_tresorerie', 'emprunts_capital_restant', '45000'),
    makeStringAnswer('resultat_tresorerie', 'echeance_mensuelle_emprunts', '1500'),
    // Membres
    makeStringAnswer('structure_base', 'nb_membres_actifs_total', '165'),
    makeStringAnswer('structure_base', 'nb_membres_illimite', '110'),
    makeStringAnswer('structure_base', 'nb_membres_3x_semaine', '30'),
    makeStringAnswer('structure_base', 'nb_membres_cartes_10', '15'),
    makeStringAnswer('structure_base', 'nb_membres_cartes_20', '5'),
    makeStringAnswer('structure_base', 'nb_membres_sans_engagement', '40'),
    // Tarification
    makeStringAnswer('tarification_detaillee', 'prix_illimite_sans_engagement', '159'),
    makeStringAnswer('tarification_detaillee', 'prix_3x_semaine', '129'),
    // Acquisition
    makeStringAnswer('acquisition_conversion', 'essais_gratuits_mois', '22'),
    makeStringAnswer('acquisition_conversion', 'conversions_essai_abonne_mois', '12'),
    makeStringAnswer('acquisition_conversion', 'cout_acquisition_membre', '45'),
    // Rétention
    makeStringAnswer('retention_churn', 'resiliations_mensuelles', '5'),
    makeStringAnswer('retention_churn', 'anciennes_moyens_mois', '18'),
    // Engagement
    makeStringAnswer('engagement_satisfaction', 'frequentation_moyenne_semaine', '3.2'),
    makeStringAnswer('engagement_satisfaction', 'nps_score', '42'),
    makeStringAnswer('engagement_satisfaction', 'note_moyenne_google', '4.6'),
    makeStringAnswer('engagement_satisfaction', 'nb_avis_google', '120'),
    // Infrastructure
    makeStringAnswer('infrastructure_detaillee', 'surface_totale', '450'),
    makeStringAnswer('infrastructure_detaillee', 'surface_crossfit', '350'),
    makeStringAnswer('infrastructure_detaillee', 'age_moyen_materiel', '3'),
    makeStringAnswer('infrastructure_detaillee', 'valeur_materiel_total', '80000'),
    // Planning
    makeStringAnswer('structure_planning', 'nb_cours_lundi', '6'),
    makeStringAnswer('structure_planning', 'nb_cours_mardi', '6'),
    makeStringAnswer('structure_planning', 'nb_cours_mercredi', '6'),
    makeStringAnswer('structure_planning', 'nb_cours_jeudi', '6'),
    makeStringAnswer('structure_planning', 'nb_cours_vendredi', '6'),
    makeStringAnswer('structure_planning', 'nb_cours_samedi', '4'),
    makeStringAnswer('structure_planning', 'nb_cours_dimanche', '1'),
    // Occupation
    makeStringAnswer('capacite_occupation', 'capacite_max_cours', '20'),
    makeStringAnswer('capacite_occupation', 'participants_moyen_cours', '14'),
    makeStringAnswer('capacite_occupation', 'nb_cours_complets_semaine', '8'),
    makeStringAnswer('capacite_occupation', 'occupation_6h_9h', '55'),
    makeStringAnswer('capacite_occupation', 'occupation_9h_12h', '40'),
    makeStringAnswer('capacite_occupation', 'occupation_12h_14h', '85'),
    makeStringAnswer('capacite_occupation', 'occupation_14h_17h', '25'),
    makeStringAnswer('capacite_occupation', 'occupation_17h_19h', '92'),
    makeStringAnswer('capacite_occupation', 'occupation_19h_21h', '60'),
    // RH
    makeStringAnswer('structure_equipe', 'nombre_coaches', '5'),
    makeStringAnswer('structure_equipe', 'coaches_temps_plein', '3'),
    makeStringAnswer('structure_equipe', 'coaches_temps_partiel', '1'),
    makeStringAnswer('structure_equipe', 'coaches_freelance', '1'),
    makeStringAnswer('certifications', 'coaches_cf_l1', '5'),
    makeStringAnswer('certifications', 'coaches_cf_l2', '3'),
    makeStringAnswer('certifications', 'coaches_cf_l3', '1'),
    makeStringAnswer('formation_developpement', 'budget_formation_annuel', '4500'),
    makeStringAnswer('turnover_stabilite', 'nb_departs_coachs_12m', '1'),
    makeStringAnswer('turnover_stabilite', 'anciennete_moyenne_coachs', '30'),
  ];
}

/** Helper: vérifie qu'un objet n'a que des nombres finis pour ses propriétés numériques */
function expectAllNumericFieldsFinite(obj: Record<string, unknown>, label: string) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'number') {
      expect(Number.isFinite(value), `${label}.${key} devrait être un nombre fini, reçu: ${value}`).toBe(true);
    }
  }
}

// ===========================================================================
// calculateKPIs — KPIs de base
// ===========================================================================
describe('calculateKPIs', () => {
  it('retourne des KPIs cohérents avec des valeurs string réalistes', () => {
    const answers = buildRealisticAnswers();
    const kpis = calculateKPIs(answers);

    // Tous les KPIs sont des nombres finis
    expectAllNumericFieldsFinite(kpis as unknown as Record<string, unknown>, 'kpis');

    // CA total raisonnable (entre 5k et 500k pour une box)
    expect(kpis.ca_total_12m).toBeGreaterThan(5000);
    expect(kpis.ca_total_12m).toBeLessThan(500000);

    // ARPM raisonnable (entre 10 et 500€)
    expect(kpis.arpm).toBeGreaterThan(10);
    expect(kpis.arpm).toBeLessThan(500);

    // Pourcentages entre 0 et 100
    expect(kpis.pourcent_recurrent).toBeGreaterThanOrEqual(0);
    expect(kpis.pourcent_recurrent).toBeLessThanOrEqual(100);
    expect(kpis.churn_mensuel).toBeGreaterThanOrEqual(0);
    expect(kpis.churn_mensuel).toBeLessThanOrEqual(100);
    expect(kpis.conversion_essai).toBeGreaterThanOrEqual(0);
    expect(kpis.conversion_essai).toBeLessThanOrEqual(100);
    expect(kpis.occupation_moyenne).toBeGreaterThanOrEqual(0);
    expect(kpis.occupation_moyenne).toBeLessThanOrEqual(100);
  });

  it('retourne des zéros cohérents avec un tableau vide', () => {
    const kpis = calculateKPIs([]);

    expectAllNumericFieldsFinite(kpis as unknown as Record<string, unknown>, 'kpis_empty');
    expect(kpis.ca_total_12m).toBe(0);
    expect(kpis.arpm).toBe(0);
    expect(kpis.marge_ebitda).toBe(0);
  });

  it('les relations entre KPIs sont cohérentes', () => {
    const answers = buildRealisticAnswers();
    const kpis = calculateKPIs(answers);

    // CA récurrent <= CA total
    expect(kpis.ca_recurrent_12m).toBeLessThanOrEqual(kpis.ca_total_12m);

    // EBITDA doit être un nombre fini
    expect(Number.isFinite(kpis.ebitda_estime)).toBe(true);
  });
});

// ===========================================================================
// calculateScores — scoring par pilier
// ===========================================================================
describe('calculateScores (cohérence)', () => {
  it('les scores sont toujours entre 0 et 100 avec des données réalistes', () => {
    const answers = buildRealisticAnswers();
    const kpis = calculateKPIs(answers);
    const { scores, globalScore } = calculateScores(kpis);

    scores.forEach((s) => {
      expect(s.score, `Score ${s.code} hors bornes`).toBeGreaterThanOrEqual(0);
      expect(s.score, `Score ${s.code} hors bornes`).toBeLessThanOrEqual(100);
    });
    expect(globalScore).toBeGreaterThanOrEqual(0);
    expect(globalScore).toBeLessThanOrEqual(100);
  });

  it('les scores sont entre 0 et 100 même avec un tableau vide', () => {
    const kpis = calculateKPIs([]);
    const { scores, globalScore } = calculateScores(kpis);

    scores.forEach((s) => {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
    });
    expect(globalScore).toBeGreaterThanOrEqual(0);
    expect(globalScore).toBeLessThanOrEqual(100);
  });
});

// ===========================================================================
// calculateAdvancedFinancialKPIs
// ===========================================================================
describe('calculateAdvancedFinancialKPIs', () => {
  it('retourne un objet avec toutes les propriétés numériques finies', () => {
    const answers = buildRealisticAnswers();
    const kpis = calculateKPIs(answers);
    const result = calculateAdvancedFinancialKPIs(kpis, answers);

    expectAllNumericFieldsFinite(result as unknown as Record<string, unknown>, 'advFinKPIs');
  });

  it('le CA total est cohérent et raisonnable', () => {
    const answers = buildRealisticAnswers();
    const kpis = calculateKPIs(answers);
    const result = calculateAdvancedFinancialKPIs(kpis, answers);

    expect(result.ca_total_annuel).toBeGreaterThan(0);
    expect(result.ca_total_annuel).toBeLessThan(5000000);
    expect(typeof result.ca_total_annuel).toBe('number');
  });

  it('les ratios en pourcentage sont dans des bornes raisonnables', () => {
    const answers = buildRealisticAnswers();
    const kpis = calculateKPIs(answers);
    const result = calculateAdvancedFinancialKPIs(kpis, answers);

    expect(result.pct_ca_abonnements).toBeGreaterThanOrEqual(0);
    expect(result.pct_ca_abonnements).toBeLessThanOrEqual(100);
    expect(result.ratio_loyer_ca_pct).toBeGreaterThanOrEqual(0);
    expect(result.ratio_masse_salariale_ca_pct).toBeGreaterThanOrEqual(0);
  });

  it('fonctionne avec un tableau vide sans crash', () => {
    const kpis = calculateKPIs([]);
    const result = calculateAdvancedFinancialKPIs(kpis, []);

    expectAllNumericFieldsFinite(result as unknown as Record<string, unknown>, 'advFinKPIs_empty');
    expect(result.ca_total_annuel).toBe(0);
  });
});

// ===========================================================================
// calculateAdvancedClientKPIs
// ===========================================================================
describe('calculateAdvancedClientKPIs', () => {
  it('retourne un objet avec toutes les propriétés numériques finies', () => {
    const answers = buildRealisticAnswers();
    const result = calculateAdvancedClientKPIs(answers);

    expectAllNumericFieldsFinite(result as unknown as Record<string, unknown>, 'advClientKPIs');
  });

  it('les membres et pourcentages sont cohérents', () => {
    const answers = buildRealisticAnswers();
    const result = calculateAdvancedClientKPIs(answers);

    expect(result.membres_actifs_total).toBeGreaterThan(0);
    expect(result.taux_churn_mensuel_pct).toBeGreaterThanOrEqual(0);
    expect(result.taux_churn_mensuel_pct).toBeLessThanOrEqual(100);
    expect(result.taux_conversion_global_pct).toBeGreaterThanOrEqual(0);
    expect(result.taux_conversion_global_pct).toBeLessThanOrEqual(100);
  });

  it('fonctionne avec un tableau vide sans crash', () => {
    const result = calculateAdvancedClientKPIs([]);

    expectAllNumericFieldsFinite(result as unknown as Record<string, unknown>, 'advClientKPIs_empty');
  });
});

// ===========================================================================
// calculateAdvancedOperationalKPIs
// ===========================================================================
describe('calculateAdvancedOperationalKPIs', () => {
  it('retourne un objet avec toutes les propriétés numériques finies', () => {
    const answers = buildRealisticAnswers();
    const result = calculateAdvancedOperationalKPIs(answers);

    expectAllNumericFieldsFinite(result as unknown as Record<string, unknown>, 'advOpsKPIs');
  });

  it('les taux d\'occupation sont entre 0 et 100', () => {
    const answers = buildRealisticAnswers();
    const result = calculateAdvancedOperationalKPIs(answers);

    expect(result.taux_occupation_global_pct).toBeGreaterThanOrEqual(0);
    expect(result.taux_occupation_global_pct).toBeLessThanOrEqual(100);
  });

  it('les cours par semaine sont positifs', () => {
    const answers = buildRealisticAnswers();
    const result = calculateAdvancedOperationalKPIs(answers);

    expect(result.creneaux_semaine).toBeGreaterThan(0);
  });

  it('fonctionne avec un tableau vide sans crash', () => {
    const result = calculateAdvancedOperationalKPIs([]);

    expectAllNumericFieldsFinite(result as unknown as Record<string, unknown>, 'advOpsKPIs_empty');
  });
});

// ===========================================================================
// calculateAdvancedHRKPIs
// ===========================================================================
describe('calculateAdvancedHRKPIs', () => {
  it('retourne un objet avec toutes les propriétés numériques finies', () => {
    const answers = buildRealisticAnswers();
    const result = calculateAdvancedHRKPIs(answers);

    expectAllNumericFieldsFinite(result as unknown as Record<string, unknown>, 'advHRKPIs');
  });

  it('le nombre de coachs est positif', () => {
    const answers = buildRealisticAnswers();
    const result = calculateAdvancedHRKPIs(answers);

    expect(result.nombre_coaches).toBeGreaterThan(0);
  });

  it('les pourcentages sont entre 0 et 100', () => {
    const answers = buildRealisticAnswers();
    const result = calculateAdvancedHRKPIs(answers);

    // ratio_coach_certifie_pct peut dépasser 100% car un coach peut avoir plusieurs certifications
    expect(result.ratio_coach_certifie_pct).toBeGreaterThanOrEqual(0);
    expect(result.taux_turnover_annuel_pct).toBeGreaterThanOrEqual(0);
    expect(result.taux_turnover_annuel_pct).toBeLessThanOrEqual(100);
  });

  it('fonctionne avec un tableau vide sans crash', () => {
    const result = calculateAdvancedHRKPIs([]);

    expectAllNumericFieldsFinite(result as unknown as Record<string, unknown>, 'advHRKPIs_empty');
  });
});

// ===========================================================================
// calculateFinancialHealthScore
// ===========================================================================
describe('calculateFinancialHealthScore', () => {
  it('retourne un score entre 0 et 100', () => {
    const answers = buildRealisticAnswers();
    const kpis = calculateKPIs(answers);
    const advFin = calculateAdvancedFinancialKPIs(kpis, answers);
    const result = calculateFinancialHealthScore(advFin);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('les sous-scores respectent leurs bornes', () => {
    const answers = buildRealisticAnswers();
    const kpis = calculateKPIs(answers);
    const advFin = calculateAdvancedFinancialKPIs(kpis, answers);
    const result = calculateFinancialHealthScore(advFin);

    expect(result.rentabilite.score).toBeGreaterThanOrEqual(0);
    expect(result.rentabilite.score).toBeLessThanOrEqual(40);
    expect(result.tresorerie.score).toBeGreaterThanOrEqual(0);
    expect(result.tresorerie.score).toBeLessThanOrEqual(30);
    expect(result.structure.score).toBeGreaterThanOrEqual(0);
    expect(result.structure.score).toBeLessThanOrEqual(30);

    // Total = somme des sous-scores
    expect(result.score).toBe(result.rentabilite.score + result.tresorerie.score + result.structure.score);
  });

  it('retourne un score fini pour des KPIs vides', () => {
    const emptyFin = calculateAdvancedFinancialKPIs(calculateKPIs([]), []);
    const result = calculateFinancialHealthScore(emptyFin);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(Number.isFinite(result.score)).toBe(true);
  });
});

// ===========================================================================
// calculateFinancialHealthScore — edge cases
// ===========================================================================
describe('calculateFinancialHealthScore (edge cases)', () => {
  /** Helper : construit un AdvancedFinancialKPIs avec surcharges ciblées */
  function makeHealthKPIs(overrides: Partial<AdvancedFinancialKPIs> = {}): AdvancedFinancialKPIs {
    const base = calculateAdvancedFinancialKPIs(calculateKPIs([]), []);
    return { ...base, ...overrides };
  }

  it('all zeros → scores minimum non-négatifs', () => {
    const kpis = makeHealthKPIs({
      marge_ebitda_pct: 0,
      marge_nette_pct: 0,
      jours_tresorerie: 0,
      ratio_liquidite_generale: 0,
      ratio_loyer_ca_pct: 0,
      ratio_masse_salariale_ca_pct: 0,
      ratio_endettement_pct: 0,
    });
    const result = calculateFinancialHealthScore(kpis);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.rentabilite.marge_ebitda_score).toBe(5);
    expect(result.rentabilite.marge_nette_score).toBe(5);
    expect(result.tresorerie.jours_tresorerie_score).toBe(3);
    expect(result.tresorerie.ratio_liquidite_score).toBe(0);
    expect(result.structure.ratio_loyer_score).toBe(10);
    expect(result.structure.ratio_ms_score).toBe(2);
    expect(result.structure.ratio_endettement_score).toBe(10);
  });

  it('EBITDA et marge négatifs → score rentabilité = 0', () => {
    const kpis = makeHealthKPIs({
      marge_ebitda_pct: -10,
      marge_nette_pct: -5,
    });
    const result = calculateFinancialHealthScore(kpis);

    expect(result.rentabilite.marge_ebitda_score).toBe(0);
    expect(result.rentabilite.marge_nette_score).toBe(0);
    expect(result.rentabilite.score).toBe(0);
  });

  it('endettement > 100% → score endettement = 0', () => {
    const kpis = makeHealthKPIs({
      ratio_endettement_pct: 150,
    });
    const result = calculateFinancialHealthScore(kpis);

    expect(result.structure.ratio_endettement_score).toBe(0);
  });

  it('loyer > 25% → score loyer = 0', () => {
    const kpis = makeHealthKPIs({
      ratio_loyer_ca_pct: 30,
    });
    const result = calculateFinancialHealthScore(kpis);

    expect(result.structure.ratio_loyer_score).toBe(0);
  });

  it('valeurs parfaites → score = 100', () => {
    const kpis = makeHealthKPIs({
      marge_ebitda_pct: 30,
      marge_nette_pct: 20,
      jours_tresorerie: 120,
      ratio_liquidite_generale: 3,
      ratio_loyer_ca_pct: 10,
      ratio_masse_salariale_ca_pct: 35,
      ratio_endettement_pct: 20,
    });
    const result = calculateFinancialHealthScore(kpis);

    expect(result.score).toBe(100);
  });

  it('valeurs exactement aux bornes → score = 100', () => {
    const kpis = makeHealthKPIs({
      marge_ebitda_pct: 25,
      marge_nette_pct: 15,
      jours_tresorerie: 90,
      ratio_liquidite_generale: 2,
      ratio_loyer_ca_pct: 12,
      ratio_masse_salariale_ca_pct: 30,
      ratio_endettement_pct: 30,
    });
    const result = calculateFinancialHealthScore(kpis);

    expect(result.score).toBe(100);
  });
});

// ===========================================================================
// generateScheduleHeatMap
// ===========================================================================
describe('generateScheduleHeatMap', () => {
  it('retourne une matrice avec 6 créneaux et 7 jours', () => {
    const answers = buildRealisticAnswers();
    const result = generateScheduleHeatMap(answers);

    expect(result.timeSlots).toHaveLength(6);
    expect(result.days).toHaveLength(7);
    expect(result.data).toHaveLength(42); // 6 slots × 7 days

    const validLevels = ['saturé', 'bon', 'moyen', 'faible'];
    result.data.forEach((entry) => {
      expect(validLevels).toContain(entry.level);
      expect(Number.isFinite(entry.value)).toBe(true);
      expect(entry.value).toBeGreaterThanOrEqual(0);
    });
  });

  it('fonctionne avec un tableau vide', () => {
    const result = generateScheduleHeatMap([]);

    expect(result.timeSlots).toHaveLength(6);
    expect(result.days).toHaveLength(7);
    expect(result.data).toHaveLength(42);
  });
});

// ===========================================================================
// analyzeChurnRisk
// ===========================================================================
describe('analyzeChurnRisk', () => {
  it('retourne un niveau de risque valide', () => {
    const answers = buildRealisticAnswers();
    const result = analyzeChurnRisk(answers);

    const validLevels = ['faible', 'modéré', 'élevé', 'critique'];
    expect(validLevels).toContain(result.risk_level);
    expect(result.risk_score).toBeGreaterThanOrEqual(0);
    expect(result.risk_score).toBeLessThanOrEqual(100);
    expect(Number.isFinite(result.risk_score)).toBe(true);
    expect(result.actions.length).toBeGreaterThan(0);
  });

  it('fonctionne avec un tableau vide', () => {
    const result = analyzeChurnRisk([]);

    expect(Number.isFinite(result.risk_score)).toBe(true);
    expect(result.risk_score).toBeGreaterThanOrEqual(0);
  });
});

// ===========================================================================
// calculatePricingPosition
// ===========================================================================
describe('calculatePricingPosition', () => {
  it('retourne une position valide', () => {
    const answers = buildRealisticAnswers();
    const result = calculatePricingPosition(answers);

    const validPositions = ['P1', 'P2', 'P3', 'P4'];
    expect(validPositions).toContain(result.position);
    expect(typeof result.recommandation).toBe('string');
    expect(result.recommandation.length).toBeGreaterThan(0);
    expect(Number.isFinite(result.qualite_score)).toBe(true);
    expect(Number.isFinite(result.ecart_pct)).toBe(true);
  });

  it('fonctionne avec un tableau vide', () => {
    const result = calculatePricingPosition([]);

    expect(Number.isFinite(result.qualite_score)).toBe(true);
    expect(Number.isFinite(result.ecart_pct)).toBe(true);
  });
});

// ===========================================================================
// Pipeline complet — test d'intégration de bout en bout
// ===========================================================================
describe('Pipeline complet de calcul', () => {
  it('enchaîne tous les calculs sans erreur avec des données string réalistes', () => {
    const answers = buildRealisticAnswers();

    // Étape 1: KPIs de base
    const kpis = calculateKPIs(answers);
    expectAllNumericFieldsFinite(kpis as unknown as Record<string, unknown>, 'kpis');

    // Étape 2: Scores
    const { scores, globalScore } = calculateScores(kpis);
    expect(scores).toHaveLength(3);
    expect(globalScore).toBeGreaterThanOrEqual(0);
    expect(globalScore).toBeLessThanOrEqual(100);

    // Étape 3: KPIs avancés
    const advFin = calculateAdvancedFinancialKPIs(kpis, answers);
    expectAllNumericFieldsFinite(advFin as unknown as Record<string, unknown>, 'advFin');

    const advClient = calculateAdvancedClientKPIs(answers);
    expectAllNumericFieldsFinite(advClient as unknown as Record<string, unknown>, 'advClient');

    const advOps = calculateAdvancedOperationalKPIs(answers);
    expectAllNumericFieldsFinite(advOps as unknown as Record<string, unknown>, 'advOps');

    const advHR = calculateAdvancedHRKPIs(answers);
    expectAllNumericFieldsFinite(advHR as unknown as Record<string, unknown>, 'advHR');

    // Étape 4: Score de santé financière
    const healthScore = calculateFinancialHealthScore(advFin);
    expect(healthScore.score).toBeGreaterThanOrEqual(0);
    expect(healthScore.score).toBeLessThanOrEqual(100);

    // Étape 5: Heatmap, churn, pricing
    const heatmap = generateScheduleHeatMap(answers);
    expect(heatmap.data).toHaveLength(42);

    const churnRisk = analyzeChurnRisk(answers);
    expect(Number.isFinite(churnRisk.risk_score)).toBe(true);

    const pricing = calculatePricingPosition(answers);
    expect(Number.isFinite(pricing.qualite_score)).toBe(true);
  });

  it('enchaîne tous les calculs sans erreur avec un tableau vide', () => {
    const answers: Answer[] = [];

    const kpis = calculateKPIs(answers);
    const { globalScore } = calculateScores(kpis);
    const advFin = calculateAdvancedFinancialKPIs(kpis, answers);
    const advClient = calculateAdvancedClientKPIs(answers);
    const advOps = calculateAdvancedOperationalKPIs(answers);
    const advHR = calculateAdvancedHRKPIs(answers);
    const healthScore = calculateFinancialHealthScore(advFin);
    const heatmap = generateScheduleHeatMap(answers);
    const churnRisk = analyzeChurnRisk(answers);
    const pricing = calculatePricingPosition(answers);

    // Tout doit retourner des valeurs finies, pas de NaN, pas de crash
    expectAllNumericFieldsFinite(kpis as unknown as Record<string, unknown>, 'kpis_empty');
    expect(Number.isFinite(globalScore)).toBe(true);
    expectAllNumericFieldsFinite(advFin as unknown as Record<string, unknown>, 'advFin_empty');
    expectAllNumericFieldsFinite(advClient as unknown as Record<string, unknown>, 'advClient_empty');
    expectAllNumericFieldsFinite(advOps as unknown as Record<string, unknown>, 'advOps_empty');
    expectAllNumericFieldsFinite(advHR as unknown as Record<string, unknown>, 'advHR_empty');
    expect(Number.isFinite(healthScore.score)).toBe(true);
    expect(heatmap.data).toHaveLength(42);
    expect(Number.isFinite(churnRisk.risk_score)).toBe(true);
    expect(Number.isFinite(pricing.qualite_score)).toBe(true);
  });
});
