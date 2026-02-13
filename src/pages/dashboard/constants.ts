export const INFO_DETAILS: Record<string, string> = {
  score_global:
    'Score global = somme pondérée des scores Finance (30%), Commercial & rétention (35%) et Organisation & pilotage (35%).\nDonnées: réponses de l\'audit sur chaque pilier.',
  score_finance:
    'Score Finance = 40% marge EBITDA + 20% ratio loyer/CA + 20% masse salariale/CA + 20% CA/m².\nLes sous-scores sont déterminés via les seuils internes.',
  score_clientele:
    'Score Commercial & rétention = 40% % de CA récurrent + 35% ARPM + 25% churn mensuel.\nBasé sur les données membres et revenus.',
  score_exploitation:
    'Score Organisation & pilotage = 60% taux d\'occupation global + 40% taux de conversion essai.\nBasé sur capacités et funnel.',
  ca_total_12m:
    'Somme des revenus annuels (abonnements, drop-in, PT, merchandising, autres).\nDonnées: bloc Finance > Revenus.',
  arpm:
    'ARPM = CA total annuel / 12 / nombre de membres actifs.\nDonnées: CA total + membres actifs.',
  marge_ebitda:
    'Marge EBITDA = EBITDA / CA total × 100.\nEBITDA = CA total - (charges totales hors amortissements, provisions et frais financiers).',
  churn_mensuel:
    'Churn mensuel = résiliations mensuelles / membres actifs × 100.\nDonnées: bloc Rétention & churn.',
  ca_abonnements:
    'Somme des revenus abonnements mensuels, trimestriels, semestriels et annuels.',
  pct_ca_abonnements:
    '% CA abonnements = CA abonnements / CA total × 100.',
  ca_drop_in:
    'Revenus drop-in = cartes 10/20 + séances unitaires.\nDonnées: bloc Produits/Exploitation.',
  pct_ca_drop_in:
    '% CA drop-in = CA drop-in / CA total × 100.',
  ca_personal_training:
    'Revenus Personal Training saisis dans l\'audit (coaching individuel).',
  ca_merchandising:
    'Revenus merchandising = vêtements + accessoires.',
  ebitda:
    'EBITDA calculé à partir du CA et des charges d\'exploitation (hors amortissements, provisions, frais financiers).',
  marge_ebitda_pct:
    'Marge EBITDA = EBITDA / CA total × 100.',
  resultat_net:
    'Résultat net = CA total - charges totales (incluant amortissements, provisions, frais financiers).',
  marge_nette_pct:
    'Marge nette = résultat net / CA total × 100.',
  marge_brute_pct:
    'Marge brute = (CA total - charges directes) / CA total × 100.\nCalculée à partir des charges déclarées.',
  ratio_loyer_ca_pct:
    'Ratio loyer/CA = loyer annuel / CA total × 100.',
  ratio_masse_salariale_ca_pct:
    'Ratio masse salariale/CA = masse salariale annuelle / CA total × 100.',
  ratio_marketing_ca_pct:
    'Ratio marketing/CA = dépenses marketing annuelles / CA total × 100.',
  ca_par_m2:
    'CA par m² = CA total annuel / surface totale (m²).',
  membres_actifs_total:
    'Nombre total de membres actifs saisi dans l\'audit.',
  membres_illimites:
    'Nombre de membres avec abonnement illimité saisi.',
  membres_limites:
    'Nombre de membres avec abonnement limité (2-3x/sem) saisi.',
  membres_premium:
    'Nombre de membres avec offre premium saisi.',
  leads_mois:
    'Leads mensuels saisis (demandes entrantes).',
  essais_gratuits_mois:
    'Essais gratuits mensuels saisis.',
  taux_conversion_lead_essai_pct:
    'Conversion lead → essai = essais gratuits / leads × 100 (ou taux saisi).',
  nouveaux_membres_mois:
    'Nouveaux membres mensuels (conversions essai → abonné) saisis.',
  taux_conversion_essai_membre_pct:
    'Conversion essai → membre = conversions essai / essais × 100.',
  cac_moyen:
    'CAC moyen = coût d\'acquisition moyen saisi.',
  ltv_moyen:
    'LTV estimée = ARPM × ancienneté moyenne (mois).',
  ratio_ltv_cac:
    'Ratio LTV/CAC = LTV estimée / CAC.',
  temps_retour_cac_mois:
    'Payback CAC = CAC / revenu mensuel moyen par membre (ARPM).',
  taux_retention_mensuel_pct:
    'Rétention mensuelle = 100% - churn mensuel (ou taux de renouvellement saisi).',
  taux_churn_mensuel_pct:
    'Churn mensuel = résiliations mensuelles / membres actifs × 100.',
  anciennete_moyenne_mois:
    'Ancienneté moyenne des membres (mois) saisie.',
  nps_score:
    'NPS = % promoteurs - % détracteurs (saisi dans l\'audit).',
  creneaux_semaine:
    'Nombre de créneaux par semaine saisi.',
  heures_ouverture_semaine:
    'Nombre d\'heures d\'ouverture hebdomadaires saisi.',
  seances_mois:
    'Séances mensuelles estimées à partir des créneaux hebdomadaires.',
  surface_totale_m2:
    'Surface totale déclarée (m²).',
  occupation_6h_9h_pct:
    'Taux d\'occupation 6h-9h = participants moyens / capacité × 100.',
  occupation_12h_14h_pct:
    'Taux d\'occupation 12h-14h = participants moyens / capacité × 100.',
  occupation_17h_20h_pct:
    'Taux d\'occupation 17h-20h = participants moyens / capacité × 100.',
  ca_par_seance:
    'CA par séance = CA total / nombre de séances.',
  cout_par_seance:
    'Coût par séance = charges totales / nombre de séances.',
  marge_par_seance:
    'Marge par séance = CA par séance - coût par séance.',
  ca_par_heure_ouverture:
    'CA par heure d\'ouverture = CA total / heures d\'ouverture annuelles.',
  nombre_coaches:
    'Nombre total de coachs saisi.',
  nombre_salaries_temps_plein:
    'Nombre de salariés temps plein saisi.',
  nombre_salaries_temps_partiel:
    'Nombre de salariés temps partiel saisi.',
  nombre_auto_entrepreneurs:
    'Nombre d\'auto-entrepreneurs/freelances saisi.',
  coaches_cf_l1:
    'Nombre de coachs certifiés CF Level 1 saisi.',
  coaches_cf_l2:
    'Nombre de coachs certifiés CF Level 2 saisi.',
  coaches_cf_l3:
    'Nombre de coachs certifiés CF Level 3 saisi.',
  coaches_cf_l4:
    'Nombre de coachs certifiés CF Level 4 saisi.',
  score_qualifications_moyen:
    'Score moyen de qualifications calculé à partir du niveau de certifications.',
  masse_salariale_annuelle:
    'Masse salariale annuelle totale saisie.',
  cout_moyen_coach_annuel:
    'Coût moyen par coach = masse salariale annuelle / nombre de coachs.',
  ca_par_coach_annuel:
    'CA par coach = CA total annuel / nombre de coachs.',
  nps_coaching:
    'NPS coaching saisi (promoteurs - détracteurs).',
  taux_satisfaction_membres_coaching_pct:
    'Satisfaction membres coaching (%) saisie.',
  taux_turnover_annuel_pct:
    'Turnover annuel = départs annuels / effectif moyen × 100.',
  stabilite_equipe_score:
    'Score de stabilité équipe basé sur l\'ancienneté et le turnover.'
};
