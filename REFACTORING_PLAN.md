# Plan de Refactoring Complet - CrossFit Audit Application

## Problème identifié

L'application a 2 systèmes parallèles qui ne communiquent pas:
1. **calculateKPIs** - utilise des codes obsolètes ('ca', 'adhesions', etc.) → retourne 0 partout
2. **calculateAdvancedFinancialKPIs** - partiellement corrigé mais pas complètement aligné

## Solution: Refactoring complet

### 1. Système de calcul unifié

**Objectif**: Un seul système qui calcule tous les KPIs à partir des vraies données du questionnaire

**Actions**:
- Supprimer calculateKPIs obsolète
- Créer un nouveau système basé sur les données réelles
- Mapper correctement questionnaire → calculs

### 2. Codes du questionnaire (actuels)

```
BLOC 1: Identité & Contexte
- identite_legale
- infrastructure_detaillee (surface_totale, etc.)
- localisation

BLOC 2: Finance
- produits_exploitation (ca_abonnements_mensuels, ca_personal_training, etc.)
- charges_exploitation (loyer_mensuel_ht, salaires_bruts_coachs, etc.)
- resultat_tresorerie

BLOC 3: Clientèle
- structure_base (nb_membres_actifs_total, etc.)
- tarification_detaillee (panier_moyen_mensuel, etc.)
- demographie
- acquisition_conversion
- retention_churn
- engagement_satisfaction

BLOC 4: Opérations
- structure_planning
- capacite_occupation
- types_cours
- evenements

BLOC 5: RH
- structure_equipe (nombre_coaches, etc.)
- certifications
- formation_developpement
- remuneration
- organisation
- turnover_stabilite
- qualite_coaching
```

### 3. Nouveau système de calcul

**Phase 1: KPIs de base**
```typescript
calculateCoreKPIs(answers) {
  // Finance
  - CA total (somme de tous les produits)
  - ARPM (CA / membres)
  - Masse salariale totale
  - EBITDA
  - Marges

  // Clientèle
  - Membres actifs
  - Churn
  - Taux de conversion
  - LTV / CAC

  // Opérations
  - Taux d'occupation
  - CA/m²

  // RH
  - Ratio coaches/membres
  - Coût par coach
}
```

**Phase 2: Scoring par piliers**
```typescript
calculatePillarScores(coreKPIs, answers, benchmarks) {
  // Score Finance (0-100)
  - Rentabilité (40%): EBITDA, marges
  - Structure coûts (30%): Loyer, MS, charges
  - Efficience (30%): CA/m², CA/membre

  // Score Clientèle (0-100)
  - Acquisition (30%): Conversion, CAC
  - Rétention (40%): Churn, ancienneté
  - Valorisation (30%): ARPM, LTV

  // Score Exploitation (0-100)
  - Capacité (40%): Taux occupation
  - Planning (30%): Nb créneaux, diversité
  - Expérience (30%): Satisfaction, NPS

  // Score RH (0-100)
  - Structure (30%): Ratio coaches/membres
  - Coûts (40%): MS/CA, coût/coach
  - Qualité (30%): Certifications, formation
}
```

**Phase 3: Recommandations intelligentes**
```typescript
generateSmartRecommendations(scores, kpis, answers) {
  // Analyse des faiblesses
  - Identifier les piliers < 60
  - Identifier les KPIs hors cibles

  // Recommandations contextuelles
  - Si ARPM bas → repositionnement tarifaire
  - Si occupation basse → optimisation planning
  - Si churn élevé → amélioration rétention
  - Si MS/CA élevé → optimisation équipe

  // Priorisation
  - Impact financier x facilité x urgence
}
```

### 4. Affichage Dashboard

**Vue d'ensemble**
- Score global + scores par piliers
- Top 3 KPIs clés
- Top 3 recommandations prioritaires

**Onglets détaillés**
- Finance: KPIs financiers + analyse détaillée
- Clientèle: Base membres + acquisition + rétention
- Opérations: Planning + occupation + infrastructure
- RH: Équipe + coûts + qualité

### 5. Plan d'implémentation

**Étape 1**: Refaire calculateKPIs complètement
**Étape 2**: Corriger calculateScores avec bon algorithme
**Étape 3**: Améliorer generateRecommendations
**Étape 4**: Simplifier Dashboard pour afficher les bonnes données
**Étape 5**: Tests avec données réelles

## Principe clé

**Toujours partir des données réelles du questionnaire, jamais inventer de codes**
