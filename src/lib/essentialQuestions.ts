export type EssentialQuestionItem = {
  block: string;
  code?: string;
  codes?: string[];
  label: string;
};

export type EssentialQuestionSection = {
  title: string;
  description?: string;
  items: EssentialQuestionItem[];
};

export const essentialQuestionSections: EssentialQuestionSection[] = [
  {
    title: '🏢 IDENTITÉ & INFRASTRUCTURE (5 questions)',
    items: [
      { block: 'identite_legale', code: 'raison_sociale', label: 'Identité de base' },
      { block: 'identite_legale', code: 'annee_ouverture', label: 'Ancienneté/maturité de la box' },
      { block: 'infrastructure_detaillee', code: 'surface_crossfit', label: 'Surface exploitable pour calcul du ratio revenus/m²' },
      { block: 'capacite_occupation', code: 'capacite_max_cours', label: 'Capacité opérationnelle' },
      { block: 'infrastructure_detaillee', code: 'nb_places_parking', label: 'Accessibilité (impact acquisition)' }
    ]
  },
  {
    title: '💰 FINANCE - TOP PRIORITÉ (8 questions)',
    items: [
      { block: 'produits_exploitation', code: 'ca_abonnements_mensuels', label: 'Source principale de revenus' },
      { block: 'charges_exploitation', code: 'loyer_mensuel_ht', label: 'Charge fixe #1 (20-30% du CA typiquement)' },
      { block: 'charges_exploitation', code: 'electricite_annuel', label: 'Charge fixe #2' },
      { block: 'charges_exploitation', code: 'salaires_bruts_coachs', label: 'Masse salariale (30-40% du CA)' },
      { block: 'charges_exploitation', code: 'charges_sociales_patronales', label: 'Charges sur salaires' },
      { block: 'resultat_tresorerie', code: 'tresorerie_actuelle', label: 'Santé financière immédiate' },
      { block: 'resultat_tresorerie', code: 'emprunts_capital_restant', label: 'Endettement' },
      { block: 'resultat_tresorerie', code: 'echeance_mensuelle_emprunts', label: 'Impact trésorerie mensuelle' }
    ]
  },
  {
    title: '👥 MEMBRES - CRITIQUES (7 questions)',
    items: [
      { block: 'structure_base', code: 'nb_membres_actifs_total', label: 'Base client' },
      { block: 'structure_base', code: 'nb_membres_illimite', label: 'Segment premium (plus rentable)' },
      { block: 'tarification_detaillee', code: 'prix_illimite_sans_engagement', label: 'Tarif de référence' },
      { block: 'acquisition_conversion', code: 'nb_essais_mois_actuel', label: 'Pipeline d’acquisition' },
      { block: 'acquisition_conversion', code: 'nb_conversions_mois_actuel', label: 'Performance commerciale' },
      { block: 'retention_churn', code: 'nb_resiliations_mois_actuel', label: 'Churn rate' },
      { block: 'retention_churn', code: 'duree_moyenne_adhesion', label: 'Lifetime Value indicator' }
    ]
  },
  {
    title: '📅 PLANNING & OPÉRATIONS (3 questions)',
    items: [
      {
        block: 'structure_planning',
        codes: ['nb_cours_lundi', 'nb_cours_mardi', 'nb_cours_mercredi', 'nb_cours_jeudi', 'nb_cours_vendredi'],
        label: 'Volume semaine (lundi à vendredi)'
      },
      { block: 'capacite_occupation', code: 'participants_moyen_cours', label: 'Taux d’occupation' },
      { block: 'capacite_occupation', code: 'nb_cours_complets_semaine', label: 'Saturation/capacité' }
    ]
  },
  {
    title: '👨‍🏫 RH & COACHING (2 questions)',
    items: [
      { block: 'structure_equipe', code: 'nb_total_coachs', label: 'Ressources humaines' },
      { block: 'remuneration', code: 'remuneration_coach_temps_plein', label: 'Structure de coûts RH' }
    ]
  }
];

export const essentialQuestionItems = essentialQuestionSections.flatMap((section) => section.items);
