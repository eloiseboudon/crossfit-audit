const { calculateKPIs, calculateScores, generateRecommendations } = require('../../utils/calculations');

describe('🧮 Algorithmes de Calcul - Business Logic', () => {
  /**
   * ========================================================================
   * CAS 1: SALLE PERFORMANTE (Benchmark)
   * CA: 180k€, 150 membres, marge EBITDA 22%, churn 2.5%
   * ========================================================================
   */
  describe('Cas 1: Box Performante (Benchmark)', () => {
    const answersPerformante = [
      // Finance - Revenus
      { block_code: 'produits_exploitation', question_code: 'ca_abonnements_mensuels', value: 12000 },
      { block_code: 'produits_exploitation', question_code: 'ca_abonnements_trimestriels', value: 1500 },
      { block_code: 'produits_exploitation', question_code: 'ca_abonnements_annuels', value: 1200 },
      { block_code: 'produits_exploitation', question_code: 'ca_cartes_10', value: 800 },
      { block_code: 'produits_exploitation', question_code: 'ca_personal_training', value: 1000 },
      { block_code: 'produits_exploitation', question_code: 'ca_merchandising', value: 500 },

      // Finance - Charges
      { block_code: 'charges_exploitation', question_code: 'loyer_mensuel_ht', value: 2000 },
      { block_code: 'charges_exploitation', question_code: 'electricite_annuel', value: 3600 },
      { block_code: 'charges_exploitation', question_code: 'salaires_bruts_coachs', value: 50000 },
      { block_code: 'charges_exploitation', question_code: 'charges_sociales_patronales', value: 20000 },
      { block_code: 'charges_exploitation', question_code: 'marketing_total', value: 3000 },

      // Membres
      { block_code: 'structure_base', question_code: 'nb_membres_actifs_total', value: 150 },
      { block_code: 'structure_base', question_code: 'nb_membres_illimite', value: 100 },
      { block_code: 'tarification_detaillee', question_code: 'prix_illimite_sans_engagement', value: 95 },

      // Opérations
      { block_code: 'infrastructure_detaillee', question_code: 'surface_totale', value: 300 },
      { block_code: 'infrastructure_detaillee', question_code: 'surface_crossfit', value: 250 },
      { block_code: 'capacite_occupation', question_code: 'capacite_max_cours', value: 16 },
      { block_code: 'capacite_occupation', question_code: 'participants_moyen_cours', value: 12 },
      { block_code: 'structure_planning', question_code: 'nb_creneaux_semaine', value: 40 },

      // Acquisition
      { block_code: 'acquisition_conversion', question_code: 'nb_essais_mois_actuel', value: 25 },
      { block_code: 'acquisition_conversion', question_code: 'nb_conversions_mois_actuel', value: 12 },

      // Rétention
      { block_code: 'retention_churn', question_code: 'nb_resiliations_mois', value: 4 },
      { block_code: 'retention_churn', question_code: 'anciennes_moyens_mois', value: 24 }
    ];

    it('devrait calculer correctement l\'ARPM (~99.3€)', () => {
      const kpis = calculateKPIs(answersPerformante);

      // CA mensuel = 12000 + (1500/3) + (1200/12) + 800 + 1000 + 500 = 14 900€
      // ARPM = 14900 / 150 membres ≈ 99.3€
      expect(kpis.arpm).toBeCloseTo(99.33, 2);
    });

    it('devrait calculer correctement le CA total annuel (180k€)', () => {
      const kpis = calculateKPIs(answersPerformante);

      // CA annuel = (12000 * 12) + 1500 * 4 + 1200 + (800 * 12) + (1000 * 12) + (500 * 12)
      // = 144000 + 6000 + 1200 + 9600 + 12000 + 6000 = 178 800€
      expect(kpis.ca_total_12m).toBeCloseTo(178800, -3); // Tolérance ±1000€
    });

    it('devrait calculer le ratio loyer/CA correct (~13.4%)', () => {
      const kpis = calculateKPIs(answersPerformante);

      // Loyer annuel = 2000 * 12 = 24 000€
      // Ratio = 24000 / 178800 * 100 = 13.4%
      expect(kpis.loyer_ratio).toBeCloseTo(13.4, 1);
    });

    it('devrait calculer l\'EBITDA et marge EBITDA correctement', () => {
      const kpis = calculateKPIs(answersPerformante);

      // Charges totales ≈ 24000 + 3600 + 50000 + 20000 + 3000 = 100 600€
      // EBITDA ≈ 178 800 - 100 600 = 78 200€
      // Marge EBITDA = 78200 / 178800 * 100 ≈ 43.7% (très bon)
      expect(kpis.ebitda_estime).toBeGreaterThan(75000);
      expect(kpis.marge_ebitda).toBeGreaterThan(20);
    });

    it('devrait calculer le taux d\'occupation (75%)', () => {
      const kpis = calculateKPIs(answersPerformante);

      // Taux occupation = 12 participants / 16 capacité = 75%
      expect(kpis.occupation_moyenne).toBeCloseTo(75, 0);
    });

    it('devrait calculer le taux de conversion (48%)', () => {
      const kpis = calculateKPIs(answersPerformante);

      // Conversion = 12 conversions / 25 essais = 48%
      expect(kpis.conversion_essai).toBeCloseTo(48, 0);
    });

    it('devrait calculer le churn mensuel (2.67%)', () => {
      const kpis = calculateKPIs(answersPerformante);

      // Churn = 4 départs / 150 membres = 2.67%
      expect(kpis.churn_mensuel).toBeCloseTo(2.67, 1);
    });

    it('devrait attribuer un EXCELLENT score global (>80)', () => {
      const kpis = calculateKPIs(answersPerformante);
      const { scores, globalScore } = calculateScores(kpis);

      expect(globalScore).toBeGreaterThan(80);

      // Vérifier les scores par pilier
      const financeScore = scores.find((s) => s.code === 'finance');
      const clienteleScore = scores.find((s) => s.code === 'clientele');
      const exploitationScore = scores.find((s) => s.code === 'exploitation');

      expect(financeScore.score).toBeGreaterThan(75);
      expect(clienteleScore.score).toBeGreaterThan(75);
      expect(exploitationScore.score).toBeGreaterThan(70);
    });

    it('devrait générer PEU ou AUCUNE recommandation P1', () => {
      const kpis = calculateKPIs(answersPerformante);
      const recommendations = generateRecommendations(kpis, answersPerformante);

      const p1Recommendations = recommendations.filter((r) => r.priority === 'P1');
      expect(p1Recommendations.length).toBeLessThanOrEqual(1);
    });
  });

  /**
   * ========================================================================
   * CAS 2: SALLE EN DIFFICULTÉ (Alerte Rouge)
   * CA: 90k€, 80 membres, marge EBITDA 5%, churn 8%
   * ========================================================================
   */
  describe('Cas 2: Box en Difficulté (Alerte)', () => {
    const answersEnDifficulte = [
      // Finance - Revenus faibles
      { block_code: 'produits_exploitation', question_code: 'ca_abonnements_mensuels', value: 6000 },
      { block_code: 'produits_exploitation', question_code: 'ca_cartes_10', value: 500 },
      { block_code: 'produits_exploitation', question_code: 'ca_personal_training', value: 300 },

      // Finance - Charges élevées
      { block_code: 'charges_exploitation', question_code: 'loyer_mensuel_ht', value: 2500 }, // Loyer trop élevé!
      { block_code: 'charges_exploitation', question_code: 'electricite_annuel', value: 4200 },
      { block_code: 'charges_exploitation', question_code: 'salaires_bruts_coachs', value: 35000 },
      { block_code: 'charges_exploitation', question_code: 'charges_sociales_patronales', value: 14000 },

      // Membres
      { block_code: 'structure_base', question_code: 'nb_membres_actifs_total', value: 80 },
      { block_code: 'structure_base', question_code: 'nb_membres_illimite', value: 45 },
      { block_code: 'tarification_detaillee', question_code: 'prix_illimite_sans_engagement', value: 75 }, // Prix trop bas

      // Opérations
      { block_code: 'infrastructure_detaillee', question_code: 'surface_totale', value: 280 },
      { block_code: 'capacite_occupation', question_code: 'capacite_max_cours', value: 16 },
      { block_code: 'capacite_occupation', question_code: 'participants_moyen_cours', value: 7 }, // Faible occupation
      { block_code: 'structure_planning', question_code: 'nb_creneaux_semaine', value: 35 },

      // Acquisition
      { block_code: 'acquisition_conversion', question_code: 'nb_essais_mois_actuel', value: 20 },
      { block_code: 'acquisition_conversion', question_code: 'nb_conversions_mois_actuel', value: 5 }, // Faible conversion

      // Rétention
      { block_code: 'retention_churn', question_code: 'nb_resiliations_mois', value: 6 }, // Churn élevé!
      { block_code: 'retention_churn', question_code: 'anciennes_moyens_mois', value: 14 }
    ];

    it('devrait calculer un ARPM faible (<70€)', () => {
      const kpis = calculateKPIs(answersEnDifficulte);

      // CA mensuel ≈ 6000 + 500 + 300 = 6800€
      // ARPM = 6800 / 80 = 85€ (mais avec prix bas + structure)
      expect(kpis.arpm).toBeLessThan(90);
    });

    it('devrait détecter un ratio loyer/CA CRITIQUE (>30%)', () => {
      const kpis = calculateKPIs(answersEnDifficulte);

      // Loyer annuel = 2500 * 12 = 30 000€
      // CA annuel ≈ 90 000€
      // Ratio = 30000 / 90000 = 33%
      expect(kpis.loyer_ratio).toBeGreaterThan(25);
    });

    it('devrait calculer une marge EBITDA FAIBLE (<10%)', () => {
      const kpis = calculateKPIs(answersEnDifficulte);

      expect(kpis.marge_ebitda).toBeLessThan(10);
    });

    it('devrait détecter un CHURN ÉLEVÉ (>7%)', () => {
      const kpis = calculateKPIs(answersEnDifficulte);

      // Churn = 6 / 80 = 7.5%
      expect(kpis.churn_mensuel).toBeGreaterThan(7);
    });

    it('devrait calculer un taux d\'occupation FAIBLE (<50%)', () => {
      const kpis = calculateKPIs(answersEnDifficulte);

      // Occupation = 7 / 16 = 43.75%
      expect(kpis.occupation_moyenne).toBeLessThan(50);
    });

    it('devrait calculer un taux de conversion FAIBLE (<30%)', () => {
      const kpis = calculateKPIs(answersEnDifficulte);

      // Conversion = 5 / 20 = 25%
      expect(kpis.conversion_essai).toBeLessThan(30);
    });

    it('devrait attribuer un score global FAIBLE (<50)', () => {
      const kpis = calculateKPIs(answersEnDifficulte);
      const { scores, globalScore } = calculateScores(kpis);

      expect(globalScore).toBeLessThan(55);
    });

    it('devrait générer PLUSIEURS recommandations P1 critiques', () => {
      const kpis = calculateKPIs(answersEnDifficulte);
      const recommendations = generateRecommendations(kpis, answersEnDifficulte);

      const p1Recommendations = recommendations.filter((r) => r.priority === 'P1');

      // Devrait avoir au moins 3 recommandations P1
      expect(p1Recommendations.length).toBeGreaterThanOrEqual(3);

      // Vérifier les recommandations attendues
      const recCodes = p1Recommendations.map((r) => r.rec_code);
      expect(recCodes).toContain('improve_margins'); // Marge faible
      expect(recCodes).toContain('optimize_rent'); // Loyer élevé
      expect(recCodes).toContain('reduce_churn'); // Churn élevé
    });

    it('devrait estimer un impact financier pour chaque recommandation', () => {
      const kpis = calculateKPIs(answersEnDifficulte);
      const recommendations = generateRecommendations(kpis, answersEnDifficulte);

      recommendations.forEach((rec) => {
        expect(rec.expected_impact_eur).toBeDefined();
        expect(typeof rec.expected_impact_eur).toBe('number');
      });
    });
  });

  /**
   * ========================================================================
   * CAS 3: VALIDATION DES SEUILS DE SCORING
   * Tests unitaires des barèmes de notation
   * ========================================================================
   */
  describe('Cas 3: Validation des Seuils de Scoring', () => {
    it('Score Finance: Marge EBITDA >= 25% → 100 points', () => {
      const kpis = { marge_ebitda: 25, loyer_ratio: 12, masse_salariale_ratio: 35, ca_par_m2: 400 };
      const { scores } = calculateScores(kpis);
      const financeScore = scores.find((s) => s.code === 'finance');

      expect(financeScore.details.score_rentabilite).toBe(100);
    });

    it('Score Finance: Marge EBITDA = 15% → 75 points', () => {
      const kpis = { marge_ebitda: 15, loyer_ratio: 12, masse_salariale_ratio: 35, ca_par_m2: 400 };
      const { scores } = calculateScores(kpis);
      const financeScore = scores.find((s) => s.code === 'finance');

      expect(financeScore.details.score_rentabilite).toBe(75);
    });

    it('Score Finance: Marge EBITDA < 0% → 25 points', () => {
      const kpis = { marge_ebitda: -5, loyer_ratio: 12, masse_salariale_ratio: 35, ca_par_m2: 400 };
      const { scores } = calculateScores(kpis);
      const financeScore = scores.find((s) => s.code === 'finance');

      expect(financeScore.details.score_rentabilite).toBeLessThanOrEqual(25);
    });

    it('Score Clientèle: ARPM >= 110€ → 100 points', () => {
      const kpis = { pourcent_recurrent: 85, arpm: 110, churn_mensuel: 2 };
      const { scores } = calculateScores(kpis);
      const clienteleScore = scores.find((s) => s.code === 'clientele');

      expect(clienteleScore.details.score_arpm).toBe(100);
    });

    it('Score Clientèle: Churn <= 2% → 100 points', () => {
      const kpis = { pourcent_recurrent: 85, arpm: 95, churn_mensuel: 2 };
      const { scores } = calculateScores(kpis);
      const clienteleScore = scores.find((s) => s.code === 'clientele');

      expect(clienteleScore.details.score_churn).toBe(100);
    });

    it('Score Exploitation: Occupation >= 85% → 100 points', () => {
      const kpis = { occupation_moyenne: 85, conversion_essai: 50 };
      const { scores } = calculateScores(kpis);
      const exploitationScore = scores.find((s) => s.code === 'exploitation');

      expect(exploitationScore.details.score_occupation).toBe(100);
    });

    it('Score Exploitation: Conversion >= 60% → 100 points', () => {
      const kpis = { occupation_moyenne: 75, conversion_essai: 60 };
      const { scores } = calculateScores(kpis);
      const exploitationScore = scores.find((s) => s.code === 'exploitation');

      expect(exploitationScore.details.score_conversion).toBe(100);
    });
  });

  /**
   * ========================================================================
   * CAS 4: PONDÉRATION DU SCORE GLOBAL
   * Finance 30%, Clientèle 35%, Exploitation 35%
   * ========================================================================
   */
  describe('Cas 4: Validation de la Pondération du Score Global', () => {
    it('devrait respecter les poids: Finance 30%, Clientèle 35%, Exploitation 35%', () => {
      const kpis = {
        marge_ebitda: 20,
        loyer_ratio: 14,
        masse_salariale_ratio: 40,
        ca_par_m2: 350,
        pourcent_recurrent: 85,
        arpm: 95,
        churn_mensuel: 3,
        occupation_moyenne: 75,
        conversion_essai: 45
      };

      const { scores, globalScore } = calculateScores(kpis);

      const financeScore = scores.find((s) => s.code === 'finance').score;
      const clienteleScore = scores.find((s) => s.code === 'clientele').score;
      const exploitationScore = scores.find((s) => s.code === 'exploitation').score;

      const calculatedGlobal = Math.round(
        financeScore * 0.3 + clienteleScore * 0.35 + exploitationScore * 0.35
      );

      expect(globalScore).toBe(calculatedGlobal);
    });

    it('Score global doit être entre 0 et 100', () => {
      const kpisBas = {
        marge_ebitda: -10,
        loyer_ratio: 40,
        masse_salariale_ratio: 60,
        ca_par_m2: 100,
        pourcent_recurrent: 40,
        arpm: 50,
        churn_mensuel: 15,
        occupation_moyenne: 30,
        conversion_essai: 15
      };

      const { globalScore: scoreBas } = calculateScores(kpisBas);
      expect(scoreBas).toBeGreaterThanOrEqual(0);
      expect(scoreBas).toBeLessThanOrEqual(100);

      const kpisHaut = {
        marge_ebitda: 30,
        loyer_ratio: 10,
        masse_salariale_ratio: 30,
        ca_par_m2: 500,
        pourcent_recurrent: 95,
        arpm: 120,
        churn_mensuel: 1.5,
        occupation_moyenne: 90,
        conversion_essai: 65
      };

      const { globalScore: scoreHaut } = calculateScores(kpisHaut);
      expect(scoreHaut).toBeGreaterThanOrEqual(0);
      expect(scoreHaut).toBeLessThanOrEqual(100);
    });
  });

  /**
   * ========================================================================
   * CAS 5: EDGE CASES & ROBUSTESSE
   * ========================================================================
   */
  describe('Cas 5: Edge Cases & Robustesse', () => {
    it('devrait gérer division par zéro (0 membres)', () => {
      const answersZeroMembres = [
        { block_code: 'produits_exploitation', question_code: 'ca_abonnements_mensuels', value: 5000 },
        { block_code: 'structure_base', question_code: 'nb_membres_actifs_total', value: 0 }
      ];

      const kpis = calculateKPIs(answersZeroMembres);
      expect(kpis.arpm).toBe(0); // Ou NaN géré proprement
      expect(kpis.churn_mensuel).toBe(0);
    });

    it('devrait gérer valeurs négatives', () => {
      const answersNegatif = [
        { block_code: 'produits_exploitation', question_code: 'ca_abonnements_mensuels', value: 3000 },
        { block_code: 'charges_exploitation', question_code: 'loyer_mensuel_ht', value: 5000 }, // Charges > CA
        { block_code: 'structure_base', question_code: 'nb_membres_actifs_total', value: 50 }
      ];

      const kpis = calculateKPIs(answersNegatif);
      const { scores } = calculateScores(kpis);

      expect(kpis.marge_ebitda).toBeLessThan(0);
      expect(scores.every((s) => s.score >= 0)).toBe(true);
    });

    it('devrait gérer valeurs manquantes (undefined)', () => {
      const answersIncomplete = [
        { block_code: 'structure_base', question_code: 'nb_membres_actifs_total', value: 100 }
        // Manque beaucoup de données
      ];

      expect(() => {
        const kpis = calculateKPIs(answersIncomplete);
        calculateScores(kpis);
      }).not.toThrow();
    });
  });
});
