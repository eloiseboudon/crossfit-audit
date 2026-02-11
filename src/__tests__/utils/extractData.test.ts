import { describe, expect, it } from 'vitest';
import { getAnswerValue, extractFinanceData, extractMembresData, extractOperationsData, extractAllData } from '../../lib/extractData';
import type { Answer } from '../../lib/types';

/** Helper: crée une réponse avec une valeur numérique */
function makeAnswer(blockCode: string, questionCode: string, value: number): Answer {
  return { id: '1', audit_id: 'a1', block_code: blockCode, question_code: questionCode, value, created_at: '', updated_at: '' };
}

/** Helper: crée une réponse avec une valeur STRING (comme en base de données) */
function makeStringAnswer(blockCode: string, questionCode: string, value: string): Answer {
  return { id: '1', audit_id: 'a1', block_code: blockCode, question_code: questionCode, value, created_at: '', updated_at: '' };
}

// ===========================================================================
// getAnswerValue — parsing et cohérence des types
// ===========================================================================
describe('getAnswerValue', () => {
  it('retourne la valeur de la réponse correspondante', () => {
    const answers: Answer[] = [makeAnswer('finance', 'q1', 10)];
    expect(getAnswerValue(answers, 'finance', 'q1')).toBe(10);
  });

  it('retourne la valeur par défaut si non trouvée', () => {
    expect(getAnswerValue([], 'finance', 'q1', 42)).toBe(42);
  });

  it('retourne 0 par défaut si aucune valeur par défaut spécifiée', () => {
    expect(getAnswerValue([], 'finance', 'q1')).toBe(0);
  });

  it('parse une valeur string en nombre quand defaultValue est numérique', () => {
    const answers: Answer[] = [makeStringAnswer('finance', 'q1', '9500')];
    const result = getAnswerValue(answers, 'finance', 'q1', 0);
    expect(result).toBe(9500);
    expect(typeof result).toBe('number');
  });

  it('parse une valeur string décimale en nombre', () => {
    const answers: Answer[] = [makeStringAnswer('finance', 'q1', '3.14')];
    const result = getAnswerValue(answers, 'finance', 'q1', 0);
    expect(result).toBeCloseTo(3.14);
    expect(typeof result).toBe('number');
  });

  it('retourne le defaultValue pour une string non-numérique quand defaultValue est numérique', () => {
    const answers: Answer[] = [makeStringAnswer('finance', 'q1', 'abc')];
    expect(getAnswerValue(answers, 'finance', 'q1', 0)).toBe(0);
  });

  it('retourne le defaultValue pour une string vide quand defaultValue est numérique', () => {
    const answers: Answer[] = [makeStringAnswer('finance', 'q1', '')];
    expect(getAnswerValue(answers, 'finance', 'q1', 0)).toBe(0);
  });

  it('retourne la string brute quand defaultValue est une string', () => {
    const answers: Answer[] = [makeStringAnswer('finance', 'q1', 'oui')];
    expect(getAnswerValue(answers, 'finance', 'q1', '')).toBe('oui');
  });

  it('retourne le defaultValue pour null/undefined values', () => {
    const answers: Answer[] = [
      { id: '1', audit_id: 'a1', block_code: 'b', question_code: 'q', value: null, created_at: '', updated_at: '' }
    ];
    expect(getAnswerValue(answers, 'b', 'q', 0)).toBe(0);
  });
});

// ===========================================================================
// extractFinanceData — calculs financiers
// ===========================================================================
describe('extractFinanceData', () => {
  it('calcule le CA total et le CA récurrent', () => {
    const answers: Answer[] = [
      makeAnswer('produits_exploitation', 'ca_abonnements_mensuels', 5000),
      makeAnswer('produits_exploitation', 'ca_abonnements_annuels', 10000),
      makeAnswer('produits_exploitation', 'ca_personal_training', 1000)
    ];

    const result = extractFinanceData(answers);

    expect(result.revenus.ca_recurrent).toBe(5000 + 10000);
    expect(result.revenus.ca_non_recurrent).toBe(1000);
    expect(result.revenus.ca_total).toBe(result.revenus.ca_recurrent + result.revenus.ca_non_recurrent);
  });

  it('calcule correctement avec des valeurs STRING (cas réel base de données)', () => {
    const answers: Answer[] = [
      makeStringAnswer('produits_exploitation', 'ca_abonnements_mensuels', '9500'),
      makeStringAnswer('produits_exploitation', 'ca_abonnements_trimestriels', '2800'),
      makeStringAnswer('produits_exploitation', 'ca_abonnements_annuels', '3000'),
      makeStringAnswer('produits_exploitation', 'ca_personal_training', '1200'),
      makeStringAnswer('produits_exploitation', 'ca_cartes_10', '800')
    ];

    const result = extractFinanceData(answers);

    expect(result.revenus.ca_recurrent).toBe(9500 + 2800 + 3000);
    expect(result.revenus.ca_non_recurrent).toBe(1200 + 800);
    expect(result.revenus.ca_total).toBe(9500 + 2800 + 3000 + 1200 + 800);
    // Le CA total doit être un nombre raisonnable, pas une concaténation de strings
    expect(result.revenus.ca_total).toBeLessThan(100000);
    expect(typeof result.revenus.ca_total).toBe('number');
  });

  it('calcule le pourcentage récurrent', () => {
    const answers: Answer[] = [
      makeAnswer('produits_exploitation', 'ca_abonnements_mensuels', 1000)
    ];

    const result = extractFinanceData(answers);

    expect(result.revenus.pourcent_recurrent).toBe(100);
  });

  it('gère un CA total à 0 sans division par zéro', () => {
    const result = extractFinanceData([]);

    expect(result.revenus.ca_total).toBe(0);
    expect(result.revenus.pourcent_recurrent).toBe(0);
    expect(result.resultat.marge_ebitda).toBe(0);
    expect(result.ratios.loyer_ca_ratio).toBe(0);
  });

  it('calcule les charges et l\'EBITDA', () => {
    const answers: Answer[] = [
      makeAnswer('produits_exploitation', 'ca_abonnements_mensuels', 10000),
      makeAnswer('charges_exploitation', 'loyer_mensuel_ht', 2000),
      makeAnswer('charges_exploitation', 'salaires_bruts_coachs', 3000)
    ];

    const result = extractFinanceData(answers);

    expect(result.charges.loyer_annuel_total).toBe(2000 * 12);
    expect(result.charges.masse_salariale_total).toBe(3000);
    expect(result.resultat.ebitda).toBe(result.revenus.ca_total - result.charges.charges_total);
  });

  it('tous les champs numériques sont des nombres finis (pas NaN ni Infinity)', () => {
    const answers: Answer[] = [
      makeStringAnswer('produits_exploitation', 'ca_abonnements_mensuels', '9500'),
      makeStringAnswer('charges_exploitation', 'loyer_mensuel_ht', '2200'),
      makeStringAnswer('charges_exploitation', 'salaires_bruts_coachs', '7500')
    ];

    const result = extractFinanceData(answers);

    // Revenus
    expect(Number.isFinite(result.revenus.ca_total)).toBe(true);
    expect(Number.isFinite(result.revenus.ca_recurrent)).toBe(true);
    expect(Number.isFinite(result.revenus.ca_non_recurrent)).toBe(true);
    expect(Number.isFinite(result.revenus.pourcent_recurrent)).toBe(true);

    // Charges
    expect(Number.isFinite(result.charges.loyer_annuel_total)).toBe(true);
    expect(Number.isFinite(result.charges.charges_total)).toBe(true);
    expect(Number.isFinite(result.charges.masse_salariale_total)).toBe(true);

    // Ratios
    expect(Number.isFinite(result.ratios.loyer_ca_ratio)).toBe(true);
    expect(Number.isFinite(result.ratios.ms_ca_ratio)).toBe(true);
    expect(Number.isFinite(result.ratios.charges_ca_ratio)).toBe(true);

    // Résultat
    expect(Number.isFinite(result.resultat.ebitda)).toBe(true);
    expect(Number.isFinite(result.resultat.marge_ebitda)).toBe(true);
  });

  it('les ratios en pourcentage restent entre 0 et 100', () => {
    const answers: Answer[] = [
      makeAnswer('produits_exploitation', 'ca_abonnements_mensuels', 10000),
      makeAnswer('charges_exploitation', 'loyer_mensuel_ht', 2000),
      makeAnswer('charges_exploitation', 'salaires_bruts_coachs', 3000)
    ];

    const result = extractFinanceData(answers);

    expect(result.revenus.pourcent_recurrent).toBeGreaterThanOrEqual(0);
    expect(result.revenus.pourcent_recurrent).toBeLessThanOrEqual(100);
    expect(result.ratios.loyer_ca_ratio).toBeGreaterThanOrEqual(0);
    expect(result.ratios.ms_ca_ratio).toBeGreaterThanOrEqual(0);
  });
});

// ===========================================================================
// extractMembresData — données membres
// ===========================================================================
describe('extractMembresData', () => {
  it('calcule l\'ARPM', () => {
    const answers: Answer[] = [
      makeAnswer('produits_exploitation', 'ca_abonnements_mensuels', 10000),
      makeAnswer('structure_base', 'nb_membres_actifs_total', 100)
    ];

    const financeData = extractFinanceData(answers);
    const result = extractMembresData(answers, financeData);

    expect(result.nb_membres_actifs_total).toBe(100);
    expect(result.arpm).toBe(financeData.revenus.ca_total / 12 / 100);
  });

  it('calcule l\'ARPM correctement avec des valeurs string', () => {
    const answers: Answer[] = [
      makeStringAnswer('produits_exploitation', 'ca_abonnements_mensuels', '12000'),
      makeStringAnswer('structure_base', 'nb_membres_actifs_total', '150')
    ];

    const financeData = extractFinanceData(answers);
    const result = extractMembresData(answers, financeData);

    expect(result.nb_membres_actifs_total).toBe(150);
    expect(typeof result.arpm).toBe('number');
    expect(result.arpm).toBeCloseTo(12000 / 12 / 150);
  });

  it('retourne un ARPM de 0 sans membres', () => {
    const financeData = extractFinanceData([]);
    const result = extractMembresData([], financeData);

    expect(result.arpm).toBe(0);
  });

  it('tous les champs numériques sont des nombres finis', () => {
    const answers: Answer[] = [
      makeStringAnswer('produits_exploitation', 'ca_abonnements_mensuels', '10000'),
      makeStringAnswer('structure_base', 'nb_membres_actifs_total', '120'),
      makeStringAnswer('tarification_detaillee', 'prix_illimite_sans_engagement', '159')
    ];

    const financeData = extractFinanceData(answers);
    const result = extractMembresData(answers, financeData);

    expect(Number.isFinite(result.arpm)).toBe(true);
    expect(Number.isFinite(result.ltv_estime)).toBe(true);
    expect(Number.isFinite(result.nb_membres_actifs_total)).toBe(true);
  });
});

// ===========================================================================
// extractOperationsData — données opérationnelles
// ===========================================================================
describe('extractOperationsData', () => {
  it('calcule le CA par m2', () => {
    const answers: Answer[] = [
      makeAnswer('produits_exploitation', 'ca_abonnements_mensuels', 10000),
      makeAnswer('infrastructure_detaillee', 'surface_totale', 200),
      makeAnswer('structure_base', 'nb_membres_actifs_total', 100)
    ];

    const financeData = extractFinanceData(answers);
    const membresData = extractMembresData(answers, financeData);
    const result = extractOperationsData(answers, financeData, membresData);

    expect(result.ca_par_m2).toBe(financeData.revenus.ca_total / 200);
  });

  it('calcule le taux de conversion', () => {
    const answers: Answer[] = [
      makeAnswer('acquisition_conversion', 'essais_gratuits_mois', 20),
      makeAnswer('acquisition_conversion', 'conversions_essai_abonne_mois', 10),
      makeAnswer('infrastructure_detaillee', 'surface_totale', 200),
      makeAnswer('structure_base', 'nb_membres_actifs_total', 100)
    ];

    const financeData = extractFinanceData(answers);
    const membresData = extractMembresData(answers, financeData);
    const result = extractOperationsData(answers, financeData, membresData);

    expect(result.taux_conversion_pct).toBe(50);
  });

  it('calcule le taux de churn', () => {
    const answers: Answer[] = [
      makeAnswer('retention_churn', 'resiliations_mensuelles', 5),
      makeAnswer('structure_base', 'nb_membres_actifs_total', 100),
      makeAnswer('infrastructure_detaillee', 'surface_totale', 200)
    ];

    const financeData = extractFinanceData(answers);
    const membresData = extractMembresData(answers, financeData);
    const result = extractOperationsData(answers, financeData, membresData);

    expect(result.taux_churn_pct).toBe(5);
  });

  it('calcule correctement avec des valeurs string', () => {
    const answers: Answer[] = [
      makeStringAnswer('acquisition_conversion', 'essais_gratuits_mois', '20'),
      makeStringAnswer('acquisition_conversion', 'conversions_essai_abonne_mois', '10'),
      makeStringAnswer('infrastructure_detaillee', 'surface_totale', '300'),
      makeStringAnswer('structure_base', 'nb_membres_actifs_total', '150'),
      makeStringAnswer('produits_exploitation', 'ca_abonnements_mensuels', '10000')
    ];

    const financeData = extractFinanceData(answers);
    const membresData = extractMembresData(answers, financeData);
    const result = extractOperationsData(answers, financeData, membresData);

    expect(result.taux_conversion_pct).toBe(50);
    expect(typeof result.ca_par_m2).toBe('number');
    expect(result.ca_par_m2).toBeCloseTo(10000 / 300);
  });

  it('tous les champs numériques sont des nombres finis', () => {
    const answers: Answer[] = [
      makeStringAnswer('infrastructure_detaillee', 'surface_totale', '300'),
      makeStringAnswer('structure_base', 'nb_membres_actifs_total', '150'),
      makeStringAnswer('produits_exploitation', 'ca_abonnements_mensuels', '10000'),
      makeStringAnswer('retention_churn', 'resiliations_mensuelles', '5'),
      makeStringAnswer('acquisition_conversion', 'essais_gratuits_mois', '20'),
      makeStringAnswer('acquisition_conversion', 'conversions_essai_abonne_mois', '10')
    ];

    const financeData = extractFinanceData(answers);
    const membresData = extractMembresData(answers, financeData);
    const result = extractOperationsData(answers, financeData, membresData);

    expect(Number.isFinite(result.ca_par_m2)).toBe(true);
    expect(Number.isFinite(result.taux_conversion_pct)).toBe(true);
    expect(Number.isFinite(result.taux_churn_pct)).toBe(true);
    expect(Number.isFinite(result.taux_occupation_global_pct)).toBe(true);
    expect(Number.isFinite(result.surface_totale)).toBe(true);
  });
});

// ===========================================================================
// extractAllData — cohérence globale
// ===========================================================================
describe('extractAllData', () => {
  it('retourne les trois sections de données', () => {
    const answers: Answer[] = [
      makeAnswer('produits_exploitation', 'ca_abonnements_mensuels', 10000),
      makeAnswer('structure_base', 'nb_membres_actifs_total', 100),
      makeAnswer('infrastructure_detaillee', 'surface_totale', 200)
    ];

    const result = extractAllData(answers);

    expect(result).toHaveProperty('finance');
    expect(result).toHaveProperty('membres');
    expect(result).toHaveProperty('operations');
    expect(result.finance.revenus.ca_total).toBeGreaterThan(0);
    expect(result.membres.nb_membres_actifs_total).toBe(100);
    expect(result.operations.surface_totale).toBe(200);
  });

  it('fonctionne avec un tableau vide', () => {
    const result = extractAllData([]);

    expect(result.finance.revenus.ca_total).toBe(0);
    expect(result.membres.nb_membres_actifs_total).toBe(0);
    expect(result.operations.surface_totale).toBe(1);
  });

  it('scénario réaliste complet avec valeurs string — aucun NaN ni concaténation', () => {
    const answers: Answer[] = [
      makeStringAnswer('produits_exploitation', 'ca_abonnements_mensuels', '9500'),
      makeStringAnswer('produits_exploitation', 'ca_abonnements_trimestriels', '2800'),
      makeStringAnswer('produits_exploitation', 'ca_abonnements_semestriels', '1500'),
      makeStringAnswer('produits_exploitation', 'ca_abonnements_annuels', '3000'),
      makeStringAnswer('produits_exploitation', 'ca_cartes_10', '800'),
      makeStringAnswer('produits_exploitation', 'ca_cartes_20', '400'),
      makeStringAnswer('produits_exploitation', 'ca_personal_training', '1200'),
      makeStringAnswer('produits_exploitation', 'ca_boissons_snacks', '300'),
      makeStringAnswer('charges_exploitation', 'loyer_mensuel_ht', '2200'),
      makeStringAnswer('charges_exploitation', 'charges_locatives_mensuelles', '350'),
      makeStringAnswer('charges_exploitation', 'salaires_bruts_coachs', '7500'),
      makeStringAnswer('charges_exploitation', 'charges_sociales_patronales', '5500'),
      makeStringAnswer('structure_base', 'nb_membres_actifs_total', '165'),
      makeStringAnswer('infrastructure_detaillee', 'surface_totale', '450'),
      makeStringAnswer('retention_churn', 'resiliations_mensuelles', '5'),
      makeStringAnswer('acquisition_conversion', 'essais_gratuits_mois', '22'),
      makeStringAnswer('acquisition_conversion', 'conversions_essai_abonne_mois', '12')
    ];

    const result = extractAllData(answers);

    // CA total doit être une somme logique, pas une concaténation
    const expectedCA = 9500 + 2800 + 1500 + 3000 + 800 + 400 + 1200 + 300;
    expect(result.finance.revenus.ca_total).toBe(expectedCA);
    expect(result.finance.revenus.ca_total).toBeLessThan(50000);

    // Toutes les valeurs numériques clés sont des nombres finis
    expect(Number.isFinite(result.finance.revenus.ca_total)).toBe(true);
    expect(Number.isFinite(result.finance.charges.charges_total)).toBe(true);
    expect(Number.isFinite(result.finance.resultat.ebitda)).toBe(true);
    expect(Number.isFinite(result.finance.resultat.marge_ebitda)).toBe(true);
    expect(Number.isFinite(result.membres.arpm)).toBe(true);
    expect(Number.isFinite(result.membres.ltv_estime)).toBe(true);
    expect(Number.isFinite(result.operations.ca_par_m2)).toBe(true);
    expect(Number.isFinite(result.operations.taux_churn_pct)).toBe(true);
    expect(Number.isFinite(result.operations.taux_conversion_pct)).toBe(true);

    // Sanity checks sur les ordres de grandeur
    expect(result.finance.revenus.ca_total).toBeGreaterThan(0);
    expect(result.finance.charges.charges_total).toBeGreaterThan(0);
    expect(result.membres.arpm).toBeGreaterThan(0);
    expect(result.membres.arpm).toBeLessThan(1000); // Un ARPM > 1000€ serait absurde
    expect(result.operations.taux_churn_pct).toBeGreaterThanOrEqual(0);
    expect(result.operations.taux_churn_pct).toBeLessThanOrEqual(100);
    expect(result.operations.taux_conversion_pct).toBeGreaterThanOrEqual(0);
    expect(result.operations.taux_conversion_pct).toBeLessThanOrEqual(100);
  });
});
