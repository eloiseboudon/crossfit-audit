# Synthèse des calculs KPI & scoring

Ce document résume le système de calculs KPI, de scoring et de recommandations utilisé par l'application.

## 1) Données sources

Les calculs utilisent exclusivement les réponses du questionnaire, notamment :

- **Finance** : `produits_exploitation`, `charges_exploitation`, `resultat_tresorerie`.
- **Clientèle** : `structure_base`, `tarification_detaillee`, `acquisition_conversion`, `retention_churn`.
- **Opérations** : `structure_planning`, `capacite_occupation`.

## 2) KPIs principaux

Exemples de KPIs calculés à partir des données extraites :

- **CA total annuel** : somme de tous les revenus.
- **CA récurrent** : abonnements uniquement.
- **ARPM** : `CA total / 12 / membres actifs`.
- **EBITDA & marge EBITDA**.
- **Ratios** : loyer/CA, masse salariale/CA, marketing/CA, CA/m².
- **Opérations** : taux d'occupation, conversion essai, churn.

## 3) Scoring (synthèse)

Le score global est calculé à partir de 3 piliers pondérés :

- **Finance (30%)** : marge EBITDA, loyer/CA, masse salariale/CA, CA/m².
- **Commercial & rétention (35%)** : récurrence du CA, ARPM, churn.
- **Organisation & pilotage (35%)** : occupation, conversion essais.

Chaque KPI est comparé à un barème (0-100) puis agrégé par pilier.

## 4) Recommandations

Des recommandations sont générées en fonction des seuils (exemples) :

- **Marge EBITDA < 15%** → optimisation des coûts.
- **Loyer/CA > 18%** → renégociation/sous-location.
- **ARPM < 80€** → travail tarifaire et services additionnels.
- **Churn > 5%** → actions de rétention.
- **Occupation < 65%** → ajustement planning.
- **Conversion < 40%** → optimisation du parcours d'essai.

Les recommandations sont priorisées (P1 → P3) et triées par impact estimé.

## 5) Exemple rapide

Si `CA total = 120k€` et `membres actifs = 120`, alors :

```
ARPM = 120000 / 12 / 120 = 83,3€
```

Les ratios et scores suivent les barèmes définis dans le code.

---

## 6) Fonctions de calcul avancées

Huit fonctions de calcul avancées fournissent une analyse détaillée par domaine. Elles sont implémentées dans `src/lib/calculations.ts`.

### 6a. `calculateAdvancedFinancialKPIs(answers)`

Analyse financière détaillée retournant un objet `AdvancedFinancialKPIs` :

- **CA par segment** : CA total, récurrent, non-récurrent, % récurrent
- **Charges** : loyer annuel, masse salariale, marketing, énergie, total charges
- **Marges** : marge brute, EBITDA (€ et %), marge nette
- **Ratios d'efficacité** : loyer/CA, MS/CA, marketing/CA, énergie/CA, assurances/CA, charges/CA
- **Structure de coûts** : CA par segment (cartes, PT), point mort mensuel, mois pour atteindre le point mort
- **Trésorerie** : jours de trésorerie, ratio de liquidité, BFR, poids échéances/CA
- **Endettement** : ratio d'endettement, capacité d'autofinancement
- **Résultat** : résultat courant avant impôt, EBE

### 6b. `calculateAdvancedClientKPIs(answers)`

Analyse clientèle retournant un objet `AdvancedClientKPIs` :

- **Base membres** : total actifs, par type (illimités, limités, cartes, essais)
- **Acquisition** : essais/mois, conversions, taux conversion, délai conversion moyen, CAC
- **Économie unitaire** : ARPM global et par type, LTV, ratio LTV/CAC
- **Rétention/Churn** : churn mensuel/annuel, rétention à 3/6/12 mois
- **Engagement** : fréquence moyenne, segmentation (assidus/réguliers/occasionnels/inactifs)
- **Démographie** : âge moyen, répartition H/F, ancienneté moyenne
- **Upsell** : taux pénétration premium, taux pénétration PT

### 6c. `calculateAdvancedOperationalKPIs(answers)`

Analyse opérationnelle retournant un objet `AdvancedOperationalKPIs` :

- **Infrastructure** : surface totale, capacité max, membres/m²
- **Planning** : cours/semaine, cours/jour, heures d'ouverture
- **Occupation** : taux global, en pointe, en creux, par tranche horaire
- **Productivité** : CA/session, coût/session, marge/session, CA/m², coût loyer/m²/mois, rentabilité/m²/an
- **Types de cours** : répartition WOD/haltéro/gymnastique/cardio/spécialisé
- **Équipement** : ratio membres/barre, âge moyen matériel

### 6d. `calculateAdvancedHRKPIs(answers)`

Analyse RH retournant un objet `AdvancedHRKPIs` :

- **Structure équipe** : nombre total, temps plein, temps partiel, freelance, ratio TP/TPartiel, taux externalisation
- **Coûts** : coût moyen/coach, coût total coachs, masse salariale totale
- **Certifications** : taux certification L1-L4, spécialités, nb certifications moyennes/coach
- **Formation** : budget annuel, budget/coach
- **Charge de travail** : heures coaching/sem, membres/coach, cours/coach/sem, taux double coaching
- **Turnover** : taux turnover, ancienneté moyenne
- **Qualité** : note coaching /10, NPS, feedback collecté

### 6e. `calculateFinancialHealthScore(financialKPIs)`

Score de santé financière sur 100 points, décomposé en 3 sous-catégories :

| Catégorie | Points max | Composition |
|-----------|:----------:|-------------|
| **Rentabilité** | 40 | Marge EBITDA (25 pts) + Marge nette (15 pts) |
| **Trésorerie** | 30 | Jours de trésorerie (20 pts) + Ratio de liquidité (10 pts) |
| **Structure** | 30 | Ratio loyer/CA (10 pts) + Ratio MS/CA (10 pts) + Ratio endettement (10 pts) |

Barèmes de scoring :
- Marge EBITDA : 25 pts si ≥ 20%, 20 pts si ≥ 15%, 15 pts si ≥ 10%, 8 pts si ≥ 5%, 3 pts si ≥ 0%, 0 sinon
- Jours trésorerie : 20 pts si ≥ 90j, 15 pts si ≥ 60j, 10 pts si ≥ 30j, 5 pts si ≥ 15j, 0 sinon

### 6f. `generateScheduleHeatMap(answers)`

Génère une matrice d'occupation par tranche horaire :

- **6 tranches** : early (6h-8h), morning (8h-12h), lunch (12h-14h), afternoon (14h-17h), evening (17h-20h), late (20h-22h)
- **7 jours** : lundi à dimanche
- **Niveaux** : `saturé` (>90%), `bon` (60-90%), `moyen` (30-60%), `faible` (<30%)

### 6g. `analyzeChurnRisk(answers)`

Évalue le risque de churn global de la salle :

- **5 facteurs** : taux de churn, fréquentation, inactivité, NPS, engagement
- **Score** : 0-100 (somme pondérée des facteurs)
- **Niveau de risque** : `faible` (<25), `modéré` (25-50), `élevé` (50-75), `critique` (≥75)
- Retourne des actions recommandées adaptées au niveau de risque

### 6h. `calculatePricingPosition(answers)`

Positionne la salle dans la matrice qualité × prix :

- **Axe prix** : comparaison avec la zone de marché (min/max)
- **Axe qualité** : score basé sur surface, équipement, coaching, services
- **Positions** : P1 (premium justifié), P2 (bon rapport Q/P), P3 (repositionnement nécessaire), P4 (low cost)
- Retourne une recommandation tarifaire adaptée
