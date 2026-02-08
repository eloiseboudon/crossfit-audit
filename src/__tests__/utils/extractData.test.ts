import { describe, expect, it } from 'vitest';
import { getAnswerValue, extractFinanceData, extractMembresData, extractOperationsData, extractAllData } from '../../lib/extractData';
import type { Answer } from '../../lib/types';

function makeAnswer(blockCode: string, questionCode: string, value: number): Answer {
  return { id: '1', audit_id: 'a1', block_code: blockCode, question_code: questionCode, value, created_at: '', updated_at: '' };
}

describe('getAnswerValue', () => {
  it('retourne la valeur de la réponse correspondante', () => {
    const answers: Answer[] = [makeAnswer('finance', 'q1', 10)];

    expect(getAnswerValue(answers, 'finance', 'q1')).toBe(10);
  });

  it('retourne la valeur par défaut si non trouvée', () => {
    const answers: Answer[] = [];

    expect(getAnswerValue(answers, 'finance', 'q1', 42)).toBe(42);
  });

  it('retourne 0 par défaut si aucune valeur par défaut spécifiée', () => {
    const answers: Answer[] = [];

    expect(getAnswerValue(answers, 'finance', 'q1')).toBe(0);
  });
});

describe('extractFinanceData', () => {
  it('calcule le CA total et le CA récurrent', () => {
    const answers: Answer[] = [
      makeAnswer('produits_exploitation', 'ca_abonnements_mensuels', 5000),
      makeAnswer('produits_exploitation', 'ca_abonnements_annuels', 10000),
      makeAnswer('produits_exploitation', 'ca_personal_training', 1000)
    ];

    const result = extractFinanceData(answers);

    // Les valeurs sont sommées directement (montants mensuels bruts)
    expect(result.revenus.ca_recurrent).toBe(5000 + 10000);
    expect(result.revenus.ca_non_recurrent).toBe(1000);
    expect(result.revenus.ca_total).toBe(result.revenus.ca_recurrent + result.revenus.ca_non_recurrent);
  });

  it('calcule le pourcentage récurrent', () => {
    const answers: Answer[] = [
      makeAnswer('produits_exploitation', 'ca_abonnements_mensuels', 1000)
    ];

    const result = extractFinanceData(answers);

    expect(result.revenus.pourcent_recurrent).toBe(100);
  });

  it('gère un CA total à 0 sans division par zéro', () => {
    const answers: Answer[] = [];

    const result = extractFinanceData(answers);

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
});

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

  it('retourne un ARPM de 0 sans membres', () => {
    const answers: Answer[] = [];

    const financeData = extractFinanceData(answers);
    const result = extractMembresData(answers, financeData);

    expect(result.arpm).toBe(0);
  });
});

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
});

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
});
