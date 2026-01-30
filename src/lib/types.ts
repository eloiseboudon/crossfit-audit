export interface Gym {
  id: string;
  user_id?: string;
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  legal_status?: string;
  founded_year?: number;
  partners_count?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type AuditStatus = 'brouillon' | 'en_cours' | 'finalise' | 'archive';

export interface Audit {
  id: string;
  gym_id: string;
  status: AuditStatus;
  audit_date_start?: string;
  audit_date_end?: string;
  baseline_period: string;
  currency: string;
  notes?: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  gym?: Gym;
}

export interface Answer {
  id: string;
  audit_id: string;
  block_code: string;
  question_code: string;
  value: any;
  created_at: string;
  updated_at: string;
}

export interface KPI {
  id: string;
  audit_id: string;
  kpi_code: string;
  value: number;
  unit?: string;
  computed_at: string;
  inputs_snapshot?: any;
}

export interface Score {
  id: string;
  audit_id: string;
  pillar_code: string;
  pillar_name: string;
  score: number;
  weight: number;
  computed_at: string;
  details?: any;
}

export interface Recommendation {
  id: string;
  audit_id: string;
  rec_code: string;
  title: string;
  description?: string;
  priority: 'P1' | 'P2' | 'P3';
  expected_impact_eur?: number;
  effort_level: 'S' | 'M' | 'L';
  confidence: 'faible' | 'moyen' | 'fort';
  category?: string;
  computed_at: string;
}

export interface MarketBenchmark {
  id: string;
  benchmark_code: string;
  name: string;
  value: number;
  unit?: string;
  description?: string;
  category?: string;
  updated_at: string;
}

export type QuestionType = 'number' | 'text' | 'select' | 'multiselect' | 'date' | 'boolean' | 'table';

export interface Question {
  code: string;
  label: string;
  type: QuestionType;
  unit?: string;
  required?: boolean;
  help_text?: string;
  options?: string[];
  conditional?: {
    dependsOn: string;
    value: any;
  };
}

export interface QuestionBlock {
  code: string;
  title: string;
  description?: string;
  questions: Question[];
}

// ============================================================================
// ZONE DE CHALANDISE & CONCURRENCE
// Types pour l'analyse concurrentielle contextuelle
// ============================================================================

/**
 * Niveau de prix d'une zone de marché
 * - budget: 100-140€ (zones périurbaines/rurales)
 * - standard: 140-180€ (villes moyennes)
 * - premium: 180-250€ (grandes métropoles)
 * - luxe: 250-350€+ (Paris, zones premium)
 */
export type PriceLevel = 'budget' | 'standard' | 'premium' | 'luxe';

/**
 * Portée géographique d'une zone
 */
export type GeographicScope = 'quartier' | 'ville' | 'agglomeration' | 'region';

/**
 * Densité de population d'une zone
 */
export type PopulationDensity = 'rurale' | 'periurbaine' | 'urbaine' | 'metropolitaine';

/**
 * Zone de marché CrossFit
 * Définit les caractéristiques tarifaires et géographiques d'une zone
 */
export interface MarketZone {
  id: string;
  name: string;
  description?: string;
  price_level: PriceLevel;
  avg_subscription_min: number;
  avg_subscription_max: number;
  geographic_scope?: GeographicScope;
  population_density?: PopulationDensity;
  avg_household_income_range?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Positionnement stratégique d'un concurrent
 */
export type CompetitorPositioning = 'budget' | 'standard' | 'premium' | 'luxe';

/**
 * Qualité de l'équipement
 */
export type EquipmentQuality = 'basique' | 'standard' | 'premium' | 'excellent';

/**
 * Concurrent CrossFit direct
 * Contient toutes les informations pour l'analyse concurrentielle
 */
export interface Competitor {
  id: string;
  gym_id: string;

  // Identification
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;

  // Proximité
  distance_km?: number;
  travel_time_minutes?: number;

  // Zone de marché
  market_zone_id?: string;
  market_zone?: MarketZone;

  // Tarification concurrentielle
  base_subscription_price?: number;
  base_subscription_name?: string;
  limited_subscription_price?: number;
  limited_subscription_name?: string;
  premium_subscription_price?: number;
  premium_subscription_name?: string;
  trial_price?: number;
  offers_count: number;

  // Positionnement stratégique
  positioning?: CompetitorPositioning;
  value_proposition?: string;
  strengths?: string[];
  weaknesses?: string[];

  // Visibilité & Réputation
  google_rating?: number;
  google_reviews_count: number;
  google_maps_url?: string;
  instagram_handle?: string;
  instagram_followers: number;
  website_url?: string;

  // Infrastructure
  surface_m2?: number;
  capacity?: number;
  equipment_quality?: EquipmentQuality;

  // Services offerts
  has_hyrox: boolean;
  has_weightlifting: boolean;
  has_gymnastics: boolean;
  has_childcare: boolean;
  has_nutrition: boolean;
  additional_services?: string[];

  // Coaching
  number_of_coaches?: number;
  head_coach_name?: string;

  // Méta-données
  last_updated: string;
  data_source?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Type d'offre commerciale
 */
export type OfferType =
  | 'unlimited'           // Illimité
  | 'limited_sessions'    // Séances limitées (ex: 2x/semaine)
  | 'trial'              // Essai/Découverte
  | 'student'            // Tarif étudiant
  | 'couple'             // Tarif couple
  | 'family'             // Tarif famille
  | 'corporate'          // Entreprise/CE
  | 'off_peak'           // Heures creuses
  | 'early_bird'         // Tarif précoce (engagement long)
  | 'annual'             // Paiement annuel
  | 'premium'            // Premium (avec services additionnels)
  | 'pt_package'         // Pack Personal Training
  | 'class_pack';        // Pack de séances

/**
 * Offre commerciale d'une salle
 * Remplace le simple "panier_moyen_mensuel" par une structure détaillée
 */
export interface GymOffer {
  id: string;
  gym_id: string;
  audit_id?: string;

  // Type & Identification
  offer_type: OfferType;
  offer_name: string;
  offer_description?: string;

  // Tarification
  price: number;
  currency: string;

  // Caractéristiques
  session_count?: number;           // NULL si illimité
  duration_months: number;
  commitment_months: number;

  // Conditions
  target_audience?: string[];
  restrictions?: string;
  included_services?: string[];

  // Statut
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;

  // Performance commerciale
  active_subscriptions_count: number;
  monthly_revenue?: number;

  // Méta-données
  created_at: string;
  updated_at: string;
}

/**
 * Action tarifaire recommandée
 */
export type RecommendedPricingAction =
  | 'maintain'           // Maintenir les prix actuels
  | 'increase_gradual'   // Augmenter progressivement
  | 'increase_immediate' // Augmenter immédiatement
  | 'decrease'           // Réduire (rare)
  | 'restructure'        // Restructurer l'offre
  | 'differentiate';     // Différencier par la valeur

/**
 * Analyse comparative de tarification
 * Résultat de l'algorithme d'analyse concurrentielle
 */
export interface CompetitivePricingAnalysis {
  id: string;
  audit_id: string;
  market_zone_id?: string;
  market_zone?: MarketZone;

  // Position tarifaire de la salle
  gym_avg_price: number;
  gym_min_price?: number;
  gym_max_price?: number;
  gym_offers_count: number;

  // Statistiques de zone
  zone_avg_price?: number;
  zone_median_price?: number;
  zone_min_price?: number;
  zone_max_price?: number;
  zone_competitors_count: number;

  // Scoring (-100 à +100)
  pricing_position_score?: number;
  pricing_power_index?: number;
  competitive_gap_pct?: number;
  nearest_competitor_gap_pct?: number;

  // Recommandations
  optimal_price_range_min?: number;
  optimal_price_range_max?: number;
  recommended_action?: RecommendedPricingAction;

  // Détails
  analysis_details?: any;

  // Méta-données
  computed_at: string;
  algorithm_version: string;
}

// ============================================================================
// KPIs AVANCÉS - ANALYSE FINANCIÈRE DE NIVEAU EXPERT
// ============================================================================

/**
 * KPIs financiers avancés pour audit niveau consultant international
 * Inclut ratios de marges, rentabilité, trésorerie, structure de coûts
 * Standard Deloitte/PwC/BCG pour analyse CrossFit
 */
export interface AdvancedFinancialKPIs {
  audit_id: string;

  // === CHIFFRE D'AFFAIRES & STRUCTURE DE REVENUS ===
  ca_total_annuel: number;                    // CA total annuel (€)
  ca_abonnements: number;                     // CA abonnements (€)
  ca_drop_in: number;                         // CA drop-in (€)
  ca_personal_training: number;               // CA personal training (€)
  ca_merchandising: number;                   // CA merchandising (€)
  ca_nutrition: number;                       // CA nutrition/compléments (€)
  ca_events: number;                          // CA événements/compétitions (€)
  ca_autres: number;                          // CA autres sources (€)

  // Structure en % du CA total
  pct_ca_abonnements: number;                 // % CA abonnements (idéal: 75-85%)
  pct_ca_drop_in: number;                     // % CA drop-in
  pct_ca_ancillary: number;                   // % CA services annexes (PT, merch, nutrition)

  // === CHARGES D'EXPLOITATION ===
  charges_totales_annuelles: number;          // Total charges annuelles (€)
  charges_fixes_annuelles: number;            // Charges fixes (loyer, salaires fixes, assurances)
  charges_variables_annuelles: number;        // Charges variables (utilities, marketing, consommables)

  // Détail charges principales
  cout_loyer_annuel: number;                  // Loyer annuel (€)
  cout_masse_salariale_annuelle: number;      // Masse salariale totale (€)
  cout_marketing_annuel: number;              // Marketing & acquisition (€)
  cout_utilities_annuel: number;              // Utilities (élec, eau, internet) (€)
  cout_equipement_annuel: number;             // Équipement & maintenance (€)
  cout_assurances_annuel: number;             // Assurances & RC (€)
  cout_logiciels_annuel: number;              // Logiciels & tech (€)

  // === RÉSULTAT & RENTABILITÉ ===
  ebitda: number;                             // EBITDA (€)
  resultat_net: number;                       // Résultat net (€)
  marge_brute_pct: number;                    // Marge brute (%)
  marge_nette_pct: number;                    // Marge nette (%)
  marge_ebitda_pct: number;                   // Marge EBITDA (%)
  seuil_rentabilite_eur: number;              // Seuil de rentabilité (€/mois)
  seuil_rentabilite_membres: number;          // Seuil de rentabilité (nb membres)

  // === RATIOS D'EFFICIENCE ===
  ca_par_m2: number;                          // CA par m² (€/m²/an)
  ca_par_coach: number;                       // CA par coach (€/coach/an)
  ca_par_membre: number;                      // CA par membre (€/membre/mois)
  charges_par_m2: number;                     // Charges par m² (€/m²/an)
  charges_par_membre: number;                 // Charges par membre (€/membre/mois)

  // === STRUCTURE DE COÛTS ===
  ratio_loyer_ca_pct: number;                 // Loyer/CA (%) - idéal: <20%
  ratio_masse_salariale_ca_pct: number;       // Masse salariale/CA (%) - idéal: 30-40%
  ratio_marketing_ca_pct: number;             // Marketing/CA (%) - idéal: 5-10%
  ratio_charges_fixes_ca_pct: number;         // Charges fixes/CA (%)
  ratio_charges_variables_ca_pct: number;     // Charges variables/CA (%)

  // === TRÉSORERIE & LIQUIDITÉ ===
  tresorerie_actuelle: number;                // Trésorerie disponible (€)
  fonds_roulement: number;                    // Fonds de roulement (€)
  besoin_fonds_roulement: number;             // BFR (€)
  tresorerie_nette: number;                   // Trésorerie nette (€)
  ratio_liquidite_generale: number;           // Actif CT / Passif CT
  delai_paiement_moyen_jours: number;         // DSO - délai encaissement (jours)

  // === ENDETTEMENT ===
  total_dettes: number;                       // Total dettes (€)
  ratio_endettement_pct: number;              // Dettes / Fonds propres (%)
  capacite_remboursement_mois: number;        // Dettes / EBITDA mensuel (mois)
  charge_dette_mensuelle: number;             // Charge dette mensuelle (€)

  // === PERFORMANCE COMPARATIVE ===
  benchmark_marge_nette_sector_pct: number;   // Benchmark secteur marge nette (%)
  ecart_marge_vs_benchmark_pct: number;       // Écart vs benchmark (points %)
  percentile_rentabilite: number;             // Percentile rentabilité secteur (0-100)

  // Méta-données
  computed_at: string;
  data_quality_score: number;                 // Score qualité données (0-100)
  missing_data_fields: string[];              // Champs manquants
}

// ============================================================================
// KPIs AVANCÉS - ANALYSE CLIENTÈLE & COMMERCIAL
// ============================================================================

/**
 * KPIs clientèle avancés pour analyse marketing et rétention
 * Funnel d'acquisition, LTV, CAC, churn, engagement
 */
export interface AdvancedClientKPIs {
  audit_id: string;

  // === BASE MEMBRES ===
  membres_actifs_total: number;               // Total membres actifs
  membres_illimites: number;                  // Membres abonnement illimité
  membres_limites: number;                    // Membres abonnement limité (2-3x/sem)
  membres_premium: number;                    // Membres offres premium
  membres_drop_in: number;                    // Drop-in réguliers (>2/mois)
  croissance_membres_mois_pct: number;        // Croissance M/M (%)
  croissance_membres_annee_pct: number;       // Croissance Y/Y (%)

  // === ACQUISITION & FUNNEL ===
  leads_mois: number;                         // Leads mensuels
  essais_gratuits_mois: number;               // Essais gratuits/mois
  taux_conversion_lead_essai_pct: number;     // Lead → Essai (%) - idéal: 40-60%
  taux_conversion_essai_membre_pct: number;   // Essai → Membre (%) - idéal: 30-50%
  taux_conversion_global_pct: number;         // Lead → Membre (%)
  nouveaux_membres_mois: number;              // Nouveaux membres/mois

  // Sources d'acquisition (% nouveaux membres)
  pct_acquisition_bouche_oreille: number;     // Bouche-à-oreille (%)
  pct_acquisition_reseaux_sociaux: number;    // Réseaux sociaux (%)
  pct_acquisition_google: number;             // Google Search/Maps (%)
  pct_acquisition_parrainage: number;         // Parrainage (%)
  pct_acquisition_events: number;             // Événements (%)
  pct_acquisition_autres: number;             // Autres sources (%)

  // === ÉCONOMIE UNITAIRE ===
  cac_moyen: number;                          // Coût d'acquisition client (€)
  ltv_moyen: number;                          // Life Time Value moyen (€)
  ratio_ltv_cac: number;                      // Ratio LTV/CAC - idéal: >3
  panier_moyen_mensuel: number;               // Panier moyen mensuel (€/membre)
  revenu_moyen_membre_annuel: number;         // ARPU annuel (€/an)
  temps_retour_cac_mois: number;              // Payback CAC (mois) - idéal: <12

  // === RÉTENTION & CHURN ===
  taux_retention_mensuel_pct: number;         // Rétention M/M (%)
  taux_retention_annuel_pct: number;          // Rétention Y/Y (%)
  taux_churn_mensuel_pct: number;             // Churn M/M (%) - idéal: <5%
  taux_churn_annuel_pct: number;              // Churn Y/Y (%)
  departs_mois: number;                       // Départs/mois
  anciennete_moyenne_mois: number;            // Ancienneté moyenne (mois)
  taux_reactivation_pct: number;              // Taux réactivation anciens membres (%)

  // Analyse churn
  churn_0_3_mois_pct: number;                 // Churn 0-3 mois (%) - nouveau membre
  churn_3_12_mois_pct: number;                // Churn 3-12 mois (%)
  churn_12plus_mois_pct: number;              // Churn 12+ mois (%)
  motifs_depart_top3: string[];               // Top 3 motifs de départ

  // === ENGAGEMENT & SATISFACTION ===
  frequentation_moyenne_sem: number;          // Fréquentation moyenne (séances/sem)
  taux_participation_events_pct: number;      // Participation événements (%)
  nps_score: number;                          // Net Promoter Score (-100 à +100)
  satisfaction_score: number;                 // Score satisfaction (0-10)
  taux_recommandation_pct: number;            // Taux recommandation (%)
  avis_google_avg: number;                    // Note Google moyenne
  avis_google_count: number;                  // Nombre avis Google

  // === SEGMENTATION DÉMOGRAPHIQUE ===
  age_moyen: number;                          // Âge moyen membres
  pct_femmes: number;                         // % femmes
  pct_hommes: number;                         // % hommes
  pct_debutants: number;                      // % débutants (<6 mois)
  pct_intermediaires: number;                 // % intermédiaires (6-24 mois)
  pct_avances: number;                        // % avancés (>24 mois)

  // === UPSELL & CROSS-SELL ===
  taux_upsell_pct: number;                    // Taux upsell vers offre supérieure (%)
  revenu_ancillary_par_membre: number;        // Revenu annexe/membre/mois (€)
  pct_membres_pt: number;                     // % membres faisant du PT
  pct_membres_nutrition: number;              // % membres avec suivi nutrition

  // Méta-données
  computed_at: string;
  periode_analyse: string;                    // Période d'analyse (ex: "2024-Q1")
}

// ============================================================================
// KPIs AVANCÉS - OPÉRATIONS & PLANNING
// ============================================================================

/**
 * KPIs opérationnels pour optimisation du planning et de la capacité
 * Taux d'occupation, productivité, gestion des créneaux
 */
export interface AdvancedOperationalKPIs {
  audit_id: string;

  // === CAPACITÉ & INFRASTRUCTURE ===
  surface_totale_m2: number;                  // Surface totale (m²)
  surface_entrainement_m2: number;            // Surface zone entraînement (m²)
  capacite_maximale_seance: number;           // Capacité max/séance (personnes)
  nombre_postes_wod: number;                  // Nombre de postes WOD
  ratio_m2_par_membre: number;                // m² par membre actif
  ratio_m2_par_poste: number;                 // m² par poste WOD

  // === PLANNING & VOLUME ===
  creneaux_semaine: number;                   // Créneaux hebdomadaires
  creneaux_jour_moyen: number;                // Créneaux/jour moyen
  heures_ouverture_semaine: number;           // Heures ouverture/semaine
  seances_mois: number;                       // Séances total/mois
  seances_par_creneau_moyen: number;          // Séances par créneau moyen

  // === OCCUPATION & UTILISATION ===
  taux_occupation_global_pct: number;         // Taux occupation global (%)
  taux_occupation_heures_pleines_pct: number; // Occupation heures pleines (%) - 17h-20h
  taux_occupation_heures_creuses_pct: number; // Occupation heures creuses (%) - 10h-17h
  taux_occupation_weekend_pct: number;        // Occupation weekend (%)
  participation_moyenne_seance: number;       // Participation moyenne/séance
  taux_remplissage_moyen_pct: number;         // Taux remplissage moyen (%)

  // Analyse par tranche horaire
  occupation_6h_9h_pct: number;               // Occupation 6h-9h (early morning)
  occupation_9h_12h_pct: number;              // Occupation 9h-12h (matinée)
  occupation_12h_14h_pct: number;             // Occupation 12h-14h (midi)
  occupation_14h_17h_pct: number;             // Occupation 14h-17h (après-midi)
  occupation_17h_20h_pct: number;             // Occupation 17h-20h (peak hours)
  occupation_20h_22h_pct: number;             // Occupation 20h-22h (soirée)

  // === PRODUCTIVITÉ ===
  seances_par_coach_semaine: number;          // Séances par coach/semaine
  membres_par_coach: number;                  // Ratio membres/coach
  ca_par_heure_ouverture: number;             // CA par heure d'ouverture (€)
  ca_par_seance: number;                      // CA par séance (€)
  cout_par_seance: number;                    // Coût par séance (€)
  marge_par_seance: number;                   // Marge par séance (€)

  // === OPTIMISATION PLANNING ===
  creneaux_satures_count: number;             // Créneaux saturés (>90% capacité)
  creneaux_sous_utilises_count: number;       // Créneaux sous-utilisés (<30%)
  potentiel_creneaux_additionnels: number;    // Créneaux additionnels possibles
  perte_ca_creneaux_vides_eur: number;        // Perte CA créneaux vides estimée (€/mois)
  gain_potentiel_optimisation_eur: number;    // Gain optimisation planning (€/mois)

  // === TYPES DE COURS & PROGRAMMATION ===
  pct_cours_crossfit_classic: number;         // % CrossFit classique
  pct_cours_weightlifting: number;            // % Haltérophilie
  pct_cours_gymnastics: number;               // % Gymnastique
  pct_cours_hyrox: number;                    // % HYROX
  pct_cours_open_gym: number;                 // % Open Gym
  pct_cours_debutants: number;                // % Cours débutants
  pct_personal_training: number;              // % Personal Training

  // === ÉVÉNEMENTS & COMPÉTITIONS ===
  events_par_mois: number;                    // Événements/mois
  competitions_par_an: number;                // Compétitions/an
  taux_participation_events_pct: number;      // Participation événements (%)
  ca_events_annuel: number;                   // CA événements annuel (€)

  // === ÉQUIPEMENT & MAINTENANCE ===
  valeur_equipement_total: number;            // Valeur équipement (€)
  age_moyen_equipement_annees: number;        // Âge moyen équipement (années)
  cout_maintenance_annuel: number;            // Coût maintenance/an (€)
  taux_disponibilite_equipement_pct: number;  // Disponibilité équipement (%)
  investissement_equipement_prevu: number;    // Investissement prévu (€)

  // === CONSOMMABLES & SUPPLIES ===
  cout_consommables_mois: number;             // Consommables/mois (€)
  cout_consommables_par_membre: number;       // Consommables/membre/mois (€)

  // Méta-données
  computed_at: string;
  periode_analyse: string;
}

// ============================================================================
// KPIs AVANCÉS - RESSOURCES HUMAINES & COACHING
// ============================================================================

/**
 * KPIs RH avancés pour analyse de l'équipe et qualité du coaching
 * Structure équipe, coûts, certifications, turnover, performance
 */
export interface AdvancedHRKPIs {
  audit_id: string;

  // === STRUCTURE DE L'ÉQUIPE ===
  effectif_total: number;                     // Effectif total
  nombre_coaches: number;                     // Nombre de coaches
  nombre_salaries_temps_plein: number;        // Salariés temps plein
  nombre_salaries_temps_partiel: number;      // Salariés temps partiel
  nombre_auto_entrepreneurs: number;          // Auto-entrepreneurs
  nombre_benevoles_associes: number;          // Bénévoles/associés
  ratio_temps_plein_pct: number;              // % temps plein

  // === COÛTS RH ===
  masse_salariale_annuelle: number;           // Masse salariale totale (€/an)
  masse_salariale_mensuelle: number;          // Masse salariale mensuelle (€/mois)
  cout_moyen_coach_annuel: number;            // Coût moyen coach/an (€)
  cout_coach_par_heure: number;               // Coût coach/heure (€)
  cout_coach_par_seance: number;              // Coût coach/séance (€)
  charges_sociales_annuelles: number;         // Charges sociales/an (€)
  ratio_masse_salariale_ca_pct: number;       // Masse salariale/CA (%) - idéal: 30-40%

  // === CERTIFICATIONS & QUALIFICATIONS ===
  coaches_cf_l1: number;                      // Coaches CF-L1
  coaches_cf_l2: number;                      // Coaches CF-L2
  coaches_cf_l3: number;                      // Coaches CF-L3
  coaches_cf_l4: number;                      // Coaches CF-L4
  coaches_haltero_certifies: number;          // Coaches haltéro certifiés
  coaches_gymnastics_certifies: number;       // Coaches gymnastique certifiés
  coaches_nutrition_certifies: number;        // Coaches nutrition certifiés
  score_qualifications_moyen: number;         // Score qualifications moyen (0-100)
  taux_certification_avancee_pct: number;     // % coaches L2+ (%)

  // === FORMATION & DÉVELOPPEMENT ===
  budget_formation_annuel: number;            // Budget formation/an (€)
  budget_formation_par_coach: number;         // Budget formation/coach/an (€)
  heures_formation_par_coach_an: number;      // Heures formation/coach/an
  formations_suivies_annee: number;           // Formations suivies/an
  taux_participation_formation_pct: number;   // Participation formations (%)

  // === ORGANISATION & CHARGE DE TRAVAIL ===
  heures_coaching_hebdo_par_coach: number;    // Heures coaching/coach/semaine
  seances_hebdo_par_coach: number;            // Séances/coach/semaine
  membres_par_coach_ratio: number;            // Ratio membres/coach - idéal: 25-40
  charge_travail_score: number;               // Score charge travail (0-100)
  taux_utilisation_capacite_pct: number;      // Utilisation capacité coaching (%)

  // === TURNOVER & STABILITÉ ===
  anciennete_moyenne_coaches_mois: number;    // Ancienneté moyenne coaches (mois)
  taux_turnover_annuel_pct: number;           // Turnover annuel (%) - idéal: <20%
  departs_annee: number;                      // Départs/an
  arrivees_annee: number;                     // Arrivées/an
  taux_retention_coaches_pct: number;         // Rétention coaches (%)
  stabilite_equipe_score: number;             // Score stabilité (0-100)

  // === SATISFACTION & ENGAGEMENT ===
  satisfaction_coaches_score: number;         // Satisfaction coaches (0-10)
  engagement_coaches_score: number;           // Engagement coaches (0-100)
  taux_absenteisme_pct: number;               // Absentéisme (%)
  taux_recommandation_employeur_pct: number;  // Recommandation employeur (%)

  // === QUALITÉ DU COACHING ===
  evaluation_qualite_coaching: number;        // Évaluation qualité (0-10)
  nps_coaching: number;                       // NPS coaching (-100 à +100)
  taux_satisfaction_membres_coaching_pct: number; // Satisfaction membres coaching (%)
  plaintes_coaching_mois: number;             // Plaintes coaching/mois
  ratio_coach_certifie_pct: number;           // % coaches certifiés CF-L1+

  // === PRODUCTIVITÉ COMMERCIALE ===
  ca_par_coach_annuel: number;                // CA/coach/an (€)
  marge_par_coach_annuel: number;             // Marge/coach/an (€)
  nouveaux_membres_par_coach_mois: number;    // Nouveaux membres/coach/mois
  taux_conversion_essais_par_coach_pct: number; // Conversion essais/coach (%)

  // === COMMUNICATION & CULTURE ===
  frequence_reunions_equipe_mois: number;     // Réunions équipe/mois
  utilisation_outils_com_pct: number;         // Utilisation outils comm. (%)
  score_culture_entreprise: number;           // Score culture (0-100)
  taux_cohesion_equipe_pct: number;           // Cohésion équipe (%)

  // Méta-données
  computed_at: string;
  periode_analyse: string;
}

export interface DataTableSummary {
  name: string;
  rowCount: number;
}

export interface DataTableData {
  name: string;
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}
