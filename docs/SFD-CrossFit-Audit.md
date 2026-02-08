# Spécifications Fonctionnelles Détaillées (SFD)

## CrossFit Audit - Plateforme d'Audit de Performance pour Salles de CrossFit

| Information | Valeur |
|---|---|
| **Projet** | CrossFit Audit |
| **Version** | 1.0 |
| **Date** | Février 2026 |
| **Statut** | En production |
| **Stack technique** | React/TypeScript (Frontend) + Node.js/Express (Backend) + SQLite |

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
14. [Annexes](#14-annexes)

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
| **Reverse Proxy** | Nginx (production) | 80/443 |

### 2.2 Organisation du code

```
crossfit-audit/
├── src/                          # Frontend React/TypeScript
│   ├── pages/                    # Pages applicatives
│   ├── hooks/                    # Hooks React personnalisés
│   ├── lib/                      # Logique métier, types, API
│   ├── components/               # Composants réutilisables
│   └── __tests__/                # Tests unitaires frontend
├── backend/                      # Backend Node.js/Express
│   ├── controllers/              # Logique des endpoints
│   ├── models/                   # Accès données (SQLite)
│   ├── routes/                   # Définition des routes API
│   ├── middleware/                # Auth, erreurs, accès gym
│   ├── utils/                    # Calculs, extraction, helpers
│   ├── constants/                # Constantes et seuils métier
│   ├── validators/               # Validation des requêtes
│   ├── scripts/                  # Scripts d'initialisation
│   ├── migrations/               # Fichiers SQL de migration
│   └── __tests__/                # Tests unitaires backend
├── deploy/                       # Fichiers de déploiement (systemd, nginx)
└── docs/                         # Documentation
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
        ▼
   calculateKPIs()               → 12 KPIs normalisés
        │
        ▼
   calculateScores()             → 3 scores pilier + score global
        │
        ▼
   generateRecommendations()     → 1 à 6 recommandations priorisées
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
| 1 | Identité & Contexte | 35 | `identite_legale`, `infrastructure_detaillee`, `localisation_environnement` |
| 2 | Analyse Financière Complète | 80 | `produits_exploitation`, `charges_exploitation`, `resultat_tresorerie` |
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

### 6.4 Questions essentielles (mode rapide)

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

### 6.5 Sauvegarde des réponses

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

### 11.7 Santé

| Méthode | Endpoint | Auth | Description |
|---------|----------|:----:|-------------|
| GET | `/health` | Non | Healthcheck du serveur |
| GET | `/` | Non | Informations API |

---

## 12. Pages et navigation frontend

### 12.1 Pages applicatives

| Page | Fichier | Fonction |
|------|---------|----------|
| **Accueil** | `HomePage.tsx` | Page d'atterrissage, navigation principale |
| **Dashboard** | `Dashboard.tsx` | Affichage des résultats d'audit en 5 onglets : Vue d'ensemble, Finance, Clientèle, Opérations, RH |
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

Le script `deploy.sh` exécute les étapes suivantes en séquence :

1. Sauvegarde de la base de données (10 dernières sauvegardes conservées)
2. Récupération du code depuis GitHub (`git fetch` + `git reset --hard`)
3. Installation des dépendances (npm install backend + frontend)
4. Exécution des tests unitaires (frontend + backend)
5. Build du frontend (`tsc -b && vite build`)
6. Application des migrations de base de données
7. Redémarrage des services systemd (backend + frontend)
8. Tests de santé (healthcheck sur les deux ports)

**RG-DEP-01** : Le déploiement est interrompu si les tests échouent.
**RG-DEP-02** : Le déploiement est interrompu si le build frontend échoue.
**RG-DEP-03** : Une sauvegarde de la BDD est toujours créée avant mise à jour.

---

## 14. Annexes

### 14.1 Exemple de calcul complet

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

### 14.2 Constantes et enums

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

### 14.3 Couverture des tests

| Couche | Framework | Fichiers | Tests |
|--------|-----------|:--------:|:-----:|
| Frontend | Vitest | 13 | 73 |
| Backend | Jest | 12 | 109 |
| **Total** | | **25** | **182** |
