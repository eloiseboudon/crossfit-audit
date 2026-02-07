/**
 * @module utils/extractData
 * @description Extraction et structuration des données brutes des réponses d'audit
 * en données financières, membres et opérationnelles exploitables.
 */

/**
 * Récupère la valeur d'une réponse par bloc et code de question.
 *
 * @param {object[]} answers - Tableau des réponses d'audit.
 * @param {string} blockCode - Code du bloc (ex: 'produits_exploitation').
 * @param {string} questionCode - Code de la question (ex: 'ca_abonnements_mensuels').
 * @param {number} [defaultValue=0] - Valeur par défaut si la réponse n'existe pas.
 * @returns {number} Valeur de la réponse ou valeur par défaut.
 */
function getAnswerValue(answers, blockCode, questionCode, defaultValue = 0) {
  const answer = answers.find(
    (item) => item.block_code === blockCode && item.question_code === questionCode
  );
  return answer?.value ?? defaultValue;
}

/**
 * Extrait les données financières des réponses d'audit.
 * Calcule le CA (récurrent/non-récurrent), les charges, l'EBITDA et les ratios clés.
 *
 * @param {object[]} answers - Réponses brutes de l'audit.
 * @returns {object} Données financières structurées : revenus, charges, résultat, ratios.
 */
function extractFinanceData(answers) {
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
  const ca_merchandising = getAnswerValue(answers, 'produits_exploitation', 'ca_merchandising', 0);
  const ca_complements = getAnswerValue(answers, 'produits_exploitation', 'ca_complements', 0);
  const ca_boissons_snacks = getAnswerValue(answers, 'produits_exploitation', 'ca_boissons_snacks', 0);
  const ca_sous_location = getAnswerValue(answers, 'produits_exploitation', 'ca_sous_location', 0);
  const ca_partenariats = getAnswerValue(answers, 'produits_exploitation', 'ca_partenariats', 0);
  const ca_sponsoring = getAnswerValue(answers, 'produits_exploitation', 'ca_sponsoring', 0);

  const ca_recurrent = ca_abonnements_mensuels * 12 +
    ca_abonnements_trimestriels * 4 +
    ca_abonnements_semestriels * 2 +
    ca_abonnements_annuels;

  const ca_non_recurrent = (ca_cartes_10 + ca_cartes_20 + ca_seances_unitaires + ca_frais_inscription +
    ca_personal_training + ca_coaching_nutrition + ca_suivi_remote + ca_cours_specialises +
    ca_competitions_internes + ca_competitions_externes + ca_seminaires + ca_team_building +
    ca_merchandising_vetements + ca_merchandising_accessoires + ca_merchandising + ca_complements +
    ca_boissons_snacks + ca_sous_location + ca_partenariats + ca_sponsoring) * 12;

  const ca_total = ca_recurrent + ca_non_recurrent;
  const pourcent_recurrent = ca_total > 0 ? (ca_recurrent / ca_total) * 100 : 0;

  const loyer_mensuel_ht = getAnswerValue(answers, 'charges_exploitation', 'loyer_mensuel_ht', 0);
  const charges_locatives_mensuelles = getAnswerValue(answers, 'charges_exploitation', 'charges_locatives_mensuelles', 0);
  const taxe_fonciere = getAnswerValue(answers, 'charges_exploitation', 'taxe_fonciere', 0);
  const loyer_annuel_total = (loyer_mensuel_ht + charges_locatives_mensuelles) * 12 + taxe_fonciere;

  const electricite_annuel = getAnswerValue(answers, 'charges_exploitation', 'electricite_annuel', 0);
  const eau_annuel = getAnswerValue(answers, 'charges_exploitation', 'eau_annuel', 0);
  const gaz_chauffage_annuel = getAnswerValue(answers, 'charges_exploitation', 'gaz_chauffage_annuel', 0);
  const energies_total = electricite_annuel + eau_annuel + gaz_chauffage_annuel;

  const marketing_total = getAnswerValue(answers, 'charges_exploitation', 'marketing_total', 0);
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
    charges_sociales_patronales + cotisations_sociales_tns + charges_freelance + participation_transport +
    tickets_restaurant + formation_personnel + autres_charges_personnel;

  const charges_total = loyer_annuel_total + energies_total + marketing_total + masse_salariale_total;

  const ebitda = ca_total - charges_total;
  const marge_ebitda = ca_total > 0 ? (ebitda / ca_total) * 100 : 0;

  const loyer_ca_ratio = ca_total > 0 ? (loyer_annuel_total / ca_total) * 100 : 0;
  const ms_ca_ratio = ca_total > 0 ? (masse_salariale_total / ca_total) * 100 : 0;
  const marketing_ca_ratio = ca_total > 0 ? (marketing_total / ca_total) * 100 : 0;
  const charges_ca_ratio = ca_total > 0 ? (charges_total / ca_total) * 100 : 0;

  return {
    revenus: {
      ca_abonnements_mensuels,
      ca_abonnements_trimestriels,
      ca_abonnements_semestriels,
      ca_abonnements_annuels,
      ca_cartes_10,
      ca_cartes_20,
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
      ca_merchandising,
      ca_complements,
      ca_boissons_snacks,
      ca_sous_location,
      ca_partenariats,
      ca_sponsoring,
      ca_total,
      ca_recurrent,
      ca_non_recurrent,
      pourcent_recurrent
    },
    charges: {
      loyer_mensuel_ht,
      charges_locatives_mensuelles,
      taxe_fonciere,
      loyer_annuel_total,
      electricite_annuel,
      eau_annuel,
      gaz_chauffage_annuel,
      energies_total,
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
      charges_total
    },
    resultat: {
      ebitda,
      marge_ebitda
    },
    ratios: {
      loyer_ca_ratio,
      ms_ca_ratio,
      marketing_ca_ratio,
      charges_ca_ratio
    }
  };
}

/**
 * Extrait les données membres des réponses d'audit.
 * Calcule l'ARPM (revenu moyen par membre) et la LTV estimée.
 *
 * @param {object[]} answers - Réponses brutes de l'audit.
 * @param {object} financeData - Données financières extraites par extractFinanceData.
 * @returns {object} Données membres : nb_membres_actifs_total, arpm, ltv_estime.
 */
function extractMembresData(answers, financeData) {
  const nb_membres_actifs_total = getAnswerValue(answers, 'structure_base', 'nb_membres_actifs_total', 0);
  const nb_membres_illimite = getAnswerValue(answers, 'structure_base', 'nb_membres_illimite', 0);
  const arpm = nb_membres_actifs_total > 0 && financeData.revenus.ca_total > 0
    ? financeData.revenus.ca_total / 12 / nb_membres_actifs_total
    : 0;

  const anciennes_moyens_mois = getAnswerValue(answers, 'retention_churn', 'anciennes_moyens_mois', 22);
  const ltv_estime = arpm * anciennes_moyens_mois;

  return {
    nb_membres_actifs_total,
    nb_membres_illimite,
    arpm,
    ltv_estime
  };
}

/**
 * Extrait les données opérationnelles des réponses d'audit.
 * Calcule le CA/m2, le taux d'occupation, le taux de conversion et le taux de churn.
 *
 * @param {object[]} answers - Réponses brutes de l'audit.
 * @param {object} financeData - Données financières extraites.
 * @param {object} membresData - Données membres extraites.
 * @returns {object} Données opérationnelles : surfaces, occupation, conversion, churn.
 */
function extractOperationsData(answers, financeData, membresData) {
  const surface_totale = getAnswerValue(answers, 'infrastructure_detaillee', 'surface_totale', 1);
  const surface_crossfit = getAnswerValue(answers, 'infrastructure_detaillee', 'surface_crossfit', 0);
  const ca_par_m2 = surface_totale > 0 && financeData.revenus.ca_total > 0
    ? financeData.revenus.ca_total / surface_totale
    : 0;

  const nb_creneaux_semaine = getAnswerValue(answers, 'structure_planning', 'creneaux_semaine', 0) ||
    getAnswerValue(answers, 'structure_planning', 'nb_creneaux_semaine', 0);

  const capacite_par_creneau = getAnswerValue(answers, 'structure_planning', 'capacite_par_creneau', 0);
  const participants_moyens_creneau = getAnswerValue(answers, 'structure_planning', 'participants_moyens_creneau', 0);

  const capacite_max_cours = getAnswerValue(answers, 'capacite_occupation', 'capacite_max_cours', 0);
  const participants_moyen_cours = getAnswerValue(answers, 'capacite_occupation', 'participants_moyen_cours', 0);

  let taux_occupation_global_pct = getAnswerValue(answers, 'capacite_occupation', 'taux_occupation_global_pct', 0);
  if (!taux_occupation_global_pct && capacite_max_cours > 0) {
    taux_occupation_global_pct = (participants_moyen_cours / capacite_max_cours) * 100;
  }

  let essais_gratuits_mois = getAnswerValue(answers, 'acquisition_conversion', 'essais_gratuits_mois', 0);
  if (!essais_gratuits_mois) {
    essais_gratuits_mois = getAnswerValue(answers, 'acquisition_conversion', 'nb_essais_mois_actuel', 0);
  }

  let conversions_essai_abonne_mois = getAnswerValue(answers, 'acquisition_conversion', 'conversions_essai_abonne_mois', 0);
  if (!conversions_essai_abonne_mois) {
    conversions_essai_abonne_mois = getAnswerValue(answers, 'acquisition_conversion', 'nb_conversions_mois_actuel', 0);
  }

  const taux_conversion_pct = essais_gratuits_mois > 0
    ? (conversions_essai_abonne_mois / essais_gratuits_mois) * 100
    : 0;

  let resiliations_mensuelles = getAnswerValue(answers, 'retention_churn', 'resiliations_mensuelles', 0);
  if (!resiliations_mensuelles) {
    resiliations_mensuelles = getAnswerValue(answers, 'retention_churn', 'nb_resiliations_mois', 0) ||
      getAnswerValue(answers, 'retention_churn', 'nb_resiliations_mois_actuel', 0);
  }

  const taux_churn_pct = membresData.nb_membres_actifs_total > 0
    ? (resiliations_mensuelles / membresData.nb_membres_actifs_total) * 100
    : 0;

  return {
    surface_totale,
    surface_crossfit,
    ca_par_m2,
    nb_creneaux_semaine,
    capacite_par_creneau,
    participants_moyens_creneau,
    capacite_max_cours,
    participants_moyen_cours,
    taux_occupation_global_pct,
    essais_gratuits_mois,
    conversions_essai_abonne_mois,
    taux_conversion_pct,
    resiliations_mensuelles,
    taux_churn_pct
  };
}

/**
 * Extrait et agrège toutes les données d'un audit : finance, membres et opérations.
 * Orchestre les trois fonctions d'extraction en chaîne (les données membres
 * dépendent des données financières, les opérations dépendent des deux).
 *
 * @param {object[]} answers - Réponses brutes de l'audit.
 * @returns {{ finance: object, membres: object, operations: object }} Données complètes structurées.
 */
function extractAllData(answers) {
  const finance = extractFinanceData(answers);
  const membres = extractMembresData(answers, finance);
  const operations = extractOperationsData(answers, finance, membres);

  return {
    finance,
    membres,
    operations
  };
}

module.exports = {
  getAnswerValue,
  extractFinanceData,
  extractMembresData,
  extractOperationsData,
  extractAllData
};
