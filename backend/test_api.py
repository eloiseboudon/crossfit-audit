"""
Script de Test - CrossFit AI Analyzer API
==========================================
Ce script montre comment utiliser l'API et teste toutes ses fonctionnalités
"""

import requests
import json
from pprint import pprint

# Configuration
API_BASE_URL = "http://localhost:5000"

# Couleurs pour l'affichage
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'


def print_section(title):
    """Affiche un titre de section"""
    print(f"\n{Colors.BLUE}{'='*70}")
    print(f"{title}")
    print(f"{'='*70}{Colors.END}\n")


def test_health_check():
    """Test 1: Vérification de la santé de l'API"""
    print_section("TEST 1: Health Check")
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/health")
        
        if response.status_code == 200:
            print(f"{Colors.GREEN}✓ API en ligne et fonctionnelle{Colors.END}")
            pprint(response.json())
        else:
            print(f"{Colors.RED}✗ Erreur: {response.status_code}{Colors.END}")
            
    except Exception as e:
        print(f"{Colors.RED}✗ Impossible de se connecter à l'API: {e}{Colors.END}")
        print(f"Assurez-vous que l'API tourne sur {API_BASE_URL}")


def test_validate_data():
    """Test 2: Validation des données"""
    print_section("TEST 2: Validation des Données")
    
    # Données partielles pour tester la validation
    test_data = {
        "chiffre_affaires_mensuel": 36000,
        "nombre_abonnements_actifs": 180,
        "surface_totale_m2": 500,
        "nombre_coachs": 4
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/validate",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"{Colors.GREEN}✓ Validation réussie{Colors.END}")
            print(f"\nComplétude des données: {result['data_completeness']}%")
            print(f"Valide: {result['is_valid']}")
            print(f"Recommandation: {result['recommendation']}")
            
            if result['missing_optional']:
                print(f"\nChamps optionnels manquants (premiers 10):")
                for field in result['missing_optional']:
                    print(f"  - {field}")
        else:
            print(f"{Colors.RED}✗ Erreur: {response.status_code}{Colors.END}")
            pprint(response.json())
            
    except Exception as e:
        print(f"{Colors.RED}✗ Erreur: {e}{Colors.END}")


def test_quick_analysis():
    """Test 3: Analyse rapide (scores uniquement)"""
    print_section("TEST 3: Analyse Rapide (Scores)")
    
    # Données complètes pour l'analyse
    audit_data = {
        "chiffre_affaires_mensuel": 36000,
        "charges_fixes_mensuelles": 8000,
        "charges_variables_mensuelles": 3000,
        "loyer_mensuel": 4000,
        "sous_location_revenus": 1000,
        "salaires_total": 12000,
        
        "nombre_abonnements_actifs": 180,
        "nombre_abonnements_prelevement": 160,
        "nombre_abonnements_carte": 20,
        "panier_moyen_abonnement": 200,
        "tarif_affiche_standard": 220,
        
        "surface_totale_m2": 500,
        "nombre_coachs": 4
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/analyze/quick",
            json=audit_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"{Colors.GREEN}✓ Analyse rapide réussie{Colors.END}")
            print(f"\n📊 Score Global: {result['overall_score']}/100")
            print(f"🎯 Grade: {result['grade']}")
            print(f"\n📈 Scores par catégorie:")
            
            for category, data in result['category_scores'].items():
                score = data['score']
                color = Colors.GREEN if score >= 70 else Colors.YELLOW if score >= 50 else Colors.RED
                print(f"  {color}• {category}: {score}/100{Colors.END}")
        else:
            print(f"{Colors.RED}✗ Erreur: {response.status_code}{Colors.END}")
            pprint(response.json())
            
    except Exception as e:
        print(f"{Colors.RED}✗ Erreur: {e}{Colors.END}")


def test_full_analysis():
    """Test 4: Analyse complète"""
    print_section("TEST 4: Analyse Complète (avec Insights)")
    
    # Données complètes basées sur BeUnit CrossFit
    audit_data = {
        # Financier
        "chiffre_affaires_mensuel": 36000,
        "charges_fixes_mensuelles": 8000,
        "charges_variables_mensuelles": 3000,
        "loyer_mensuel": 4000,
        "sous_location_revenus": 1000,
        "salaires_total": 12000,
        
        # Abonnements
        "nombre_abonnements_actifs": 180,
        "nombre_abonnements_prelevement": 160,
        "nombre_abonnements_carte": 20,
        "panier_moyen_abonnement": 200,
        "tarif_affiche_standard": 220,
        
        # Membres
        "nombre_nouveaux_membres_mois": 8,
        "nombre_membres_perdus_mois": 5,
        "taux_presence_moyen": 55,
        "anciennete_moyenne_membres": 14,
        
        # Infrastructure
        "surface_totale_m2": 500,
        "surface_entrainement_m2": 400,
        "valeur_equipement": 110000,
        "age_moyen_equipement": 3.5,
        "capacite_max_simultane": 25,
        
        # RH
        "nombre_coachs": 4,
        "nombre_coachs_temps_plein": 2,
        "ratio_coach_membre": 45,
        "anciennete_moyenne_coachs": 3.0,
        
        # Opérations
        "nombre_cours_semaine": 35,
        "taux_remplissage_cours": 70,
        "heures_ouverture_semaine": 70,
        
        # Marketing
        "budget_marketing_mensuel": 800,
        "nombre_followers_instagram": 650,
        "taux_engagement_social": 0.025,
        "nombre_avis_google": 45,
        "note_moyenne_google": 4.6,
        
        # Concurrence
        "nombre_concurrents_directs": 3,
        "tarif_moyen_concurrent": 230,
        "position_concurrentielle": "suiveur",
        
        # Acquisition (optionnel)
        "prix_acquisition": 160000
    }
    
    try:
        print("⏳ Lancement de l'analyse complète (peut prendre 1-2 secondes)...")
        
        response = requests.post(
            f"{API_BASE_URL}/api/analyze",
            json=audit_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"{Colors.GREEN}✓ Analyse complète réussie{Colors.END}")
            
            # Affichage des résultats principaux
            scores = result['performance_scores']
            print(f"\n📊 SCORE GLOBAL: {scores['overall_score']}/100 - {scores['grade']}")
            
            print(f"\n📈 SCORES PAR CATÉGORIE:")
            for category, data in scores['category_scores'].items():
                score = data['score']
                color = Colors.GREEN if score >= 70 else Colors.YELLOW if score >= 50 else Colors.RED
                print(f"  {color}• {category}: {score}/100{Colors.END}")
            
            # Top 5 insights
            insights = result['insights']
            top_insights = sorted(insights, key=lambda x: x['priority_score'], reverse=True)[:5]
            
            print(f"\n🎯 TOP 5 PRIORITÉS:")
            for i, insight in enumerate(top_insights, 1):
                severity_color = Colors.RED if insight['severity'] == 'critique' else \
                               Colors.YELLOW if insight['severity'] == 'élevé' else Colors.GREEN
                print(f"\n{i}. [{severity_color}{insight['severity'].upper()}{Colors.END}] {insight['title']}")
                print(f"   Priorité: {insight['priority_score']:.1f}/100 | Impact: {insight['impact_score']}/100")
                print(f"   {insight['description'][:120]}...")
            
            # Projections
            if 'projections' in result:
                proj = result['projections']['revenue']
                print(f"\n💰 PROJECTIONS 12 MOIS:")
                print(f"  • CA projeté: {proj['total_projected_revenue_12m']:,.0f}€")
                print(f"  • CA mensuel moyen: {proj['avg_monthly_revenue']:,.0f}€")
                print(f"  • Croissance totale: {proj['total_growth_pct']:.1f}%")
                print(f"  • Membres finaux: {proj['final_membre_count']}")
            
            # Acquisition
            if 'acquisition_analysis' in result and result['acquisition_analysis']:
                acq = result['acquisition_analysis']
                print(f"\n💎 ANALYSE D'ACQUISITION:")
                print(f"  • Prix: {acq['prix_acquisition']:,.0f}€")
                print(f"  • Mensualité prêt (7 ans à 4%): {acq['mensualite_pret']:,.2f}€")
                print(f"  • Cash-flow mensuel après prêt: {acq['cashflow_mensuel_apres_pret']:,.2f}€")
                print(f"  • Risque: {acq['risk_level']}")
                print(f"  • {acq['recommendation']}")
            
            # Sauvegarde des résultats
            print(f"\n💾 Sauvegarde des résultats complets...")
            with open('audit_results_test.json', 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            print(f"{Colors.GREEN}✓ Résultats sauvegardés dans: audit_results_test.json{Colors.END}")
            
        else:
            print(f"{Colors.RED}✗ Erreur: {response.status_code}{Colors.END}")
            pprint(response.json())
            
    except Exception as e:
        print(f"{Colors.RED}✗ Erreur: {e}{Colors.END}")


def test_error_handling():
    """Test 5: Gestion des erreurs"""
    print_section("TEST 5: Gestion des Erreurs")
    
    # Test avec données manquantes
    print("Test 5.1: Données incomplètes")
    incomplete_data = {
        "chiffre_affaires_mensuel": 36000
        # Champs requis manquants
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/analyze",
            json=incomplete_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 400:
            print(f"{Colors.GREEN}✓ Erreur correctement détectée (400){Colors.END}")
            result = response.json()
            print(f"Message d'erreur: {result.get('error')}")
            print(f"Champs manquants: {result.get('missing_fields')}")
        else:
            print(f"{Colors.YELLOW}⚠ Code inattendu: {response.status_code}{Colors.END}")
            
    except Exception as e:
        print(f"{Colors.RED}✗ Erreur: {e}{Colors.END}")
    
    # Test avec données invalides
    print("\nTest 5.2: Données invalides")
    invalid_data = {
        "chiffre_affaires_mensuel": "not_a_number",
        "nombre_abonnements_actifs": -10,
        "surface_totale_m2": 500,
        "nombre_coachs": 4
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/analyze",
            json=invalid_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code in [400, 500]:
            print(f"{Colors.GREEN}✓ Erreur correctement gérée{Colors.END}")
            print(f"Message: {response.json().get('error')}")
        else:
            print(f"{Colors.YELLOW}⚠ Code inattendu: {response.status_code}{Colors.END}")
            
    except Exception as e:
        print(f"{Colors.RED}✗ Erreur: {e}{Colors.END}")


def main():
    """Fonction principale - exécute tous les tests"""
    print(f"""
{Colors.BLUE}╔══════════════════════════════════════════════════════════════════════╗
║          SUITE DE TESTS - CrossFit AI Analyzer API                  ║
╚══════════════════════════════════════════════════════════════════════╝{Colors.END}

🎯 Cette suite de tests va vérifier toutes les fonctionnalités de l'API.
📍 URL de l'API: {API_BASE_URL}

Assurez-vous que l'API est lancée avant de continuer !
(Lancez api_flask.py dans un autre terminal)
    """)
    
    input("Appuyez sur Entrée pour commencer les tests...")
    
    # Exécution des tests
    test_health_check()
    input("\nAppuyez sur Entrée pour continuer...")
    
    test_validate_data()
    input("\nAppuyez sur Entrée pour continuer...")
    
    test_quick_analysis()
    input("\nAppuyez sur Entrée pour continuer...")
    
    test_full_analysis()
    input("\nAppuyez sur Entrée pour continuer...")
    
    test_error_handling()
    
    print(f"""
{Colors.GREEN}╔══════════════════════════════════════════════════════════════════════╗
║                       TESTS TERMINÉS !                               ║
╚══════════════════════════════════════════════════════════════════════╝{Colors.END}

✅ Tous les tests ont été exécutés.
📄 Consultez le fichier 'audit_results_test.json' pour voir les résultats complets.

💡 Prochaines étapes:
   1. Intégrer l'API dans votre application Bolt
   2. Personnaliser les visualisations
   3. Ajouter la sauvegarde en base de données
   4. Déployer en production

📖 Consultez INTEGRATION_GUIDE.md pour plus de détails.
    """)


if __name__ == "__main__":
    main()
