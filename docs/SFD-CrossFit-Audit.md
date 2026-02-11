# Spécifications Fonctionnelles Détaillées (SFD)

## CrossFit Audit - Plateforme d'Audit de Performance pour Salles de CrossFit

| Information | Valeur |
|---|---|
| **Projet** | CrossFit Audit |
| **Version** | 1.2 |
| **Date** | Février 2026 |
| **Statut** | En production |
| **Stack technique** | React/TypeScript (Frontend) + Node.js/Express (Backend) + SQLite + GitHub Actions CI/CD |

---

## Table des matières

1. [Contexte et objectifs](#1-contexte-et-objectifs)
2. [Architecture technique](#2-architecture-technique)
3. [Modèle de données](#3-modèle-de-données)
4. [Gestion des utilisateurs et droits d'accès](#4-gestion-des-utilisateurs-et-droits-daccès)
5. [Gestion des salles (Gyms)](#5-gestion-des-salles-gyms)
6. [Questionnaire d'audit](#6-questionnaire-daudit)
7. [Moteur de calcul des KPIs](#7-moteur-de-calcul-des-kpis)
8. [Système de scoring par pilier](#8-système-de-scoring-par-pilier)
9. [Moteur de recommandations](#9-moteur-de-recommandations)
10. [Analyse concurrentielle et marché](#10-analyse-concurrentielle-et-marché)
11. [Catalogue d'API REST](#11-catalogue-dapi-rest)
12. [Pages et navigation frontend](#12-pages-et-navigation-frontend)
13. [Règles de gestion transversales](#13-règles-de-gestion-transversales)
14. [CI/CD - Intégration et Déploiement Continus](#14-cicd---intégration-et-déploiement-continus)
15. [Annexes](#15-annexes)

---

## 1. Contexte et objectifs

### 1.1 Contexte

Les salles de CrossFit (boxes) ont besoin d'outils d'analyse de performance pour piloter leur activité. Les indicateurs clés (rentabilité, rétention, occupation) sont souvent dispersés et difficilement exploitables.

### 1.2 Objectifs

CrossFit Audit est une plateforme d'audit de performance qui permet de :

1. **Collecter** les données opérationnelles via un questionnaire structuré de 250 questions
2. **Calculer** 12 KPIs clés couvrant finance, clientèle et exploitation
3. **Scorer** la salle sur 3 piliers pondérés avec un score global de 0 à 100
4. **Recommander** des actions d'amélioration priorisées avec estimation d'impact financier
5. **Comparer** la salle avec des benchmarks marché et des concurrents directs

### 1.3 Utilisateurs cibles

| Profil | Description | Droits |
|--------|-------------|--------|
| **Propriétaire de box** | Gérant principal de la salle | Accès complet (owner) |
| **Collaborateur** | Coach/assistant avec accès délégué | Lecture ou lecture/écriture |
| **Administrateur** | Super-utilisateur système | Accès total (admin) |

---

## 2. Architecture technique

### 2.1 Stack

| Couche | Technologie | Port |
|--------|------------|------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS | 5176 |
| **Backend** | Node.js + Express.js | 5177 |
| **Base de données** | SQLite (better-sqlite3) | Fichier local |
| **Authentification** | JWT (jsonwebtoken) + bcrypt | - |
| **Tests Frontend** | Vitest + @testing-library/react | - |
| **Tests Backend** | Jest + supertest | - |
| **CI/CD** | GitHub Actions (CI + Deploy) | - |
| **Reverse Proxy** | Nginx (production) | 80/443 |
| **Process Manager** | systemd (2 services) | - |

### 2.2 Organisation du code

```
crossfit-audit/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Pipeline CI (lint, typecheck, tests)
│       └── deploy.yml                # Pipeline de déploiement automatique
├── src/                              # Frontend React/TypeScript
│   ├── pages/                        # Pages applicatives
│   ├── hooks/                        # Hooks React personnalisés
│   ├── lib/                          # Logique métier, types, API
│   ├── components/                   # Composants réutilisables (UI + VersionBadge)
│   └── __tests__/                    # Tests unitaires frontend (Vitest)
├── backend/                          # Backend Node.js/Express
│   ├── controllers/                  # Logique des endpoints (6 controllers)
│   ├── models/                       # Accès données SQLite (better-sqlite3)
│   ├── routes/                       # Définition des routes API
│   ├── middleware/                    # Auth, erreurs, accès gym
│   ├── utils/                        # Calculs, extraction, helpers
│   ├── constants/                    # Constantes et seuils métier
│   ├── validators/                   # Validation des requêtes
│   ├── scripts/                      # Scripts d'initialisation
│   ├── migrations/                   # Fichiers SQL de migration
│   ├── migration-manager.js          # Moteur d'exécution des migrations
│   └── __tests__/                    # Tests unitaires backend (Jest)
├── deploy/                           # Fichiers de déploiement
│   ├── crossfit-audit-backend.service  # Service systemd backend
│   ├── crossfit-audit-frontend.service # Service systemd frontend
│   ├── nginx-crossfit-audit            # Configuration Nginx reverse proxy
│   └── setup-services.sh              # Script d'installation initiale
├── deploy.sh                         # Script de déploiement (exécuté par CI/CD)
├── db-manage.sh                      # Utilitaire de gestion BDD (backup/restore)
└── docs/                             # Documentation
```

### 2.3 Flux de données global

```
Réponses au questionnaire (block_code, question_code, value)
        │
        ▼
   extractAllData()
   ├── extractFinanceData()      → Revenus, charges, ratios, résultat
   ├── extractMembresData()      → ARPM, LTV, segmentation
   └── extractOperationsData()   → Occupation, conversion, churn
        │
        ├──────────────────────────────────────────┐
        ▼                                          ▼
   calculateKPIs()  → 12 KPIs          Calculs avancés (v1.2)
        │                               ├── calculateAdvancedFinancialKPIs()
        ▼                               ├── calculateAdvancedClientKPIs()
   calculateScores()                    ├── calculateAdvancedOperationalKPIs()
        │                               ├── calculateAdvancedHRKPIs()
        ▼                               ├── calculateFinancialHealthScore()
   generateRecommendations()            ├── generateScheduleHeatMap()
        │                               ├── analyzeChurnRisk()
        ▼                               └── calculatePricingPosition()
   1 à 6 recommandations                       │
                                                ▼
                                    Dashboard 5 onglets avancés
```

---

## 3. Modèle de données

### 3.1 Schéma relationnel

```
┌──────────┐     ┌──────────────────┐     ┌──────────┐
│  users   │────<│ gym_user_access  │>────│   gyms   │
└──────────┘     └──────────────────┘     └────┬─────┘
                                               │
           ┌───────────────┬───────────────────┼───────────────┐
           │               │                   │               │
     ┌─────▼─────┐  ┌──────▼──────┐   ┌───────▼──────┐ ┌──────▼──────┐
     │  audits   │  │ competitors │   │  gym_offers  │ │market_zones │
     └─────┬─────┘  └─────────────┘   └──────────────┘ └─────────────┘
           │
    ┌──────┼──────────┬───────────┐
    │      │          │           │
┌───▼──┐┌──▼──┐┌──────▼──┐┌──────▼──────────┐  ┌──────────────────┐
│answer││kpis ││ scores  ││recommendations │  │market_benchmarks │
└──────┘└─────┘└─────────┘└────────────────┘  └──────────────────┘
```

### 3.2 Table `users`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | TEXT | PK | UUID v4 |
| `email` | TEXT | UNIQUE, NOT NULL | Email de connexion |
| `password` | TEXT | NOT NULL | Hash bcrypt (salt 10) |
| `name` | TEXT | NOT NULL | Nom affiché |
| `role` | TEXT | NOT NULL, DEFAULT 'user' | `admin` ou `user` |
| `is_active` | INTEGER | NOT NULL, DEFAULT 1 | 0 = désactivé (soft delete) |
| `created_at` | TEXT | NOT NULL | ISO 8601 |
| `updated_at` | TEXT | NOT NULL | ISO 8601 |

**RG-USR-01** : Le mot de passe doit contenir au minimum 6 caractères.
**RG-USR-02** : L'email doit être unique dans le système.
**RG-USR-03** : La suppression d'un utilisateur est un soft delete (`is_active = 0`).
**RG-USR-04** : Un compte désactivé ne peut pas se connecter (HTTP 403).

### 3.3 Table `gyms`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | TEXT | PK | UUID v4 |
| `user_id` | TEXT | FK users | Propriétaire de la salle |
| `name` | TEXT | NOT NULL, max 255 | Nom de la salle |
| `address` | TEXT | - | Adresse postale |
| `city` | TEXT | max 100 | Ville |
| `postal_code` | TEXT | - | Code postal |
| `contact_name` | TEXT | - | Nom du contact |
| `phone` | TEXT | - | Téléphone |
| `email` | TEXT | - | Email de la salle |
| `website` | TEXT | - | Site web |
| `instagram` | TEXT | - | Compte Instagram |
| `legal_status` | TEXT | - | Forme juridique |
| `founded_year` | INTEGER | - | Année de création |
| `partners_count` | INTEGER | - | Nombre d'associés |
| `notes` | TEXT | - | Notes libres |
| `created_at` | TEXT | NOT NULL | ISO 8601 |
| `updated_at` | TEXT | NOT NULL | ISO 8601 |

**RG-GYM-01** : Toute salle est rattachée à un propriétaire (`user_id`).
**RG-GYM-02** : Le nom est obligatoire et limité à 255 caractères.
**RG-GYM-03** : La suppression d'une salle entraîne la suppression en cascade de ses audits, réponses, concurrents et offres.

### 3.4 Table `gym_user_access`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | TEXT | PK | UUID v4 |
| `gym_id` | TEXT | FK gyms, NOT NULL | Salle concernée |
| `user_id` | TEXT | FK users, NOT NULL | Utilisateur autorisé |
| `access_level` | TEXT | NOT NULL, CHECK (read\|write) | Niveau d'accès |
| `created_at` | TEXT | NOT NULL | ISO 8601 |
| `updated_at` | TEXT | NOT NULL | ISO 8601 |

**Contrainte UNIQUE** : `(gym_id, user_id)` - un utilisateur a un seul niveau d'accès par salle.

**RG-ACC-01** : Le propriétaire (`gyms.user_id`) a implicitement un accès `owner` sans entrée dans cette table.
**RG-ACC-02** : Les niveaux `read` et `write` sont les seuls stockés en base.
**RG-ACC-03** : Un administrateur (`role = admin`) a accès à toutes les salles.

### 3.5 Table `audits`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | TEXT | PK | UUID v4 |
| `gym_id` | TEXT | FK gyms, NOT NULL | Salle auditée |
| `status` | TEXT | NOT NULL | Statut de l'audit |
| `audit_date_start` | TEXT | - | Date de début |
| `audit_date_end` | TEXT | - | Date de fin |
| `baseline_period` | TEXT | - | Période de référence (ex : "2024-Q1") |
| `currency` | TEXT | - | Devise (EUR ou USD) |
| `notes` | TEXT | - | Notes libres |
| `completion_percentage` | REAL | NOT NULL, DEFAULT 0 | Taux de complétion (0-100) |
| `created_at` | TEXT | NOT NULL | ISO 8601 |
| `updated_at` | TEXT | NOT NULL | ISO 8601 |

**RG-AUD-01** : Les statuts possibles sont `draft`, `in_progress`, `completed`.
**RG-AUD-02** : Le pourcentage de complétion est calculé automatiquement selon le nombre de réponses fournies par rapport aux questions essentielles.
**RG-AUD-03** : La suppression d'un audit supprime en cascade ses réponses, KPIs, scores et recommandations.

### 3.6 Table `answers`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | TEXT | PK | UUID v4 |
| `audit_id` | TEXT | FK audits, NOT NULL | Audit parent |
| `block_code` | TEXT | NOT NULL | Code du bloc thématique |
| `question_code` | TEXT | NOT NULL | Code de la question |
| `value` | TEXT | - | Valeur (stockée en texte, interprétée selon type) |
| `created_at` | TEXT | NOT NULL | ISO 8601 |
| `updated_at` | TEXT | NOT NULL | ISO 8601 |

**Contrainte UNIQUE** : `(audit_id, block_code, question_code)` - une seule réponse par question par audit.

**RG-ANS-01** : L'enregistrement utilise un UPSERT (INSERT OR REPLACE) pour mettre à jour les réponses existantes.
**RG-ANS-02** : La sauvegarde est différée (debounce 800ms) côté frontend pour éviter les appels excessifs.

### 3.7 Table `kpis`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | TEXT | PK | UUID v4 |
| `audit_id` | TEXT | FK audits, NOT NULL | Audit parent |
| `kpi_code` | TEXT | NOT NULL | Code du KPI |
| `value` | REAL | NOT NULL | Valeur calculée |
| `unit` | TEXT | - | Unité (%, EUR, ratio) |
| `computed_at` | TEXT | NOT NULL | Date/heure de calcul |
| `inputs_snapshot` | TEXT | - | Snapshot JSON des données d'entrée |

**Contrainte UNIQUE** : `(audit_id, kpi_code)`

### 3.8 Table `scores`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | TEXT | PK | UUID v4 |
| `audit_id` | TEXT | FK audits, NOT NULL | Audit parent |
| `pillar_code` | TEXT | NOT NULL | `finance`, `clientele` ou `exploitation` |
| `pillar_name` | TEXT | NOT NULL | Nom affichable du pilier |
| `score` | REAL | NOT NULL | Score 0-100 |
| `weight` | REAL | NOT NULL | Poids dans le score global (0-1) |
| `computed_at` | TEXT | NOT NULL | Date/heure de calcul |
| `details` | TEXT | - | JSON avec le détail des sous-scores |

**Contrainte UNIQUE** : `(audit_id, pillar_code)`

### 3.9 Table `recommendations`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | TEXT | PK | UUID v4 |
| `audit_id` | TEXT | FK audits, NOT NULL | Audit parent |
| `rec_code` | TEXT | NOT NULL | Code machine |
| `title` | TEXT | NOT NULL | Titre affiché |
| `description` | TEXT | - | Description détaillée |
| `priority` | TEXT | NOT NULL | `P1`, `P2` ou `P3` |
| `expected_impact_eur` | REAL | - | Impact estimé en EUR |
| `effort_level` | TEXT | NOT NULL | `facile`, `moyen` ou `difficile` |
| `confidence` | TEXT | NOT NULL | `faible`, `moyen` ou `fort` |
| `category` | TEXT | - | `finance`, `commercial`, `operations`, `general` |
| `computed_at` | TEXT | NOT NULL | Date/heure de calcul |

**RG-REC-01** : Les recommandations sont recalculées intégralement à chaque demande (remplacement complet via DELETE + INSERT).

### 3.10 Tables concurrence et marché

#### Table `competitors`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | TEXT PK | UUID v4 |
| `gym_id` | TEXT FK | Salle de référence |
| `name` | TEXT NOT NULL | Nom du concurrent |
| `address`, `city`, `postal_code` | TEXT | Adresse |
| `latitude`, `longitude` | REAL | Coordonnées GPS |
| `distance_km` | REAL | Distance depuis la salle |
| `travel_time_minutes` | REAL | Temps de trajet |
| `market_zone_id` | TEXT FK | Zone de marché rattachée |
| `base_subscription_price/name` | REAL/TEXT | Abonnement de base |
| `limited_subscription_price/name` | REAL/TEXT | Abonnement limité |
| `premium_subscription_price/name` | REAL/TEXT | Abonnement premium |
| `trial_price` | REAL | Prix de l'essai |
| `offers_count` | INTEGER | Nombre d'offres tarifaires |
| `positioning` | TEXT | `budget`, `standard`, `premium`, `luxe` |
| `google_rating` | REAL | Note Google (0-5) |
| `google_reviews_count` | INTEGER | Nombre d'avis Google |
| `instagram_followers` | INTEGER | Followers Instagram |
| `surface_m2`, `capacity` | REAL | Infrastructure |
| `equipment_quality` | TEXT | `basique`, `standard`, `premium`, `excellent` |
| `has_hyrox/weightlifting/gymnastics/childcare/nutrition` | INTEGER (0\|1) | Services proposés |
| `is_active` | INTEGER | Soft delete |

**RG-CMP-01** : La suppression d'un concurrent est un soft delete (`is_active = 0`).
**RG-CMP-02** : Le champ `offers_count` est calculé automatiquement au moment de la sauvegarde à partir des prix renseignés.

#### Table `market_zones`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | TEXT PK | UUID v4 |
| `name` | TEXT NOT NULL | Nom de la zone |
| `description` | TEXT | Description |
| `price_level` | TEXT NOT NULL | `budget`, `standard`, `premium`, `luxe` |
| `avg_subscription_min` | REAL NOT NULL | Prix moyen min de la zone |
| `avg_subscription_max` | REAL NOT NULL | Prix moyen max de la zone |
| `geographic_scope` | TEXT | `quartier`, `ville`, `agglomeration`, `region` |
| `population_density` | TEXT | `rurale`, `periurbaine`, `urbaine`, `metropolitaine` |
| `avg_household_income_range` | TEXT | Fourchette revenus moyens |
| `is_active` | INTEGER | Soft delete |

**Fourchettes indicatives par niveau de prix** :
- **Budget** : 100-140 EUR/mois (zones périurbaines/rurales)
- **Standard** : 140-180 EUR/mois (villes moyennes)
- **Premium** : 180-250 EUR/mois (grandes métropoles)
- **Luxe** : 250-350+ EUR/mois (Paris, zones premium)

#### Table `gym_offers`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | TEXT PK | UUID v4 |
| `gym_id` | TEXT FK | Salle propriétaire |
| `audit_id` | TEXT FK | Audit de rattachement (optionnel) |
| `offer_type` | TEXT NOT NULL | `abonnement`, `carte`, `pack` |
| `offer_name` | TEXT NOT NULL | Nom commercial |
| `offer_description` | TEXT | Description |
| `price` | REAL NOT NULL | Prix en EUR |
| `currency` | TEXT NOT NULL | Devise (EUR) |
| `session_count` | INTEGER | Nombre de séances (NULL si illimité) |
| `duration_months` | INTEGER NOT NULL | Durée en mois |
| `commitment_months` | INTEGER NOT NULL | Engagement en mois |
| `is_featured` | INTEGER | Mise en avant |
| `active_subscriptions_count` | INTEGER | Nombre d'abonnés actifs |
| `is_active` | INTEGER | Soft delete |

#### Table `market_benchmarks`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | TEXT PK | UUID v4 |
| `benchmark_code` | TEXT UNIQUE | Code identifiant |
| `name` | TEXT NOT NULL | Nom affiché |
| `value` | REAL NOT NULL | Valeur de référence |
| `unit` | TEXT | Unité (%, EUR) |
| `description` | TEXT | Description |
| `category` | TEXT | Catégorie |

**Benchmarks par défaut** :

| Code | Nom | Valeur | Catégorie |
|------|-----|--------|-----------|
| `arpm_toulouse` | ARPM moyen Toulouse | 85 EUR | pricing |
| `churn_target` | Taux de churn cible | 2% | retention |
| `conversion_target` | Taux conversion cible | 40% | acquisition |
| `loyer_ratio_max` | Ratio loyer/CA max | 15% | finance |
| `masse_salariale_ratio_max` | Ratio MS/CA max | 45% | finance |
| `ebitda_target` | Marge EBITDA cible | 20% | finance |
| `occupation_target` | Taux occupation cible | 70% | exploitation |
| `ca_par_m2_target` | CA par m2 cible | 300 EUR | exploitation |

---

## 4. Gestion des utilisateurs et droits d'accès

### 4.1 Inscription

| Champ | Obligatoire | Validation |
|-------|-------------|------------|
| `email` | Oui | Format email valide, unique en base |
| `password` | Oui | Minimum 6 caractères |
| `name` | Oui | Non vide |

**RG-AUTH-01** : Le mot de passe est haché avec bcrypt (salt factor 10) avant stockage.
**RG-AUTH-02** : Un token JWT est retourné immédiatement après inscription.
**RG-AUTH-03** : Le rôle par défaut est `user`.

### 4.2 Connexion

**RG-AUTH-04** : Les messages d'erreur pour email inexistant et mot de passe incorrect sont identiques ("Email ou mot de passe incorrect") pour prévenir l'énumération de comptes.
**RG-AUTH-05** : Un compte désactivé retourne HTTP 403 avec le message "Votre compte a été désactivé".

### 4.3 Token JWT

| Propriété | Valeur |
|-----------|--------|
| **Payload** | `{ id, email, role }` |
| **Secret** | Variable d'environnement `JWT_SECRET` |
| **Expiration** | Variable `JWT_EXPIRE` ou 7 jours par défaut |
| **Format** | Header `Authorization: Bearer <token>` |

### 4.4 Matrice des droits d'accès

| Action | Non connecté | User (autre) | User (read) | User (write/owner) | Admin |
|--------|:---:|:---:|:---:|:---:|:---:|
| Lister les salles | Partiel | Partiel | Oui | Oui | Oui |
| Voir une salle | Non | Non | Oui | Oui | Oui |
| Créer une salle | Non | Oui | Oui | Oui | Oui |
| Modifier une salle | Non | Non | Non | Oui | Oui |
| Supprimer une salle | Non | Non | Non | Oui | Oui |
| Gérer les accès | Non | Non | Non | Oui (owner) | Oui |
| Voir un audit | Partiel | Non | Oui | Oui | Oui |
| Créer un audit | Non | Oui | Oui | Oui | Oui |
| Modifier un audit | Non | Non | Non | Oui | Oui |
| Sauvegarder des réponses | Non | Non | Non | Oui | Oui |

### 4.5 Changement de mot de passe

**RG-AUTH-06** : Le mot de passe actuel doit être vérifié avant modification.
**RG-AUTH-07** : Le nouveau mot de passe doit respecter la règle des 6 caractères minimum.

---

## 5. Gestion des salles (Gyms)

### 5.1 Création

**RG-GYM-04** : La création d'une salle associe automatiquement le `user_id` du créateur comme propriétaire.
**RG-GYM-05** : Les champs validés à la création : `name` (obligatoire, max 255 car.), `city` (optionnel, max 100 car.).

### 5.2 Statistiques enrichies

La vue détaillée d'une salle (`getWithStats`) retourne en plus :
- Nombre d'audits rattachés
- Nombre de concurrents actifs
- Nombre d'offres actives

### 5.3 Gestion multi-utilisateurs

**RG-GYM-06** : Un propriétaire peut inviter des collaborateurs avec un niveau `read` ou `write`.
**RG-GYM-07** : L'invitation se fait par email ou user_id.
**RG-GYM-08** : Le mécanisme d'accès utilise un UPSERT (mise à jour si l'accès existe déjà).

---

## 6. Questionnaire d'audit

### 6.1 Structure générale

Le questionnaire est organisé en **5 blocs thématiques** totalisant **250 questions** :

| Bloc | Titre | Nb questions | Code bloc |
|------|-------|:---:|-----------|
| 1 | Identité & Contexte | ~57 | `identite_legale`, `infrastructure_detaillee` (dont inventaire matériel détaillé), `localisation_environnement` |
| 2 | Analyse Financière Complète | ~87 | `produits_exploitation`, `charges_exploitation` (dont amortissements), `resultat_tresorerie` (dont résultats financiers) |
| 3 | Adhésions & Clientèle | 50 | `structure_base`, `tarification_detaillee`, `demographie`, `acquisition_conversion`, `retention_churn`, `engagement_satisfaction` |
| 4 | Planning & Opérations | 45 | `structure_planning`, `capacite_occupation`, `types_cours`, `evenements_communaute` |
| 5 | RH & Coaching | 40 | `structure_equipe`, `certifications`, `formation_developpement`, `remuneration`, `organisation_communication`, `turnover_stabilite`, `qualite_coaching` |

### 6.2 Types de questions

| Type | Description | Exemple |
|------|-------------|---------|
| `number` | Valeur numérique | Nombre de membres, CA mensuel |
| `text` | Texte libre | Raison sociale, notes |
| `select` | Choix unique | Forme juridique, régime fiscal |
| `multiselect` | Choix multiples | Canaux d'acquisition |
| `date` | Date | Année d'ouverture |
| `boolean` | Oui/Non | A un parking ? |

### 6.3 Questions conditionnelles

Certaines questions ne s'affichent que si une condition est remplie :

| Question | Condition | Dépend de |
|----------|-----------|-----------|
| Nom du programme externe | Programmation = "externe" ou "mixte" | `programmation_type` |
| Nombre de classes double coaching/sem | Double coaching = Oui | `double_coaching` |
| Fréquence des réunions | Réunions régulières = Oui | `reunions_equipe_regulieres` |
| Fréquence entretiens individuels | Entretiens réguliers = Oui | `entretiens_individuels_reguliers` |
| Note coaching /10 | Feedback collecté = Oui | `feedback_coaching_collecte` |
| Heures coaching/sem du gérant | Gérant coach = Oui | `gerant_coach` |
| Nb de séances onboarding | Onboarding personnalisé = Oui | `onboarding_personnalise` |
| Nombre en liste d'attente | Liste d'attente active = Oui | `liste_attente_active` |
| Fréquence formations internes | Formations internes = Oui | `formations_internes_regulieres` |

### 6.4 Questions ajoutées (v1.2)

#### Inventaire matériel détaillé (Bloc 1.2 - `infrastructure_detaillee`)

22 questions de type `number` + 2 questions complémentaires :

| Catégorie | Questions | Type |
|-----------|-----------|------|
| Barres | `nb_barres_olympiques`, `nb_barres_femmes`, `nb_barres_techniques` | number |
| Poids | `poids_total_disques_kg` | number (kg) |
| Structure | `nb_racks`, `nb_rigs`, `nb_pull_up_bars`, `nb_anneaux` | number |
| Cardio | `nb_rowers`, `nb_assault_bikes`, `nb_ski_ergs`, `nb_echo_bikes`, `nb_tapis_course` | number |
| Accessoires | `nb_wall_balls`, `nb_kettlebells`, `nb_dumbbells`, `nb_boxes`, `nb_cordes` | number |
| Spécialisé | `nb_ghd`, `nb_reverse_hyper`, `nb_sleds`, `nb_strongman` | number |
| État | `etat_general_materiel` (excellent/bon/moyen/mauvais), `date_derniere_renovation` | select, date |

#### Amortissements (Bloc 2.2 - `charges_exploitation`)

| Question | Code | Type | Unité |
|----------|------|------|-------|
| Amortissement matériel | `amortissement_materiel` | number | €/an |
| Amortissement travaux | `amortissement_travaux` | number | €/an |
| Amortissement véhicule | `amortissement_vehicule` | number | €/an |

#### Résultats financiers (Bloc 2.3 - `resultat_tresorerie`)

| Question | Code | Type | Unité |
|----------|------|------|-------|
| Résultat d'exploitation | `resultat_exploitation` | number | € |
| Résultat net | `resultat_net` | number | € |
| EBITDA | `ebitda` | number | € |
| Capacité d'autofinancement | `capacite_autofinancement` | number | € |

### 6.5 Questions essentielles (mode rapide)

Un mode rapide de **25 questions essentielles** est disponible pour un pré-diagnostic accéléré :

**Identité & Infrastructure (5 questions)** :
- Raison sociale
- Année d'ouverture
- Surface CrossFit (m2)
- Capacité max par cours
- Places de parking

**Finance - Top Priorité (8 questions)** :
- CA abonnements mensuels
- Loyer mensuel HT
- Electricité annuelle
- Salaires bruts coachs
- Charges sociales patronales
- Trésorerie actuelle
- Capital restant emprunts
- Echéance mensuelle emprunts

**Membres - Critiques (7 questions)** :
- Nombre total de membres actifs
- Membres illimités
- Tarif illimité sans engagement
- Essais gratuits du mois
- Conversions du mois
- Résiliations du mois
- Ancienneté moyenne des membres

**Planning & Opérations (3 questions)** :
- Volume de cours/semaine
- Taux d'occupation moyen
- Nombre de cours saturés

**RH & Coaching (2 questions)** :
- Nombre total de coachs
- Salaire coach temps plein

### 6.6 Sauvegarde des réponses

**RG-ANS-03** : Les réponses sont sauvegardées individuellement (question par question) via un mécanisme de debounce à 800ms.
**RG-ANS-04** : Le mode "bulk" permet la sauvegarde transactionnelle de plusieurs réponses simultanément.
**RG-ANS-05** : Chaque sauvegarde déclenche un recalcul du pourcentage de complétion de l'audit.

---

## 7. Moteur de calcul des KPIs

### 7.1 Extraction des données financières

#### 7.1.1 Chiffre d'affaires

**CA Récurrent** (annualisé) :
```
CA_récurrent = ca_abonnements_mensuels × 12
             + ca_abonnements_trimestriels × 4
             + ca_abonnements_semestriels × 2
             + ca_abonnements_annuels × 1
```

**CA Non Récurrent** (annualisé à partir de données mensuelles) :
```
CA_non_récurrent = (ca_cartes_10 + ca_cartes_20 + ca_seances_unitaires
                  + ca_frais_inscription + ca_personal_training
                  + ca_coaching_nutrition + ca_suivi_remote
                  + ca_cours_specialises + ca_competitions_internes
                  + ca_competitions_externes + ca_seminaires
                  + ca_team_building + ca_merchandising_vetements
                  + ca_merchandising_accessoires + ca_complements
                  + ca_boissons_snacks + ca_sous_location
                  + ca_partenariats + ca_sponsoring) × 12
```

**RG-FIN-01** : `CA_total = CA_récurrent + CA_non_récurrent`
**RG-FIN-02** : `%_récurrent = (CA_récurrent / CA_total) × 100` (0 si CA_total = 0)

#### 7.1.2 Charges d'exploitation

| Poste | Formule |
|-------|---------|
| **Loyer annuel** | `(loyer_mensuel_ht + charges_locatives) × 12 + taxe_fonciere` |
| **Energies** | `electricite + eau + gaz_chauffage` (annuels) |
| **Marketing** | `marketing_total` |
| **Masse salariale** | Somme : salaires gérant/coachs/admin + charges sociales + freelance + transport + repas + formation + autres |
| **Assurances** | RC pro + locaux + matériel + santé + mutuelle |
| **Services extérieurs** | Comptable + avocat + cotisations + affiliation + honoraires |
| **Communication** | Téléphone + courrier + logiciels (planning, compta, CRM, web, musique) |
| **Entretien** | Entretien + réparations + matériel |
| **Impôts & taxes** | CFE + CVAE + taxe apprentissage + formation + autres |
| **Frais financiers** | Frais bancaires + intérêts emprunts |

**RG-FIN-03** : `Charges_totales = Σ tous les postes ci-dessus`

#### 7.1.3 Résultat

**RG-FIN-04** : `EBITDA = CA_total - Charges_totales`
**RG-FIN-05** : `Marge_EBITDA = (EBITDA / CA_total) × 100` (0 si CA = 0)

#### 7.1.4 Ratios

| Ratio | Formule | Cible |
|-------|---------|-------|
| Loyer/CA | `(Loyer_annuel / CA_total) × 100` | < 15% |
| Masse salariale/CA | `(MS_totale / CA_total) × 100` | 30-40% |
| Marketing/CA | `(Marketing / CA_total) × 100` | 5-10% |
| Charges/CA | `(Charges_totales / CA_total) × 100` | < 80% |

**RG-FIN-06** : Tous les ratios retournent 0 si le CA total est nul (protection division par zéro).

### 7.2 Extraction des données membres

**RG-MBR-01** : `ARPM = (CA_total / 12) / Nb_membres_actifs` (0 si pas de membres)
**RG-MBR-02** : `LTV = ARPM × Ancienneté_moyenne_mois` (ancienneté par défaut : 22 mois)
**RG-MBR-03** : `Ratio LTV/CAC = LTV / CAC` (0 si CAC = 0)

### 7.3 Extraction des données opérationnelles

**RG-OPS-01** : `CA_par_m2 = CA_total / Surface_totale` (surface min 1m2 pour éviter /0)
**RG-OPS-02** : `Taux_conversion = (Conversions / Essais_gratuits) × 100` (0 si pas d'essais)
**RG-OPS-03** : `Taux_churn = (Résiliations / Nb_membres_actifs) × 100` (0 si pas de membres)
**RG-OPS-04** : `Taux_occupation = (Participants_moyens / Capacité_max) × 100` (0 si pas de capacité)

### 7.4 Liste des 12 KPIs calculés

| KPI | Code | Unité | Source |
|-----|------|-------|--------|
| CA total annuel | `ca_total_12m` | EUR | Finance |
| CA récurrent annuel | `ca_recurrent_12m` | EUR | Finance |
| % récurrent | `pourcent_recurrent` | % | Finance |
| ARPM | `arpm` | EUR/mois | Membres |
| Ratio loyer/CA | `loyer_ratio` | % | Finance |
| CA par m2 | `ca_par_m2` | EUR/m2/an | Opérations |
| Ratio masse salariale/CA | `masse_salariale_ratio` | % | Finance |
| EBITDA estimé | `ebitda_estime` | EUR | Finance |
| Marge EBITDA | `marge_ebitda` | % | Finance |
| Churn mensuel | `churn_mensuel` | % | Opérations |
| Conversion essais | `conversion_essai` | % | Opérations |
| Occupation moyenne | `occupation_moyenne` | % | Opérations |

### 7.5 Calculs avancés (v1.2)

En plus des 12 KPIs de base, le moteur de calcul propose 8 fonctions avancées pour une analyse approfondie :

| Fonction | Retour | Description |
|----------|--------|-------------|
| `calculateAdvancedFinancialKPIs` | `AdvancedFinancialKPIs` | Analyse financière détaillée : CA par segment, marges, EBE, ratios, point mort, trésorerie, endettement |
| `calculateAdvancedClientKPIs` | `AdvancedClientKPIs` | Analyse clientèle : base membres, CAC, LTV, ARPM, churn, rétention, segmentation, démographie |
| `calculateAdvancedOperationalKPIs` | `AdvancedOperationalKPIs` | Analyse opérationnelle : occupation, productivité, planning, CA/m², types de cours |
| `calculateAdvancedHRKPIs` | `AdvancedHRKPIs` | Analyse RH : structure équipe, certifications, turnover, qualité coaching |
| `calculateFinancialHealthScore` | Score /100 | Score de santé financière : Rentabilité (40pts) + Trésorerie (30pts) + Structure (30pts) |
| `generateScheduleHeatMap` | Matrice 6×7 | Carte de chaleur d'occupation : 6 tranches horaires × 7 jours, niveaux saturé/bon/moyen/faible |
| `analyzeChurnRisk` | Risque + actions | Analyse du risque de churn : scoring 5 facteurs, niveau faible/modéré/élevé/critique |
| `calculatePricingPosition` | Position P1-P4 | Positionnement prix : matrice qualité × prix avec recommandation tarifaire |

### 7.6 Score de santé financière

Le score de santé financière est un indicateur composite sur 100 points affiché dans l'onglet Vue d'ensemble du Dashboard :

| Sous-catégorie | Points | Indicateurs |
|----------------|:------:|-------------|
| Rentabilité | 40 | Marge EBITDA (25 pts) + Marge nette (15 pts) |
| Trésorerie | 30 | Jours de trésorerie (20 pts) + Ratio de liquidité (10 pts) |
| Structure | 30 | Ratio loyer/CA (10 pts) + Ratio MS/CA (10 pts) + Ratio endettement (10 pts) |

**Grille d'interprétation** :

| Score | Zone | Interprétation |
|:-----:|------|----------------|
| 80-100 | Vert | Santé financière excellente |
| 60-79 | Jaune | Santé financière correcte, axes d'amélioration |
| 40-59 | Orange | Santé financière fragile, vigilance requise |
| 0-39 | Rouge | Santé financière critique, intervention urgente |

---

## 8. Système de scoring par pilier

### 8.1 Principe

Le scoring fonctionne en 3 niveaux :
1. **Sous-score** : Chaque KPI est évalué de 0 à 100 selon des seuils métier
2. **Score pilier** : Moyenne pondérée des sous-scores du pilier, bornée [0, 100]
3. **Score global** : Moyenne pondérée des 3 piliers, bornée [0, 100]

### 8.2 Barèmes de scoring

#### Pilier Finance

##### Marge EBITDA (plus c'est haut, mieux c'est)

| Seuil | Score | Interprétation |
|:---:|:---:|---|
| >= 25% | 100 | Excellent - Marge très confortable |
| >= 20% | 90 | Très bien - Objectif atteint |
| >= 15% | 75 | Bien - Dans la cible |
| >= 10% | 60 | Correct - Marge d'amélioration |
| >= 5% | 40 | Insuffisant - Rentabilité fragile |
| >= 0% | 25 | Critique - Seuil de rentabilité |
| < 0% | 10 | Alerte - Exploitation déficitaire |

##### Ratio loyer/CA (plus c'est bas, mieux c'est)

| Seuil | Score | Interprétation |
|:---:|:---:|---|
| <= 12% | 100 | Excellent - Loyer très maîtrisé |
| <= 15% | 85 | Très bien - Dans la norme |
| <= 18% | 70 | Correct - Attention |
| <= 22% | 50 | Insuffisant - Poids élevé |
| <= 25% | 30 | Critique - Loyer trop lourd |
| > 25% | 10 | Alerte - Viabilité en question |

##### Ratio masse salariale/CA (zone optimale)

| Seuil | Score | Interprétation |
|:---:|:---:|---|
| 30-40% | 100 | Optimal - Equilibre parfait |
| 25-45% | 85 | Très bien - Proche de l'optimum |
| 20-50% | 70 | Correct - Acceptable |
| 0-55% | 50 | Insuffisant - Hors zone optimale |
| > 55% | 25 | Critique - MS trop élevée |

##### CA par m2 (plus c'est haut, mieux c'est)

| Seuil | Score | Interprétation |
|:---:|:---:|---|
| >= 400 EUR | 100 | Excellent - Surface très rentable |
| >= 300 EUR | 85 | Très bien |
| >= 250 EUR | 75 | Bien |
| >= 200 EUR | 60 | Correct |
| >= 150 EUR | 40 | Insuffisant |
| < 150 EUR | 25 | Critique - Surface sous-exploitée |

#### Pilier Clientèle (Commercial & Rétention)

##### % CA récurrent (plus c'est haut, mieux c'est)

| Seuil | Score | Interprétation |
|:---:|:---:|---|
| >= 90% | 100 | Excellent - Base très stable |
| >= 85% | 90 | Très bien |
| >= 80% | 80 | Bien |
| >= 70% | 65 | Correct |
| >= 60% | 45 | Insuffisant |
| < 60% | 25 | Critique - Trop de one-shot |

##### ARPM (plus c'est haut, mieux c'est)

| Seuil | Score | Interprétation |
|:---:|:---:|---|
| >= 110 EUR | 100 | Excellent - Forte monétisation |
| >= 95 EUR | 90 | Très bien |
| >= 85 EUR | 80 | Bien - Cible atteinte |
| >= 75 EUR | 65 | Correct |
| >= 65 EUR | 50 | Insuffisant |
| < 65 EUR | 30 | Critique - Sous-monétisation |

##### Churn mensuel (plus c'est bas, mieux c'est)

| Seuil | Score | Interprétation |
|:---:|:---:|---|
| <= 2% | 100 | Excellent - Rétention exceptionnelle |
| <= 3% | 90 | Très bien - Cible atteinte |
| <= 5% | 75 | Bien |
| <= 7% | 55 | Correct |
| <= 10% | 35 | Insuffisant |
| > 10% | 15 | Critique - Hémorragie membres |

#### Pilier Exploitation (Organisation & Pilotage)

##### Taux d'occupation (plus c'est haut, mieux c'est)

| Seuil | Score | Interprétation |
|:---:|:---:|---|
| >= 85% | 100 | Excellent - Cours pleins |
| >= 75% | 90 | Très bien |
| >= 70% | 80 | Bien - Cible atteinte |
| >= 65% | 70 | Correct |
| >= 55% | 55 | Insuffisant |
| >= 45% | 40 | Faible |
| < 45% | 25 | Critique - Cours vides |

##### Taux de conversion essais (plus c'est haut, mieux c'est)

| Seuil | Score | Interprétation |
|:---:|:---:|---|
| >= 60% | 100 | Excellent |
| >= 50% | 90 | Très bien - Cible atteinte |
| >= 40% | 75 | Bien |
| >= 30% | 55 | Correct |
| >= 20% | 35 | Insuffisant |
| < 20% | 20 | Critique |

### 8.3 Pondérations internes des piliers

#### Finance (poids global : 30%)
| Sous-score | Poids |
|------------|:-----:|
| Rentabilité (marge EBITDA) | 40% |
| Loyer | 20% |
| Masse salariale | 20% |
| CA par m2 | 20% |

#### Clientèle (poids global : 35%)
| Sous-score | Poids |
|------------|:-----:|
| % récurrent | 40% |
| ARPM | 35% |
| Churn | 25% |

#### Exploitation (poids global : 35%)
| Sous-score | Poids |
|------------|:-----:|
| Occupation | 60% |
| Conversion | 40% |

### 8.4 Score global

```
Score_Global = Score_Finance × 0.30
             + Score_Clientèle × 0.35
             + Score_Exploitation × 0.35
```

**RG-SCR-01** : Chaque score pilier est borné entre 0 et 100 (`clamp(score, 0, 100)`).
**RG-SCR-02** : Tous les scores sont arrondis à l'entier le plus proche (`Math.round`).
**RG-SCR-03** : Le score global est la somme pondérée des 3 piliers, également arrondie.

### 8.5 Grille d'interprétation du score global

| Score | Zone | Interprétation |
|:-----:|------|----------------|
| 80-100 | Vert | Excellente performance - Maintenir et optimiser |
| 60-79 | Jaune | Bonne performance - Axes d'amélioration identifiés |
| 40-59 | Orange | Performance insuffisante - Plan d'action nécessaire |
| 0-39 | Rouge | Performance critique - Intervention urgente |

---

## 9. Moteur de recommandations

### 9.1 Seuils de déclenchement

Chaque KPI est comparé à un seuil de déclenchement. Si le seuil est franchi, une recommandation est générée.

| KPI | Seuil | Cible | Condition |
|-----|:-----:|:-----:|-----------|
| Marge EBITDA | 15% | 15-20% | KPI < seuil |
| Ratio loyer/CA | 18% | < 15% | KPI > seuil |
| ARPM | 80 EUR | 85-100 EUR | KPI < seuil |
| Churn mensuel | 5% | < 3% | KPI > seuil |
| Occupation moyenne | 65% | 70-80% | KPI < seuil |
| Conversion essais | 40% | > 50% | KPI < seuil |
| % CA récurrent | 80% | > 85% | KPI < seuil |

### 9.2 Catalogue des recommandations

#### REC-01 : Améliorer la rentabilité (`improve_margins`)

| Propriété | Valeur |
|-----------|--------|
| **Déclencheur** | Marge EBITDA < 15% |
| **Priorité** | P1 (Haute) |
| **Effort** | Moyen |
| **Confiance** | Forte |
| **Catégorie** | Finance |
| **Impact estimé** | `CA_total × 5%` |
| **Action** | Analyser les charges fixes, optimiser la structure de coûts |

#### REC-02 : Optimiser le loyer (`optimize_rent`)

| Propriété | Valeur |
|-----------|--------|
| **Déclencheur** | Ratio loyer/CA > 18% |
| **Priorité** | P1 (Haute) |
| **Effort** | Difficile |
| **Confiance** | Moyenne |
| **Catégorie** | Finance |
| **Impact estimé** | `((loyer_ratio - 15) × CA_total) / 100` |
| **Action** | Renégocier le bail, sous-louer les espaces inutilisés |

#### REC-03 : Augmenter l'ARPM (`increase_arpm`)

| Propriété | Valeur |
|-----------|--------|
| **Déclencheur** | ARPM < 80 EUR |
| **Priorité** | P1 (Haute) |
| **Effort** | Moyen |
| **Confiance** | Forte |
| **Catégorie** | Commercial |
| **Impact estimé** | `(85 - ARPM) × Nb_membres × 12 × 0.7` |
| **Action** | Revoir la stratégie tarifaire, développer l'upsell (PT, nutrition) |

#### REC-04 : Réduire le churn (`reduce_churn`)

| Propriété | Valeur |
|-----------|--------|
| **Déclencheur** | Churn mensuel > 5% |
| **Priorité** | P1 (Haute) |
| **Effort** | Moyen |
| **Confiance** | Moyenne |
| **Catégorie** | Commercial |
| **Impact estimé** | `(churn - 3) × Nb_membres × ARPM × 6` |
| **Action** | Mettre en place un onboarding structuré, suivi personnalisé, événements communautaires |

#### REC-05 : Optimiser le taux d'occupation (`improve_occupation`)

| Propriété | Valeur |
|-----------|--------|
| **Déclencheur** | Occupation moyenne < 65% |
| **Priorité** | P2 (Moyenne) |
| **Effort** | Facile |
| **Confiance** | Moyenne |
| **Catégorie** | Opérations |
| **Impact estimé** | Non chiffré (opérationnel) |
| **Action** | Analyser le planning, remplir les créneaux sous-utilisés |

#### REC-06 : Améliorer la conversion des essais (`improve_conversion`)

| Propriété | Valeur |
|-----------|--------|
| **Déclencheur** | Conversion essais < 40% |
| **Priorité** | P2 (Moyenne) |
| **Effort** | Moyen |
| **Confiance** | Moyenne |
| **Catégorie** | Commercial |
| **Impact estimé** | `Essais/mois × 12 × (50 - conversion)/100 × ARPM × 12 × 0.5` |
| **Action** | Optimiser le processus d'essai, former l'équipe commerciale |

#### REC-07 : Augmenter le CA récurrent (`increase_recurring`)

| Propriété | Valeur |
|-----------|--------|
| **Déclencheur** | % récurrent < 80% |
| **Priorité** | P2 (Moyenne) |
| **Effort** | Moyen |
| **Confiance** | Moyenne |
| **Catégorie** | Commercial |
| **Impact estimé** | Non chiffré (stratégique) |
| **Action** | Privilégier les abonnements mensuels aux cartes de séances |

#### REC-08 : Maintenir les performances (`maintain_performance`)

| Propriété | Valeur |
|-----------|--------|
| **Déclencheur** | Aucun KPI ne dépasse les seuils |
| **Priorité** | P3 (Basse) |
| **Effort** | Facile |
| **Confiance** | Forte |
| **Catégorie** | Général |
| **Impact estimé** | 0 |
| **Action** | Continuer la stratégie actuelle, surveiller les KPIs régulièrement |

### 9.3 Règles de tri et de limitation

**RG-REC-02** : Les recommandations sont triées par :
1. Priorité croissante (P1 avant P2, P2 avant P3)
2. A priorité égale, par impact estimé décroissant

**RG-REC-03** : Maximum **6 recommandations** retournées (les plus prioritaires).

**RG-REC-04** : Si aucun KPI ne déclenche de recommandation, la recommandation `maintain_performance` est systématiquement générée.

---

## 10. Analyse concurrentielle et marché

### 10.1 Zones de marché

Les zones de marché permettent de contextualiser les tarifs selon la géographie.

| Niveau de prix | Fourchette | Environnement |
|:---:|---|---|
| Budget | 100-140 EUR/mois | Zones périurbaines, rurales |
| Standard | 140-180 EUR/mois | Villes moyennes |
| Premium | 180-250 EUR/mois | Grandes métropoles |
| Luxe | 250-350+ EUR/mois | Paris, quartiers premium |

### 10.2 Fiche concurrent

La fiche concurrent capture :
- **Identification** : Nom, adresse, coordonnées GPS, distance
- **Tarification** : 3 niveaux d'abonnement + essai
- **Positionnement** : Budget / Standard / Premium / Luxe
- **Réputation** : Note Google, nombre d'avis, followers Instagram
- **Infrastructure** : Surface, capacité, qualité équipement
- **Services** : Hyrox, haltérophilie, gymnastique, garderie, nutrition
- **Coaching** : Nombre de coachs, coach principal

### 10.3 Offres commerciales

Les offres commerciales de la salle sont cataloguées avec :
- **Type** : Abonnement, carte de séances, pack
- **Tarification** : Prix, devise, durée, engagement
- **Performance** : Nombre d'abonnés actifs, revenu mensuel estimé

---

## 11. Catalogue d'API REST

### 11.1 Authentification (`/api/auth`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|:----:|-------------|
| POST | `/api/auth/register` | Non | Inscription d'un nouvel utilisateur |
| POST | `/api/auth/login` | Non | Connexion et obtention du token JWT |
| GET | `/api/auth/me` | Oui | Profil de l'utilisateur connecté |
| PUT | `/api/auth/password` | Oui | Changement de mot de passe |

### 11.2 Salles (`/api/gyms`)

| Méthode | Endpoint | Auth | Accès | Description |
|---------|----------|:----:|:-----:|-------------|
| GET | `/api/gyms` | Opt. | - | Lister les salles |
| POST | `/api/gyms` | Oui | - | Créer une salle |
| GET | `/api/gyms/:id` | Opt. | Read | Détail d'une salle |
| PUT | `/api/gyms/:id` | Oui | Write | Modifier une salle |
| DELETE | `/api/gyms/:id` | Oui | Write | Supprimer une salle |
| POST | `/api/gyms/:id/access` | Oui | Owner | Ajouter un accès collaborateur |
| DELETE | `/api/gyms/:id/access/:userId` | Oui | Owner | Retirer un accès |

### 11.3 Audits (`/api/audits`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|:----:|-------------|
| GET | `/api/audits` | Opt. | Lister les audits |
| POST | `/api/audits` | Opt. | Créer un audit |
| GET | `/api/audits/:id` | Opt. | Détail d'un audit |
| PUT | `/api/audits/:id` | Oui | Modifier un audit |
| DELETE | `/api/audits/:id` | Oui | Supprimer un audit |
| GET | `/api/audits/:id/complete` | Opt. | Audit complet (réponses + KPIs + scores + recommandations) |
| GET | `/api/audits/:id/answers` | Opt. | Lister les réponses |
| POST | `/api/audits/:id/answers` | Oui | Sauvegarder des réponses |
| POST | `/api/audits/:id/kpis` | Oui | Sauvegarder les KPIs calculés |
| POST | `/api/audits/:id/scores` | Oui | Sauvegarder les scores |
| GET | `/api/audits/:id/global-score` | Opt. | Obtenir le score global |
| GET | `/api/audits/:id/recommendations` | Opt. | Lister les recommandations |
| POST | `/api/audits/:id/recommendations` | Oui | Sauvegarder les recommandations |

### 11.4 Marché et concurrence

| Méthode | Endpoint | Auth | Description |
|---------|----------|:----:|-------------|
| GET | `/api/competitors` | Opt. | Lister les concurrents |
| POST | `/api/competitors` | Oui | Ajouter un concurrent |
| GET | `/api/competitors/:id` | Opt. | Détail concurrent |
| PUT | `/api/competitors/:id` | Oui | Modifier un concurrent |
| DELETE | `/api/competitors/:id` | Oui | Supprimer un concurrent |
| GET | `/api/market-zones` | Opt. | Lister les zones de marché |
| POST | `/api/market-zones` | Oui | Créer une zone |
| GET | `/api/market-zones/:id` | Opt. | Détail zone |
| PUT | `/api/market-zones/:id` | Oui | Modifier une zone |
| DELETE | `/api/market-zones/:id` | Oui | Supprimer une zone |
| GET | `/api/gym-offers` | Opt. | Lister les offres |
| POST | `/api/gym-offers` | Oui | Créer une offre |
| GET | `/api/gym-offers/:id` | Opt. | Détail offre |
| PUT | `/api/gym-offers/:id` | Oui | Modifier une offre |
| DELETE | `/api/gym-offers/:id` | Oui | Supprimer une offre |

### 11.5 Benchmarks (`/api/market-benchmarks`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|:----:|-------------|
| GET | `/api/market-benchmarks` | Opt. | Lister les benchmarks |
| POST | `/api/market-benchmarks` | Oui | Créer un benchmark |
| PUT | `/api/market-benchmarks/:id` | Oui | Modifier un benchmark |

### 11.6 Exploration données (`/api/data-tables`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|:----:|-------------|
| GET | `/api/data-tables` | Opt. | Lister les tables disponibles |
| GET | `/api/data-tables/:name` | Opt. | Contenu d'une table |

### 11.7 Santé et version

| Méthode | Endpoint | Auth | Description |
|---------|----------|:----:|-------------|
| GET | `/health` | Non | Healthcheck du serveur |
| GET | `/` | Non | Informations API |
| GET | `/api/version` | Non | Version de l'application et de la base de données |

L'endpoint `/api/version` retourne :
```json
{
  "app": "1.1.0",
  "db": { "version": "20250210143000", "appliedAt": "2025-02-10T14:30:00Z" }
}
```

---

## 12. Pages et navigation frontend

### 12.1 Pages applicatives

| Page | Fichier | Fonction |
|------|---------|----------|
| **Accueil** | `HomePage.tsx` | Page d'atterrissage, navigation principale |
| **Dashboard** | `Dashboard.tsx` | Affichage des résultats d'audit en 5 onglets : Vue d'ensemble (score global + score santé financière /100 + KPIs clés), Finance (KPIs financiers avancés), Clientèle (KPIs clientèle avancés), Opérations (KPIs opérationnels avancés), RH & Coaching (KPIs RH avancés) |
| **Formulaire d'audit** | `AuditForm.tsx` | Questionnaire multi-étapes (250 questions, 5 blocs) avec sauvegarde automatique |
| **Formulaire salle** | `GymForm.tsx` | Création et édition des informations de la salle |
| **Concurrents** | `CompetitorsPage.tsx` | Gestion des concurrents et analyse du marché |
| **Zones de marché** | `MarketZonesPage.tsx` | Définition des zones géographiques et tarifaires |
| **Offres** | `OffersPage.tsx` | Gestion du catalogue d'offres commerciales |
| **Tables de données** | `DataTablesPage.tsx` | Exploration des données brutes en base |
| **Paramètres** | `SettingsPage.tsx` | Préférences utilisateur |

### 12.2 Hooks React

| Hook | Fichier | Fonction |
|------|---------|----------|
| `useAudits` | `useAudits.ts` | CRUD audits avec gestion d'état |
| `useGyms` | `useGyms.ts` | CRUD salles |
| `useCompetitors` | `useCompetitors.ts` | CRUD concurrents |
| `useGymOffers` | `useGymOffers.ts` | CRUD offres |
| `useMarketZones` | `useMarketZones.ts` | CRUD zones de marché |
| `useMarketBenchmarks` | `useMarketBenchmarks.ts` | Lecture benchmarks |
| `useEntityCRUD` | `useEntityCRUD.ts` | Hook générique factorisé pour les opérations CRUD |

### 12.3 Composant VersionBadge

Le composant `VersionBadge` affiche un badge discret en bas à droite de l'écran. Au clic, il déploie un panneau montrant :
- **Version Front** : version du package.json injectée au build via `__APP_VERSION__`
- **Version API** : version du backend (récupérée via `/api/version`)
- **Version DB** : version du schéma de base de données (dernière migration appliquée)

---

## 13. Règles de gestion transversales

### 13.1 Gestion des erreurs

| Type d'erreur | Code HTTP | Classe |
|---------------|:---------:|--------|
| Champ requis manquant | 400 | `ApiError.badRequest` |
| Token JWT invalide/expiré | 401 | `ApiError.unauthorized` |
| Compte désactivé / accès refusé | 403 | `ApiError.forbidden` |
| Ressource introuvable | 404 | `ApiError.notFound` |
| Email déjà utilisé | 409 | `ApiError.conflict` |
| Erreur serveur interne | 500 | Erreur non gérée |

**RG-ERR-01** : Toutes les erreurs retournent un JSON structuré : `{ error, message, details? }`.
**RG-ERR-02** : Les erreurs 500 n'exposent jamais les détails techniques en production.

### 13.2 Validation des requêtes

**RG-VAL-01** : La validation utilise express-validator avec des chaînes de validation par route.
**RG-VAL-02** : Les erreurs de validation retournent un HTTP 400 avec un tableau d'erreurs détaillées.

### 13.3 Soft delete

**RG-DEL-01** : Les entités suivantes utilisent le soft delete (champ `is_active`) : `users`, `competitors`, `market_zones`, `gym_offers`.
**RG-DEL-02** : Les entités suivantes sont supprimées physiquement : `audits`, `answers`, `kpis`, `scores`, `recommendations`, `gyms`.
**RG-DEL-03** : Les suppressions en cascade sont gérées par les contraintes FK SQLite (`ON DELETE CASCADE`).

### 13.4 Identifiants

**RG-ID-01** : Tous les identifiants primaires sont des UUID v4 générés côté serveur.
**RG-ID-02** : Les timestamps (`created_at`, `updated_at`) sont au format ISO 8601.

### 13.5 Migrations de base de données

Le système de migration permet l'évolution du schéma de manière contrôlée :

| Commande | Description |
|----------|-------------|
| `npm run migrate` | Appliquer les migrations en attente |
| `npm run migrate:status` | Afficher le statut des migrations |
| `npm run migrate:create <nom>` | Créer un fichier de migration |

**RG-MIG-01** : Les migrations sont nommées `YYYYMMDDHHMMSS_nom_descriptif.sql`.
**RG-MIG-02** : Chaque migration est exécutée dans une transaction.
**RG-MIG-03** : Un checksum SHA256 assure l'intégrité des fichiers de migration.
**RG-MIG-04** : L'historique des migrations est stocké dans la table `schema_version`.

### 13.6 Déploiement

Le déploiement est entièrement automatisé via GitHub Actions CI/CD (voir [section 14](#14-cicd---intégration-et-déploiement-continus) pour le détail complet).

**RG-DEP-01** : Le déploiement est interrompu si les tests échouent (vérifié en CI avant déploiement).
**RG-DEP-02** : Le déploiement est interrompu si le build frontend échoue.
**RG-DEP-03** : Une sauvegarde de la BDD est toujours créée avant mise à jour.
**RG-DEP-04** : Les fichiers `.env` sont sauvegardés et restaurés automatiquement lors du pull Git.
**RG-DEP-05** : Seules les 10 dernières sauvegardes de BDD sont conservées (nettoyage automatique).

---

## 14. CI/CD - Intégration et Déploiement Continus

### 14.1 Vue d'ensemble

Le projet utilise **GitHub Actions** pour automatiser l'intégration continue (CI) et le déploiement continu (CD). Le pipeline garantit que chaque modification est testée avant d'atteindre la production.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WORKFLOW CI/CD                                │
│                                                                     │
│  Développeur                                                        │
│      │                                                              │
│      ├─── push sur branche feature ──→ CI Pipeline                  │
│      │                                  ├── Lint (ESLint)           │
│      │                                  ├── Typecheck (TypeScript)  │
│      │                                  └── Tests (Vitest + Jest)   │
│      │                                                              │
│      ├─── Pull Request vers main ────→ CI Pipeline (même chose)     │
│      │                                                              │
│      └─── merge/push sur main ───────→ Deploy Pipeline              │
│                                         ├── Tests (Vitest + Jest)   │
│                                         └── Deploy via SSH ──→ VPS  │
│                                              ├── Backup BDD         │
│                                              ├── Pull code          │
│                                              ├── Install deps       │
│                                              ├── Build frontend     │
│                                              ├── Migrations BDD     │
│                                              └── Restart services   │
└─────────────────────────────────────────────────────────────────────┘
```

### 14.2 Pipeline CI (Intégration Continue)

**Fichier** : `.github/workflows/ci.yml`

**Déclenchement** :
- Push sur toute branche **sauf** `main`
- Pull Request ciblant `main`

**Environnement** : Ubuntu latest, Node.js 22

#### Job 1 : Lint & Typecheck

| Étape | Commande | Description |
|-------|----------|-------------|
| Checkout | `actions/checkout@v4` | Récupère le code source |
| Setup Node | `actions/setup-node@v4` | Installe Node.js 22 avec cache npm |
| Install | `npm ci` | Installation propre des dépendances frontend |
| Lint | `npm run lint` | Vérification ESLint (qualité de code) |
| Typecheck | `npm run typecheck` | Vérification TypeScript (`tsc --noEmit`) |

#### Job 2 : Tests

| Étape | Commande | Description |
|-------|----------|-------------|
| Checkout | `actions/checkout@v4` | Récupère le code source |
| Setup Node | `actions/setup-node@v4` | Installe Node.js 22 avec cache npm |
| Install Frontend | `npm ci` | Dépendances frontend |
| Install Backend | `cd backend && npm ci` | Dépendances backend |
| Tests | `npm test` | Exécute Vitest (frontend) + Jest (backend) |

> **Note** : Les deux jobs s'exécutent **en parallèle** pour un retour rapide.

### 14.3 Pipeline Deploy (Déploiement Continu)

**Fichier** : `.github/workflows/deploy.yml`

**Déclenchement** : Push sur la branche `main` uniquement

#### Job 1 : Tests (identique au CI)

Les tests sont rejoués avant tout déploiement pour garantir l'intégrité du code sur `main`.

#### Job 2 : Deploy to VPS

**Prérequis** : Le job `test` doit réussir (`needs: test`).

| Propriété | Valeur |
|-----------|--------|
| **Action utilisée** | `appleboy/ssh-action@v1` |
| **Connexion** | SSH via clé privée |
| **Commande distante** | `cd /home/ubuntu/crossfit-audit && bash deploy.sh` |

### 14.4 Secrets GitHub requis

Pour que le pipeline de déploiement fonctionne, les secrets suivants doivent être configurés dans **Settings > Secrets and variables > Actions** du repository GitHub :

| Secret | Description | Exemple |
|--------|-------------|---------|
| `VPS_HOST` | Adresse IP ou hostname du serveur | `203.0.113.42` |
| `VPS_USER` | Utilisateur SSH sur le serveur | `ubuntu` |
| `VPS_SSH_KEY` | Clé privée SSH (contenu complet) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_PORT` | Port SSH (optionnel, défaut 22) | `22` |

### 14.5 Script de déploiement (`deploy.sh`)

Le script `deploy.sh` est exécuté sur le VPS par GitHub Actions. Il orchestre les 6 étapes suivantes :

#### Étape 1 : Sauvegarde de la base de données

```bash
# Crée une copie horodatée de la BDD
cp backend/database/crossfit_audit.db backups/crossfit_audit_backup_YYYYMMDD_HHMMSS.db

# Conserve uniquement les 10 dernières sauvegardes
ls -t backups/crossfit_audit_backup_*.db | tail -n +11 | xargs -r rm
```

#### Étape 2 : Récupération du code depuis GitHub

```bash
# Sauvegarde les fichiers .env (non versionnés)
cp backend/.env backend/.env.backup

# Mise à jour du code
git fetch origin
git reset --hard origin/main

# Restaure les .env
mv backend/.env.backup backend/.env
```

> **Important** : Les fichiers `.env` sont sauvegardés puis restaurés car le `git reset --hard` écrase tous les fichiers locaux.

#### Étape 3 : Installation des dépendances

```bash
cd backend && npm install       # Backend (avec devDeps pour les migrations)
cd .. && npm install             # Frontend
```

#### Étape 4 : Build du frontend

```bash
npm run build    # Exécute tsc -b && vite build → génère le dossier dist/
```

Après le build, les devDependencies du backend sont nettoyées :
```bash
cd backend && npm prune --production
```

#### Étape 5 : Migrations de base de données

```bash
# Si la BDD n'existe pas → initialisation complète
npm run init-db

# Application des migrations en attente
npm run migrate
```

#### Étape 6 : Redémarrage des services et healthcheck

```bash
# Redémarrage des services systemd
sudo systemctl restart crossfit-audit-backend
sudo systemctl restart crossfit-audit-frontend

# Vérification de santé
curl -sf http://localhost:5177/health    # Backend
curl -sf http://localhost:5176           # Frontend
```

Le script affiche un résumé final avec le commit déployé, la date, l'auteur et le message.

### 14.6 Infrastructure de production

#### Architecture du serveur

```
┌──────────────────────────────────────────────────────────┐
│                    VPS (Ubuntu)                           │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                 Nginx (port 80/443)                  │ │
│  │  ┌──────────────────┐  ┌──────────────────────────┐ │ │
│  │  │  /               │  │  /api + /health          │ │ │
│  │  │  → localhost:5176 │  │  → localhost:5177        │ │ │
│  │  └──────────────────┘  └──────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────────┐  ┌────────────────────────────┐ │
│  │  systemd service    │  │  systemd service           │ │
│  │  crossfit-audit-    │  │  crossfit-audit-           │ │
│  │  frontend           │  │  backend                   │ │
│  │  (Vite preview      │  │  (Node.js Express          │ │
│  │   :5176)            │  │   :5177)                   │ │
│  └─────────────────────┘  └────────────┬───────────────┘ │
│                                        │                 │
│                              ┌─────────▼──────────┐      │
│                              │  SQLite Database    │      │
│                              │  crossfit_audit.db  │      │
│                              └────────────────────┘      │
└──────────────────────────────────────────────────────────┘
```

#### Services systemd

**Backend** (`crossfit-audit-backend.service`) :

| Propriété | Valeur |
|-----------|--------|
| **Type** | simple |
| **Utilisateur** | ubuntu |
| **Répertoire** | `/home/ubuntu/crossfit-audit/backend` |
| **Commande** | `/usr/bin/node server.js` |
| **Port** | 5177 |
| **Redémarrage** | Automatique (délai 10s) |
| **Logs** | `sudo journalctl -u crossfit-audit-backend -f` |

**Frontend** (`crossfit-audit-frontend.service`) :

| Propriété | Valeur |
|-----------|--------|
| **Type** | simple |
| **Utilisateur** | ubuntu |
| **Répertoire** | `/home/ubuntu/crossfit-audit` |
| **Commande** | `/usr/bin/npm run preview -- --port 5176 --host` |
| **Port** | 5176 |
| **Redémarrage** | Automatique (délai 10s) |
| **Logs** | `sudo journalctl -u crossfit-audit-frontend -f` |

#### Configuration Nginx

Le reverse proxy Nginx route les requêtes vers les bons services :

| Route | Destination | Description |
|-------|-------------|-------------|
| `/` | `localhost:5176` | Application frontend (SPA React) |
| `/api` | `localhost:5177` | API REST backend |
| `/health` | `localhost:5177/health` | Healthcheck (sans logs d'accès) |

**Headers de sécurité** configurés :
- `X-Frame-Options: SAMEORIGIN` - Protection contre le clickjacking
- `X-Content-Type-Options: nosniff` - Empêche le MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Protection XSS

**Limite upload** : 10 MB (`client_max_body_size`)

**Domaine** : `crossfit-audit.tulipe-saas.fr`

### 14.7 Guide de mise en place CI/CD (pour un nouveau projet)

Ce guide explique comment reproduire la CI/CD de ce projet depuis zéro.

#### Prérequis

- Un repository GitHub
- Un VPS avec Ubuntu (accès SSH root ou sudo)
- Node.js 22+ installé sur le VPS
- Nginx installé sur le VPS

#### Étape 1 : Préparer le VPS

```bash
# 1. Se connecter au VPS
ssh ubuntu@votre-serveur

# 2. Installer Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Installer Nginx
sudo apt-get install -y nginx

# 4. Cloner le repository
cd /home/ubuntu
git clone https://github.com/votre-user/votre-repo.git
cd votre-repo
```

#### Étape 2 : Configurer les services systemd

Créer les fichiers de service pour le backend et le frontend :

```bash
# Copier les fichiers de service
sudo cp deploy/crossfit-audit-backend.service /etc/systemd/system/
sudo cp deploy/crossfit-audit-frontend.service /etc/systemd/system/

# Recharger systemd et activer les services
sudo systemctl daemon-reload
sudo systemctl enable crossfit-audit-backend crossfit-audit-frontend

# Démarrer les services
sudo systemctl start crossfit-audit-backend
sudo systemctl start crossfit-audit-frontend
```

> **Astuce** : Le script `deploy/setup-services.sh` automatise toute cette étape (installation des dépendances, création des `.env`, init BDD, setup systemd, configuration Nginx).

#### Étape 3 : Configurer Nginx

```bash
# Copier la configuration
sudo cp deploy/nginx-crossfit-audit /etc/nginx/sites-available/crossfit-audit

# Activer le site
sudo ln -sf /etc/nginx/sites-available/crossfit-audit /etc/nginx/sites-enabled/

# Tester et recharger
sudo nginx -t && sudo systemctl reload nginx
```

Pour HTTPS (recommandé) :
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.fr
```

#### Étape 4 : Générer une clé SSH pour GitHub Actions

```bash
# Sur le VPS : générer une paire de clés dédiée
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions

# Ajouter la clé publique aux authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Afficher la clé privée (à copier dans GitHub Secrets)
cat ~/.ssh/github_actions
```

#### Étape 5 : Configurer les secrets GitHub

Dans le repository GitHub : **Settings > Secrets and variables > Actions > New repository secret**

| Secret | Valeur à renseigner |
|--------|---------------------|
| `VPS_HOST` | Adresse IP du VPS |
| `VPS_USER` | `ubuntu` (ou votre utilisateur) |
| `VPS_SSH_KEY` | Contenu de `~/.ssh/github_actions` (clé privée) |
| `VPS_PORT` | `22` (ou votre port SSH personnalisé) |

#### Étape 6 : Créer les workflows GitHub Actions

**Fichier `.github/workflows/ci.yml`** (intégration continue) :

```yaml
name: CI

on:
  push:
    branches-ignore:
      - main
  pull_request:
    branches:
      - main

jobs:
  lint-and-typecheck:
    name: Lint & Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    name: Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: cd backend && npm ci
      - run: npm test
```

**Fichier `.github/workflows/deploy.yml`** (déploiement) :

```yaml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  test:
    name: Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: cd backend && npm ci
      - run: npm test

  deploy:
    name: Deploy to VPS
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT || 22 }}
          script: cd /home/ubuntu/crossfit-audit && bash deploy.sh
```

#### Étape 7 : Créer le script de déploiement

Le fichier `deploy.sh` à la racine du projet doit :
1. Sauvegarder la BDD avant toute modification
2. Récupérer le code (`git fetch` + `git reset --hard`)
3. Préserver les fichiers `.env` (non versionnés)
4. Installer les dépendances (`npm install`)
5. Builder le frontend (`npm run build`)
6. Appliquer les migrations de BDD
7. Redémarrer les services systemd
8. Vérifier la santé des services (healthcheck)

> Le script complet est disponible dans `deploy.sh` à la racine du projet (229 lignes).

#### Résumé du flux

1. Le développeur push sur une branche feature → **CI** vérifie lint, types et tests
2. Le développeur ouvre une Pull Request vers `main` → **CI** revalide
3. La PR est mergée dans `main` → **Deploy** lance les tests puis déploie automatiquement
4. Le VPS exécute `deploy.sh` : backup, pull, build, migrate, restart
5. Les healthchecks confirment que l'application est opérationnelle

### 14.8 Commandes utiles en production

| Commande | Description |
|----------|-------------|
| `sudo journalctl -u crossfit-audit-backend -f` | Logs backend en temps réel |
| `sudo journalctl -u crossfit-audit-frontend -f` | Logs frontend en temps réel |
| `sudo systemctl status crossfit-audit-*` | Statut des deux services |
| `sudo systemctl restart crossfit-audit-backend` | Redémarrer le backend |
| `sudo systemctl restart crossfit-audit-frontend` | Redémarrer le frontend |
| `cd /home/ubuntu/crossfit-audit && ./db-manage.sh restore` | Restaurer un backup BDD |
| `cd /home/ubuntu/crossfit-audit && bash deploy.sh` | Déploiement manuel |

---

## 15. Annexes

### 15.1 Exemple de calcul complet

**Données d'entrée** :
- CA abonnements mensuels : 8 000 EUR
- CA non récurrent mensuel : 2 000 EUR
- 120 membres actifs
- Loyer mensuel : 1 500 EUR + 200 EUR charges
- Masse salariale : 3 500 EUR/mois
- Surface : 300 m2
- Essais/mois : 15, Conversions : 8
- Résiliations/mois : 4
- Occupation moyenne : 72%

**Etape 1 - Extraction** :
- CA récurrent = 8 000 × 12 = 96 000 EUR
- CA non récurrent = 2 000 × 12 = 24 000 EUR
- CA total = 120 000 EUR
- % récurrent = 80%
- Loyer annuel = (1 500 + 200) × 12 = 20 400 EUR
- MS annuelle = 3 500 × 12 = 42 000 EUR (simplifié)

**Etape 2 - KPIs** :
- ARPM = 120 000 / 12 / 120 = **83,3 EUR**
- Marge EBITDA = ((120 000 - 62 400) / 120 000) × 100 = **48%** (charges simplifiées)
- Loyer/CA = (20 400 / 120 000) × 100 = **17%**
- MS/CA = (42 000 / 120 000) × 100 = **35%**
- CA/m2 = 120 000 / 300 = **400 EUR**
- Conversion = (8 / 15) × 100 = **53,3%**
- Churn = (4 / 120) × 100 = **3,3%**
- Occupation = **72%**

**Etape 3 - Scores** :
- Score marge EBITDA : 100 (48% >= 25%)
- Score loyer : 70 (17% <= 18%)
- Score MS : 100 (35% dans [30-40%])
- Score CA/m2 : 100 (400 >= 400)
- **Score Finance** = 100×0.4 + 70×0.2 + 100×0.2 + 100×0.2 = **94**

- Score récurrent : 80 (80% >= 80%)
- Score ARPM : 65 (83.3 >= 75)
- Score churn : 90 (3.3% <= 3%)... non, 3.3% > 3% donc <= 5% → **75**
- **Score Clientèle** = 80×0.4 + 65×0.35 + 75×0.25 = **73** (arrondi)

- Score occupation : 80 (72% >= 70%)
- Score conversion : 90 (53.3% >= 50%)
- **Score Exploitation** = 80×0.6 + 90×0.4 = **84**

**Etape 4 - Score Global** :
- Global = 94×0.30 + 73×0.35 + 84×0.35 = 28.2 + 25.55 + 29.4 = **83**

**Etape 5 - Recommandations** :
- ARPM = 83.3 > 80 → Pas de recommandation
- Churn = 3.3% < 5% → Pas de recommandation
- % récurrent = 80% >= 80% → Pas de recommandation
- Tous les seuils passent → **Recommandation : "Maintenir les performances" (P3)**

### 15.2 Constantes et enums

| Constante | Valeurs |
|-----------|---------|
| `ROLES` | `admin`, `user` |
| `AUDIT_STATUS` | `draft`, `in_progress`, `completed` |
| `ACCESS_LEVELS` | `read`, `write`, `owner`, `public` |
| `RECOMMENDATION_PRIORITY` | `P1` (haute), `P2` (moyenne), `P3` (basse) |
| `EFFORT_LEVEL` | `facile`, `moyen`, `difficile` |
| `CONFIDENCE_LEVEL` | `faible`, `moyen`, `fort` |
| `CURRENCY` | `EUR`, `USD` |
| `PRICE_LEVEL` | `budget`, `standard`, `premium`, `luxe` |
| `OFFER_TYPE` | `abonnement`, `carte`, `pack` |

### 15.3 Historique des évolutions majeures

| Version | Date | Changements |
|:-------:|------|-------------|
| 1.2 | Février 2026 | Moteur de calcul avancé complet (8 fonctions), score de santé financière /100, inventaire matériel détaillé, amortissements, résultats financiers, Dashboard 5 onglets fonctionnels |
| 1.1 | Février 2026 | CI/CD GitHub Actions, badge de version, optimisation better-sqlite3, refactoring constantes, séparation Jest/Vitest |
| 1.0 | Février 2026 | Version initiale : questionnaire, KPIs, scoring, recommandations, concurrence, déploiement VPS |

**Détail des évolutions v1.1** :
- **CI/CD GitHub Actions** : Pipelines automatisés de lint, typecheck, tests et déploiement
- **Badge de version** : Composant `VersionBadge` affichant les versions front, API et BDD
- **Migration better-sqlite3** : Remplacement de `sqlite3` (async) par `better-sqlite3` (synchrone) pour de meilleures performances
- **Refactoring constantes** : Remplacement de toutes les magic strings par des constantes centralisées (`backend/constants/`)
- **Séparation des tests** : Jest pour le backend, Vitest pour le frontend (configurations isolées)
- **Correction TypeScript** : Résolution de 36 erreurs TypeScript bloquant le build de production
- **Tests frontend** : Ajout de 73 tests unitaires Vitest (composants, hooks, utilitaires)
- **JSDoc backend** : Documentation complète de toutes les fonctions backend

### 15.4 Couverture des tests

| Couche | Framework | Fichiers | Tests | Catégories |
|--------|-----------|:--------:|:-----:|------------|
| Frontend | Vitest + @testing-library/react | 13 | 73 | Composants UI, hooks CRUD, utilitaires |
| Backend | Jest + supertest | 12 | 109 | Business logic, controllers, models, middleware |
| **Total** | | **25** | **182** | |

**Commandes de test** :

| Commande | Description |
|----------|-------------|
| `npm test` | Tous les tests (frontend + backend) |
| `npm run test:frontend` | Tests frontend uniquement (Vitest) |
| `npm run test:backend` | Tests backend uniquement (Jest) |
| `cd backend && npm run test:applicatif` | Tests métier backend (business + controllers) |
| `cd backend && npm run test:crud` | Tests CRUD backend (models + middleware + utils) |
