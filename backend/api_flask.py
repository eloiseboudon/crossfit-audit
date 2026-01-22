"""
API Flask pour l'Algorithme d'Analyse CrossFit
==============================================
API REST complète pour intégrer l'algorithme d'IA dans Bolt
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import traceback
from crossfit_ai_analyzer import CrossFitAnalyzer, AuditData

# Initialisation de l'application
app = Flask(__name__)
CORS(app)  # Permet les requêtes cross-origin depuis Bolt

# Configuration
app.config['JSON_AS_ASCII'] = False  # Support des caractères UTF-8
app.config['JSON_SORT_KEYS'] = False  # Préserver l'ordre des clés


# ============================================================================
# MIDDLEWARE ET HELPERS
# ============================================================================

def validate_required_fields(data, required_fields):
    """Valide que tous les champs requis sont présents"""
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return False, missing_fields
    return True, []


def safe_float(value, default=0.0):
    """Conversion sûre en float"""
    try:
        return float(value) if value is not None else default
    except (ValueError, TypeError):
        return default


def safe_int(value, default=0):
    """Conversion sûre en int"""
    try:
        return int(value) if value is not None else default
    except (ValueError, TypeError):
        return default


# ============================================================================
# ENDPOINTS PRINCIPAUX
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Endpoint de vérification de santé
    ---
    GET /api/health
    
    Response: 200
    {
        "status": "healthy",
        "service": "CrossFit AI Analyzer",
        "version": "1.0",
        "timestamp": "2025-01-14T10:30:00"
    }
    """
    return jsonify({
        'status': 'healthy',
        'service': 'CrossFit AI Analyzer',
        'version': '1.0',
        'timestamp': datetime.now().isoformat()
    }), 200


@app.route('/api/analyze', methods=['POST'])
def analyze_gym():
    """
    Endpoint principal d'analyse complète d'une salle de CrossFit
    ---
    POST /api/analyze
    
    Body (JSON):
    {
        "chiffre_affaires_mensuel": 36000,
        "nombre_abonnements_actifs": 180,
        "surface_totale_m2": 500,
        "nombre_coachs": 4,
        ... (voir INTEGRATION_GUIDE.md pour tous les champs)
    }
    
    Response: 200
    {
        "timestamp": "...",
        "gym_data_summary": {...},
        "performance_scores": {...},
        "insights": [...],
        "projections": {...}
    }
    
    Response: 400 (si données invalides)
    {
        "error": "Champs requis manquants",
        "missing_fields": ["champ1", "champ2"]
    }
    
    Response: 500 (si erreur serveur)
    {
        "error": "Description de l'erreur",
        "type": "TypeError",
        "traceback": "..."
    }
    """
    try:
        # Récupération des données
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Aucune donnée fournie',
                'details': 'Le body de la requête doit contenir des données JSON'
            }), 400
        
        # Validation des champs requis minimums
        required_fields = [
            'chiffre_affaires_mensuel',
            'nombre_abonnements_actifs',
            'surface_totale_m2',
            'nombre_coachs'
        ]
        
        is_valid, missing_fields = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify({
                'error': 'Champs requis manquants',
                'missing_fields': missing_fields
            }), 400
        
        # Création de l'objet AuditData avec valeurs par défaut intelligentes
        audit_data = AuditData(
            # Données financières
            chiffre_affaires_mensuel=safe_float(data.get('chiffre_affaires_mensuel')),
            charges_fixes_mensuelles=safe_float(data.get('charges_fixes_mensuelles', 0)),
            charges_variables_mensuelles=safe_float(data.get('charges_variables_mensuelles', 0)),
            loyer_mensuel=safe_float(data.get('loyer_mensuel', 0)),
            sous_location_revenus=safe_float(data.get('sous_location_revenus', 0)),
            salaires_total=safe_float(data.get('salaires_total', 0)),
            
            # Abonnements
            nombre_abonnements_actifs=safe_int(data.get('nombre_abonnements_actifs')),
            nombre_abonnements_prelevement=safe_int(data.get('nombre_abonnements_prelevement', 0)),
            nombre_abonnements_carte=safe_int(data.get('nombre_abonnements_carte', 0)),
            panier_moyen_abonnement=safe_float(data.get('panier_moyen_abonnement', 0)),
            tarif_affiche_standard=safe_float(data.get('tarif_affiche_standard', 0)),
            
            # Membres
            nombre_nouveaux_membres_mois=safe_int(data.get('nombre_nouveaux_membres_mois', 0)),
            nombre_membres_perdus_mois=safe_int(data.get('nombre_membres_perdus_mois', 0)),
            taux_presence_moyen=safe_float(data.get('taux_presence_moyen', 50)),
            anciennete_moyenne_membres=safe_float(data.get('anciennete_moyenne_membres', 12)),
            
            # Infrastructure
            surface_totale_m2=safe_float(data.get('surface_totale_m2')),
            surface_entrainement_m2=safe_float(data.get('surface_entrainement_m2', 0)),
            valeur_equipement=safe_float(data.get('valeur_equipement', 0)),
            age_moyen_equipement=safe_float(data.get('age_moyen_equipement', 3)),
            capacite_max_simultane=safe_int(data.get('capacite_max_simultane', 20)),
            
            # Ressources humaines
            nombre_coachs=safe_int(data.get('nombre_coachs')),
            nombre_coachs_temps_plein=safe_int(data.get('nombre_coachs_temps_plein', 0)),
            ratio_coach_membre=safe_float(data.get('ratio_coach_membre', 0)),
            anciennete_moyenne_coachs=safe_float(data.get('anciennete_moyenne_coachs', 2)),
            
            # Planning & Opérations
            nombre_cours_semaine=safe_int(data.get('nombre_cours_semaine', 30)),
            taux_remplissage_cours=safe_float(data.get('taux_remplissage_cours', 70)),
            heures_ouverture_semaine=safe_float(data.get('heures_ouverture_semaine', 70)),
            
            # Marketing & Communication
            budget_marketing_mensuel=safe_float(data.get('budget_marketing_mensuel', 500)),
            nombre_followers_instagram=safe_int(data.get('nombre_followers_instagram', 0)),
            taux_engagement_social=safe_float(data.get('taux_engagement_social', 0.02)),
            nombre_avis_google=safe_int(data.get('nombre_avis_google', 10)),
            note_moyenne_google=safe_float(data.get('note_moyenne_google', 4.5)),
            
            # Concurrence
            nombre_concurrents_directs=safe_int(data.get('nombre_concurrents_directs', 2)),
            tarif_moyen_concurrent=safe_float(data.get('tarif_moyen_concurrent', 200)),
            position_concurrentielle=data.get('position_concurrentielle', 'suiveur')
        )
        
        # Validation post-création
        if audit_data.nombre_abonnements_actifs <= 0:
            return jsonify({
                'error': 'Données invalides',
                'details': 'Le nombre d\'abonnements actifs doit être supérieur à 0'
            }), 400
        
        # Calcul automatique du ratio coach/membre si non fourni
        if audit_data.ratio_coach_membre == 0 and audit_data.nombre_coachs > 0:
            audit_data.ratio_coach_membre = audit_data.nombre_abonnements_actifs / audit_data.nombre_coachs
        
        # Calcul automatique du panier moyen si non fourni
        if audit_data.panier_moyen_abonnement == 0 and audit_data.nombre_abonnements_actifs > 0:
            audit_data.panier_moyen_abonnement = audit_data.chiffre_affaires_mensuel / audit_data.nombre_abonnements_actifs
        
        # Création de l'analyseur
        analyzer = CrossFitAnalyzer()
        
        # Prix d'acquisition optionnel
        prix_acquisition = data.get('prix_acquisition')
        if prix_acquisition is not None:
            prix_acquisition = safe_float(prix_acquisition)
        
        # Exécution de l'analyse
        results = analyzer.run_complete_analysis(audit_data, prix_acquisition)
        
        # Ajout de métadonnées
        results['metadata'] = {
            'api_version': '1.0',
            'processing_time_ms': 0,  # À implémenter si nécessaire
            'data_completeness': calculate_data_completeness(data)
        }
        
        return jsonify(results), 200
        
    except ValueError as e:
        return jsonify({
            'error': 'Erreur de validation des données',
            'details': str(e),
            'type': 'ValueError'
        }), 400
        
    except Exception as e:
        # Log de l'erreur (à remplacer par un vrai logger en production)
        print(f"ERREUR: {str(e)}")
        print(traceback.format_exc())
        
        return jsonify({
            'error': 'Erreur interne du serveur',
            'details': str(e),
            'type': type(e).__name__,
            'traceback': traceback.format_exc() if app.debug else None
        }), 500


@app.route('/api/analyze/quick', methods=['POST'])
def quick_analyze():
    """
    Endpoint d'analyse rapide (scores uniquement, sans insights détaillés)
    Plus rapide pour des aperçus ou des comparaisons
    ---
    POST /api/analyze/quick
    
    Body: Même format que /api/analyze
    
    Response: 200
    {
        "performance_scores": {...},
        "grade": "B (Satisfaisant)",
        "overall_score": 68.5
    }
    """
    try:
        data = request.get_json()
        
        # Validation basique
        required_fields = ['chiffre_affaires_mensuel', 'nombre_abonnements_actifs', 
                         'surface_totale_m2', 'nombre_coachs']
        
        is_valid, missing_fields = validate_required_fields(data, required_fields)
        if not is_valid:
            return jsonify({
                'error': 'Champs requis manquants',
                'missing_fields': missing_fields
            }), 400
        
        # Création rapide de l'audit
        from crossfit_ai_analyzer import PerformanceScorer
        
        # Création simplifiée de l'objet
        audit_data = create_audit_data_from_request(data)
        
        # Calcul des scores uniquement
        scorer = PerformanceScorer()
        scores = scorer.calculate_overall_score(audit_data)
        
        return jsonify({
            'timestamp': datetime.now().isoformat(),
            'overall_score': scores['overall_score'],
            'grade': scores['grade'],
            'category_scores': scores['category_scores']
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'type': type(e).__name__
        }), 500


@app.route('/api/validate', methods=['POST'])
def validate_data():
    """
    Endpoint de validation des données (avant de lancer une analyse complète)
    ---
    POST /api/validate
    
    Body: Données à valider
    
    Response: 200
    {
        "is_valid": true,
        "missing_required": [],
        "missing_optional": [...],
        "data_completeness": 85.5
    }
    """
    try:
        data = request.get_json()
        
        required_fields = [
            'chiffre_affaires_mensuel', 'nombre_abonnements_actifs',
            'surface_totale_m2', 'nombre_coachs'
        ]
        
        optional_fields = [
            'charges_fixes_mensuelles', 'charges_variables_mensuelles',
            'loyer_mensuel', 'nombre_cours_semaine', 'taux_remplissage_cours',
            'budget_marketing_mensuel', 'nombre_followers_instagram',
            # ... tous les autres champs
        ]
        
        is_valid, missing_required = validate_required_fields(data, required_fields)
        missing_optional = [field for field in optional_fields if field not in data]
        
        completeness = calculate_data_completeness(data)
        
        return jsonify({
            'is_valid': is_valid,
            'missing_required': missing_required,
            'missing_optional': missing_optional[:10],  # Limiter à 10 pour la lisibilité
            'data_completeness': completeness,
            'recommendation': get_completeness_recommendation(completeness)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'type': type(e).__name__
        }), 500


# ============================================================================
# HELPERS
# ============================================================================

def create_audit_data_from_request(data):
    """Crée un objet AuditData depuis les données de requête"""
    return AuditData(
        chiffre_affaires_mensuel=safe_float(data.get('chiffre_affaires_mensuel')),
        charges_fixes_mensuelles=safe_float(data.get('charges_fixes_mensuelles', 0)),
        charges_variables_mensuelles=safe_float(data.get('charges_variables_mensuelles', 0)),
        loyer_mensuel=safe_float(data.get('loyer_mensuel', 0)),
        sous_location_revenus=safe_float(data.get('sous_location_revenus', 0)),
        salaires_total=safe_float(data.get('salaires_total', 0)),
        nombre_abonnements_actifs=safe_int(data.get('nombre_abonnements_actifs')),
        nombre_abonnements_prelevement=safe_int(data.get('nombre_abonnements_prelevement', 0)),
        nombre_abonnements_carte=safe_int(data.get('nombre_abonnements_carte', 0)),
        panier_moyen_abonnement=safe_float(data.get('panier_moyen_abonnement', 0)),
        tarif_affiche_standard=safe_float(data.get('tarif_affiche_standard', 0)),
        nombre_nouveaux_membres_mois=safe_int(data.get('nombre_nouveaux_membres_mois', 0)),
        nombre_membres_perdus_mois=safe_int(data.get('nombre_membres_perdus_mois', 0)),
        taux_presence_moyen=safe_float(data.get('taux_presence_moyen', 50)),
        anciennete_moyenne_membres=safe_float(data.get('anciennete_moyenne_membres', 12)),
        surface_totale_m2=safe_float(data.get('surface_totale_m2')),
        surface_entrainement_m2=safe_float(data.get('surface_entrainement_m2', 0)),
        valeur_equipement=safe_float(data.get('valeur_equipement', 0)),
        age_moyen_equipement=safe_float(data.get('age_moyen_equipement', 3)),
        capacite_max_simultane=safe_int(data.get('capacite_max_simultane', 20)),
        nombre_coachs=safe_int(data.get('nombre_coachs')),
        nombre_coachs_temps_plein=safe_int(data.get('nombre_coachs_temps_plein', 0)),
        ratio_coach_membre=safe_float(data.get('ratio_coach_membre', 0)),
        anciennete_moyenne_coachs=safe_float(data.get('anciennete_moyenne_coachs', 2)),
        nombre_cours_semaine=safe_int(data.get('nombre_cours_semaine', 30)),
        taux_remplissage_cours=safe_float(data.get('taux_remplissage_cours', 70)),
        heures_ouverture_semaine=safe_float(data.get('heures_ouverture_semaine', 70)),
        budget_marketing_mensuel=safe_float(data.get('budget_marketing_mensuel', 500)),
        nombre_followers_instagram=safe_int(data.get('nombre_followers_instagram', 0)),
        taux_engagement_social=safe_float(data.get('taux_engagement_social', 0.02)),
        nombre_avis_google=safe_int(data.get('nombre_avis_google', 10)),
        note_moyenne_google=safe_float(data.get('note_moyenne_google', 4.5)),
        nombre_concurrents_directs=safe_int(data.get('nombre_concurrents_directs', 2)),
        tarif_moyen_concurrent=safe_float(data.get('tarif_moyen_concurrent', 200)),
        position_concurrentielle=data.get('position_concurrentielle', 'suiveur')
    )


def calculate_data_completeness(data):
    """Calcule le taux de complétude des données (0-100)"""
    all_fields = [
        'chiffre_affaires_mensuel', 'charges_fixes_mensuelles', 'charges_variables_mensuelles',
        'loyer_mensuel', 'sous_location_revenus', 'salaires_total',
        'nombre_abonnements_actifs', 'nombre_abonnements_prelevement', 'nombre_abonnements_carte',
        'panier_moyen_abonnement', 'tarif_affiche_standard',
        'nombre_nouveaux_membres_mois', 'nombre_membres_perdus_mois',
        'taux_presence_moyen', 'anciennete_moyenne_membres',
        'surface_totale_m2', 'surface_entrainement_m2', 'valeur_equipement',
        'age_moyen_equipement', 'capacite_max_simultane',
        'nombre_coachs', 'nombre_coachs_temps_plein', 'ratio_coach_membre',
        'anciennete_moyenne_coachs',
        'nombre_cours_semaine', 'taux_remplissage_cours', 'heures_ouverture_semaine',
        'budget_marketing_mensuel', 'nombre_followers_instagram', 'taux_engagement_social',
        'nombre_avis_google', 'note_moyenne_google',
        'nombre_concurrents_directs', 'tarif_moyen_concurrent', 'position_concurrentielle'
    ]
    
    provided_fields = sum(1 for field in all_fields if field in data and data[field] not in [None, '', 0])
    completeness = (provided_fields / len(all_fields)) * 100
    
    return round(completeness, 1)


def get_completeness_recommendation(completeness):
    """Retourne une recommandation basée sur la complétude"""
    if completeness >= 90:
        return "Excellent! Toutes les données nécessaires sont présentes pour une analyse optimale."
    elif completeness >= 70:
        return "Bon niveau de complétude. Quelques données manquantes mais l'analyse sera fiable."
    elif completeness >= 50:
        return "Complétude moyenne. Certains insights pourraient être limités. Complétez davantage pour une meilleure analyse."
    else:
        return "Complétude insuffisante. Ajoutez plus de données pour obtenir une analyse pertinente."


# ============================================================================
# GESTIONNAIRES D'ERREURS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint non trouvé',
        'available_endpoints': [
            'GET /api/health',
            'POST /api/analyze',
            'POST /api/analyze/quick',
            'POST /api/validate'
        ]
    }), 404


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        'error': 'Méthode HTTP non autorisée',
        'details': 'Vérifiez que vous utilisez la bonne méthode (GET, POST, etc.)'
    }), 405


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Erreur interne du serveur',
        'details': str(error) if app.debug else 'Une erreur est survenue'
    }), 500


# ============================================================================
# LANCEMENT DE L'APPLICATION
# ============================================================================

if __name__ == '__main__':
    print("""
    ╔══════════════════════════════════════════════════════════════════════╗
    ║          CrossFit AI Analyzer API - Démarrage                       ║
    ╚══════════════════════════════════════════════════════════════════════╝
    
    📊 Service: CrossFit Gym Analysis API
    🔗 Base URL: http://localhost:5000
    
    📍 Endpoints disponibles:
       • GET  /api/health          - Health check
       • POST /api/analyze         - Analyse complète
       • POST /api/analyze/quick   - Analyse rapide (scores uniquement)
       • POST /api/validate        - Validation des données
    
    📖 Documentation complète: voir INTEGRATION_GUIDE.md
    
    ⚡ L'API est prête à recevoir des requêtes!
    """)
    
    # Lancement du serveur
    # En production, utiliser gunicorn ou uwsgi au lieu du serveur de développement
    app.run(
        debug=True,  # Mettre False en production
        host='0.0.0.0',  # Écoute sur toutes les interfaces
        port=5000,
        threaded=True  # Support des requêtes concurrentes
    )
