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
