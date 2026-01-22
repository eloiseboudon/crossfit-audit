"""
CROSSFIT GYM AI ANALYZER - Advanced Algorithm
==============================================

Algorithme d'intelligence artificielle ultra-performant pour l'analyse,
l'audit et l'optimisation de salles de CrossFit.

Auteur: Système d'analyse business CrossFit
Version: 1.0
"""

import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, field
from enum import Enum
import json
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


# ============================================================================
# SECTION 1: STRUCTURES DE DONNÉES ET CLASSES DE BASE
# ============================================================================

class SeverityLevel(Enum):
    """Niveaux de sévérité pour les insights"""
    CRITIQUE = "critique"
    ELEVE = "élevé"
    MOYEN = "moyen"
    FAIBLE = "faible"
    OPPORTUNITE = "opportunité"


class CategoryType(Enum):
    """Catégories d'analyse"""
    FINANCIER = "financier"
    MARKETING = "marketing"
    OPERATIONNEL = "opérationnel"
    HUMAIN = "humain"
    EQUIPEMENT = "équipement"
    SATISFACTION = "satisfaction"
    STRATEGIQUE = "stratégique"


@dataclass
class AuditData:
    """Structure de données pour l'audit complet"""
    # Données financières
    chiffre_affaires_mensuel: float
    charges_fixes_mensuelles: float
    charges_variables_mensuelles: float
    loyer_mensuel: float
    sous_location_revenus: float
    salaires_total: float
    
    # Abonnements
    nombre_abonnements_actifs: int
    nombre_abonnements_prelevement: int
    nombre_abonnements_carte: int
    panier_moyen_abonnement: float
    tarif_affiche_standard: float
    
    # Membres
    nombre_nouveaux_membres_mois: int
    nombre_membres_perdus_mois: int
    taux_presence_moyen: float
    anciennete_moyenne_membres: float  # en mois
    
    # Infrastructure
    surface_totale_m2: float
    surface_entrainement_m2: float
    valeur_equipement: float
    age_moyen_equipement: float  # en années
    capacite_max_simultane: int
    
    # Ressources humaines
    nombre_coachs: int
    nombre_coachs_temps_plein: int
    ratio_coach_membre: float
    anciennete_moyenne_coachs: float  # en années
    
    # Planning & Opérations
    nombre_cours_semaine: int
    taux_remplissage_cours: float
    heures_ouverture_semaine: float
    
    # Marketing & Communication
    budget_marketing_mensuel: float
    nombre_followers_instagram: int
    taux_engagement_social: float
    nombre_avis_google: int
    note_moyenne_google: float
    
    # Concurrence
    nombre_concurrents_directs: int
    tarif_moyen_concurrent: float
    position_concurrentielle: str  # "leader", "suiveur", "challenger"
    
    # Données additionnelles optionnelles
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Insight:
    """Représente une observation ou recommandation"""
    category: CategoryType
    severity: SeverityLevel
    title: str
    description: str
    impact_score: float  # 0-100
    implementation_difficulty: float  # 0-100
    estimated_revenue_impact: Optional[float]
    estimated_cost_impact: Optional[float]
    priority_score: float  # Calculé automatiquement
    actionable_steps: List[str]
    kpis_to_track: List[str]
    timeframe: str  # "immediate", "court_terme", "moyen_terme", "long_terme"


# ============================================================================
# SECTION 2: ALGORITHME DE SCORING ET ÉVALUATION
# ============================================================================

class PerformanceScorer:
    """
    Système de scoring avancé pour évaluer la performance globale
    """
    
    def __init__(self):
        # Poids des différentes catégories (total = 1.0)
        self.category_weights = {
            'financial_health': 0.30,
            'operational_efficiency': 0.20,
            'member_satisfaction': 0.20,
            'growth_potential': 0.15,
            'competitive_position': 0.15
        }
        
    def calculate_financial_health_score(self, data: AuditData) -> Tuple[float, Dict]:
        """Score de santé financière (0-100)"""
        
        # Calcul du résultat net mensuel
        revenus_total = data.chiffre_affaires_mensuel + data.sous_location_revenus
        charges_total = (data.charges_fixes_mensuelles + 
                        data.charges_variables_mensuelles + 
                        data.loyer_mensuel + 
                        data.salaires_total)
        resultat_net = revenus_total - charges_total
        marge_nette = (resultat_net / revenus_total * 100) if revenus_total > 0 else 0
        
        # Calcul du revenu moyen par m²
        revenu_par_m2 = data.chiffre_affaires_mensuel / data.surface_totale_m2 if data.surface_totale_m2 > 0 else 0
        
        # Ratio charges/revenus
        ratio_charges = (charges_total / revenus_total * 100) if revenus_total > 0 else 100
        
        # Scoring
        score_marge = min(100, max(0, (marge_nette + 20) * 2.5))  # -20% à +20% -> 0 à 100
        score_revenu_m2 = min(100, (revenu_par_m2 / 50) * 100)  # 50€/m² = 100 points
        score_ratio_charges = max(0, 100 - ratio_charges)  # Plus bas est mieux
        
        financial_score = (
            score_marge * 0.4 +
            score_revenu_m2 * 0.3 +
            score_ratio_charges * 0.3
        )
        
        details = {
            'resultat_net_mensuel': resultat_net,
            'marge_nette_pct': marge_nette,
            'revenu_par_m2': revenu_par_m2,
            'ratio_charges_pct': ratio_charges,
            'score_marge': score_marge,
            'score_revenu_m2': score_revenu_m2,
            'score_ratio_charges': score_ratio_charges
        }
        
        return financial_score, details
    
    def calculate_operational_efficiency_score(self, data: AuditData) -> Tuple[float, Dict]:
        """Score d'efficacité opérationnelle (0-100)"""
        
        # Taux d'utilisation de la capacité
        capacite_utilisee = (data.nombre_abonnements_actifs * data.taux_presence_moyen) / 100
        taux_utilisation = (capacite_utilisee / data.capacite_max_simultane) * 100 if data.capacite_max_simultane > 0 else 0
        
        # Productivité des coachs
        membres_par_coach = data.nombre_abonnements_actifs / data.nombre_coachs if data.nombre_coachs > 0 else 0
        
        # Efficacité du planning
        cours_par_heure = data.nombre_cours_semaine / data.heures_ouverture_semaine if data.heures_ouverture_semaine > 0 else 0
        
        # Scoring
        score_utilisation = min(100, taux_utilisation * 1.25)  # 80% utilisation = 100 points
        score_productivite_coach = min(100, (membres_par_coach / 30) * 100)  # 30 membres/coach = optimal
        score_planning = min(100, (cours_par_heure / 0.5) * 100)  # 0.5 cours/heure = optimal
        score_remplissage = data.taux_remplissage_cours
        
        operational_score = (
            score_utilisation * 0.25 +
            score_productivite_coach * 0.25 +
            score_planning * 0.20 +
            score_remplissage * 0.30
        )
        
        details = {
            'taux_utilisation_capacite': taux_utilisation,
            'membres_par_coach': membres_par_coach,
            'cours_par_heure': cours_par_heure,
            'score_utilisation': score_utilisation,
            'score_productivite_coach': score_productivite_coach,
            'score_planning': score_planning,
            'score_remplissage': score_remplissage
        }
        
        return operational_score, details
    
    def calculate_member_satisfaction_score(self, data: AuditData) -> Tuple[float, Dict]:
        """Score de satisfaction des membres (0-100)"""
        
        # Taux de rétention
        churn_rate = (data.nombre_membres_perdus_mois / data.nombre_abonnements_actifs * 100) if data.nombre_abonnements_actifs > 0 else 0
        retention_rate = 100 - churn_rate
        
        # Scoring
        score_retention = min(100, retention_rate * 1.1)  # 90% rétention = 100 points
        score_anciennete = min(100, (data.anciennete_moyenne_membres / 24) * 100)  # 24 mois = optimal
        score_presence = data.taux_presence_moyen
        score_avis = (data.note_moyenne_google / 5) * 100
        
        # Bonus pour nombre d'avis (indique engagement)
        bonus_avis = min(20, (data.nombre_avis_google / 50) * 20)
        
        satisfaction_score = (
            score_retention * 0.30 +
            score_anciennete * 0.20 +
            score_presence * 0.20 +
            score_avis * 0.30 +
            bonus_avis * 0.1
        ) * 0.95  # Ajustement pour ne pas dépasser 100
        
        details = {
            'churn_rate_mensuel': churn_rate,
            'retention_rate': retention_rate,
            'score_retention': score_retention,
            'score_anciennete': score_anciennete,
            'score_presence': score_presence,
            'score_avis': score_avis,
            'bonus_avis': bonus_avis
        }
        
        return satisfaction_score, details
    
    def calculate_growth_potential_score(self, data: AuditData) -> Tuple[float, Dict]:
        """Score de potentiel de croissance (0-100)"""
        
        # Taux de croissance mensuel
        growth_rate = ((data.nombre_nouveaux_membres_mois - data.nombre_membres_perdus_mois) / 
                      data.nombre_abonnements_actifs * 100) if data.nombre_abonnements_actifs > 0 else 0
        
        # Capacité résiduelle
        capacite_residuelle = data.capacite_max_simultane - (data.nombre_abonnements_actifs * data.taux_presence_moyen / 100)
        taux_capacite_residuelle = (capacite_residuelle / data.capacite_max_simultane * 100) if data.capacite_max_simultane > 0 else 0
        
        # Engagement digital
        ratio_followers = (data.nombre_followers_instagram / data.nombre_abonnements_actifs) if data.nombre_abonnements_actifs > 0 else 0
        
        # Scoring
        score_croissance = min(100, (growth_rate + 5) * 10)  # +5% croissance = 100 points
        score_capacite = min(100, taux_capacite_residuelle * 2.5)  # 40% capacité résiduelle = 100
        score_digital = min(100, ratio_followers * 20)  # Ratio 5:1 followers/membres = 100
        score_engagement = min(100, data.taux_engagement_social * 200)  # 0.5% engagement = 100
        
        growth_score = (
            score_croissance * 0.35 +
            score_capacite * 0.25 +
            score_digital * 0.20 +
            score_engagement * 0.20
        )
        
        details = {
            'growth_rate_mensuel': growth_rate,
            'capacite_residuelle': capacite_residuelle,
            'taux_capacite_residuelle': taux_capacite_residuelle,
            'ratio_followers_membres': ratio_followers,
            'score_croissance': score_croissance,
            'score_capacite': score_capacite,
            'score_digital': score_digital,
            'score_engagement': score_engagement
        }
        
        return growth_score, details
    
    def calculate_competitive_position_score(self, data: AuditData) -> Tuple[float, Dict]:
        """Score de position concurrentielle (0-100)"""
        
        # Comparaison tarifaire
        ratio_prix = (data.panier_moyen_abonnement / data.tarif_moyen_concurrent * 100) if data.tarif_moyen_concurrent > 0 else 100
        
        # Position sur le marché
        position_scores = {
            'leader': 100,
            'challenger': 75,
            'suiveur': 50
        }
        score_position = position_scores.get(data.position_concurrentielle.lower(), 50)
        
        # Densité concurrentielle (inversement proportionnel)
        densite_concurrent = data.nombre_concurrents_directs / (data.nombre_abonnements_actifs / 50)
        score_densite = max(0, 100 - (densite_concurrent * 20))
        
        # Part de marché estimée
        membres_total_estime = data.nombre_abonnements_actifs * (data.nombre_concurrents_directs + 1)
        part_marche = (data.nombre_abonnements_actifs / membres_total_estime * 100) if membres_total_estime > 0 else 0
        score_part_marche = part_marche * 5  # 20% part = 100 points
        
        competitive_score = (
            score_position * 0.40 +
            score_densite * 0.30 +
            score_part_marche * 0.30
        )
        
        details = {
            'ratio_prix_vs_concurrent': ratio_prix,
            'position': data.position_concurrentielle,
            'densite_concurrentielle': densite_concurrent,
            'part_marche_estimee': part_marche,
            'score_position': score_position,
            'score_densite': score_densite,
            'score_part_marche': score_part_marche
        }
        
        return competitive_score, details
    
    def calculate_overall_score(self, data: AuditData) -> Dict:
        """Calcul du score global et de tous les sous-scores"""
        
        # Calcul de tous les scores
        financial_score, financial_details = self.calculate_financial_health_score(data)
        operational_score, operational_details = self.calculate_operational_efficiency_score(data)
        satisfaction_score, satisfaction_details = self.calculate_member_satisfaction_score(data)
        growth_score, growth_details = self.calculate_growth_potential_score(data)
        competitive_score, competitive_details = self.calculate_competitive_position_score(data)
        
        # Score global pondéré
        overall_score = (
            financial_score * self.category_weights['financial_health'] +
            operational_score * self.category_weights['operational_efficiency'] +
            satisfaction_score * self.category_weights['member_satisfaction'] +
            growth_score * self.category_weights['growth_potential'] +
            competitive_score * self.category_weights['competitive_position']
        )
        
        # Détermination du grade
        if overall_score >= 85:
            grade = "A+ (Excellence)"
        elif overall_score >= 75:
            grade = "A (Très Bon)"
        elif overall_score >= 65:
            grade = "B+ (Bon)"
        elif overall_score >= 55:
            grade = "B (Satisfaisant)"
        elif overall_score >= 45:
            grade = "C (Moyen)"
        elif overall_score >= 35:
            grade = "D (Faible)"
        else:
            grade = "F (Critique)"
        
        return {
            'overall_score': round(overall_score, 2),
            'grade': grade,
            'category_scores': {
                'financial_health': {
                    'score': round(financial_score, 2),
                    'weight': self.category_weights['financial_health'],
                    'details': financial_details
                },
                'operational_efficiency': {
                    'score': round(operational_score, 2),
                    'weight': self.category_weights['operational_efficiency'],
                    'details': operational_details
                },
                'member_satisfaction': {
                    'score': round(satisfaction_score, 2),
                    'weight': self.category_weights['member_satisfaction'],
                    'details': satisfaction_details
                },
                'growth_potential': {
                    'score': round(growth_score, 2),
                    'weight': self.category_weights['growth_potential'],
                    'details': growth_details
                },
                'competitive_position': {
                    'score': round(competitive_score, 2),
                    'weight': self.category_weights['competitive_position'],
                    'details': competitive_details
                }
            }
        }


# ============================================================================
# SECTION 3: MOTEUR D'INSIGHTS ET RECOMMANDATIONS
# ============================================================================

class InsightEngine:
    """
    Moteur intelligent de génération d'insights et recommandations
    """
    
    def __init__(self):
        self.insights: List[Insight] = []
        
    def generate_financial_insights(self, data: AuditData, scores: Dict) -> List[Insight]:
        """Génère des insights financiers"""
        insights = []
        
        financial_details = scores['category_scores']['financial_health']['details']
        marge_nette = financial_details['marge_nette_pct']
        revenu_par_m2 = financial_details['revenu_par_m2']
        ratio_charges = financial_details['ratio_charges_pct']
        
        # Insight sur la marge nette
        if marge_nette < 10:
            insights.append(Insight(
                category=CategoryType.FINANCIER,
                severity=SeverityLevel.CRITIQUE if marge_nette < 5 else SeverityLevel.ELEVE,
                title="Marge nette insuffisante",
                description=f"La marge nette de {marge_nette:.1f}% est en dessous du seuil de rentabilité saine (15-20%). "
                           f"Cela limite la capacité d'investissement et expose à des risques financiers.",
                impact_score=95,
                implementation_difficulty=60,
                estimated_revenue_impact=data.chiffre_affaires_mensuel * 0.10,
                estimated_cost_impact=-data.charges_fixes_mensuelles * 0.15,
                priority_score=0,
                actionable_steps=[
                    "Analyser en détail chaque poste de charge et identifier les 20% qui représentent 80% des coûts",
                    "Augmenter les tarifs de 5-10% sur les nouveaux abonnements",
                    "Développer des services additionnels (nutrition, PT, récupération) avec marge élevée",
                    "Optimiser les achats groupés de matériel et suppléments",
                    "Négocier le loyer ou chercher des colocations supplémentaires"
                ],
                kpis_to_track=[
                    "Marge nette mensuelle",
                    "Ratio charges/revenus",
                    "Évolution du panier moyen",
                    "Revenus par service additionnel"
                ],
                timeframe="court_terme"
            ))
        
        # Insight sur le revenu par m²
        if revenu_par_m2 < 30:
            impact_revenu_potentiel = (40 - revenu_par_m2) * data.surface_totale_m2
            insights.append(Insight(
                category=CategoryType.FINANCIER,
                severity=SeverityLevel.MOYEN,
                title="Sous-utilisation de l'espace",
                description=f"Le revenu de {revenu_par_m2:.1f}€/m² est inférieur au potentiel (35-50€/m²). "
                           f"Potentiel additionnel: {impact_revenu_potentiel:.0f}€/mois.",
                impact_score=70,
                implementation_difficulty=50,
                estimated_revenue_impact=impact_revenu_potentiel,
                estimated_cost_impact=None,
                priority_score=0,
                actionable_steps=[
                    "Créer des créneaux supplémentaires aux heures creuses",
                    "Développer des offres \"open gym\" pour maximiser l'occupation",
                    "Louer l'espace pour des événements le weekend",
                    "Proposer des cours spécialisés (mobilité, yoga, olympique) à tarif premium",
                    "Optimiser l'agencement pour augmenter la capacité"
                ],
                kpis_to_track=[
                    "Revenu par m²",
                    "Taux d'occupation horaire",
                    "Nombre de créneaux actifs",
                    "Revenus location/événements"
                ],
                timeframe="court_terme"
            ))
        
        # Insight sur les charges
        if ratio_charges > 85:
            insights.append(Insight(
                category=CategoryType.FINANCIER,
                severity=SeverityLevel.ELEVE,
                title="Ratio de charges élevé",
                description=f"Les charges représentent {ratio_charges:.1f}% des revenus (objectif: 75-80%). "
                           f"Cela réduit drastiquement la rentabilité et la marge de manœuvre.",
                impact_score=85,
                implementation_difficulty=65,
                estimated_revenue_impact=None,
                estimated_cost_impact=-data.chiffre_affaires_mensuel * 0.10,
                priority_score=0,
                actionable_steps=[
                    "Audit détaillé de tous les postes de dépenses",
                    "Renégocier les contrats fournisseurs (électricité, assurance, équipement)",
                    "Mutualiser les achats avec d'autres salles",
                    "Optimiser les horaires des coachs selon l'affluence réelle",
                    "Automatiser les tâches administratives (facturation, relances)"
                ],
                kpis_to_track=[
                    "Ratio charges/revenus",
                    "Économies mensuelles réalisées",
                    "Charges par catégorie",
                    "ROI des optimisations"
                ],
                timeframe="court_terme"
            ))
        
        # Insight sur la dépendance aux prélèvements
        ratio_prelevement = (data.nombre_abonnements_prelevement / data.nombre_abonnements_actifs * 100)
        if ratio_prelevement < 85:
            insights.append(Insight(
                category=CategoryType.FINANCIER,
                severity=SeverityLevel.MOYEN,
                title="Prévisibilité des revenus à améliorer",
                description=f"Seulement {ratio_prelevement:.1f}% des abonnements sont en prélèvement automatique. "
                           f"Objectif: 90%+ pour maximiser la prévisibilité et réduire le churn.",
                impact_score=60,
                implementation_difficulty=30,
                estimated_revenue_impact=data.panier_moyen_abonnement * (data.nombre_abonnements_actifs * 0.05),
                estimated_cost_impact=None,
                priority_score=0,
                actionable_steps=[
                    "Inciter au prélèvement avec une réduction de 5%",
                    "Simplifier le processus d'inscription au prélèvement",
                    "Communiquer sur la facilité et les avantages du prélèvement",
                    "Convertir progressivement les membres carte existants"
                ],
                kpis_to_track=[
                    "Taux de prélèvement automatique",
                    "Taux de conversion carte -> prélèvement",
                    "Churn rate par type de paiement"
                ],
                timeframe="court_terme"
            ))
        
        return insights
    
    def generate_operational_insights(self, data: AuditData, scores: Dict) -> List[Insight]:
        """Génère des insights opérationnels"""
        insights = []
        
        operational_details = scores['category_scores']['operational_efficiency']['details']
        taux_utilisation = operational_details['taux_utilisation_capacite']
        membres_par_coach = operational_details['membres_par_coach']
        
        # Insight sur le taux de remplissage
        if data.taux_remplissage_cours < 75:
            insights.append(Insight(
                category=CategoryType.OPERATIONNEL,
                severity=SeverityLevel.MOYEN,
                title="Taux de remplissage des cours sous-optimal",
                description=f"Le taux de remplissage moyen de {data.taux_remplissage_cours:.1f}% indique une capacité inexploitée. "
                           f"Objectif: 80-85% pour un équilibre optimal.",
                impact_score=65,
                implementation_difficulty=45,
                estimated_revenue_impact=None,
                estimated_cost_impact=None,
                priority_score=0,
                actionable_steps=[
                    "Analyser les créneaux sous-performants (jour, heure, coach)",
                    "Ajuster le planning en fonction des données de réservation",
                    "Tester des formats de cours différents aux heures creuses",
                    "Communiquer davantage sur les créneaux disponibles",
                    "Mettre en place un système de réservation obligatoire pour mieux prévoir"
                ],
                kpis_to_track=[
                    "Taux de remplissage par créneau",
                    "Taux de remplissage par coach",
                    "Taux de présence après réservation",
                    "Évolution hebdomadaire du remplissage"
                ],
                timeframe="immediate"
            ))
        
        # Insight sur le ratio coach/membre
        if membres_par_coach > 35 or membres_par_coach < 20:
            if membres_par_coach > 35:
                insights.append(Insight(
                    category=CategoryType.OPERATIONNEL,
                    severity=SeverityLevel.ELEVE,
                    title="Ratio coach/membre trop élevé",
                    description=f"Avec {membres_par_coach:.1f} membres par coach, la qualité du coaching risque d'être compromise. "
                               f"Objectif: 25-30 membres par coach pour un accompagnement optimal.",
                    impact_score=75,
                    implementation_difficulty=70,
                    estimated_revenue_impact=None,
                    estimated_cost_impact=data.salaires_total * 0.20,
                    priority_score=0,
                    actionable_steps=[
                        "Recruter un coach supplémentaire (temps partiel d'abord)",
                        "Former un membre expérimenté au coaching",
                        "Réorganiser les créneaux pour mieux distribuer la charge",
                        "Développer des cours en petit groupe premium (6-8 personnes) à prix élevé"
                    ],
                    kpis_to_track=[
                        "Ratio membres/coach",
                        "Satisfaction des membres (enquête)",
                        "Taux de rétention",
                        "Nombre de blessures/incidents"
                    ],
                    timeframe="moyen_terme"
                ))
            else:
                insights.append(Insight(
                    category=CategoryType.OPERATIONNEL,
                    severity=SeverityLevel.MOYEN,
                    title="Sous-utilisation des coachs",
                    description=f"Avec {membres_par_coach:.1f} membres par coach, les coachs sont sous-utilisés. "
                               f"Opportunité d'optimiser les coûts ou d'augmenter l'offre.",
                    impact_score=55,
                    implementation_difficulty=50,
                    estimated_revenue_impact=data.panier_moyen_abonnement * 10,
                    estimated_cost_impact=-data.salaires_total * 0.10,
                    priority_score=0,
                    actionable_steps=[
                        "Lancer une campagne d'acquisition agressive",
                        "Proposer des services de coaching personnalisé",
                        "Développer des ateliers et séminaires payants",
                        "Optimiser les plannings pour réduire les heures creuses",
                        "Envisager de passer un coach en temps partiel temporairement"
                    ],
                    kpis_to_track=[
                        "Ratio membres/coach",
                        "Taux d'occupation des coachs",
                        "Revenus par coach",
                        "Nouvelles inscriptions"
                    ],
                    timeframe="court_terme"
                ))
        
        # Insight sur le planning
        if data.nombre_cours_semaine < 30:
            insights.append(Insight(
                category=CategoryType.OPERATIONNEL,
                severity=SeverityLevel.FAIBLE,
                title="Densité de planning à optimiser",
                description=f"Avec {data.nombre_cours_semaine} cours/semaine, il existe un potentiel d'optimisation. "
                           f"Benchmark: 35-45 cours/semaine pour une box active.",
                impact_score=50,
                implementation_difficulty=40,
                estimated_revenue_impact=data.panier_moyen_abonnement * 5,
                estimated_cost_impact=None,
                priority_score=0,
                actionable_steps=[
                    "Analyser la demande horaire non satisfaite",
                    "Ajouter des créneaux tôt le matin (6h-7h) et tard le soir (20h-21h)",
                    "Tester des créneaux le weekend",
                    "Proposer des formats courts (30-45min) pour attirer plus de monde",
                    "Créer des cours spécialisés (débutants, technique, compétition)"
                ],
                kpis_to_track=[
                    "Nombre de cours par semaine",
                    "Taux de remplissage par tranche horaire",
                    "Revenus additionnels générés",
                    "Satisfaction membres sur la variété des créneaux"
                ],
                timeframe="court_terme"
            ))
        
        return insights
    
    def generate_member_satisfaction_insights(self, data: AuditData, scores: Dict) -> List[Insight]:
        """Génère des insights sur la satisfaction des membres"""
        insights = []
        
        satisfaction_details = scores['category_scores']['member_satisfaction']['details']
        churn_rate = satisfaction_details['churn_rate_mensuel']
        
        # Insight sur le churn
        if churn_rate > 8:
            insights.append(Insight(
                category=CategoryType.SATISFACTION,
                severity=SeverityLevel.CRITIQUE if churn_rate > 12 else SeverityLevel.ELEVE,
                title="Taux de désabonnement préoccupant",
                description=f"Churn rate de {churn_rate:.1f}%/mois (objectif: <5%). "
                           f"À ce rythme, {churn_rate * 12:.0f}% des membres partent chaque année. "
                           f"Coût d'acquisition d'un nouveau membre: 5-10x plus cher que retenir un existant.",
                impact_score=90,
                implementation_difficulty=70,
                estimated_revenue_impact=data.panier_moyen_abonnement * (data.nombre_abonnements_actifs * 0.05) * 12,
                estimated_cost_impact=None,
                priority_score=0,
                actionable_steps=[
                    "Mettre en place des entretiens de départ systématiques pour comprendre les raisons",
                    "Créer un programme d'onboarding structuré (30-60-90 jours)",
                    "Identifier les membres à risque (baisse de fréquentation) et les contacter proactivement",
                    "Organiser des événements communautaires mensuels",
                    "Proposer des parcours de progression personnalisés",
                    "Mettre en place un système de parrainage avec récompenses"
                ],
                kpis_to_track=[
                    "Churn rate mensuel",
                    "Taux de rétention par cohorte",
                    "NPS (Net Promoter Score)",
                    "Raisons de départ (catégorisées)",
                    "Taux de présence par membre"
                ],
                timeframe="immediate"
            ))
        
        # Insight sur les avis Google
        if data.nombre_avis_google < 50 or data.note_moyenne_google < 4.5:
            insights.append(Insight(
                category=CategoryType.SATISFACTION,
                severity=SeverityLevel.MOYEN,
                title="Réputation en ligne à développer",
                description=f"Avec {data.nombre_avis_google} avis à {data.note_moyenne_google:.1f}/5, "
                           f"la visibilité et crédibilité en ligne peuvent être améliorées. "
                           f"Objectif: 100+ avis à 4.7+/5.",
                impact_score=60,
                implementation_difficulty=30,
                estimated_revenue_impact=data.panier_moyen_abonnement * 3,
                estimated_cost_impact=None,
                priority_score=0,
                actionable_steps=[
                    "Solliciter activement les avis après 1 mois d'adhésion",
                    "Faciliter le processus (QR code, lien direct)",
                    "Répondre à TOUS les avis (positifs et négatifs) rapidement",
                    "Créer un programme de reconnaissance des membres satisfaits",
                    "Traiter rapidement les problèmes soulevés dans les avis négatifs"
                ],
                kpis_to_track=[
                    "Nombre d'avis Google",
                    "Note moyenne Google",
                    "Taux de réponse aux avis",
                    "Taux de conversion visiteurs -> membres",
                    "Mentions et avis spontanés"
                ],
                timeframe="court_terme"
            ))
        
        # Insight sur le taux de présence
        if data.taux_presence_moyen < 50:
            insights.append(Insight(
                category=CategoryType.SATISFACTION,
                severity=SeverityLevel.MOYEN,
                title="Engagement des membres à stimuler",
                description=f"Taux de présence moyen de {data.taux_presence_moyen:.1f}% indique un engagement faible. "
                           f"Des membres peu engagés sont plus susceptibles de partir. Objectif: 60-70%.",
                impact_score=70,
                implementation_difficulty=55,
                estimated_revenue_impact=None,
                estimated_cost_impact=None,
                priority_score=0,
                actionable_steps=[
                    "Créer des challenges mensuels avec tableau de bord visible",
                    "Mettre en place un système de suivi de progression (app, tableau)",
                    "Organiser des compétitions internes amicales",
                    "Envoyer des rappels/encouragements personnalisés aux membres inactifs",
                    "Créer des groupes d'entraide et d'accountability",
                    "Gamifier l'expérience (badges, niveaux, récompenses)"
                ],
                kpis_to_track=[
                    "Taux de présence moyen",
                    "Distribution de fréquentation (1x, 2x, 3x+/semaine)",
                    "Engagement dans les challenges",
                    "Corrélation présence/rétention"
                ],
                timeframe="court_terme"
            ))
        
        return insights
    
    def generate_growth_insights(self, data: AuditData, scores: Dict) -> List[Insight]:
        """Génère des insights sur la croissance"""
        insights = []
        
        growth_details = scores['category_scores']['growth_potential']['details']
        growth_rate = growth_details['growth_rate_mensuel']
        ratio_followers = growth_details['ratio_followers_membres']
        
        # Insight sur la croissance
        if growth_rate < 2:
            insights.append(Insight(
                category=CategoryType.MARKETING,
                severity=SeverityLevel.ELEVE if growth_rate < 0 else SeverityLevel.MOYEN,
                title="Croissance insuffisante" if growth_rate >= 0 else "Décroissance préoccupante",
                description=f"Taux de croissance mensuel de {growth_rate:.1f}%. "
                           f"Objectif: 3-5%/mois pour une croissance saine. "
                           f"À ce rythme: {growth_rate * 12:.0f}% de croissance annuelle.",
                impact_score=85,
                implementation_difficulty=65,
                estimated_revenue_impact=data.panier_moyen_abonnement * (data.nombre_abonnements_actifs * 0.05) * 12,
                estimated_cost_impact=data.budget_marketing_mensuel * 2,
                priority_score=0,
                actionable_steps=[
                    "Augmenter le budget marketing à 5-7% du CA",
                    "Lancer un programme de parrainage agressif (1 mois offert parrain + parrainé)",
                    "Organiser une journée portes ouvertes mensuelle",
                    "Développer des partenariats locaux (entreprises, écoles, clubs)",
                    "Créer des offres d'essai irrésistibles (1 semaine gratuite)",
                    "Optimiser le tunnel de conversion (site web, réseaux sociaux, landing pages)"
                ],
                kpis_to_track=[
                    "Taux de croissance mensuel",
                    "Coût d'acquisition par membre (CAC)",
                    "Taux de conversion visiteurs -> essais -> membres",
                    "ROI marketing par canal",
                    "Lifetime Value (LTV) des membres"
                ],
                timeframe="immediate"
            ))
        
        # Insight sur les réseaux sociaux
        if ratio_followers < 3 or data.taux_engagement_social < 0.02:
            insights.append(Insight(
                category=CategoryType.MARKETING,
                severity=SeverityLevel.MOYEN,
                title="Présence digitale sous-développée",
                description=f"Ratio followers/membres de {ratio_followers:.1f}:1 (objectif: 4-6:1) "
                           f"et engagement de {data.taux_engagement_social*100:.2f}% (objectif: >2%). "
                           f"Le digital est un levier de croissance majeur sous-exploité.",
                impact_score=65,
                implementation_difficulty=45,
                estimated_revenue_impact=data.panier_moyen_abonnement * 5,
                estimated_cost_impact=500,
                priority_score=0,
                actionable_steps=[
                    "Poster quotidiennement du contenu varié (WODs, transformations, tips, coulisses)",
                    "Mettre en avant les success stories des membres (avant/après)",
                    "Créer des Reels/TikToks dynamiques et viraux",
                    "Lancer des challenges digitaux (#30DaysOfCrossFit)",
                    "Collaborer avec des influenceurs fitness locaux",
                    "Utiliser les stories pour l'interaction quotidienne",
                    "Investir dans de la publicité ciblée Facebook/Instagram"
                ],
                kpis_to_track=[
                    "Nombre de followers par plateforme",
                    "Taux d'engagement",
                    "Reach et impressions",
                    "Conversions depuis les réseaux sociaux",
                    "Coût par acquisition (CPA) digital"
                ],
                timeframe="court_terme"
            ))
        
        # Insight sur la capacité
        capacite_residuelle = growth_details['capacite_residuelle']
        if capacite_residuelle < 10:
            insights.append(Insight(
                category=CategoryType.STRATEGIQUE,
                severity=SeverityLevel.ELEVE,
                title="Capacité maximale proche",
                description=f"Capacité résiduelle de seulement {capacite_residuelle:.0f} places. "
                           f"La croissance est limitée par les infrastructures actuelles. "
                           f"Planification stratégique nécessaire.",
                impact_score=80,
                implementation_difficulty=85,
                estimated_revenue_impact=None,
                estimated_cost_impact=data.loyer_mensuel * 1.5,
                priority_score=0,
                actionable_steps=[
                    "Évaluer la faisabilité d'une expansion dans les locaux actuels",
                    "Optimiser le planning pour maximiser la capacité existante",
                    "Envisager l'ouverture d'un second site",
                    "Augmenter les tarifs pour ralentir la croissance et améliorer la marge",
                    "Créer une liste d'attente avec engagement",
                    "Développer des créneaux en dehors des heures de pointe"
                ],
                kpis_to_track=[
                    "Taux d'occupation",
                    "Liste d'attente",
                    "Faisabilité expansion",
                    "ROI potentiel nouveau site",
                    "Satisfaction malgré la saturation"
                ],
                timeframe="long_terme"
            ))
        
        return insights
    
    def generate_competitive_insights(self, data: AuditData, scores: Dict) -> List[Insight]:
        """Génère des insights concurrentiels"""
        insights = []
        
        competitive_details = scores['category_scores']['competitive_position']['details']
        ratio_prix = competitive_details['ratio_prix_vs_concurrent']
        
        # Insight sur le positionnement prix
        if ratio_prix < 85:
            insights.append(Insight(
                category=CategoryType.STRATEGIQUE,
                severity=SeverityLevel.MOYEN,
                title="Sous-valorisation tarifaire",
                description=f"Vos tarifs sont {100-ratio_prix:.0f}% inférieurs à la concurrence. "
                           f"Opportunité d'augmentation de 10-15% sans perte de compétitivité. "
                           f"Impact potentiel: +{data.chiffre_affaires_mensuel * 0.12:.0f}€/mois.",
                impact_score=75,
                implementation_difficulty=40,
                estimated_revenue_impact=data.chiffre_affaires_mensuel * 0.12,
                estimated_cost_impact=None,
                priority_score=0,
                actionable_steps=[
                    "Augmenter les tarifs de 10% sur tous les nouveaux abonnements",
                    "Maintenir les anciens membres aux tarifs actuels (clause d'antériorité)",
                    "Améliorer la proposition de valeur (services, coaching, équipement)",
                    "Communiquer sur la qualité et les résultats pour justifier l'augmentation",
                    "Créer des offres premium avec services additionnels"
                ],
                kpis_to_track=[
                    "Panier moyen nouveau membre",
                    "Taux de conversion après augmentation",
                    "Churn rate nouveau vs ancien tarif",
                    "Revenus mensuels totaux"
                ],
                timeframe="immediate"
            ))
        elif ratio_prix > 115:
            insights.append(Insight(
                category=CategoryType.STRATEGIQUE,
                severity=SeverityLevel.MOYEN,
                title="Positionnement prix premium à justifier",
                description=f"Vos tarifs sont {ratio_prix-100:.0f}% supérieurs à la concurrence. "
                           f"Assurez-vous que la proposition de valeur justifie ce premium.",
                impact_score=60,
                implementation_difficulty=50,
                estimated_revenue_impact=None,
                estimated_cost_impact=None,
                priority_score=0,
                actionable_steps=[
                    "Auditer la proposition de valeur vs concurrence",
                    "Renforcer les éléments de différenciation (coaching, équipement, communauté)",
                    "Communiquer activement sur les avantages uniques",
                    "Collecter et mettre en avant les témoignages et résultats",
                    "Surveiller le taux de conversion et ajuster si nécessaire"
                ],
                kpis_to_track=[
                    "Taux de conversion",
                    "Motifs de refus/objections",
                    "NPS vs concurrence",
                    "Churn rate comparatif"
                ],
                timeframe="court_terme"
            ))
        
        # Insight sur la concurrence
        if data.nombre_concurrents_directs > 3:
            insights.append(Insight(
                category=CategoryType.STRATEGIQUE,
                severity=SeverityLevel.MOYEN,
                title="Marché concurrentiel saturé",
                description=f"Avec {data.nombre_concurrents_directs} concurrents directs, la différenciation est cruciale. "
                           f"Nécessité de développer des avantages compétitifs uniques.",
                impact_score=70,
                implementation_difficulty=70,
                estimated_revenue_impact=None,
                estimated_cost_impact=None,
                priority_score=0,
                actionable_steps=[
                    "Analyser en détail l'offre de chaque concurrent",
                    "Identifier des niches non servies (seniors, débutants, femmes enceintes, etc.)",
                    "Développer une identité de marque forte et unique",
                    "Créer des programmes exclusifs non réplicables",
                    "Miser sur la communauté et l'expérience membre exceptionnelle",
                    "Considérer des partenariats stratégiques"
                ],
                kpis_to_track=[
                    "Part de marché estimée",
                    "Différenciateurs perçus (enquête)",
                    "Taux de conversion vs concurrence",
                    "Raisons de choix des nouveaux membres"
                ],
                timeframe="moyen_terme"
            ))
        
        return insights
    
    def generate_equipment_insights(self, data: AuditData) -> List[Insight]:
        """Génère des insights sur l'équipement"""
        insights = []
        
        # Insight sur l'âge de l'équipement
        if data.age_moyen_equipement > 5:
            insights.append(Insight(
                category=CategoryType.EQUIPEMENT,
                severity=SeverityLevel.MOYEN,
                title="Équipement vieillissant",
                description=f"Âge moyen de l'équipement: {data.age_moyen_equipement:.1f} ans. "
                           f"Au-delà de 5 ans, risque accru de pannes et image dégradée.",
                impact_score=55,
                implementation_difficulty=75,
                estimated_revenue_impact=None,
                estimated_cost_impact=20000,
                priority_score=0,
                actionable_steps=[
                    "Établir un plan de renouvellement progressif (20% par an)",
                    "Prioriser l'équipement le plus utilisé et visible",
                    "Négocier des partenariats avec des fournisseurs (équipement contre visibilité)",
                    "Considérer l'achat d'équipement d'occasion récent",
                    "Améliorer la maintenance préventive pour prolonger la durée de vie"
                ],
                kpis_to_track=[
                    "Âge moyen de l'équipement",
                    "Nombre de pannes/mois",
                    "Budget de maintenance",
                    "Satisfaction sur l'équipement (enquête)"
                ],
                timeframe="moyen_terme"
            ))
        
        # Insight sur la valeur de l'équipement
        valeur_par_membre = data.valeur_equipement / data.nombre_abonnements_actifs
        if valeur_par_membre < 500:
            insights.append(Insight(
                category=CategoryType.EQUIPEMENT,
                severity=SeverityLevel.FAIBLE,
                title="Ratio équipement/membre à améliorer",
                description=f"Valeur d'équipement par membre: {valeur_par_membre:.0f}€ (objectif: 600-800€). "
                           f"Un investissement supplémentaire pourrait améliorer l'expérience.",
                impact_score=45,
                implementation_difficulty=60,
                estimated_revenue_impact=None,
                estimated_cost_impact=10000,
                priority_score=0,
                actionable_steps=[
                    "Identifier les manques d'équipement via feedback membres",
                    "Investir dans du matériel polyvalent et robuste",
                    "Prioriser l'équipement qui permet de nouvelles activités/cours",
                    "Améliorer l'esthétique générale de la salle"
                ],
                kpis_to_track=[
                    "Valeur équipement/membre",
                    "Utilisation du nouvel équipement",
                    "Impact sur satisfaction",
                    "ROI de l'investissement"
                ],
                timeframe="moyen_terme"
            ))
        
        return insights
    
    def calculate_priority_scores(self) -> None:
        """Calcule les scores de priorité pour tous les insights"""
        for insight in self.insights:
            # Score de priorité basé sur plusieurs facteurs
            impact_weight = 0.4
            difficulty_weight = 0.3
            severity_weight = 0.3
            
            # Plus l'impact est élevé, mieux c'est
            impact_normalized = insight.impact_score / 100
            
            # Plus la difficulté est faible, mieux c'est
            difficulty_normalized = 1 - (insight.implementation_difficulty / 100)
            
            # Mapping de sévérité
            severity_map = {
                SeverityLevel.CRITIQUE: 1.0,
                SeverityLevel.ELEVE: 0.8,
                SeverityLevel.MOYEN: 0.6,
                SeverityLevel.FAIBLE: 0.4,
                SeverityLevel.OPPORTUNITE: 0.7
            }
            severity_normalized = severity_map[insight.severity]
            
            # Calcul du score final
            insight.priority_score = (
                impact_normalized * impact_weight +
                difficulty_normalized * difficulty_weight +
                severity_normalized * severity_weight
            ) * 100
    
    def generate_all_insights(self, data: AuditData, scores: Dict) -> List[Insight]:
        """Génère tous les insights"""
        self.insights = []
        
        # Génération de tous les types d'insights
        self.insights.extend(self.generate_financial_insights(data, scores))
        self.insights.extend(self.generate_operational_insights(data, scores))
        self.insights.extend(self.generate_member_satisfaction_insights(data, scores))
        self.insights.extend(self.generate_growth_insights(data, scores))
        self.insights.extend(self.generate_competitive_insights(data, scores))
        self.insights.extend(self.generate_equipment_insights(data))
        
        # Calcul des priorités
        self.calculate_priority_scores()
        
        # Tri par priorité décroissante
        self.insights.sort(key=lambda x: x.priority_score, reverse=True)
        
        return self.insights


# ============================================================================
# SECTION 4: PRÉDICTIONS ET PROJECTIONS
# ============================================================================

class PredictionEngine:
    """
    Moteur de prédiction et de projection financière
    """
    
    def predict_revenue_growth(self, data: AuditData, months: int = 12) -> Dict:
        """Prédit l'évolution des revenus sur X mois"""
        
        # Taux de croissance actuel
        current_growth_rate = (data.nombre_nouveaux_membres_mois - data.nombre_membres_perdus_mois) / data.nombre_abonnements_actifs
        
        projections = []
        current_membres = data.nombre_abonnements_actifs
        current_revenue = data.chiffre_affaires_mensuel
        
        for month in range(months):
            # Croissance avec légère décélération (plus réaliste)
            adjusted_growth_rate = current_growth_rate * (0.95 ** month)
            new_membres = current_membres * (1 + adjusted_growth_rate)
            new_revenue = new_membres * data.panier_moyen_abonnement
            
            projections.append({
                'month': month + 1,
                'membres': round(new_membres),
                'revenue': round(new_revenue, 2),
                'growth_rate': round(adjusted_growth_rate * 100, 2)
            })
            
            current_membres = new_membres
        
        total_projected_revenue = sum(p['revenue'] for p in projections)
        avg_monthly_revenue = total_projected_revenue / months
        
        return {
            'projections': projections,
            'total_projected_revenue_12m': round(total_projected_revenue, 2),
            'avg_monthly_revenue': round(avg_monthly_revenue, 2),
            'final_membre_count': projections[-1]['membres'],
            'total_growth_pct': round(((projections[-1]['membres'] / data.nombre_abonnements_actifs) - 1) * 100, 2)
        }
    
    def calculate_breakeven_acquisition_cost(self, data: AuditData) -> Dict:
        """Calcule le coût d'acquisition maximum par membre"""
        
        # Lifetime Value estimée
        avg_lifetime_months = data.anciennete_moyenne_membres
        monthly_margin = data.panier_moyen_abonnement * 0.6  # Marge estimée à 60%
        ltv = avg_lifetime_months * monthly_margin
        
        # CAC max = 1/3 de la LTV (règle générale)
        max_cac = ltv / 3
        
        # CAC actuel estimé
        if data.nombre_nouveaux_membres_mois > 0:
            current_cac = data.budget_marketing_mensuel / data.nombre_nouveaux_membres_mois
        else:
            current_cac = 0
        
        return {
            'estimated_ltv': round(ltv, 2),
            'max_cac_recommended': round(max_cac, 2),
            'current_cac': round(current_cac, 2),
            'cac_to_ltv_ratio': round(current_cac / ltv, 2) if ltv > 0 else 0,
            'is_healthy': current_cac < max_cac if current_cac > 0 else True
        }
    
    def simulate_optimization_impact(self, data: AuditData, insights: List[Insight]) -> Dict:
        """Simule l'impact de l'implémentation des recommandations"""
        
        # Calcul de l'impact total potentiel
        total_revenue_impact = sum(i.estimated_revenue_impact or 0 for i in insights)
        total_cost_impact = sum(i.estimated_cost_impact or 0 for i in insights)
        
        # Revenus actuels
        current_monthly_revenue = data.chiffre_affaires_mensuel + data.sous_location_revenus
        current_monthly_costs = (data.charges_fixes_mensuelles + 
                                data.charges_variables_mensuelles + 
                                data.loyer_mensuel + 
                                data.salaires_total)
        current_monthly_profit = current_monthly_revenue - current_monthly_costs
        
        # Projections optimisées (implémentation progressive sur 6 mois)
        optimized_scenarios = []
        
        for scenario_pct in [0.3, 0.5, 0.7, 1.0]:  # 30%, 50%, 70%, 100% d'implémentation
            scenario_revenue_impact = total_revenue_impact * scenario_pct
            scenario_cost_impact = total_cost_impact * scenario_pct
            
            new_monthly_revenue = current_monthly_revenue + scenario_revenue_impact
            new_monthly_costs = current_monthly_costs + scenario_cost_impact
            new_monthly_profit = new_monthly_revenue - new_monthly_costs
            
            profit_increase = new_monthly_profit - current_monthly_profit
            profit_increase_pct = (profit_increase / current_monthly_profit * 100) if current_monthly_profit > 0 else 0
            
            optimized_scenarios.append({
                'implementation_rate': f"{int(scenario_pct * 100)}%",
                'monthly_revenue': round(new_monthly_revenue, 2),
                'monthly_costs': round(new_monthly_costs, 2),
                'monthly_profit': round(new_monthly_profit, 2),
                'profit_increase': round(profit_increase, 2),
                'profit_increase_pct': round(profit_increase_pct, 2),
                'annual_profit': round(new_monthly_profit * 12, 2)
            })
        
        return {
            'current_state': {
                'monthly_revenue': round(current_monthly_revenue, 2),
                'monthly_costs': round(current_monthly_costs, 2),
                'monthly_profit': round(current_monthly_profit, 2),
                'annual_profit': round(current_monthly_profit * 12, 2)
            },
            'optimization_scenarios': optimized_scenarios,
            'max_potential_monthly_increase': round(total_revenue_impact + abs(total_cost_impact), 2),
            'max_potential_annual_increase': round((total_revenue_impact + abs(total_cost_impact)) * 12, 2)
        }
    
    def calculate_acquisition_viability(self, prix_acquisition: float, data: AuditData, 
                                       annual_profit: float, duree_pret_annees: int = 7,
                                       taux_interet: float = 0.04) -> Dict:
        """Calcule la viabilité d'une acquisition"""
        
        # Calcul de la mensualité du prêt
        taux_mensuel = taux_interet / 12
        nombre_mensualites = duree_pret_annees * 12
        
        if taux_mensuel > 0:
            mensualite = prix_acquisition * (taux_mensuel * (1 + taux_mensuel)**nombre_mensualites) / \
                        ((1 + taux_mensuel)**nombre_mensualites - 1)
        else:
            mensualite = prix_acquisition / nombre_mensualites
        
        # Profit mensuel actuel
        monthly_profit = annual_profit / 12
        
        # Cash flow après remboursement prêt
        monthly_cashflow_after_loan = monthly_profit - mensualite
        
        # ROI et ratios
        annual_cashflow_after_loan = monthly_cashflow_after_loan * 12
        total_paid = mensualite * nombre_mensualites
        total_interest = total_paid - prix_acquisition
        
        # Temps de retour sur investissement
        if monthly_profit > 0:
            payback_period_months = prix_acquisition / monthly_profit
            payback_period_years = payback_period_months / 12
        else:
            payback_period_years = float('inf')
        
        # Évaluation de la viabilité
        is_viable = monthly_cashflow_after_loan > 0
        risk_level = "Faible" if monthly_cashflow_after_loan > mensualite * 0.3 else \
                    "Moyen" if monthly_cashflow_after_loan > 0 else "Élevé"
        
        return {
            'prix_acquisition': prix_acquisition,
            'duree_pret_annees': duree_pret_annees,
            'taux_interet_pct': taux_interet * 100,
            'mensualite_pret': round(mensualite, 2),
            'cout_total_pret': round(total_paid, 2),
            'interets_total': round(total_interest, 2),
            'profit_mensuel_actuel': round(monthly_profit, 2),
            'profit_annuel_actuel': round(annual_profit, 2),
            'cashflow_mensuel_apres_pret': round(monthly_cashflow_after_loan, 2),
            'cashflow_annuel_apres_pret': round(annual_cashflow_after_loan, 2),
            'payback_period_annees': round(payback_period_years, 2) if payback_period_years != float('inf') else "N/A",
            'is_viable': is_viable,
            'risk_level': risk_level,
            'recommendation': self._get_acquisition_recommendation(is_viable, risk_level, 
                                                                  monthly_cashflow_after_loan, mensualite)
        }
    
    def _get_acquisition_recommendation(self, is_viable: bool, risk_level: str, 
                                       cashflow: float, mensualite: float) -> str:
        """Génère une recommandation sur l'acquisition"""
        if not is_viable:
            return "❌ DÉCONSEILLÉ: Le cash-flow ne couvre pas les mensualités du prêt. Acquisition trop risquée."
        
        if risk_level == "Faible":
            return "✅ RECOMMANDÉ: Excellent cash-flow après remboursement. Acquisition très intéressante."
        elif risk_level == "Moyen":
            return "⚠️ ACCEPTABLE: Cash-flow positif mais serré. Nécessite une optimisation rapide post-acquisition."
        else:
            return "⚠️ RISQUÉ: Cash-flow minimal. Acquisition possible uniquement avec un plan d'optimisation agressif."


# ============================================================================
# SECTION 5: ORCHESTRATEUR PRINCIPAL
# ============================================================================

class CrossFitAnalyzer:
    """
    Orchestrateur principal de l'analyse complète
    """
    
    def __init__(self):
        self.scorer = PerformanceScorer()
        self.insight_engine = InsightEngine()
        self.prediction_engine = PredictionEngine()
        
    def run_complete_analysis(self, data: AuditData, 
                             prix_acquisition: Optional[float] = None) -> Dict:
        """
        Exécute une analyse complète et retourne tous les résultats
        """
        
        print("🔄 Démarrage de l'analyse...")
        
        # 1. Calcul des scores
        print("📊 Calcul des scores de performance...")
        scores = self.scorer.calculate_overall_score(data)
        
        # 2. Génération des insights
        print("💡 Génération des insights et recommandations...")
        insights = self.insight_engine.generate_all_insights(data, scores)
        
        # 3. Prédictions
        print("🔮 Calcul des projections...")
        revenue_projections = self.prediction_engine.predict_revenue_growth(data, months=12)
        cac_analysis = self.prediction_engine.calculate_breakeven_acquisition_cost(data)
        optimization_impact = self.prediction_engine.simulate_optimization_impact(data, insights)
        
        # 4. Analyse d'acquisition si prix fourni
        acquisition_analysis = None
        if prix_acquisition:
            print("💰 Analyse de viabilité d'acquisition...")
            current_annual_profit = optimization_impact['current_state']['annual_profit']
            acquisition_analysis = self.prediction_engine.calculate_acquisition_viability(
                prix_acquisition, data, current_annual_profit
            )
        
        print("✅ Analyse terminée!\n")
        
        return {
            'timestamp': datetime.now().isoformat(),
            'gym_data_summary': {
                'nombre_membres': data.nombre_abonnements_actifs,
                'ca_mensuel': data.chiffre_affaires_mensuel,
                'surface_m2': data.surface_totale_m2,
                'nombre_coachs': data.nombre_coachs
            },
            'performance_scores': scores,
            'insights': [
                {
                    'category': i.category.value,
                    'severity': i.severity.value,
                    'title': i.title,
                    'description': i.description,
                    'priority_score': round(i.priority_score, 2),
                    'impact_score': i.impact_score,
                    'difficulty': i.implementation_difficulty,
                    'estimated_revenue_impact': i.estimated_revenue_impact,
                    'estimated_cost_impact': i.estimated_cost_impact,
                    'timeframe': i.timeframe,
                    'actionable_steps': i.actionable_steps,
                    'kpis_to_track': i.kpis_to_track
                }
                for i in insights
            ],
            'projections': {
                'revenue': revenue_projections,
                'cac_analysis': cac_analysis,
                'optimization_impact': optimization_impact
            },
            'acquisition_analysis': acquisition_analysis
        }
    
    def export_to_json(self, analysis_results: Dict, filepath: str) -> None:
        """Exporte les résultats en JSON"""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(analysis_results, f, ensure_ascii=False, indent=2)
        print(f"✅ Résultats exportés vers: {filepath}")
    
    def generate_executive_summary(self, analysis_results: Dict) -> str:
        """Génère un résumé exécutif"""
        scores = analysis_results['performance_scores']
        insights = analysis_results['insights']
        
        # Top 5 insights
        top_insights = sorted(insights, key=lambda x: x['priority_score'], reverse=True)[:5]
        
        summary = f"""
╔══════════════════════════════════════════════════════════════════════════╗
║                      RÉSUMÉ EXÉCUTIF - AUDIT CROSSFIT                    ║
╚══════════════════════════════════════════════════════════════════════════╝

📊 SCORE GLOBAL: {scores['overall_score']}/100 - {scores['grade']}

📈 SCORES PAR CATÉGORIE:
   • Santé Financière: {scores['category_scores']['financial_health']['score']}/100
   • Efficacité Opérationnelle: {scores['category_scores']['operational_efficiency']['score']}/100
   • Satisfaction Membres: {scores['category_scores']['member_satisfaction']['score']}/100
   • Potentiel de Croissance: {scores['category_scores']['growth_potential']['score']}/100
   • Position Concurrentielle: {scores['category_scores']['competitive_position']['score']}/100

🎯 TOP 5 PRIORITÉS:
"""
        
        for i, insight in enumerate(top_insights, 1):
            summary += f"\n{i}. [{insight['severity'].upper()}] {insight['title']}\n"
            summary += f"   Impact: {insight['impact_score']}/100 | Priorité: {insight['priority_score']}/100\n"
        
        if analysis_results.get('acquisition_analysis'):
            acq = analysis_results['acquisition_analysis']
            summary += f"""
💰 ANALYSE D'ACQUISITION:
   • Prix: {acq['prix_acquisition']:,.0f}€
   • Mensualité prêt: {acq['mensualite_pret']:,.2f}€
   • Cash-flow mensuel après prêt: {acq['cashflow_mensuel_apres_pret']:,.2f}€
   • Niveau de risque: {acq['risk_level']}
   • Recommandation: {acq['recommendation']}
"""
        
        summary += "\n" + "═" * 76 + "\n"
        
        return summary


# ============================================================================
# SECTION 6: EXEMPLE D'UTILISATION
# ============================================================================

def main_example():
    """
    Exemple d'utilisation de l'algorithme avec les données BeUnit CrossFit
    """
    
    # Données d'exemple basées sur BeUnit CrossFit
    # NOTE: Ajustez ces valeurs avec les données réelles
    audit_data = AuditData(
        # Financier
        chiffre_affaires_mensuel=36000,  # 180 membres × 200€ moyen
        charges_fixes_mensuelles=8000,
        charges_variables_mensuelles=3000,
        loyer_mensuel=4000,
        sous_location_revenus=1000,
        salaires_total=12000,
        
        # Abonnements
        nombre_abonnements_actifs=180,
        nombre_abonnements_prelevement=160,
        nombre_abonnements_carte=20,
        panier_moyen_abonnement=200,
        tarif_affiche_standard=220,
        
        # Membres
        nombre_nouveaux_membres_mois=8,
        nombre_membres_perdus_mois=5,
        taux_presence_moyen=55,
        anciennete_moyenne_membres=14,
        
        # Infrastructure
        surface_totale_m2=500,
        surface_entrainement_m2=400,
        valeur_equipement=110000,  # 100k CrossFit + 10k muscu
        age_moyen_equipement=3.5,
        capacite_max_simultane=25,
        
        # RH
        nombre_coachs=4,
        nombre_coachs_temps_plein=2,
        ratio_coach_membre=45,
        anciennete_moyenne_coachs=3.0,
        
        # Opérations
        nombre_cours_semaine=35,
        taux_remplissage_cours=70,
        heures_ouverture_semaine=70,
        
        # Marketing
        budget_marketing_mensuel=800,
        nombre_followers_instagram=650,
        taux_engagement_social=0.025,
        nombre_avis_google=45,
        note_moyenne_google=4.6,
        
        # Concurrence
        nombre_concurrents_directs=3,
        tarif_moyen_concurrent=230,
        position_concurrentielle="suiveur"
    )
    
    # Création de l'analyseur
    analyzer = CrossFitAnalyzer()
    
    # Exécution de l'analyse complète
    results = analyzer.run_complete_analysis(
        data=audit_data,
        prix_acquisition=160000  # Prix de vente proposé
    )
    
    # Affichage du résumé exécutif
    print(analyzer.generate_executive_summary(results))
    
    # Export des résultats
    analyzer.export_to_json(results, '/home/claude/audit_results.json')
    
    return results


if __name__ == "__main__":
    # Exécution de l'exemple
    results = main_example()
    print("\n✅ Analyse terminée! Consultez le fichier audit_results.json pour les détails complets.")
