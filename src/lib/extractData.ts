import { Answer } from './types';

export function getAnswerValue(
  answers: Answer[],
  blockCode: string,
  questionCode: string,
  defaultValue: any = 0
): any {
  const answer = answers.find(
    (a) => a.block_code === blockCode && a.question_code === questionCode
  );
  return answer?.value ?? defaultValue;
}

export interface ExtractedIdentiteData {
  raison_sociale: string;
  siret: string;
  code_naf: string;
  forme_juridique: string;
  capital_social: number;
  nb_associes: number;
  repartition_capital: string;
  regime_fiscal: string;
  regime_tva: string;
  affiliation_crossfit: string;
  date_affiliation: string;
  annee_ouverture: number;
  statut_gerant: string;

  surface_totale: number;
  surface_crossfit: number;
  surface_hyrox: number;
  surface_muscu: number;
  surface_vestiaires: number;
  surface_accueil: number;
  surface_bureaux: number;
  surface_stockage: number;
  nb_vestiaires_hommes: number;
  nb_vestiaires_femmes: number;
  nb_douches_hommes: number;
  nb_douches_femmes: number;
  nb_wc_total: number;
  hauteur_sous_plafond: number;
  climatisation: string;
  ventilation: string;
  nb_places_parking: number;
  acces_pmr: string;
  valeur_totale_materiel: number;
  age_moyen_materiel: number;

  type_zone: string;
  visibilite_rue: string;
  transports_proximite: string;
  revenus_moyens_zone: string;
}

export interface ExtractedFinanceData {
  revenus: {
    ca_abonnements_mensuels: number;
    ca_abonnements_trimestriels: number;
    ca_abonnements_semestriels: number;
    ca_abonnements_annuels: number;
    ca_seances_unitaires: number;
    ca_frais_inscription: number;
    ca_personal_training: number;
    ca_coaching_nutrition: number;
    ca_suivi_remote: number;
    ca_cours_specialises: number;
    ca_competitions_internes: number;
    ca_competitions_externes: number;
    ca_seminaires: number;
    ca_team_building: number;
    ca_merchandising_vetements: number;
    ca_merchandising_accessoires: number;
    ca_complements: number;
    ca_boissons_snacks: number;
    ca_sous_location: number;
    ca_partenariats: number;
    ca_sponsoring: number;
    ca_cartes_10: number;
    ca_cartes_20: number;
    ca_total: number;
    ca_recurrent: number;
    ca_non_recurrent: number;
    pourcent_recurrent: number;
  };

  charges: {
    achats_marchandises: number;
    variation_stock: number;
    achats_fournitures: number;

    loyer_mensuel_ht: number;
    charges_locatives_mensuelles: number;
    taxe_fonciere: number;
    loyer_annuel_total: number;

    electricite_annuel: number;
    eau_annuel: number;
    gaz_chauffage_annuel: number;
    energies_total: number;

    entretien_locaux: number;
    entretien_materiel: number;
    reparations_exceptionnelles: number;
    entretien_total: number;

    assurance_rc_pro: number;
    assurance_locaux: number;
    assurance_materiel: number;
    assurance_prevoyance: number;
    mutuelle_entreprise: number;
    assurances_total: number;

    honoraires_comptable: number;
    honoraires_avocat: number;
    cotisations_professionnelles: number;
    affiliation_crossfit_annuel: number;
    licences_federales: number;
    autres_services_exterieurs: number;
    services_exterieurs_total: number;

    telephone_internet: number;
    frais_postaux: number;
    logiciel_planning: number;
    logiciel_comptabilite: number;
    crm: number;
    site_web_hebergement: number;
    abonnements_musique: number;
    autres_logiciels: number;
    communication_total: number;

    google_ads: number;
    facebook_instagram_ads: number;
    publicite_locale: number;
    evenements_marketing: number;
    creation_graphique: number;
    cadeaux_clients: number;
    marketing_total: number;

    salaires_bruts_gerant: number;
    salaires_bruts_coachs: number;
    salaires_bruts_administratif: number;
    charges_sociales_patronales: number;
    cotisations_sociales_tns: number;
    charges_freelance: number;
    participation_transport: number;
    tickets_restaurant: number;
    formation_personnel: number;
    autres_charges_personnel: number;
    masse_salariale_total: number;

    cfe: number;
    cvae: number;
    taxe_apprentissage: number;
    participation_formation: number;
    autres_impots_taxes: number;
    impots_total: number;

    frais_bancaires: number;
    interets_emprunts: number;
    frais_financiers_total: number;

    amortissements: number;
    provisions: number;
    autres_charges_fixes: number;

    charges_total: number;
  };

  resultat: {
    ebitda: number;
    ebitda_avant_amortissements: number;
    marge_ebitda: number;
    resultat_net: number;
    marge_nette: number;
  };

  ratios: {
    loyer_ca_ratio: number;
    ms_ca_ratio: number;
    marketing_ca_ratio: number;
    charges_ca_ratio: number;
  };

  tresorerie: {
    tresorerie_actuelle: number;
    tresorerie_disponible: number;
    facilite_caisse: number;
    emprunts_capital_restant: number;
    echeance_mensuelle_emprunts: number;
    dettes_fournisseurs: number;
    creances_clients: number;
    bfr_estime: number;
  };
}

export interface ExtractedMembresData {
  nb_membres_actifs_total: number;
  nb_membres_illimite: number;
  nb_membres_3x_semaine: number;
  nb_membres_2x_semaine: number;
  nb_membres_1x_semaine: number;
  nb_membres_cartes_10: number;
  nb_membres_cartes_20: number;
  nb_membres_hyrox_only: number;
  nb_membres_crossfit_hyrox: number;
  nb_membres_avec_pt: number;
  nb_membres_avec_nutrition: number;
  nb_membres_sans_engagement: number;
  nb_membres_engagement_3m: number;
  nb_membres_engagement_6m: number;
  nb_membres_engagement_12m: number;

  hommes_pourcent: number;
  femmes_pourcent: number;
  age_moyen_membres: number;
  moins_25_pourcent: number;
  entre_25_35_pourcent: number;
  entre_35_45_pourcent: number;
  plus_45_pourcent: number;

  tarif_mensuel_illimite: number;
  tarif_mensuel_3x: number;
  tarif_mensuel_2x: number;
  tarif_mensuel_1x: number;
  tarif_carte_10: number;
  tarif_carte_20: number;
  tarif_seance_unitaire: number;
  frais_inscription: number;
  reduction_etudiants_pourcent: number;
  reduction_entreprises_pourcent: number;
  remise_annuelle_pourcent: number;
  remise_famille_pourcent: number;

  arpm: number;
  ltv_estime: number;
  cac: number;
  ltv_cac_ratio: number;
}

export interface ExtractedOperationsData {
  surface_totale: number;
  surface_crossfit: number;
  ca_par_m2: number;

  nb_creneaux_semaine: number;
  capacite_par_creneau: number;
  participants_moyens_creneau: number;
  creneaux_prime_time: number;
  participants_prime_time: number;
  creneaux_off_peak: number;
  participants_off_peak: number;
  duree_wod_minutes: number;
  temps_rotation_minutes: number;

  taux_occupation_global_pct: number;
  taux_occupation_prime_time_pct: number;
  taux_occupation_off_peak_pct: number;
  heures_ouverture_semaine: number;
  jours_fermeture_annee: number;
  creneau_plus_demande: string;
  creneau_moins_demande: string;

  essais_gratuits_mois: number;
  conversions_essai_abonne_mois: number;
  leads_mensuels: number;
  taux_conversion_leads_essai_pct: number;
  cout_acquisition_membre: number;
  canaux_acquisition: string;
  taux_conversion_pct: number;

  resiliations_mensuelles: number;
  anciennes_moyens_mois: number;
  taux_reabonnement_pct: number;
  raisons_principales_depart: string;
  taux_churn_pct: number;

  frequentation_moyenne_mois: number;
  nps_score: number;
  satisfaction_globale_10: number;
  avis_google_nombre: number;
  note_google_5: number;
  taux_recommandation_pct: number;
  taux_renouvellement_pct: number;
}

export interface ExtractedRHData {
  nombre_coaches: number;
  coaches_temps_plein: number;
  coaches_temps_partiel: number;
  coaches_freelance: number;
  ratio_coach_membres: number;
  anciennete_moyenne_coaches_mois: number;
  turnover_coaches_pct: number;
  personnel_admin: number;
  personnel_menage: number;

  coaches_cf_l1: number;
  coaches_cf_l2: number;
  coaches_cf_l3: number;
  coaches_cf_l4: number;
  certifications_complementaires: number;
  specialisations_equipe: string;

  budget_formation_annuel: number;
  heures_formation_coach_an: number;
  formations_prevues: string;

  salaire_moyen_coach_temps_plein: number;
  taux_horaire_coach_partiel: number;
  taux_horaire_freelance: number;
  primes_variables: string;
  avantages_sociaux: string;

  nps_coaching: number;
  satisfaction_coaching_10: number;
}

export interface ExtractedAllData {
  identite: ExtractedIdentiteData;
  finance: ExtractedFinanceData;
  membres: ExtractedMembresData;
  operations: ExtractedOperationsData;
  rh: ExtractedRHData;
}

export function extractIdentiteData(answers: Answer[]): ExtractedIdentiteData {
  return {
    raison_sociale: getAnswerValue(answers, 'identite_legale', 'raison_sociale', ''),
    siret: getAnswerValue(answers, 'identite_legale', 'siret', ''),
    code_naf: getAnswerValue(answers, 'identite_legale', 'code_naf', ''),
    forme_juridique: getAnswerValue(answers, 'identite_legale', 'forme_juridique', ''),
    capital_social: getAnswerValue(answers, 'identite_legale', 'capital_social', 0),
    nb_associes: getAnswerValue(answers, 'identite_legale', 'nb_associes', 0),
    repartition_capital: getAnswerValue(answers, 'identite_legale', 'repartition_capital', ''),
    regime_fiscal: getAnswerValue(answers, 'identite_legale', 'regime_fiscal', ''),
    regime_tva: getAnswerValue(answers, 'identite_legale', 'regime_tva', ''),
    affiliation_crossfit: getAnswerValue(answers, 'identite_legale', 'affiliation_crossfit', ''),
    date_affiliation: getAnswerValue(answers, 'identite_legale', 'date_affiliation', ''),
    annee_ouverture: getAnswerValue(answers, 'identite_legale', 'annee_ouverture', 0),
    statut_gerant: getAnswerValue(answers, 'identite_legale', 'statut_gerant', ''),

    surface_totale: getAnswerValue(answers, 'infrastructure_detaillee', 'surface_totale', 0),
    surface_crossfit: getAnswerValue(answers, 'infrastructure_detaillee', 'surface_crossfit', 0),
    surface_hyrox: getAnswerValue(answers, 'infrastructure_detaillee', 'surface_hyrox', 0),
    surface_muscu: getAnswerValue(answers, 'infrastructure_detaillee', 'surface_muscu', 0),
    surface_vestiaires: getAnswerValue(answers, 'infrastructure_detaillee', 'surface_vestiaires', 0),
    surface_accueil: getAnswerValue(answers, 'infrastructure_detaillee', 'surface_accueil', 0),
    surface_bureaux: getAnswerValue(answers, 'infrastructure_detaillee', 'surface_bureaux', 0),
    surface_stockage: getAnswerValue(answers, 'infrastructure_detaillee', 'surface_stockage', 0),
    nb_vestiaires_hommes: getAnswerValue(answers, 'infrastructure_detaillee', 'nb_vestiaires_hommes', 0),
    nb_vestiaires_femmes: getAnswerValue(answers, 'infrastructure_detaillee', 'nb_vestiaires_femmes', 0),
    nb_douches_hommes: getAnswerValue(answers, 'infrastructure_detaillee', 'nb_douches_hommes', 0),
    nb_douches_femmes: getAnswerValue(answers, 'infrastructure_detaillee', 'nb_douches_femmes', 0),
    nb_wc_total: getAnswerValue(answers, 'infrastructure_detaillee', 'nb_wc_total', 0),
    hauteur_sous_plafond: getAnswerValue(answers, 'infrastructure_detaillee', 'hauteur_sous_plafond', 0),
    climatisation: getAnswerValue(answers, 'infrastructure_detaillee', 'climatisation', ''),
    ventilation: getAnswerValue(answers, 'infrastructure_detaillee', 'ventilation', ''),
    nb_places_parking: getAnswerValue(answers, 'infrastructure_detaillee', 'nb_places_parking', 0),
    acces_pmr: getAnswerValue(answers, 'infrastructure_detaillee', 'acces_pmr', ''),
    valeur_totale_materiel: getAnswerValue(answers, 'infrastructure_detaillee', 'valeur_materiel_total', 0),
    age_moyen_materiel: getAnswerValue(answers, 'infrastructure_detaillee', 'age_moyen_materiel', 0),

    type_zone: getAnswerValue(answers, 'localisation', 'type_zone', ''),
    visibilite_rue: getAnswerValue(answers, 'localisation', 'visibilite_rue', ''),
    transports_proximite: getAnswerValue(answers, 'localisation', 'transports_proximite', ''),
    revenus_moyens_zone: getAnswerValue(answers, 'localisation', 'revenus_moyens_zone', '')
  };
}

export function extractFinanceData(answers: Answer[]): ExtractedFinanceData {
  const ca_abonnements_mensuels = getAnswerValue(answers, 'produits_exploitation', 'ca_abonnements_mensuels', 0);
  const ca_abonnements_trimestriels = getAnswerValue(answers, 'produits_exploitation', 'ca_abonnements_trimestriels', 0);
  const ca_abonnements_semestriels = getAnswerValue(answers, 'produits_exploitation', 'ca_abonnements_semestriels', 0);
  const ca_abonnements_annuels = getAnswerValue(answers, 'produits_exploitation', 'ca_abonnements_annuels', 0);
  const ca_cartes_10 = getAnswerValue(answers, 'produits_exploitation', 'ca_cartes_10', 0);
  const ca_cartes_20 = getAnswerValue(answers, 'produits_exploitation', 'ca_cartes_20', 0);
  const ca_seances_unitaires = getAnswerValue(answers, 'produits_exploitation', 'ca_seances_unitaires', 0);
  const ca_frais_inscription = getAnswerValue(answers, 'produits_exploitation', 'ca_frais_inscription', 0);
  const ca_personal_training = getAnswerValue(answers, 'produits_exploitation', 'ca_personal_training', 0);
  const ca_coaching_nutrition = getAnswerValue(answers, 'produits_exploitation', 'ca_coaching_nutrition', 0);
  const ca_suivi_remote = getAnswerValue(answers, 'produits_exploitation', 'ca_suivi_remote', 0);
  const ca_cours_specialises = getAnswerValue(answers, 'produits_exploitation', 'ca_cours_specialises', 0);
  const ca_competitions_internes = getAnswerValue(answers, 'produits_exploitation', 'ca_competitions_internes', 0);
  const ca_competitions_externes = getAnswerValue(answers, 'produits_exploitation', 'ca_competitions_externes', 0);
  const ca_seminaires = getAnswerValue(answers, 'produits_exploitation', 'ca_seminaires', 0);
  const ca_team_building = getAnswerValue(answers, 'produits_exploitation', 'ca_team_building', 0);
  const ca_merchandising_vetements = getAnswerValue(answers, 'produits_exploitation', 'ca_merchandising_vetements', 0);
  const ca_merchandising_accessoires = getAnswerValue(answers, 'produits_exploitation', 'ca_merchandising_accessoires', 0);
  const ca_complements = getAnswerValue(answers, 'produits_exploitation', 'ca_complements', 0);
  const ca_boissons_snacks = getAnswerValue(answers, 'produits_exploitation', 'ca_boissons_snacks', 0);
  const ca_sous_location = getAnswerValue(answers, 'produits_exploitation', 'ca_sous_location', 0);
  const ca_partenariats = getAnswerValue(answers, 'produits_exploitation', 'ca_partenariats', 0);
  const ca_sponsoring = getAnswerValue(answers, 'produits_exploitation', 'ca_sponsoring', 0);

  const ca_recurrent = ca_abonnements_mensuels + ca_abonnements_trimestriels +
                       ca_abonnements_semestriels + ca_abonnements_annuels;

  const ca_non_recurrent = ca_cartes_10 + ca_cartes_20 + ca_seances_unitaires +
                           ca_frais_inscription + ca_personal_training + ca_coaching_nutrition +
                           ca_suivi_remote + ca_cours_specialises + ca_competitions_internes +
                           ca_competitions_externes + ca_seminaires + ca_team_building +
                           ca_merchandising_vetements + ca_merchandising_accessoires +
                           ca_complements + ca_boissons_snacks +
                           ca_sous_location + ca_partenariats + ca_sponsoring;

  const ca_total = ca_recurrent + ca_non_recurrent;
  const pourcent_recurrent = ca_total > 0 ? (ca_recurrent / ca_total) * 100 : 0;

  const achats_marchandises = getAnswerValue(answers, 'charges_exploitation', 'achats_marchandises', 0);
  const variation_stock = getAnswerValue(answers, 'charges_exploitation', 'variation_stock', 0);
  const achats_fournitures = getAnswerValue(answers, 'charges_exploitation', 'achats_fournitures', 0);

  const loyer_mensuel_ht = getAnswerValue(answers, 'charges_exploitation', 'loyer_mensuel_ht', 0);
  const charges_locatives_mensuelles = getAnswerValue(answers, 'charges_exploitation', 'charges_locatives_mensuelles', 0);
  const taxe_fonciere = getAnswerValue(answers, 'charges_exploitation', 'taxe_fonciere', 0);
  const loyer_annuel_total = (loyer_mensuel_ht + charges_locatives_mensuelles) * 12 + taxe_fonciere;

  const electricite_annuel = getAnswerValue(answers, 'charges_exploitation', 'electricite_annuel', 0);
  const eau_annuel = getAnswerValue(answers, 'charges_exploitation', 'eau_annuel', 0);
  const gaz_chauffage_annuel = getAnswerValue(answers, 'charges_exploitation', 'gaz_chauffage_annuel', 0);
  const energies_total = electricite_annuel + eau_annuel + gaz_chauffage_annuel;

  const entretien_locaux = getAnswerValue(answers, 'charges_exploitation', 'entretien_locaux', 0);
  const entretien_materiel = getAnswerValue(answers, 'charges_exploitation', 'entretien_materiel', 0);
  const reparations_exceptionnelles = getAnswerValue(answers, 'charges_exploitation', 'reparations_exceptionnelles', 0);
  const entretien_total = entretien_locaux + entretien_materiel + reparations_exceptionnelles;

  const assurance_rc_pro = getAnswerValue(answers, 'charges_exploitation', 'assurance_rc_pro', 0);
  const assurance_locaux = getAnswerValue(answers, 'charges_exploitation', 'assurance_locaux', 0);
  const assurance_materiel = getAnswerValue(answers, 'charges_exploitation', 'assurance_materiel', 0);
  const assurance_prevoyance = getAnswerValue(answers, 'charges_exploitation', 'assurance_prevoyance', 0);
  const mutuelle_entreprise = getAnswerValue(answers, 'charges_exploitation', 'mutuelle_entreprise', 0);
  const assurances_total = assurance_rc_pro + assurance_locaux + assurance_materiel +
                           assurance_prevoyance + mutuelle_entreprise;

  const honoraires_comptable = getAnswerValue(answers, 'charges_exploitation', 'honoraires_comptable', 0);
  const honoraires_avocat = getAnswerValue(answers, 'charges_exploitation', 'honoraires_avocat', 0);
  const cotisations_professionnelles = getAnswerValue(answers, 'charges_exploitation', 'cotisations_professionnelles', 0);
  const affiliation_crossfit_annuel = getAnswerValue(answers, 'charges_exploitation', 'affiliation_crossfit_annuel', 0);
  const licences_federales = getAnswerValue(answers, 'charges_exploitation', 'licences_federales', 0);
  const autres_services_exterieurs = getAnswerValue(answers, 'charges_exploitation', 'autres_services_exterieurs', 0);
  const services_exterieurs_total = honoraires_comptable + honoraires_avocat + cotisations_professionnelles +
                                    affiliation_crossfit_annuel + licences_federales + autres_services_exterieurs;

  const telephone_internet = getAnswerValue(answers, 'charges_exploitation', 'telephone_internet', 0);
  const frais_postaux = getAnswerValue(answers, 'charges_exploitation', 'frais_postaux', 0);
  const logiciel_planning = getAnswerValue(answers, 'charges_exploitation', 'logiciel_planning', 0);
  const logiciel_comptabilite = getAnswerValue(answers, 'charges_exploitation', 'logiciel_comptabilite', 0);
  const crm = getAnswerValue(answers, 'charges_exploitation', 'crm', 0);
  const site_web_hebergement = getAnswerValue(answers, 'charges_exploitation', 'site_web_hebergement', 0);
  const abonnements_musique = getAnswerValue(answers, 'charges_exploitation', 'abonnements_musique', 0);
  const autres_logiciels = getAnswerValue(answers, 'charges_exploitation', 'autres_logiciels', 0);
  const communication_total = telephone_internet + frais_postaux + logiciel_planning + logiciel_comptabilite +
                              crm + site_web_hebergement + abonnements_musique + autres_logiciels;

  const google_ads = getAnswerValue(answers, 'charges_exploitation', 'google_ads', 0);
  const facebook_instagram_ads = getAnswerValue(answers, 'charges_exploitation', 'facebook_instagram_ads', 0);
  const publicite_locale = getAnswerValue(answers, 'charges_exploitation', 'publicite_locale', 0);
  const evenements_marketing = getAnswerValue(answers, 'charges_exploitation', 'evenements_marketing', 0);
  const creation_graphique = getAnswerValue(answers, 'charges_exploitation', 'creation_graphique', 0);
  const cadeaux_clients = getAnswerValue(answers, 'charges_exploitation', 'cadeaux_clients', 0);
  const marketing_total = google_ads + facebook_instagram_ads + publicite_locale +
                          evenements_marketing + creation_graphique + cadeaux_clients;

  const salaires_bruts_gerant = getAnswerValue(answers, 'charges_exploitation', 'salaires_bruts_gerant', 0);
  const salaires_bruts_coachs = getAnswerValue(answers, 'charges_exploitation', 'salaires_bruts_coachs', 0);
  const salaires_bruts_administratif = getAnswerValue(answers, 'charges_exploitation', 'salaires_bruts_administratif', 0);
  const charges_sociales_patronales = getAnswerValue(answers, 'charges_exploitation', 'charges_sociales_patronales', 0);
  const cotisations_sociales_tns = getAnswerValue(answers, 'charges_exploitation', 'cotisations_sociales_tns', 0);
  const charges_freelance = getAnswerValue(answers, 'charges_exploitation', 'charges_freelance', 0);
  const participation_transport = getAnswerValue(answers, 'charges_exploitation', 'participation_transport', 0);
  const tickets_restaurant = getAnswerValue(answers, 'charges_exploitation', 'tickets_restaurant', 0);
  const formation_personnel = getAnswerValue(answers, 'charges_exploitation', 'formation_personnel', 0);
  const autres_charges_personnel = getAnswerValue(answers, 'charges_exploitation', 'autres_charges_personnel', 0);
  const masse_salariale_total = salaires_bruts_gerant + salaires_bruts_coachs + salaires_bruts_administratif +
                                charges_sociales_patronales + cotisations_sociales_tns + charges_freelance +
                                participation_transport + tickets_restaurant + formation_personnel + autres_charges_personnel;

  const cfe = getAnswerValue(answers, 'charges_exploitation', 'cfe', 0);
  const cvae = getAnswerValue(answers, 'charges_exploitation', 'cvae', 0);
  const taxe_apprentissage = getAnswerValue(answers, 'charges_exploitation', 'taxe_apprentissage', 0);
  const participation_formation = getAnswerValue(answers, 'charges_exploitation', 'participation_formation', 0);
  const autres_impots_taxes = getAnswerValue(answers, 'charges_exploitation', 'autres_impots_taxes', 0);
  const impots_total = cfe + cvae + taxe_apprentissage + participation_formation + autres_impots_taxes;

  const frais_bancaires = getAnswerValue(answers, 'charges_exploitation', 'frais_bancaires', 0);
  const interets_emprunts = getAnswerValue(answers, 'charges_exploitation', 'interets_emprunts', 0);
  const frais_financiers_total = frais_bancaires + interets_emprunts;

  const amortissements = getAnswerValue(answers, 'charges_exploitation', 'amortissements', 0);
  const provisions = getAnswerValue(answers, 'charges_exploitation', 'provisions', 0);
  const autres_charges_fixes = getAnswerValue(answers, 'charges_exploitation', 'autres_charges_fixes', 0);

  const charges_total = achats_marchandises + variation_stock + achats_fournitures +
                        loyer_annuel_total + energies_total + entretien_total +
                        assurances_total + services_exterieurs_total + communication_total +
                        marketing_total + masse_salariale_total + impots_total +
                        frais_financiers_total + amortissements + provisions + autres_charges_fixes;

  const ebitda = ca_total - (charges_total - amortissements - provisions - frais_financiers_total);
  const ebitda_avant_amortissements = ebitda;
  const marge_ebitda = ca_total > 0 ? (ebitda / ca_total) * 100 : 0;

  const resultat_net = ca_total - charges_total;
  const marge_nette = ca_total > 0 ? (resultat_net / ca_total) * 100 : 0;

  const loyer_ca_ratio = ca_total > 0 ? (loyer_annuel_total / ca_total) * 100 : 0;
  const ms_ca_ratio = ca_total > 0 ? (masse_salariale_total / ca_total) * 100 : 0;
  const marketing_ca_ratio = ca_total > 0 ? (marketing_total / ca_total) * 100 : 0;
  const charges_ca_ratio = ca_total > 0 ? (charges_total / ca_total) * 100 : 0;

  const tresorerie_actuelle = getAnswerValue(answers, 'resultat_tresorerie', 'tresorerie_actuelle', 0);
  const tresorerie_disponible = getAnswerValue(answers, 'resultat_tresorerie', 'tresorerie_disponible', 0);
  const facilite_caisse = getAnswerValue(answers, 'resultat_tresorerie', 'facilite_caisse', 0);
  const emprunts_capital_restant = getAnswerValue(answers, 'resultat_tresorerie', 'emprunts_capital_restant', 0);
  const echeance_mensuelle_emprunts = getAnswerValue(answers, 'resultat_tresorerie', 'echeance_mensuelle_emprunts', 0);
  const dettes_fournisseurs = getAnswerValue(answers, 'resultat_tresorerie', 'dettes_fournisseurs', 0);
  const creances_clients = getAnswerValue(answers, 'resultat_tresorerie', 'creances_clients', 0);
  const bfr_estime = dettes_fournisseurs - creances_clients;

  return {
    revenus: {
      ca_abonnements_mensuels,
      ca_abonnements_trimestriels,
      ca_abonnements_semestriels,
      ca_abonnements_annuels,
      ca_seances_unitaires,
      ca_frais_inscription,
      ca_personal_training,
      ca_coaching_nutrition,
      ca_suivi_remote,
      ca_cours_specialises,
      ca_competitions_internes,
      ca_competitions_externes,
      ca_seminaires,
      ca_team_building,
      ca_merchandising_vetements,
      ca_merchandising_accessoires,
      ca_complements,
      ca_boissons_snacks,
      ca_sous_location,
      ca_partenariats,
      ca_sponsoring,
      ca_cartes_10,
      ca_cartes_20,
      ca_total,
      ca_recurrent,
      ca_non_recurrent,
      pourcent_recurrent
    },
    charges: {
      achats_marchandises,
      variation_stock,
      achats_fournitures,
      loyer_mensuel_ht,
      charges_locatives_mensuelles,
      taxe_fonciere,
      loyer_annuel_total,
      electricite_annuel,
      eau_annuel,
      gaz_chauffage_annuel,
      energies_total,
      entretien_locaux,
      entretien_materiel,
      reparations_exceptionnelles,
      entretien_total,
      assurance_rc_pro,
      assurance_locaux,
      assurance_materiel,
      assurance_prevoyance,
      mutuelle_entreprise,
      assurances_total,
      honoraires_comptable,
      honoraires_avocat,
      cotisations_professionnelles,
      affiliation_crossfit_annuel,
      licences_federales,
      autres_services_exterieurs,
      services_exterieurs_total,
      telephone_internet,
      frais_postaux,
      logiciel_planning,
      logiciel_comptabilite,
      crm,
      site_web_hebergement,
      abonnements_musique,
      autres_logiciels,
      communication_total,
      google_ads,
      facebook_instagram_ads,
      publicite_locale,
      evenements_marketing,
      creation_graphique,
      cadeaux_clients,
      marketing_total,
      salaires_bruts_gerant,
      salaires_bruts_coachs,
      salaires_bruts_administratif,
      charges_sociales_patronales,
      cotisations_sociales_tns,
      charges_freelance,
      participation_transport,
      tickets_restaurant,
      formation_personnel,
      autres_charges_personnel,
      masse_salariale_total,
      cfe,
      cvae,
      taxe_apprentissage,
      participation_formation,
      autres_impots_taxes,
      impots_total,
      frais_bancaires,
      interets_emprunts,
      frais_financiers_total,
      amortissements,
      provisions,
      autres_charges_fixes,
      charges_total
    },
    resultat: {
      ebitda,
      ebitda_avant_amortissements,
      marge_ebitda,
      resultat_net,
      marge_nette
    },
    ratios: {
      loyer_ca_ratio,
      ms_ca_ratio,
      marketing_ca_ratio,
      charges_ca_ratio
    },
    tresorerie: {
      tresorerie_actuelle,
      tresorerie_disponible,
      facilite_caisse,
      emprunts_capital_restant,
      echeance_mensuelle_emprunts,
      dettes_fournisseurs,
      creances_clients,
      bfr_estime
    }
  };
}

export function extractMembresData(answers: Answer[], financeData: ExtractedFinanceData): ExtractedMembresData {
  const nb_membres_actifs_total = getAnswerValue(answers, 'structure_base', 'nb_membres_actifs_total', 0);
  const nb_membres_illimite = getAnswerValue(answers, 'structure_base', 'nb_membres_illimite', 0);
  const nb_membres_3x_semaine = getAnswerValue(answers, 'structure_base', 'nb_membres_3x_semaine', 0);
  const nb_membres_2x_semaine = getAnswerValue(answers, 'structure_base', 'nb_membres_2x_semaine', 0);
  const nb_membres_1x_semaine = getAnswerValue(answers, 'structure_base', 'nb_membres_1x_semaine', 0);
  const nb_membres_cartes_10 = getAnswerValue(answers, 'structure_base', 'nb_membres_cartes_10', 0);
  const nb_membres_cartes_20 = getAnswerValue(answers, 'structure_base', 'nb_membres_cartes_20', 0);
  const nb_membres_hyrox_only = getAnswerValue(answers, 'structure_base', 'nb_membres_hyrox_only', 0);
  const nb_membres_crossfit_hyrox = getAnswerValue(answers, 'structure_base', 'nb_membres_crossfit_hyrox', 0);
  const nb_membres_avec_pt = getAnswerValue(answers, 'structure_base', 'nb_membres_avec_pt', 0);
  const nb_membres_avec_nutrition = getAnswerValue(answers, 'structure_base', 'nb_membres_avec_nutrition', 0);
  const nb_membres_sans_engagement = getAnswerValue(answers, 'structure_base', 'nb_membres_sans_engagement', 0);
  const nb_membres_engagement_3m = getAnswerValue(answers, 'structure_base', 'nb_membres_engagement_3m', 0);
  const nb_membres_engagement_6m = getAnswerValue(answers, 'structure_base', 'nb_membres_engagement_6m', 0);
  const nb_membres_engagement_12m = getAnswerValue(answers, 'structure_base', 'nb_membres_engagement_12m', 0);

  const hommes_pourcent = getAnswerValue(answers, 'structure_base', 'hommes_pourcent', 0);
  const femmes_pourcent = getAnswerValue(answers, 'structure_base', 'femmes_pourcent', 0);
  const age_moyen_membres = getAnswerValue(answers, 'structure_base', 'age_moyen_membres', 0);
  const moins_25_pourcent = getAnswerValue(answers, 'structure_base', 'moins_25_pourcent', 0);
  const entre_25_35_pourcent = getAnswerValue(answers, 'structure_base', '25_35_pourcent', 0);
  const entre_35_45_pourcent = getAnswerValue(answers, 'structure_base', '35_45_pourcent', 0);
  const plus_45_pourcent = getAnswerValue(answers, 'structure_base', '45_plus_pourcent', 0);

  const tarif_mensuel_illimite = getAnswerValue(answers, 'tarification_detaillee', 'tarif_mensuel_illimite', 0);
  const tarif_mensuel_3x = getAnswerValue(answers, 'tarification_detaillee', 'tarif_mensuel_3x', 0);
  const tarif_mensuel_2x = getAnswerValue(answers, 'tarification_detaillee', 'tarif_mensuel_2x', 0);
  const tarif_mensuel_1x = getAnswerValue(answers, 'tarification_detaillee', 'tarif_mensuel_1x', 0);
  const tarif_carte_10 = getAnswerValue(answers, 'tarification_detaillee', 'tarif_carte_10', 0);
  const tarif_carte_20 = getAnswerValue(answers, 'tarification_detaillee', 'tarif_carte_20', 0);
  const tarif_seance_unitaire = getAnswerValue(answers, 'tarification_detaillee', 'tarif_seance_unitaire', 0);
  const frais_inscription = getAnswerValue(answers, 'tarification_detaillee', 'frais_inscription', 0);
  const reduction_etudiants_pourcent = getAnswerValue(answers, 'tarification_detaillee', 'reduction_etudiants_pourcent', 0);
  const reduction_entreprises_pourcent = getAnswerValue(answers, 'tarification_detaillee', 'reduction_entreprises_pourcent', 0);
  const remise_annuelle_pourcent = getAnswerValue(answers, 'tarification_detaillee', 'remise_annuelle_pourcent', 0);
  const remise_famille_pourcent = getAnswerValue(answers, 'tarification_detaillee', 'remise_famille_pourcent', 0);

  const arpm = nb_membres_actifs_total > 0 && financeData.revenus.ca_total > 0
    ? financeData.revenus.ca_total / 12 / nb_membres_actifs_total
    : 0;

  const anciennes_moyens_mois = getAnswerValue(answers, 'retention_churn', 'anciennes_moyens_mois', 22);
  const ltv_estime = arpm * anciennes_moyens_mois;

  const cout_acquisition_membre = getAnswerValue(answers, 'acquisition_conversion', 'cout_acquisition_membre', 0);
  const cac = cout_acquisition_membre;
  const ltv_cac_ratio = cac > 0 ? ltv_estime / cac : 0;

  return {
    nb_membres_actifs_total,
    nb_membres_illimite,
    nb_membres_3x_semaine,
    nb_membres_2x_semaine,
    nb_membres_1x_semaine,
    nb_membres_cartes_10,
    nb_membres_cartes_20,
    nb_membres_hyrox_only,
    nb_membres_crossfit_hyrox,
    nb_membres_avec_pt,
    nb_membres_avec_nutrition,
    nb_membres_sans_engagement,
    nb_membres_engagement_3m,
    nb_membres_engagement_6m,
    nb_membres_engagement_12m,
    hommes_pourcent,
    femmes_pourcent,
    age_moyen_membres,
    moins_25_pourcent,
    entre_25_35_pourcent,
    entre_35_45_pourcent,
    plus_45_pourcent,
    tarif_mensuel_illimite,
    tarif_mensuel_3x,
    tarif_mensuel_2x,
    tarif_mensuel_1x,
    tarif_carte_10,
    tarif_carte_20,
    tarif_seance_unitaire,
    frais_inscription,
    reduction_etudiants_pourcent,
    reduction_entreprises_pourcent,
    remise_annuelle_pourcent,
    remise_famille_pourcent,
    arpm,
    ltv_estime,
    cac,
    ltv_cac_ratio
  };
}

export function extractOperationsData(answers: Answer[], financeData: ExtractedFinanceData, membresData: ExtractedMembresData): ExtractedOperationsData {
  const surface_totale = getAnswerValue(answers, 'infrastructure_detaillee', 'surface_totale', 1);
  const surface_crossfit = getAnswerValue(answers, 'infrastructure_detaillee', 'surface_crossfit', 0);
  const ca_par_m2 = surface_totale > 0 && financeData.revenus.ca_total > 0
    ? financeData.revenus.ca_total / surface_totale
    : 0;

  const nb_creneaux_semaine = getAnswerValue(answers, 'structure_planning', 'creneaux_semaine', 0);
  const capacite_par_creneau = getAnswerValue(answers, 'structure_planning', 'capacite_par_creneau', 0);
  const participants_moyens_creneau = getAnswerValue(answers, 'structure_planning', 'participants_moyens_creneau', 0);
  const creneaux_prime_time = getAnswerValue(answers, 'structure_planning', 'creneaux_prime_time', 0);
  const participants_prime_time = getAnswerValue(answers, 'structure_planning', 'participants_prime_time', 0);
  const creneaux_off_peak = getAnswerValue(answers, 'structure_planning', 'creneaux_off_peak', 0);
  const participants_off_peak = getAnswerValue(answers, 'structure_planning', 'participants_off_peak', 0);
  const duree_wod_minutes = getAnswerValue(answers, 'structure_planning', 'duree_wod_minutes', 0);
  const temps_rotation_minutes = getAnswerValue(answers, 'structure_planning', 'temps_rotation_minutes', 0);

  const taux_occupation_global_pct = getAnswerValue(answers, 'capacite_occupation', 'taux_occupation_global_pct', 0);
  const taux_occupation_prime_time_pct = getAnswerValue(answers, 'capacite_occupation', 'taux_occupation_prime_time_pct', 0);
  const taux_occupation_off_peak_pct = getAnswerValue(answers, 'capacite_occupation', 'taux_occupation_off_peak_pct', 0);
  const heures_ouverture_semaine = getAnswerValue(answers, 'capacite_occupation', 'heures_ouverture_semaine', 0);
  const jours_fermeture_annee = getAnswerValue(answers, 'capacite_occupation', 'jours_fermeture_annee', 0);
  const creneau_plus_demande = getAnswerValue(answers, 'capacite_occupation', 'creneau_plus_demande', '');
  const creneau_moins_demande = getAnswerValue(answers, 'capacite_occupation', 'creneau_moins_demande', '');

  const essais_gratuits_mois = getAnswerValue(answers, 'acquisition_conversion', 'essais_gratuits_mois', 0);
  const conversions_essai_abonne_mois = getAnswerValue(answers, 'acquisition_conversion', 'conversions_essai_abonne_mois', 0);
  const leads_mensuels = getAnswerValue(answers, 'acquisition_conversion', 'leads_mensuels', 0);
  const taux_conversion_leads_essai_pct = getAnswerValue(answers, 'acquisition_conversion', 'taux_conversion_leads_essai_pct', 0);
  const cout_acquisition_membre = getAnswerValue(answers, 'acquisition_conversion', 'cout_acquisition_membre', 0);
  const canaux_acquisition = getAnswerValue(answers, 'acquisition_conversion', 'canaux_acquisition', '');
  const taux_conversion_pct = essais_gratuits_mois > 0
    ? (conversions_essai_abonne_mois / essais_gratuits_mois) * 100
    : 0;

  const resiliations_mensuelles = getAnswerValue(answers, 'retention_churn', 'resiliations_mensuelles', 0);
  const anciennes_moyens_mois = getAnswerValue(answers, 'retention_churn', 'anciennes_moyens_mois', 0);
  const taux_reabonnement_pct = getAnswerValue(answers, 'retention_churn', 'taux_reabonnement_pct', 0);
  const raisons_principales_depart = getAnswerValue(answers, 'retention_churn', 'raisons_principales_depart', '');
  const taux_churn_pct = membresData.nb_membres_actifs_total > 0
    ? (resiliations_mensuelles / membresData.nb_membres_actifs_total) * 100
    : 0;

  const frequentation_moyenne_mois = getAnswerValue(answers, 'engagement_satisfaction', 'frequentation_moyenne_mois', 0);
  const nps_score = getAnswerValue(answers, 'engagement_satisfaction', 'nps_score', 0);
  const satisfaction_globale_10 = getAnswerValue(answers, 'engagement_satisfaction', 'satisfaction_globale_10', 0);
  const avis_google_nombre = getAnswerValue(answers, 'engagement_satisfaction', 'avis_google_nombre', 0);
  const note_google_5 = getAnswerValue(answers, 'engagement_satisfaction', 'note_google_5', 0);
  const taux_recommandation_pct = getAnswerValue(answers, 'engagement_satisfaction', 'taux_recommandation_pct', 0);
  const taux_renouvellement_pct = getAnswerValue(answers, 'engagement_satisfaction', 'taux_renouvellement_pct', 0);

  return {
    surface_totale,
    surface_crossfit,
    ca_par_m2,
    nb_creneaux_semaine,
    capacite_par_creneau,
    participants_moyens_creneau,
    creneaux_prime_time,
    participants_prime_time,
    creneaux_off_peak,
    participants_off_peak,
    duree_wod_minutes,
    temps_rotation_minutes,
    taux_occupation_global_pct,
    taux_occupation_prime_time_pct,
    taux_occupation_off_peak_pct,
    heures_ouverture_semaine,
    jours_fermeture_annee,
    creneau_plus_demande,
    creneau_moins_demande,
    essais_gratuits_mois,
    conversions_essai_abonne_mois,
    leads_mensuels,
    taux_conversion_leads_essai_pct,
    cout_acquisition_membre,
    canaux_acquisition,
    taux_conversion_pct,
    resiliations_mensuelles,
    anciennes_moyens_mois,
    taux_reabonnement_pct,
    raisons_principales_depart,
    taux_churn_pct,
    frequentation_moyenne_mois,
    nps_score,
    satisfaction_globale_10,
    avis_google_nombre,
    note_google_5,
    taux_recommandation_pct,
    taux_renouvellement_pct
  };
}

export function extractRHData(answers: Answer[]): ExtractedRHData {
  const nombre_coaches = getAnswerValue(answers, 'structure_equipe', 'nombre_coaches', 0);
  const coaches_temps_plein = getAnswerValue(answers, 'structure_equipe', 'coaches_temps_plein', 0);
  const coaches_temps_partiel = getAnswerValue(answers, 'structure_equipe', 'coaches_temps_partiel', 0);
  const coaches_freelance = getAnswerValue(answers, 'structure_equipe', 'coaches_freelance', 0);
  const ratio_coach_membres = getAnswerValue(answers, 'structure_equipe', 'ratio_coach_membres', 0);
  const anciennete_moyenne_coaches_mois = getAnswerValue(answers, 'structure_equipe', 'anciennete_moyenne_coaches_mois', 0);
  const turnover_coaches_pct = getAnswerValue(answers, 'structure_equipe', 'turnover_coaches_pct', 0);
  const personnel_admin = getAnswerValue(answers, 'structure_equipe', 'personnel_admin', 0);
  const personnel_menage = getAnswerValue(answers, 'structure_equipe', 'personnel_menage', 0);

  const coaches_cf_l1 = getAnswerValue(answers, 'certifications', 'coaches_cf_l1', 0);
  const coaches_cf_l2 = getAnswerValue(answers, 'certifications', 'coaches_cf_l2', 0);
  const coaches_cf_l3 = getAnswerValue(answers, 'certifications', 'coaches_cf_l3', 0);
  const coaches_cf_l4 = getAnswerValue(answers, 'certifications', 'coaches_cf_l4', 0);
  const certifications_complementaires = getAnswerValue(answers, 'certifications', 'certifications_complementaires', 0);
  const specialisations_equipe = getAnswerValue(answers, 'certifications', 'specialisations_equipe', '');

  const budget_formation_annuel = getAnswerValue(answers, 'formation_developpement', 'budget_formation_annuel', 0);
  const heures_formation_coach_an = getAnswerValue(answers, 'formation_developpement', 'heures_formation_coach_an', 0);
  const formations_prevues = getAnswerValue(answers, 'formation_developpement', 'formations_prevues', '');

  const salaire_moyen_coach_temps_plein = getAnswerValue(answers, 'remuneration_coaches', 'salaire_moyen_coach_temps_plein', 0);
  const taux_horaire_coach_partiel = getAnswerValue(answers, 'remuneration_coaches', 'taux_horaire_coach_partiel', 0);
  const taux_horaire_freelance = getAnswerValue(answers, 'remuneration_coaches', 'taux_horaire_freelance', 0);
  const primes_variables = getAnswerValue(answers, 'remuneration_coaches', 'primes_variables', '');
  const avantages_sociaux = getAnswerValue(answers, 'remuneration_coaches', 'avantages_sociaux', '');

  const nps_coaching = getAnswerValue(answers, 'engagement_satisfaction', 'nps_coaching', 0);
  const satisfaction_coaching_10 = getAnswerValue(answers, 'engagement_satisfaction', 'satisfaction_coaching', 0);

  return {
    nombre_coaches,
    coaches_temps_plein,
    coaches_temps_partiel,
    coaches_freelance,
    ratio_coach_membres,
    anciennete_moyenne_coaches_mois,
    turnover_coaches_pct,
    personnel_admin,
    personnel_menage,
    coaches_cf_l1,
    coaches_cf_l2,
    coaches_cf_l3,
    coaches_cf_l4,
    certifications_complementaires,
    specialisations_equipe,
    budget_formation_annuel,
    heures_formation_coach_an,
    formations_prevues,
    salaire_moyen_coach_temps_plein,
    taux_horaire_coach_partiel,
    taux_horaire_freelance,
    primes_variables,
    avantages_sociaux,
    nps_coaching,
    satisfaction_coaching_10
  };
}

export function extractAllData(answers: Answer[]): ExtractedAllData {
  const identite = extractIdentiteData(answers);
  const finance = extractFinanceData(answers);
  const membres = extractMembresData(answers, finance);
  const operations = extractOperationsData(answers, finance, membres);
  const rh = extractRHData(answers);

  return {
    identite,
    finance,
    membres,
    operations,
    rh
  };
}
