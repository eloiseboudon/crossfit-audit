/**
 * questionnaire.ts
 * QUESTIONNAIRE ULTRA-DÉTAILLÉ CROSSFIT AUDIT PRO
 *
 * Version 3.0 - Expert Level (250 questions)
 * Niveau cabinet conseil international (Deloitte/PwC)
 *
 * Structure:
 * - BLOC 1: Identité & Contexte (35 questions)
 * - BLOC 2: Analyse Financière Complète (80 questions)
 * - BLOC 3: Adhésions & Clientèle (50 questions)
 * - BLOC 4: Planning & Opérations (45 questions)
 * - BLOC 5: RH & Coaching (40 questions)
 *
 * TOTAL: 250 questions pour un audit exhaustif de 3-4 heures
 */

import { QuestionBlock } from './types';

export const questionnaireBlocks: QuestionBlock[] = [
  // ========================================================================
  // BLOC 1: IDENTITÉ & CONTEXTE (35 questions)
  // ========================================================================
  {
    code: 'identite_legale',
    title: '1.1 Identité Légale & Administrative',
    description: 'Informations juridiques et administratives de l\'entité',
    questions: [
      {
        code: 'raison_sociale',
        label: 'Raison sociale complète',
        type: 'text',
        required: true,
        help_text: 'Nom officiel de la société'
      },
      {
        code: 'siret',
        label: 'Numéro SIRET',
        type: 'text',
        required: true,
        help_text: '14 chiffres'
      },
      {
        code: 'code_naf',
        label: 'Code NAF/APE',
        type: 'text',
        help_text: 'Code activité principale (ex: 9312Z)'
      },
      {
        code: 'forme_juridique',
        label: 'Forme juridique',
        type: 'select',
        options: ['SARL', 'SAS', 'SASU', 'EURL', 'SCI', 'Association loi 1901', 'Auto-entrepreneur', 'Autre'],
        required: true
      },
      {
        code: 'capital_social',
        label: 'Capital social',
        type: 'number',
        unit: '€',
        help_text: 'Montant du capital social'
      },
      {
        code: 'nb_associes',
        label: 'Nombre d\'associés/actionnaires',
        type: 'number'
      },
      {
        code: 'repartition_capital',
        label: 'Répartition du capital',
        type: 'text',
        help_text: 'Ex: Associé 1: 60%, Associé 2: 40%'
      },
      {
        code: 'regime_fiscal',
        label: 'Régime fiscal',
        type: 'select',
        options: ['IS (Impôt sur les Sociétés)', 'IR (Impôt sur le Revenu)', 'Micro-BNC', 'Réel simplifié', 'Réel normal']
      },
      {
        code: 'regime_tva',
        label: 'Régime de TVA',
        type: 'select',
        options: ['Franchise en base', 'Réel normal', 'Réel simplifié']
      },
      {
        code: 'affiliation_crossfit',
        label: 'Numéro d\'affiliation CrossFit',
        type: 'text',
        help_text: 'Numéro d\'affiliation CrossFit HQ'
      },
      {
        code: 'date_affiliation',
        label: 'Date d\'affiliation CrossFit',
        type: 'date'
      },
      {
        code: 'annee_ouverture',
        label: 'Année d\'ouverture de la salle',
        type: 'number',
        required: true
      },
      {
        code: 'statut_gerant',
        label: 'Statut du gérant principal',
        type: 'select',
        options: ['Gérant majoritaire', 'Gérant minoritaire', 'Gérant égalitaire', 'Président SAS', 'Directeur salarié']
      }
    ]
  },

  {
    code: 'infrastructure_detaillee',
    title: '1.2 Infrastructure & Équipements Détaillés',
    description: 'Analyse exhaustive des locaux, surfaces et matériel',
    questions: [
      // Surfaces détaillées (10 questions)
      {
        code: 'surface_totale',
        label: 'Surface totale du local',
        type: 'number',
        unit: 'm²',
        required: true,
        help_text: 'Surface totale exploitable'
      },
      {
        code: 'surface_crossfit',
        label: 'Surface zone CrossFit',
        type: 'number',
        unit: 'm²',
        required: true
      },
      {
        code: 'surface_hyrox',
        label: 'Surface zone Hyrox',
        type: 'number',
        unit: 'm²'
      },
      {
        code: 'surface_muscu',
        label: 'Surface zone musculation',
        type: 'number',
        unit: 'm²'
      },
      {
        code: 'surface_vestiaires',
        label: 'Surface vestiaires (H+F)',
        type: 'number',
        unit: 'm²'
      },
      {
        code: 'surface_accueil',
        label: 'Surface accueil/réception',
        type: 'number',
        unit: 'm²'
      },
      {
        code: 'surface_bureaux',
        label: 'Surface bureaux/administratif',
        type: 'number',
        unit: 'm²'
      },
      {
        code: 'surface_stockage',
        label: 'Surface stockage/réserve',
        type: 'number',
        unit: 'm²'
      },

      // Vestiaires & Sanitaires (5 questions)
      {
        code: 'nb_vestiaires_hommes',
        label: 'Nombre de vestiaires hommes',
        type: 'number'
      },
      {
        code: 'nb_vestiaires_femmes',
        label: 'Nombre de vestiaires femmes',
        type: 'number'
      },
      {
        code: 'nb_douches_hommes',
        label: 'Nombre de douches hommes',
        type: 'number'
      },
      {
        code: 'nb_douches_femmes',
        label: 'Nombre de douches femmes',
        type: 'number'
      },
      {
        code: 'nb_wc_total',
        label: 'Nombre total de WC',
        type: 'number'
      },

      // Équipements techniques (7 questions)
      {
        code: 'hauteur_sous_plafond',
        label: 'Hauteur sous plafond',
        type: 'number',
        unit: 'm',
        help_text: 'Hauteur minimale en zone CrossFit'
      },
      {
        code: 'climatisation',
        label: 'Climatisation/Chauffage',
        type: 'select',
        options: ['Aucun', 'Chauffage seul', 'Clim seule', 'Clim réversible', 'VMC double flux']
      },
      {
        code: 'ventilation',
        label: 'Système de ventilation',
        type: 'select',
        options: ['Naturelle', 'VMC simple flux', 'VMC double flux', 'Extracteurs']
      },
      {
        code: 'nb_places_parking',
        label: 'Nombre de places de parking',
        type: 'number',
        help_text: 'Places dédiées ou à proximité'
      },
      {
        code: 'acces_pmr',
        label: 'Accès PMR (Personnes à Mobilité Réduite)',
        type: 'boolean'
      },
      {
        code: 'valeur_totale_materiel',
        label: 'Valeur totale du matériel',
        type: 'number',
        unit: '€',
        help_text: 'Valeur estimée de tout le matériel'
      },
      {
        code: 'age_moyen_materiel',
        label: 'Âge moyen du matériel',
        type: 'number',
        unit: 'ans',
        help_text: 'Estimation de l\'âge moyen des équipements'
      },

      // Inventaire matériel détaillé (22 questions)
      // Barres
      {
        code: 'nb_barres_olympiques',
        label: 'Nombre de barres olympiques (20kg)',
        type: 'number'
      },
      {
        code: 'nb_barres_femmes',
        label: 'Nombre de barres femmes (15kg)',
        type: 'number'
      },
      {
        code: 'nb_barres_techniques',
        label: 'Nombre de barres techniques (training)',
        type: 'number'
      },
      // Poids
      {
        code: 'poids_total_disques_kg',
        label: 'Poids total des disques',
        type: 'number',
        unit: 'kg',
        help_text: 'Total bumpers + disques acier'
      },
      // Structure
      {
        code: 'nb_racks',
        label: 'Nombre de racks/squat stands',
        type: 'number'
      },
      {
        code: 'nb_rigs',
        label: 'Nombre de rigs',
        type: 'number'
      },
      {
        code: 'nb_pull_up_bars',
        label: 'Nombre de postes pull-up',
        type: 'number'
      },
      {
        code: 'nb_anneaux',
        label: 'Nombre de paires d\'anneaux',
        type: 'number'
      },
      // Cardio
      {
        code: 'nb_rowers',
        label: 'Nombre de rameurs (rowers)',
        type: 'number'
      },
      {
        code: 'nb_assault_bikes',
        label: 'Nombre d\'assault bikes',
        type: 'number'
      },
      {
        code: 'nb_ski_ergs',
        label: 'Nombre de ski ergs',
        type: 'number'
      },
      {
        code: 'nb_echo_bikes',
        label: 'Nombre d\'echo bikes',
        type: 'number'
      },
      {
        code: 'nb_tapis_course',
        label: 'Nombre de tapis de course',
        type: 'number'
      },
      // Accessoires
      {
        code: 'nb_wall_balls',
        label: 'Nombre de wall balls',
        type: 'number'
      },
      {
        code: 'nb_kettlebells',
        label: 'Nombre de kettlebells',
        type: 'number'
      },
      {
        code: 'nb_dumbbells',
        label: 'Nombre de paires de dumbbells',
        type: 'number'
      },
      {
        code: 'nb_boxes',
        label: 'Nombre de boxes (plyo)',
        type: 'number'
      },
      {
        code: 'nb_cordes',
        label: 'Nombre de cordes à grimper',
        type: 'number'
      },
      // Spécialisé
      {
        code: 'nb_ghd',
        label: 'Nombre de GHD',
        type: 'number'
      },
      {
        code: 'nb_reverse_hyper',
        label: 'Nombre de reverse hyper',
        type: 'number'
      },
      {
        code: 'nb_sleds',
        label: 'Nombre de sleds/prowlers',
        type: 'number'
      },
      {
        code: 'nb_strongman',
        label: 'Nombre d\'équipements strongman',
        type: 'number',
        help_text: 'Yoke, atlas stones, logs, etc.'
      },
      // État
      {
        code: 'etat_general_materiel',
        label: 'État général du matériel',
        type: 'select',
        options: ['Excellent', 'Bon', 'Moyen', 'Mauvais']
      },
      {
        code: 'date_derniere_renovation',
        label: 'Date de la dernière rénovation/investissement majeur',
        type: 'date'
      }
    ]
  },

  {
    code: 'localisation',
    title: '1.3 Localisation & Environnement',
    description: 'Contexte géographique et accessibilité',
    questions: [
      {
        code: 'type_zone',
        label: 'Type de zone',
        type: 'select',
        options: ['Centre-ville', 'Zone commerciale', 'Zone résidentielle', 'Zone industrielle', 'Zone mixte']
      },
      {
        code: 'visibilite_rue',
        label: 'Visibilité depuis la rue',
        type: 'select',
        options: ['Excellente (vitrine visible)', 'Bonne (enseigne visible)', 'Moyenne (peu visible)', 'Faible (invisible)']
      },
      {
        code: 'transports_proximite',
        label: 'Transports en commun à proximité',
        type: 'multiselect',
        options: ['Métro', 'Bus', 'Tramway', 'Train', 'Aucun']
      },
      {
        code: 'population_bassin_5km',
        label: 'Population dans un rayon de 5km',
        type: 'number',
        help_text: 'Estimation de la population potentielle'
      },
      {
        code: 'revenus_moyens_zone',
        label: 'Revenus moyens de la zone',
        type: 'select',
        options: ['Faibles (<25k€)', 'Moyens (25-35k€)', 'Élevés (35-50k€)', 'Très élevés (>50k€)']
      }
    ]
  },

  // ========================================================================
  // BLOC 2: ANALYSE FINANCIÈRE COMPLÈTE (80 questions)
  // ========================================================================
  {
    code: 'produits_exploitation',
    title: '2.1 Produits d\'Exploitation - Chiffre d\'Affaires',
    description: 'Analyse détaillée de toutes les sources de revenus (12 derniers mois)',
    questions: [
      // Ventes de prestations (12 questions)
      {
        code: 'ca_abonnements_mensuels',
        label: 'CA Abonnements mensuels',
        type: 'number',
        unit: '€/an',
        required: true,
        help_text: 'Chiffre d\'affaires généré par les abonnements mensuels sur 12 mois'
      },
      {
        code: 'ca_abonnements_trimestriels',
        label: 'CA Abonnements trimestriels',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_abonnements_semestriels',
        label: 'CA Abonnements semestriels',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_abonnements_annuels',
        label: 'CA Abonnements annuels',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_cartes_10',
        label: 'CA Cartes 10 séances',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_cartes_20',
        label: 'CA Cartes 20 séances',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_seances_unitaires',
        label: 'CA Séances unitaires',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_frais_inscription',
        label: 'CA Frais d\'inscription',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_personal_training',
        label: 'CA Personal Training',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_coaching_nutrition',
        label: 'CA Coaching nutrition',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_suivi_remote',
        label: 'CA Suivi vidéo/remote',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_cours_specialises',
        label: 'CA Cours spécialisés (Hyrox, WL, etc.)',
        type: 'number',
        unit: '€/an'
      },

      // Événements (4 questions)
      {
        code: 'ca_competitions_internes',
        label: 'CA Compétitions internes',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_competitions_externes',
        label: 'CA Compétitions externes organisées',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_seminaires',
        label: 'CA Séminaires/Workshops',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_team_building',
        label: 'CA Team building entreprises',
        type: 'number',
        unit: '€/an'
      },

      // Ventes marchandises (4 questions)
      {
        code: 'ca_merchandising_vetements',
        label: 'CA Merchandising vêtements',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_merchandising_accessoires',
        label: 'CA Merchandising accessoires',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_complements',
        label: 'CA Compléments alimentaires',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_boissons_snacks',
        label: 'CA Boissons/Snacks',
        type: 'number',
        unit: '€/an'
      },

      // Autres produits (5 questions)
      {
        code: 'ca_sous_location',
        label: 'CA Sous-location d\'espaces',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_partenariats',
        label: 'CA Partenariats/Commissions',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'ca_sponsoring',
        label: 'CA Sponsoring',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'subventions_publiques',
        label: 'Subventions publiques reçues',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'aides_emploi',
        label: 'Aides à l\'emploi',
        type: 'number',
        unit: '€/an'
      }
    ]
  },

  {
    code: 'charges_exploitation',
    title: '2.2 Charges d\'Exploitation - Dépenses Détaillées',
    description: 'Analyse exhaustive de toutes les charges (12 derniers mois)',
    questions: [
      // Achats (3 questions)
      {
        code: 'achats_marchandises',
        label: 'Achats de marchandises',
        type: 'number',
        unit: '€/an',
        help_text: 'Vêtements, compléments, etc.'
      },
      {
        code: 'variation_stock',
        label: 'Variation de stock marchandises',
        type: 'number',
        unit: '€'
      },
      {
        code: 'achats_fournitures',
        label: 'Achats matières/fournitures',
        type: 'number',
        unit: '€/an',
        help_text: 'Produits d\'entretien, papeterie, etc.'
      },

      // Loyer & charges locatives (3 questions)
      {
        code: 'loyer_mensuel_ht',
        label: 'Loyer mensuel HT',
        type: 'number',
        unit: '€/mois',
        required: true
      },
      {
        code: 'charges_locatives_mensuelles',
        label: 'Charges locatives mensuelles',
        type: 'number',
        unit: '€/mois',
        help_text: 'Charges de copropriété, ordures, etc.'
      },
      {
        code: 'taxe_fonciere',
        label: 'Taxe foncière annuelle',
        type: 'number',
        unit: '€/an'
      },

      // Énergies & fluides (3 questions)
      {
        code: 'electricite_annuel',
        label: 'Électricité',
        type: 'number',
        unit: '€/an',
        required: true
      },
      {
        code: 'eau_annuel',
        label: 'Eau',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'gaz_chauffage_annuel',
        label: 'Gaz/Chauffage',
        type: 'number',
        unit: '€/an'
      },

      // Entretien & Réparations (3 questions)
      {
        code: 'entretien_locaux',
        label: 'Entretien des locaux',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'entretien_materiel',
        label: 'Entretien du matériel',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'reparations_exceptionnelles',
        label: 'Réparations exceptionnelles',
        type: 'number',
        unit: '€/an'
      },

      // Assurances (5 questions)
      {
        code: 'assurance_rc_pro',
        label: 'Assurance RC Professionnelle',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'assurance_locaux',
        label: 'Assurance locaux',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'assurance_materiel',
        label: 'Assurance matériel',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'assurance_prevoyance',
        label: 'Assurance prévoyance dirigeant',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'mutuelle_entreprise',
        label: 'Mutuelle entreprise (part employeur)',
        type: 'number',
        unit: '€/an'
      },

      // Services extérieurs (6 questions)
      {
        code: 'honoraires_comptable',
        label: 'Honoraires comptable',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'honoraires_avocat',
        label: 'Honoraires avocat/juridique',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'cotisations_professionnelles',
        label: 'Cotisations professionnelles',
        type: 'number',
        unit: '€/an',
        help_text: 'Chambres de commerce, syndicats, etc.'
      },
      {
        code: 'affiliation_crossfit_annuel',
        label: 'Affiliation CrossFit HQ',
        type: 'number',
        unit: '€/an',
        help_text: 'Coût annuel d\'affiliation CrossFit'
      },
      {
        code: 'licences_federales',
        label: 'Licences fédérales',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'autres_services_exterieurs',
        label: 'Autres services extérieurs',
        type: 'number',
        unit: '€/an'
      },

      // Logiciels & Outils (6 questions)
      {
        code: 'logiciel_planning',
        label: 'Logiciel planning (Wodify, etc.)',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'logiciel_comptabilite',
        label: 'Logiciel comptabilité',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'crm',
        label: 'CRM/Gestion relation client',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'site_web_hebergement',
        label: 'Site web & hébergement',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'abonnements_musique',
        label: 'Abonnements musique/SACEM',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'autres_logiciels',
        label: 'Autres logiciels',
        type: 'number',
        unit: '€/an'
      },

      // Marketing & Communication (6 questions)
      {
        code: 'google_ads',
        label: 'Google Ads',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'facebook_instagram_ads',
        label: 'Facebook/Instagram Ads',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'publicite_locale',
        label: 'Publicité locale (flyers, affichage)',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'evenements_marketing',
        label: 'Événements marketing',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'creation_graphique',
        label: 'Création graphique/photo/vidéo',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'cadeaux_clients',
        label: 'Cadeaux clients',
        type: 'number',
        unit: '€/an'
      },

      // Frais bancaires (2 questions)
      {
        code: 'frais_bancaires',
        label: 'Frais bancaires',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'interets_emprunts',
        label: 'Intérêts d\'emprunts',
        type: 'number',
        unit: '€/an'
      },

      // Impôts & Taxes (5 questions)
      {
        code: 'cfe',
        label: 'CFE (Cotisation Foncière Entreprises)',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'cvae',
        label: 'CVAE (si applicable)',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'taxe_apprentissage',
        label: 'Taxe apprentissage',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'participation_formation',
        label: 'Participation formation continue',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'autres_impots_taxes',
        label: 'Autres impôts et taxes',
        type: 'number',
        unit: '€/an'
      },

      // Charges de personnel (10 questions)
      {
        code: 'salaires_bruts_gerant',
        label: 'Salaires bruts gérant',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'salaires_bruts_coachs',
        label: 'Salaires bruts coachs salariés',
        type: 'number',
        unit: '€/an',
        required: true
      },
      {
        code: 'salaires_bruts_administratif',
        label: 'Salaires bruts personnel administratif',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'charges_sociales_patronales',
        label: 'Charges sociales patronales',
        type: 'number',
        unit: '€/an',
        required: true,
        help_text: 'Charges sociales sur salaires'
      },
      {
        code: 'cotisations_sociales_tns',
        label: 'Cotisations sociales TNS (gérant)',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'charges_freelance',
        label: 'Charges coaching freelance',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'participation_transport',
        label: 'Participation transport',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'tickets_restaurant',
        label: 'Tickets restaurant (part employeur)',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'formation_personnel',
        label: 'Formation personnel',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'autres_charges_personnel',
        label: 'Autres charges personnel',
        type: 'number',
        unit: '€/an'
      },

      // Amortissements (3 questions)
      {
        code: 'amortissement_materiel',
        label: 'Amortissement matériel',
        type: 'number',
        unit: '€/an',
        help_text: 'Dotation aux amortissements du matériel sportif'
      },
      {
        code: 'amortissement_travaux',
        label: 'Amortissement travaux/aménagements',
        type: 'number',
        unit: '€/an',
        help_text: 'Dotation aux amortissements des travaux d\'aménagement'
      },
      {
        code: 'amortissement_vehicule',
        label: 'Amortissement véhicule',
        type: 'number',
        unit: '€/an',
        help_text: 'Dotation aux amortissements du véhicule d\'entreprise'
      }
    ]
  },

  {
    code: 'resultat_tresorerie',
    title: '2.3 Résultat & Trésorerie',
    description: 'Situation financière globale et endettement',
    questions: [
      // Trésorerie (3 questions)
      {
        code: 'tresorerie_actuelle',
        label: 'Trésorerie actuelle totale',
        type: 'number',
        unit: '€',
        help_text: 'Solde bancaire + liquidités disponibles'
      },
      {
        code: 'tresorerie_disponible',
        label: 'Trésorerie disponible immédiate',
        type: 'number',
        unit: '€',
        help_text: 'Trésorerie réellement utilisable (hors réserves)'
      },
      {
        code: 'facilite_caisse',
        label: 'Facilité de caisse autorisée',
        type: 'number',
        unit: '€'
      },

      // Dettes & Créances (7 questions)
      {
        code: 'emprunts_capital_restant',
        label: 'Emprunts - Capital restant dû',
        type: 'number',
        unit: '€',
        help_text: 'Total du capital restant à rembourser'
      },
      {
        code: 'echeance_mensuelle_emprunts',
        label: 'Échéance mensuelle emprunts',
        type: 'number',
        unit: '€/mois'
      },
      {
        code: 'dettes_fournisseurs',
        label: 'Dettes fournisseurs',
        type: 'number',
        unit: '€'
      },
      {
        code: 'dettes_sociales_urssaf',
        label: 'Dettes sociales (URSSAF)',
        type: 'number',
        unit: '€'
      },
      {
        code: 'dettes_fiscales',
        label: 'Dettes fiscales',
        type: 'number',
        unit: '€'
      },
      {
        code: 'creances_clients',
        label: 'Créances clients',
        type: 'number',
        unit: '€',
        help_text: 'Montant dû par les clients'
      },
      {
        code: 'autres_dettes',
        label: 'Autres dettes',
        type: 'number',
        unit: '€'
      },

      // Résultats financiers (4 questions)
      {
        code: 'resultat_exploitation',
        label: 'Résultat d\'exploitation',
        type: 'number',
        unit: '€',
        help_text: 'Résultat d\'exploitation comptable'
      },
      {
        code: 'resultat_net',
        label: 'Résultat net comptable',
        type: 'number',
        unit: '€',
        help_text: 'Résultat net après impôts'
      },
      {
        code: 'ebitda',
        label: 'EBITDA (si connu)',
        type: 'number',
        unit: '€',
        help_text: 'Excédent brut d\'exploitation'
      },
      {
        code: 'capacite_autofinancement',
        label: 'Capacité d\'autofinancement',
        type: 'number',
        unit: '€',
        help_text: 'CAF = résultat net + amortissements + provisions'
      }
    ]
  },

  // ========================================================================
  // BLOC 3: ADHÉSIONS & CLIENTÈLE (50 questions)
  // ========================================================================
  {
    code: 'structure_base',
    title: '3.1 Structure de la Base Membres',
    description: 'Répartition détaillée des adhérents par type d\'abonnement',
    questions: [
      {
        code: 'nb_membres_actifs_total',
        label: 'Nombre TOTAL de membres actifs',
        type: 'number',
        required: true,
        help_text: 'Tous abonnements confondus'
      },
      {
        code: 'nb_membres_illimite',
        label: 'Nombre membres Illimité',
        type: 'number'
      },
      {
        code: 'nb_membres_3x_semaine',
        label: 'Nombre membres 3x/semaine',
        type: 'number'
      },
      {
        code: 'nb_membres_2x_semaine',
        label: 'Nombre membres 2x/semaine',
        type: 'number'
      },
      {
        code: 'nb_membres_1x_semaine',
        label: 'Nombre membres 1x/semaine',
        type: 'number'
      },
      {
        code: 'nb_membres_cartes_10',
        label: 'Nombre membres Carte 10 séances',
        type: 'number'
      },
      {
        code: 'nb_membres_cartes_20',
        label: 'Nombre membres Carte 20 séances',
        type: 'number'
      },
      {
        code: 'nb_membres_hyrox_only',
        label: 'Nombre membres Hyrox only',
        type: 'number'
      },
      {
        code: 'nb_membres_crossfit_hyrox',
        label: 'Nombre membres CrossFit + Hyrox',
        type: 'number'
      },
      {
        code: 'nb_membres_avec_pt',
        label: 'Nombre membres avec Personal Training',
        type: 'number'
      },
      {
        code: 'nb_membres_avec_nutrition',
        label: 'Nombre membres avec suivi nutrition',
        type: 'number'
      },
      {
        code: 'nb_membres_sans_engagement',
        label: 'Nombre membres sans engagement',
        type: 'number'
      },
      {
        code: 'nb_membres_engagement_3m',
        label: 'Nombre membres engagement 3 mois',
        type: 'number'
      },
      {
        code: 'nb_membres_engagement_6m',
        label: 'Nombre membres engagement 6 mois',
        type: 'number'
      },
      {
        code: 'nb_membres_engagement_12m',
        label: 'Nombre membres engagement 12 mois',
        type: 'number'
      }
    ]
  },

  {
    code: 'tarification_detaillee',
    title: '3.2 Tarification Détaillée',
    description: 'Grille tarifaire complète et réductions',
    questions: [
      {
        code: 'prix_illimite_sans_engagement',
        label: 'Prix Illimité sans engagement',
        type: 'number',
        unit: '€/mois',
        required: true
      },
      {
        code: 'prix_illimite_3m',
        label: 'Prix Illimité engagement 3 mois',
        type: 'number',
        unit: '€/mois'
      },
      {
        code: 'prix_illimite_12m',
        label: 'Prix Illimité engagement 12 mois',
        type: 'number',
        unit: '€/mois'
      },
      {
        code: 'prix_3x_semaine',
        label: 'Prix 3x/semaine',
        type: 'number',
        unit: '€/mois'
      },
      {
        code: 'prix_2x_semaine',
        label: 'Prix 2x/semaine',
        type: 'number',
        unit: '€/mois'
      },
      {
        code: 'prix_1x_semaine',
        label: 'Prix 1x/semaine',
        type: 'number',
        unit: '€/mois'
      },
      {
        code: 'prix_carte_10',
        label: 'Prix Carte 10 séances',
        type: 'number',
        unit: '€'
      },
      {
        code: 'prix_carte_20',
        label: 'Prix Carte 20 séances',
        type: 'number',
        unit: '€'
      },
      {
        code: 'prix_seance_unitaire',
        label: 'Prix séance unitaire',
        type: 'number',
        unit: '€'
      },
      {
        code: 'prix_essai',
        label: 'Prix séance d\'essai',
        type: 'number',
        unit: '€'
      },
      {
        code: 'frais_inscription',
        label: 'Frais d\'inscription',
        type: 'number',
        unit: '€'
      },
      {
        code: 'reduction_etudiant',
        label: 'Réduction étudiant',
        type: 'number',
        unit: '%'
      },
      {
        code: 'reduction_couple',
        label: 'Réduction couple',
        type: 'number',
        unit: '%'
      },
      {
        code: 'reduction_famille',
        label: 'Réduction famille',
        type: 'number',
        unit: '%'
      },
      {
        code: 'nb_membres_reductions',
        label: 'Nombre de membres bénéficiant de réductions',
        type: 'number'
      }
    ]
  },

  {
    code: 'demographie',
    title: '3.3 Démographie & Profil Clients',
    description: 'Caractéristiques de la clientèle',
    questions: [
      {
        code: 'age_moyen_membres',
        label: 'Âge moyen des membres',
        type: 'number',
        unit: 'ans'
      },
      {
        code: 'repartition_18_25',
        label: 'Répartition 18-25 ans',
        type: 'number',
        unit: '%'
      },
      {
        code: 'repartition_26_35',
        label: 'Répartition 26-35 ans',
        type: 'number',
        unit: '%'
      },
      {
        code: 'repartition_36_45',
        label: 'Répartition 36-45 ans',
        type: 'number',
        unit: '%'
      },
      {
        code: 'repartition_46_55',
        label: 'Répartition 46-55 ans',
        type: 'number',
        unit: '%'
      },
      {
        code: 'repartition_56_plus',
        label: 'Répartition 56 ans et plus',
        type: 'number',
        unit: '%'
      },
      {
        code: 'ratio_hommes',
        label: 'Pourcentage d\'hommes',
        type: 'number',
        unit: '%'
      },
      {
        code: 'ratio_femmes',
        label: 'Pourcentage de femmes',
        type: 'number',
        unit: '%'
      },
      {
        code: 'distance_moyenne_km',
        label: 'Distance moyenne domicile-box',
        type: 'number',
        unit: 'km'
      },
      {
        code: 'professions_principales',
        label: 'Professions principales des membres',
        type: 'text',
        help_text: 'Ex: Cadres 40%, Professions libérales 30%, etc.'
      }
    ]
  },

  {
    code: 'acquisition_conversion',
    title: '3.4 Acquisition & Conversion',
    description: 'Performance du funnel d\'acquisition',
    questions: [
      {
        code: 'nb_essais_mois_actuel',
        label: 'Nombre d\'essais (mois actuel)',
        type: 'number',
        required: true
      },
      {
        code: 'nb_essais_mois_precedent',
        label: 'Nombre d\'essais (mois précédent)',
        type: 'number'
      },
      {
        code: 'nb_essais_moyenne_3m',
        label: 'Moyenne essais sur 3 mois',
        type: 'number'
      },
      {
        code: 'nb_conversions_mois_actuel',
        label: 'Nombre de conversions (mois actuel)',
        type: 'number',
        required: true
      },
      {
        code: 'delai_moyen_conversion',
        label: 'Délai moyen de conversion',
        type: 'number',
        unit: 'jours',
        help_text: 'Entre l\'essai et l\'inscription'
      },
      {
        code: 'cout_acquisition_moyen',
        label: 'Coût d\'acquisition moyen (CAC)',
        type: 'number',
        unit: '€',
        help_text: 'Dépenses marketing / Nouveaux membres'
      },
      {
        code: 'sources_bouche_oreille',
        label: 'Acquisition par bouche-à-oreille',
        type: 'number',
        unit: '%'
      },
      {
        code: 'sources_reseaux_sociaux',
        label: 'Acquisition par réseaux sociaux',
        type: 'number',
        unit: '%'
      },
      {
        code: 'sources_google',
        label: 'Acquisition par Google (SEO/SEA)',
        type: 'number',
        unit: '%'
      },
      {
        code: 'sources_passage',
        label: 'Acquisition par passage devant la salle',
        type: 'number',
        unit: '%'
      },
      {
        code: 'sources_partenariats',
        label: 'Acquisition par partenariats',
        type: 'number',
        unit: '%'
      },
      {
        code: 'sources_autres',
        label: 'Acquisition par autres sources',
        type: 'number',
        unit: '%'
      }
    ]
  },

  {
    code: 'retention_churn',
    title: '3.5 Rétention & Churn',
    description: 'Fidélisation et taux d\'attrition',
    questions: [
      {
        code: 'nb_resiliations_mois_actuel',
        label: 'Nombre de résiliations (mois actuel)',
        type: 'number',
        required: true
      },
      {
        code: 'nb_resiliations_mois_precedent',
        label: 'Nombre de résiliations (mois précédent)',
        type: 'number'
      },
      {
        code: 'nb_resiliations_moyenne_3m',
        label: 'Moyenne résiliations sur 3 mois',
        type: 'number'
      },
      {
        code: 'duree_moyenne_adhesion',
        label: 'Durée moyenne d\'adhésion',
        type: 'number',
        unit: 'mois'
      },
      {
        code: 'taux_retention_3m',
        label: 'Taux de rétention à 3 mois',
        type: 'number',
        unit: '%',
        help_text: '% de membres toujours là après 3 mois'
      },
      {
        code: 'taux_retention_6m',
        label: 'Taux de rétention à 6 mois',
        type: 'number',
        unit: '%'
      },
      {
        code: 'taux_retention_12m',
        label: 'Taux de rétention à 12 mois',
        type: 'number',
        unit: '%'
      },
      {
        code: 'raisons_prix',
        label: 'Départs pour raison de prix',
        type: 'number',
        unit: '%'
      },
      {
        code: 'raisons_demenagement',
        label: 'Départs pour déménagement',
        type: 'number',
        unit: '%'
      },
      {
        code: 'raisons_blessure',
        label: 'Départs pour blessure',
        type: 'number',
        unit: '%'
      },
      {
        code: 'raisons_temps',
        label: 'Départs pour manque de temps',
        type: 'number',
        unit: '%'
      },
      {
        code: 'raisons_insatisfaction',
        label: 'Départs pour insatisfaction',
        type: 'number',
        unit: '%'
      },
      {
        code: 'raisons_objectif_atteint',
        label: 'Départs pour objectif atteint',
        type: 'number',
        unit: '%'
      },
      {
        code: 'raisons_autres',
        label: 'Départs pour autres raisons',
        type: 'number',
        unit: '%'
      }
    ]
  },

  {
    code: 'engagement_satisfaction',
    title: '3.6 Engagement & Satisfaction',
    description: 'Niveau d\'engagement et satisfaction clients',
    questions: [
      {
        code: 'frequentation_moyenne_semaine',
        label: 'Fréquentation moyenne par membre',
        type: 'number',
        unit: 'séances/semaine',
        help_text: 'Nombre moyen de séances par membre par semaine'
      },
      {
        code: 'nb_membres_assidus',
        label: 'Nombre de membres assidus (4+/semaine)',
        type: 'number'
      },
      {
        code: 'nb_membres_reguliers',
        label: 'Nombre de membres réguliers (2-3/semaine)',
        type: 'number'
      },
      {
        code: 'nb_membres_occasionnels',
        label: 'Nombre de membres occasionnels (≤1/semaine)',
        type: 'number'
      },
      {
        code: 'nb_membres_inactifs_30j',
        label: 'Nombre de membres inactifs >30 jours',
        type: 'number'
      },
      {
        code: 'lifetime_value_moyen',
        label: 'Lifetime Value (LTV) moyen',
        type: 'number',
        unit: '€',
        help_text: 'Revenus totaux générés par membre sur toute la durée'
      },
      {
        code: 'nps_score',
        label: 'NPS Score (Net Promoter Score)',
        type: 'number',
        help_text: 'Score de -100 à +100'
      },
      {
        code: 'satisfaction_globale',
        label: 'Satisfaction globale',
        type: 'number',
        unit: '/10'
      },
      {
        code: 'taux_reponse_enquetes',
        label: 'Taux de réponse aux enquêtes',
        type: 'number',
        unit: '%'
      },
      {
        code: 'nb_avis_google',
        label: 'Nombre d\'avis Google',
        type: 'number'
      },
      {
        code: 'note_moyenne_google',
        label: 'Note moyenne Google',
        type: 'number',
        unit: '/5'
      }
    ]
  },

  // ========================================================================
  // BLOC 4: PLANNING & OPÉRATIONS (45 questions)
  // ========================================================================
  {
    code: 'structure_planning',
    title: '4.1 Structure du Planning',
    description: 'Organisation hebdomadaire des cours',
    questions: [
      {
        code: 'nb_cours_lundi',
        label: 'Nombre de cours le lundi',
        type: 'number',
        required: true
      },
      {
        code: 'nb_cours_mardi',
        label: 'Nombre de cours le mardi',
        type: 'number',
        required: true
      },
      {
        code: 'nb_cours_mercredi',
        label: 'Nombre de cours le mercredi',
        type: 'number',
        required: true
      },
      {
        code: 'nb_cours_jeudi',
        label: 'Nombre de cours le jeudi',
        type: 'number',
        required: true
      },
      {
        code: 'nb_cours_vendredi',
        label: 'Nombre de cours le vendredi',
        type: 'number',
        required: true
      },
      {
        code: 'nb_cours_samedi',
        label: 'Nombre de cours le samedi',
        type: 'number',
        required: true
      },
      {
        code: 'nb_cours_dimanche',
        label: 'Nombre de cours le dimanche',
        type: 'number',
        required: true
      },
      {
        code: 'heure_ouverture_semaine',
        label: 'Heure d\'ouverture en semaine',
        type: 'text',
        help_text: 'Format HH:MM (ex: 06:00)'
      },
      {
        code: 'heure_fermeture_semaine',
        label: 'Heure de fermeture en semaine',
        type: 'text',
        help_text: 'Format HH:MM (ex: 21:00)'
      },
      {
        code: 'heure_ouverture_weekend',
        label: 'Heure d\'ouverture le weekend',
        type: 'text'
      },
      {
        code: 'heure_fermeture_weekend',
        label: 'Heure de fermeture le weekend',
        type: 'text'
      }
    ]
  },

  {
    code: 'capacite_occupation',
    title: '4.2 Capacité & Occupation',
    description: 'Analyse du taux de remplissage des cours',
    questions: [
      {
        code: 'capacite_max_cours',
        label: 'Capacité maximale par cours',
        type: 'number',
        required: true,
        help_text: 'Nombre max de participants autorisés'
      },
      {
        code: 'capacite_confortable_cours',
        label: 'Capacité confortable par cours',
        type: 'number',
        help_text: 'Capacité idéale pour coaching de qualité'
      },
      {
        code: 'participants_moyen_cours',
        label: 'Nombre moyen de participants par cours',
        type: 'number',
        required: true
      },
      {
        code: 'nb_cours_complets_semaine',
        label: 'Nombre de cours complets par semaine',
        type: 'number',
        help_text: 'Cours atteignant la capacité max'
      },
      {
        code: 'nb_cours_faible_remplissage',
        label: 'Nombre de cours à faible remplissage (<30%)',
        type: 'number'
      },
      {
        code: 'occupation_6h_9h',
        label: 'Taux d\'occupation 6h-9h',
        type: 'number',
        unit: '%'
      },
      {
        code: 'occupation_9h_12h',
        label: 'Taux d\'occupation 9h-12h',
        type: 'number',
        unit: '%'
      },
      {
        code: 'occupation_12h_14h',
        label: 'Taux d\'occupation 12h-14h',
        type: 'number',
        unit: '%'
      },
      {
        code: 'occupation_14h_17h',
        label: 'Taux d\'occupation 14h-17h',
        type: 'number',
        unit: '%'
      },
      {
        code: 'occupation_17h_19h',
        label: 'Taux d\'occupation 17h-19h',
        type: 'number',
        unit: '%'
      },
      {
        code: 'occupation_19h_21h',
        label: 'Taux d\'occupation 19h-21h',
        type: 'number',
        unit: '%'
      },
      {
        code: 'creneaux_problematiques',
        label: 'Créneaux problématiques (détail)',
        type: 'text',
        help_text: 'Ex: Mardi 14h, Vendredi 10h, etc.'
      },
      {
        code: 'creneaux_satures',
        label: 'Créneaux saturés (détail)',
        type: 'text',
        help_text: 'Ex: Lundi 18h, Mercredi 19h, etc.'
      },
      {
        code: 'liste_attente_active',
        label: 'Liste d\'attente active',
        type: 'boolean',
        help_text: 'Y a-t-il une liste d\'attente pour certains créneaux ?'
      },
      {
        code: 'nb_personnes_liste_attente',
        label: 'Nombre moyen de personnes en liste d\'attente',
        type: 'number',
        conditional: {
          dependsOn: 'liste_attente_active',
          value: true
        }
      }
    ]
  },

  {
    code: 'types_cours',
    title: '4.3 Types de Cours & Programmation',
    description: 'Répartition des différents types de cours proposés',
    questions: [
      {
        code: 'nb_cours_crossfit_standard',
        label: 'Nb cours CrossFit standard par semaine',
        type: 'number'
      },
      {
        code: 'nb_cours_crossfit_scaled',
        label: 'Nb cours CrossFit scaled/débutants par semaine',
        type: 'number'
      },
      {
        code: 'nb_cours_crossfit_rx_plus',
        label: 'Nb cours CrossFit RX+/avancés par semaine',
        type: 'number'
      },
      {
        code: 'nb_cours_hyrox',
        label: 'Nb cours Hyrox par semaine',
        type: 'number'
      },
      {
        code: 'nb_cours_weightlifting',
        label: 'Nb cours Weightlifting par semaine',
        type: 'number'
      },
      {
        code: 'nb_cours_gymnastics',
        label: 'Nb cours Gymnastics par semaine',
        type: 'number'
      },
      {
        code: 'nb_cours_mobilite_yoga',
        label: 'Nb cours Mobilité/Yoga par semaine',
        type: 'number'
      },
      {
        code: 'creneaux_open_gym',
        label: 'Nb créneaux Open Gym par semaine',
        type: 'number'
      },
      {
        code: 'seances_pt_semaine',
        label: 'Nb séances PT par semaine',
        type: 'number'
      },
      {
        code: 'type_programmation',
        label: 'Type de programmation',
        type: 'select',
        options: ['Maison 100%', 'Externe 100%', 'Mix maison/externe']
      },
      {
        code: 'nom_programme_externe',
        label: 'Nom du programme externe',
        type: 'text',
        conditional: {
          dependsOn: 'type_programmation',
          value: 'Externe 100%'
        }
      },
      {
        code: 'cycle_programmation',
        label: 'Cycle de programmation',
        type: 'select',
        options: ['4 semaines', '6 semaines', '8 semaines', '12 semaines', 'Autre']
      },
      {
        code: 'tests_reguliers',
        label: 'Tests/Benchmarks réguliers',
        type: 'boolean'
      },
      {
        code: 'frequence_tests',
        label: 'Fréquence des tests',
        type: 'select',
        options: ['Mensuelle', 'Bimestrielle', 'Trimestrielle', 'Semestrielle'],
        conditional: {
          dependsOn: 'tests_reguliers',
          value: true
        }
      }
    ]
  },

  {
    code: 'evenements',
    title: '4.4 Événements & Communauté',
    description: 'Compétitions et événements organisés',
    questions: [
      {
        code: 'nb_competitions_internes_an',
        label: 'Nb compétitions internes par an',
        type: 'number'
      },
      {
        code: 'nb_competitions_externes_an',
        label: 'Nb compétitions externes organisées par an',
        type: 'number'
      },
      {
        code: 'nb_membres_participant_competitions',
        label: 'Nb membres participant aux compétitions',
        type: 'number',
        help_text: 'Estimation du nombre de membres compétiteurs'
      },
      {
        code: 'nb_evenements_communautaires_an',
        label: 'Nb événements communautaires par an',
        type: 'number',
        help_text: 'BBQ, soirées, sorties, etc.'
      },
      {
        code: 'budget_evenements_an',
        label: 'Budget événements annuel',
        type: 'number',
        unit: '€/an'
      }
    ]
  },

  // ========================================================================
  // BLOC 5: RH & COACHING (40 questions)
  // ========================================================================
  {
    code: 'structure_equipe',
    title: '5.1 Structure de l\'Équipe',
    description: 'Organisation et composition de l\'équipe de coaching',
    questions: [
      {
        code: 'nb_total_coachs',
        label: 'Nombre TOTAL de coachs',
        type: 'number',
        required: true,
        help_text: 'Tous types confondus (salariés + freelance)'
      },
      {
        code: 'nb_coachs_temps_plein',
        label: 'Coachs temps plein',
        type: 'number'
      },
      {
        code: 'nb_coachs_temps_partiel',
        label: 'Coachs temps partiel',
        type: 'number'
      },
      {
        code: 'nb_freelance_reguliers',
        label: 'Freelance réguliers',
        type: 'number'
      },
      {
        code: 'nb_freelance_ponctuels',
        label: 'Freelance ponctuels',
        type: 'number'
      },
      {
        code: 'gerant_coach_actif',
        label: 'Le gérant coach-t-il activement ?',
        type: 'boolean'
      },
      {
        code: 'heures_coaching_gerant',
        label: 'Heures coaching gérant/semaine',
        type: 'number',
        unit: 'h/semaine',
        conditional: {
          dependsOn: 'gerant_coach_actif',
          value: true
        }
      },
      {
        code: 'heures_gestion_gerant',
        label: 'Heures gestion gérant/semaine',
        type: 'number',
        unit: 'h/semaine'
      },
      {
        code: 'heures_totales_gerant',
        label: 'Heures totales gérant/semaine',
        type: 'number',
        unit: 'h/semaine'
      }
    ]
  },

  {
    code: 'certifications',
    title: '5.2 Certifications & Qualifications',
    description: 'Niveau de certification de l\'équipe de coaching',
    questions: [
      {
        code: 'nb_coachs_cf_level_1',
        label: 'Nombre coachs CF Level 1',
        type: 'number'
      },
      {
        code: 'nb_coachs_cf_level_2',
        label: 'Nombre coachs CF Level 2',
        type: 'number'
      },
      {
        code: 'nb_coachs_cf_level_3',
        label: 'Nombre coachs CF Level 3',
        type: 'number'
      },
      {
        code: 'nb_coachs_cf_level_4',
        label: 'Nombre coachs CF Level 4',
        type: 'number'
      },
      {
        code: 'nb_coachs_bpjeps',
        label: 'Nombre coachs BPJEPS',
        type: 'number'
      },
      {
        code: 'nb_coachs_staps',
        label: 'Nombre coachs STAPS',
        type: 'number'
      },
      {
        code: 'nb_coachs_hyrox_certified',
        label: 'Nombre coachs certifiés Hyrox',
        type: 'number'
      },
      {
        code: 'nb_coachs_weightlifting',
        label: 'Nombre coachs Weightlifting certifiés',
        type: 'number'
      },
      {
        code: 'nb_coachs_gymnastics',
        label: 'Nombre coachs Gymnastics certifiés',
        type: 'number'
      },
      {
        code: 'nb_coachs_nutrition',
        label: 'Nombre coachs nutrition certifiés',
        type: 'number'
      },
      {
        code: 'nb_kinesitherapuetes',
        label: 'Nombre de kinésithérapeutes',
        type: 'number'
      },
      {
        code: 'nb_coachs_first_aid',
        label: 'Nombre coachs First Aid certifiés',
        type: 'number'
      }
    ]
  },

  {
    code: 'formation_developpement',
    title: '5.3 Formation & Développement',
    description: 'Politique de formation continue',
    questions: [
      {
        code: 'budget_formation_annuel',
        label: 'Budget formation annuel TOTAL',
        type: 'number',
        unit: '€/an'
      },
      {
        code: 'nb_formations_12m',
        label: 'Nombre de formations suivies (12 mois)',
        type: 'number'
      },
      {
        code: 'formations_internes_regulieres',
        label: 'Formations internes régulières',
        type: 'boolean'
      },
      {
        code: 'frequence_formations_internes',
        label: 'Fréquence formations internes',
        type: 'select',
        options: ['Hebdomadaire', 'Bimensuelle', 'Mensuelle', 'Trimestrielle', 'Ponctuelle'],
        conditional: {
          dependsOn: 'formations_internes_regulieres',
          value: true
        }
      },
      {
        code: 'accompagnement_nouveaux_coachs',
        label: 'Accompagnement des nouveaux coachs',
        type: 'boolean'
      }
    ]
  },

  {
    code: 'remuneration',
    title: '5.4 Rémunération',
    description: 'Politique de rémunération des coachs',
    questions: [
      {
        code: 'remuneration_coach_temps_plein',
        label: 'Rémunération coach temps plein',
        type: 'number',
        unit: '€/mois',
        help_text: 'Rémunération brute mensuelle moyenne'
      },
      {
        code: 'remuneration_temps_partiel_horaire',
        label: 'Rémunération temps partiel',
        type: 'number',
        unit: '€/heure',
        help_text: 'Taux horaire brut'
      },
      {
        code: 'remuneration_freelance_seance',
        label: 'Rémunération freelance',
        type: 'number',
        unit: '€/séance',
        help_text: 'Paiement par séance'
      },
      {
        code: 'primes_variables',
        label: 'Primes variables existantes',
        type: 'boolean'
      },
      {
        code: 'avantages_nature',
        label: 'Avantages en nature',
        type: 'multiselect',
        options: ['Abonnement gratuit', 'Tickets restaurant', 'Mutuelle', 'Prévoyance', 'Véhicule', 'Téléphone', 'Autres', 'Aucun']
      }
    ]
  },

  {
    code: 'organisation',
    title: '5.5 Organisation & Communication',
    description: 'Organisation interne de l\'équipe',
    questions: [
      {
        code: 'reunions_equipe_regulieres',
        label: 'Réunions d\'équipe régulières',
        type: 'boolean'
      },
      {
        code: 'frequence_reunions_equipe',
        label: 'Fréquence réunions équipe',
        type: 'select',
        options: ['Hebdomadaire', 'Bimensuelle', 'Mensuelle', 'Trimestrielle'],
        conditional: {
          dependsOn: 'reunions_equipe_regulieres',
          value: true
        }
      },
      {
        code: 'entretiens_individuels_reguliers',
        label: 'Entretiens individuels réguliers',
        type: 'boolean'
      },
      {
        code: 'frequence_entretiens_individuels',
        label: 'Fréquence entretiens individuels',
        type: 'select',
        options: ['Mensuelle', 'Trimestrielle', 'Semestrielle', 'Annuelle'],
        conditional: {
          dependsOn: 'entretiens_individuels_reguliers',
          value: true
        }
      },
      {
        code: 'evaluations_performance',
        label: 'Évaluations de performance',
        type: 'boolean'
      },
      {
        code: 'outils_communication_equipe',
        label: 'Outils de communication équipe',
        type: 'multiselect',
        options: ['WhatsApp', 'Slack', 'Teams', 'Email', 'Groupe Facebook', 'Autre']
      },
      {
        code: 'manuel_procedures_coach',
        label: 'Manuel de procédures pour coachs',
        type: 'boolean'
      }
    ]
  },

  {
    code: 'turnover_stabilite',
    title: '5.6 Turnover & Stabilité',
    description: 'Rotation et fidélisation de l\'équipe',
    questions: [
      {
        code: 'nb_departs_coachs_12m',
        label: 'Nombre de départs coachs (12 mois)',
        type: 'number'
      },
      {
        code: 'nb_arrivees_coachs_12m',
        label: 'Nombre d\'arrivées coachs (12 mois)',
        type: 'number'
      },
      {
        code: 'anciennete_moyenne_coachs',
        label: 'Ancienneté moyenne des coachs',
        type: 'number',
        unit: 'mois'
      },
      {
        code: 'anciennete_coach_plus_ancien',
        label: 'Ancienneté du coach le plus ancien',
        type: 'number',
        unit: 'années'
      },
      {
        code: 'difficulte_recrutement',
        label: 'Difficulté de recrutement',
        type: 'select',
        options: ['Très facile', 'Facile', 'Moyen', 'Difficile', 'Très difficile']
      }
    ]
  },

  {
    code: 'qualite_coaching',
    title: '5.7 Qualité du Coaching',
    description: 'Évaluation de la qualité du coaching',
    questions: [
      {
        code: 'ratio_coach_membres_moyen',
        label: 'Ratio coach/membres moyen',
        type: 'number',
        help_text: 'Ex: 1 coach pour X membres'
      },
      {
        code: 'ratio_coach_membres_heures_pointe',
        label: 'Ratio coach/membres heures de pointe',
        type: 'number'
      },
      {
        code: 'double_coaching',
        label: 'Double coaching pratiqué',
        type: 'boolean',
        help_text: '2 coachs sur certains créneaux'
      },
      {
        code: 'nb_cours_double_coaching',
        label: 'Nb cours en double coaching/semaine',
        type: 'number',
        conditional: {
          dependsOn: 'double_coaching',
          value: true
        }
      },
      {
        code: 'suivi_progressions_membres',
        label: 'Suivi des progressions membres',
        type: 'select',
        options: ['Aucun', 'Informel', 'Formalisé manuel', 'Formalisé digital']
      },
      {
        code: 'coaching_personnalise_debutants',
        label: 'Coaching personnalisé pour débutants',
        type: 'boolean'
      },
      {
        code: 'duree_onboarding_debutants',
        label: 'Durée onboarding débutants',
        type: 'number',
        unit: 'séances',
        help_text: 'Nombre de séances d\'accompagnement'
      },
      {
        code: 'feedback_membres_coaching',
        label: 'Feedback membres sur coaching collecté',
        type: 'boolean'
      },
      {
        code: 'note_qualite_coaching',
        label: 'Note moyenne qualité coaching',
        type: 'number',
        unit: '/10',
        conditional: {
          dependsOn: 'feedback_membres_coaching',
          value: true
        }
      }
    ]
  }
];

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Retourne le nombre total de questions dans le questionnaire
 */
export function getTotalQuestions(): number {
  return questionnaireBlocks.reduce((total, block) => total + block.questions.length, 0);
}

/**
 * Retourne un bloc de questions par son code
 */
export function getBlockByCode(code: string): QuestionBlock | undefined {
  return questionnaireBlocks.find(block => block.code === code);
}

/**
 * Retourne une question spécifique par son code (recherche dans tous les blocs)
 */
export function getQuestionByCode(questionCode: string): any {
  for (const block of questionnaireBlocks) {
    const question = block.questions.find(q => q.code === questionCode);
    if (question) {
      return { ...question, blockCode: block.code };
    }
  }
  return undefined;
}

/**
 * Calcule le pourcentage de complétion d'un audit
 */
export function calculateCompletionPercentage(answers: any[]): number {
  const totalQuestions = getTotalQuestions();
  const answeredQuestions = answers.filter(a => a.value !== null && a.value !== undefined && a.value !== '').length;
  return Math.round((answeredQuestions / totalQuestions) * 100);
}
