# Exemple de Calcul - CrossFit Audit

## Exemple Concret

Prenons un exemple de box CrossFit qui remplit le questionnaire:

### Données Saisies

#### REVENUS (bloc `produits_exploitation`)
```
ca_abonnements_mensuels:      102744€  (120 membres × 71€ × 12 mois)
ca_abonnements_trimestriels:       0€
ca_abonnements_semestriels:        0€
ca_abonnements_annuels:            0€
ca_cartes_10:                      0€
ca_cartes_20:                      0€
ca_seances_unitaires:              0€
ca_frais_inscription:           1200€  (10 nouveaux × 120€)
ca_personal_training:          12000€
ca_coaching_nutrition:             0€
ca_suivi_remote:                   0€
ca_cours_specialises:              0€
ca_competitions_internes:       1500€
ca_competitions_externes:          0€
ca_seminaires:                     0€
ca_team_building:                  0€
ca_merchandising:               2500€
ca_nutrition_supplements:          0€
ca_location_materiel:              0€
ca_sous_location_espaces:          0€
ca_autres_revenus:                 0€
```

#### CHARGES (bloc `charges_exploitation`)
```
loyer_mensuel_ht:               3800€
charges_locatives_mensuelles:    300€
taxe_fonciere:                  1200€

electricite_annuel:             4800€
eau_annuel:                     1200€
gaz_chauffage_annuel:           2400€

salaires_bruts_gerant:         24000€
salaires_bruts_coachs:         42000€
salaires_bruts_administratif:       0€
charges_sociales_patronales:   16500€
charges_freelance:              6000€

assurance_rc_pro:               1200€
assurance_locaux:                800€
assurance_materiel:              600€
assurance_prevoyance:           1200€
mutuelle_entreprise:            2400€

honoraires_comptable:           1800€
affiliation_crossfit_annuel:    3000€

telephone_internet:              960€
logiciel_planning:               600€
logiciel_compta:                 360€

google_ads:                     2400€
facebook_instagram_ads:         1200€

entretien_locaux:               1200€
entretien_materiel:             2400€

autres_charges_fixes:           1500€
```

#### MEMBRES (bloc `structure_base`)
```
nb_membres_actifs_total:        120
```

#### INFRASTRUCTURE (bloc `infrastructure_detaillee`)
```
surface_totale:                 350 m²
```

#### OPERATIONS
```
taux_occupation_global_pct:      68%

essais_gratuits_mois:            15
conversions_essai_abonne_mois:    7

resiliations_mensuelles:          3
```

## Calculs Effectués par extractData.ts

### 1. REVENUS

```typescript
ca_recurrent = 102744 + 0 + 0 + 0
             = 102744€

ca_non_recurrent = 0 + 0 + 0 + 1200 + 12000 + 0 + 0 + 0 + 1500 +
                   0 + 0 + 0 + 2500 + 0 + 0 + 0 + 0
                 = 17200€

ca_total = 102744 + 17200
         = 119944€

pourcent_recurrent = (102744 / 119944) × 100
                   = 85,7%
```

### 2. CHARGES

```typescript
loyer_annuel_total = (3800 + 300) × 12 + 1200
                   = 4100 × 12 + 1200
                   = 50400€

energies_total = 4800 + 1200 + 2400
               = 8400€

masse_salariale_total = 24000 + 42000 + 0 + 16500 + 0 + 0 + 0 + 6000 + 0
                      = 88500€

assurances_total = 1200 + 800 + 600 + 1200 + 2400
                 = 6200€

services_exterieurs_total = 1800 + 0 + 0 + 3000 + 0 + 0
                          = 4800€

communication_total = 960 + 0 + 600 + 360 + 0 + 0 + 0
                    = 1920€

marketing_total = 2400 + 1200 + 0 + 0 + 0 + 0
                = 3600€

entretien_total = 1200 + 2400 + 0
                = 3600€

charges_total = 0 + 0 + 0 + 50400 + 8400 + 3600 +
                6200 + 4800 + 1920 + 3600 + 88500 +
                0 + 0 + 0 + 1500
              = 168920€
```

### 3. RÉSULTATS

```typescript
ebitda = 119944 - (168920 - 0 - 0 - 0)
       = 119944 - 168920
       = -48976€

marge_ebitda = (-48976 / 119944) × 100
             = -40,8%
```

### 4. MEMBRES

```typescript
arpm = 119944 / 12 / 120
     = 83,3€ par mois
```

### 5. RATIOS

```typescript
loyer_ca_ratio = (50400 / 119944) × 100
               = 42,0%

ms_ca_ratio = (88500 / 119944) × 100
            = 73,8%

marketing_ca_ratio = (3600 / 119944) × 100
                   = 3,0%

ca_par_m2 = 119944 / 350
          = 342,7€/m²
```

### 6. OPÉRATIONS

```typescript
taux_conversion_pct = (7 / 15) × 100
                    = 46,7%

taux_churn_pct = (3 / 120) × 100
               = 2,5%
```

## Résultat Final dans calculateKPIs

```typescript
{
  ca_total_12m: 119944€,
  ca_recurrent_12m: 102744€,
  pourcent_recurrent: 85,7%,
  arpm: 83,3€,
  loyer_ratio: 42,0%,
  ca_par_m2: 342,7€,
  masse_salariale_ratio: 73,8%,
  ebitda_estime: -48976€,
  marge_ebitda: -40,8%,
  churn_mensuel: 2,5%,
  conversion_essai: 46,7%,
  occupation_moyenne: 68%,
  loyer_net_annuel: 50400€
}
```

## Scoring

### FINANCE (30%)
- **Rentabilité** (40%): Marge EBITDA = -40,8% → **10 points** (perte)
- **Loyer** (20%): 42% → **10 points** (très élevé)
- **MS** (20%): 73,8% → **25 points** (trop élevé)
- **CA/m²** (20%): 342,7€ → **85 points** (bon)

Score Finance = (10 × 0,40) + (10 × 0,20) + (25 × 0,20) + (85 × 0,20)
              = 4 + 2 + 5 + 17
              = **28/100**

### COMMERCIAL & RÉTENTION (35%)
- **Récurrence** (40%): 85,7% → **90 points** (excellent)
- **ARPM** (35%): 83,3€ → **80 points** (bon)
- **Churn** (25%): 2,5% → **90 points** (excellent)

Score Commercial = (90 × 0,40) + (80 × 0,35) + (90 × 0,25)
                 = 36 + 28 + 22,5
                 = **86,5/100**

### ORGANISATION & PILOTAGE (35%)
- **Occupation** (60%): 68% → **70 points** (correct)
- **Conversion** (40%): 46,7% → **75 points** (bon)

Score Exploitation = (70 × 0,60) + (75 × 0,40)
                   = 42 + 30
                   = **72/100**

### SCORE GLOBAL
Score Global = (28 × 0,30) + (86,5 × 0,35) + (72 × 0,35)
             = 8,4 + 30,3 + 25,2
             = **64/100**

## Diagnostic

### Points Forts
✓ Excellente rétention (churn 2,5%)
✓ Bonne récurrence (85,7%)
✓ ARPM correct (83€)
✓ Conversion correcte (46,7%)
✓ CA/m² bon (342,7€)

### Points Faibles Critiques
✗ **Perte d'exploitation** (EBITDA -40,8%) → P1
✗ **Loyer beaucoup trop élevé** (42% du CA) → P1
✗ **Masse salariale excessive** (73,8% du CA) → P1

### Recommandations Prioritaires

**P1 - URGENT: Restructurer les coûts**
- Loyer: 50400€/an → Cible: 18000€ (15% du CA)
  - Économie nécessaire: 32400€
  - Actions: Renégocier bail, sous-louer, déménager

- Masse salariale: 88500€/an → Cible: 48000€ (40% du CA)
  - Économie nécessaire: 40500€
  - Actions: Optimiser planning coaches, réduire freelance, augmenter CA

**Impact combiné si objectifs atteints:**
- Économies: 72900€/an
- Nouveau résultat: -48976 + 72900 = +23924€
- Nouvelle marge EBITDA: +20%

**P2 - Augmenter le CA**
- Cible ARPM: 95€ (au lieu de 83€)
  - Augmentation: +12€/membre/mois
  - Impact: 12 × 120 × 12 = +17280€/an

## Conclusion

Cet exemple montre comment le système:
1. Extrait TOUTES les données saisies
2. Calcule correctement tous les KPIs
3. Établit un scoring objectif
4. Génère des recommandations pertinentes

Les chiffres sont cohérents et reflètent la réalité économique de la box.
