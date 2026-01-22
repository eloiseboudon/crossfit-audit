"""
API Flask pour l'Algorithme d'Analyse CrossFit
==============================================
API REST complète pour intégrer l'algorithme d'IA dans Bolt
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import traceback
import uuid
from typing import Any
from crossfit_ai_analyzer import CrossFitAnalyzer, AuditData
from db import get_db_connection, init_db, json_dumps, json_loads, row_to_dict, seed_benchmarks

# Initialisation de l'application
app = Flask(__name__)
CORS(app)  # Permet les requêtes cross-origin depuis Bolt

# Configuration
app.config['JSON_AS_ASCII'] = False  # Support des caractères UTF-8
app.config['JSON_SORT_KEYS'] = False  # Préserver l'ordre des clés

# Initialiser la base SQLite au démarrage
init_db()
seed_benchmarks()


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


def now_iso() -> str:
    return datetime.utcnow().isoformat()


def serialize_row(row: dict[str, Any], json_fields: set[str] | None = None) -> dict[str, Any]:
    json_fields = json_fields or set()
    serialized = {}
    for key, value in row.items():
        if key in json_fields:
            serialized[key] = json_loads(value)
        else:
            serialized[key] = value
    return serialized


def fetch_all(query: str, params: tuple = (), json_fields: set[str] | None = None) -> list[dict[str, Any]]:
    with get_db_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        return [serialize_row(row_to_dict(row), json_fields) for row in rows]


def fetch_one(query: str, params: tuple = (), json_fields: set[str] | None = None) -> dict[str, Any] | None:
    with get_db_connection() as conn:
        row = conn.execute(query, params).fetchone()
        if row is None:
            return None
        return serialize_row(row_to_dict(row), json_fields)


def ensure_id(data: dict[str, Any]) -> str:
    return data.get("id") or str(uuid.uuid4())


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
# SQLITE CRUD API
# ============================================================================

@app.route('/api/gyms', methods=['GET'])
def list_gyms():
    gyms = fetch_all("SELECT * FROM gyms ORDER BY created_at DESC")
    return jsonify(gyms), 200


@app.route('/api/gyms/<gym_id>', methods=['GET'])
def get_gym(gym_id: str):
    gym = fetch_one("SELECT * FROM gyms WHERE id = ?", (gym_id,))
    if not gym:
        return jsonify({"error": "Gym not found"}), 404
    return jsonify(gym), 200


@app.route('/api/gyms', methods=['POST'])
def create_gym():
    data = request.get_json() or {}
    if not data.get("name"):
        return jsonify({"error": "Gym name is required"}), 400

    gym_id = ensure_id(data)
    created_at = data.get("created_at") or now_iso()
    updated_at = data.get("updated_at") or created_at

    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO gyms (
                id, user_id, name, address, city, postal_code, contact_name, phone,
                email, website, instagram, legal_status, founded_year, partners_count,
                notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                gym_id,
                data.get("user_id"),
                data.get("name"),
                data.get("address"),
                data.get("city"),
                data.get("postal_code"),
                data.get("contact_name"),
                data.get("phone"),
                data.get("email"),
                data.get("website"),
                data.get("instagram"),
                data.get("legal_status"),
                data.get("founded_year"),
                data.get("partners_count"),
                data.get("notes"),
                created_at,
                updated_at,
            ),
        )

    return jsonify(fetch_one("SELECT * FROM gyms WHERE id = ?", (gym_id,))), 201


@app.route('/api/gyms/<gym_id>', methods=['PUT'])
def update_gym(gym_id: str):
    data = request.get_json() or {}
    fields = {
        "user_id": data.get("user_id"),
        "name": data.get("name"),
        "address": data.get("address"),
        "city": data.get("city"),
        "postal_code": data.get("postal_code"),
        "contact_name": data.get("contact_name"),
        "phone": data.get("phone"),
        "email": data.get("email"),
        "website": data.get("website"),
        "instagram": data.get("instagram"),
        "legal_status": data.get("legal_status"),
        "founded_year": data.get("founded_year"),
        "partners_count": data.get("partners_count"),
        "notes": data.get("notes"),
        "updated_at": data.get("updated_at") or now_iso(),
    }

    set_clause = ", ".join([f"{key} = ?" for key in fields.keys()])
    values = list(fields.values())
    values.append(gym_id)

    with get_db_connection() as conn:
        conn.execute(f"UPDATE gyms SET {set_clause} WHERE id = ?", values)

    gym = fetch_one("SELECT * FROM gyms WHERE id = ?", (gym_id,))
    if not gym:
        return jsonify({"error": "Gym not found"}), 404
    return jsonify(gym), 200


@app.route('/api/gyms/<gym_id>', methods=['DELETE'])
def delete_gym(gym_id: str):
    with get_db_connection() as conn:
        conn.execute("DELETE FROM gyms WHERE id = ?", (gym_id,))
    return jsonify({"status": "deleted"}), 200


@app.route('/api/audits', methods=['GET'])
def list_audits():
    include_gym = request.args.get("include_gym") == "1"
    if include_gym:
        rows = fetch_all(
            """
            SELECT audits.*, gyms.id AS gym_id_ref, gyms.name AS gym_name,
                   gyms.address AS gym_address, gyms.city AS gym_city,
                   gyms.postal_code AS gym_postal_code, gyms.contact_name AS gym_contact_name,
                   gyms.phone AS gym_phone, gyms.email AS gym_email, gyms.website AS gym_website,
                   gyms.instagram AS gym_instagram, gyms.legal_status AS gym_legal_status,
                   gyms.founded_year AS gym_founded_year, gyms.partners_count AS gym_partners_count,
                   gyms.notes AS gym_notes, gyms.created_at AS gym_created_at,
                   gyms.updated_at AS gym_updated_at, gyms.user_id AS gym_user_id
            FROM audits
            LEFT JOIN gyms ON gyms.id = audits.gym_id
            ORDER BY audits.created_at DESC
            """
        )
        audits = []
        for row in rows:
            gym = None
            if row.get("gym_id_ref"):
                gym = {
                    "id": row.get("gym_id_ref"),
                    "user_id": row.get("gym_user_id"),
                    "name": row.get("gym_name"),
                    "address": row.get("gym_address"),
                    "city": row.get("gym_city"),
                    "postal_code": row.get("gym_postal_code"),
                    "contact_name": row.get("gym_contact_name"),
                    "phone": row.get("gym_phone"),
                    "email": row.get("gym_email"),
                    "website": row.get("gym_website"),
                    "instagram": row.get("gym_instagram"),
                    "legal_status": row.get("gym_legal_status"),
                    "founded_year": row.get("gym_founded_year"),
                    "partners_count": row.get("gym_partners_count"),
                    "notes": row.get("gym_notes"),
                    "created_at": row.get("gym_created_at"),
                    "updated_at": row.get("gym_updated_at"),
                }
            row["gym"] = gym
            audits.append(row)
        return jsonify(audits), 200

    audits = fetch_all("SELECT * FROM audits ORDER BY created_at DESC")
    return jsonify(audits), 200


@app.route('/api/audits/<audit_id>', methods=['GET'])
def get_audit(audit_id: str):
    include_gym = request.args.get("include_gym") == "1"
    if include_gym:
        row = fetch_one(
            """
            SELECT audits.*, gyms.id AS gym_id_ref, gyms.name AS gym_name,
                   gyms.address AS gym_address, gyms.city AS gym_city,
                   gyms.postal_code AS gym_postal_code, gyms.contact_name AS gym_contact_name,
                   gyms.phone AS gym_phone, gyms.email AS gym_email, gyms.website AS gym_website,
                   gyms.instagram AS gym_instagram, gyms.legal_status AS gym_legal_status,
                   gyms.founded_year AS gym_founded_year, gyms.partners_count AS gym_partners_count,
                   gyms.notes AS gym_notes, gyms.created_at AS gym_created_at,
                   gyms.updated_at AS gym_updated_at, gyms.user_id AS gym_user_id
            FROM audits
            LEFT JOIN gyms ON gyms.id = audits.gym_id
            WHERE audits.id = ?
            """,
            (audit_id,),
        )
        if not row:
            return jsonify({"error": "Audit not found"}), 404
        gym = None
        if row.get("gym_id_ref"):
            gym = {
                "id": row.get("gym_id_ref"),
                "user_id": row.get("gym_user_id"),
                "name": row.get("gym_name"),
                "address": row.get("gym_address"),
                "city": row.get("gym_city"),
                "postal_code": row.get("gym_postal_code"),
                "contact_name": row.get("gym_contact_name"),
                "phone": row.get("gym_phone"),
                "email": row.get("gym_email"),
                "website": row.get("gym_website"),
                "instagram": row.get("gym_instagram"),
                "legal_status": row.get("gym_legal_status"),
                "founded_year": row.get("gym_founded_year"),
                "partners_count": row.get("gym_partners_count"),
                "notes": row.get("gym_notes"),
                "created_at": row.get("gym_created_at"),
                "updated_at": row.get("gym_updated_at"),
            }
        row["gym"] = gym
        return jsonify(row), 200

    audit = fetch_one("SELECT * FROM audits WHERE id = ?", (audit_id,))
    if not audit:
        return jsonify({"error": "Audit not found"}), 404
    return jsonify(audit), 200


@app.route('/api/audits', methods=['POST'])
def create_audit():
    data = request.get_json() or {}
    if not data.get("gym_id"):
        return jsonify({"error": "gym_id is required"}), 400

    audit_id = ensure_id(data)
    created_at = data.get("created_at") or now_iso()
    updated_at = data.get("updated_at") or created_at

    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO audits (
                id, gym_id, status, audit_date_start, audit_date_end,
                baseline_period, currency, notes, completion_percentage,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                audit_id,
                data.get("gym_id"),
                data.get("status") or "brouillon",
                data.get("audit_date_start"),
                data.get("audit_date_end"),
                data.get("baseline_period") or "mensuel",
                data.get("currency") or "EUR",
                data.get("notes"),
                data.get("completion_percentage", 0),
                created_at,
                updated_at,
            ),
        )

    return jsonify(fetch_one("SELECT * FROM audits WHERE id = ?", (audit_id,))), 201


@app.route('/api/audits/<audit_id>', methods=['PUT'])
def update_audit(audit_id: str):
    data = request.get_json() or {}
    fields = {
        "status": data.get("status"),
        "audit_date_start": data.get("audit_date_start"),
        "audit_date_end": data.get("audit_date_end"),
        "baseline_period": data.get("baseline_period"),
        "currency": data.get("currency"),
        "notes": data.get("notes"),
        "completion_percentage": data.get("completion_percentage"),
        "updated_at": data.get("updated_at") or now_iso(),
    }

    set_clause = ", ".join([f"{key} = ?" for key in fields.keys()])
    values = list(fields.values())
    values.append(audit_id)

    with get_db_connection() as conn:
        conn.execute(f"UPDATE audits SET {set_clause} WHERE id = ?", values)

    audit = fetch_one("SELECT * FROM audits WHERE id = ?", (audit_id,))
    if not audit:
        return jsonify({"error": "Audit not found"}), 404
    return jsonify(audit), 200


@app.route('/api/audits/<audit_id>', methods=['DELETE'])
def delete_audit(audit_id: str):
    with get_db_connection() as conn:
        conn.execute("DELETE FROM audits WHERE id = ?", (audit_id,))
    return jsonify({"status": "deleted"}), 200


@app.route('/api/answers', methods=['GET'])
def list_answers():
    audit_id = request.args.get("audit_id")
    if not audit_id:
        return jsonify({"error": "audit_id is required"}), 400
    answers = fetch_all(
        "SELECT * FROM answers WHERE audit_id = ? ORDER BY created_at ASC",
        (audit_id,),
        json_fields={"value"},
    )
    return jsonify(answers), 200


@app.route('/api/answers', methods=['POST'])
def upsert_answers():
    payload = request.get_json() or {}
    records = payload.get("records")
    if records is None:
        record = payload.get("record", payload)
        records = [record]

    now = now_iso()
    with get_db_connection() as conn:
        for record in records:
            if not record.get("audit_id") or not record.get("block_code") or not record.get("question_code"):
                return jsonify({"error": "audit_id, block_code, question_code are required"}), 400
            answer_id = ensure_id(record)
            conn.execute(
                """
                INSERT INTO answers (
                    id, audit_id, block_code, question_code, value, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(audit_id, block_code, question_code)
                DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
                """,
                (
                    answer_id,
                    record.get("audit_id"),
                    record.get("block_code"),
                    record.get("question_code"),
                    json_dumps(record.get("value")),
                    record.get("created_at") or now,
                    record.get("updated_at") or now,
                ),
            )

    return jsonify({"status": "ok"}), 200


@app.route('/api/market-benchmarks', methods=['GET'])
def list_market_benchmarks():
    benchmarks = fetch_all("SELECT * FROM market_benchmarks ORDER BY category ASC")
    return jsonify(benchmarks), 200


@app.route('/api/market-benchmarks/<benchmark_id>', methods=['PUT'])
def update_market_benchmark(benchmark_id: str):
    data = request.get_json() or {}
    with get_db_connection() as conn:
        conn.execute(
            """
            UPDATE market_benchmarks
            SET value = ?, updated_at = ?
            WHERE id = ?
            """,
            (data.get("value"), data.get("updated_at") or now_iso(), benchmark_id),
        )
    benchmark = fetch_one("SELECT * FROM market_benchmarks WHERE id = ?", (benchmark_id,))
    if not benchmark:
        return jsonify({"error": "Benchmark not found"}), 404
    return jsonify(benchmark), 200


@app.route('/api/market-zones', methods=['GET'])
def list_market_zones():
    zones = fetch_all("SELECT * FROM market_zones WHERE is_active = 1 ORDER BY price_level ASC")
    for zone in zones:
        zone["is_active"] = bool(zone.get("is_active"))
    return jsonify(zones), 200


@app.route('/api/market-zones', methods=['POST'])
def create_market_zone():
    data = request.get_json() or {}
    zone_id = ensure_id(data)
    created_at = data.get("created_at") or now_iso()
    updated_at = data.get("updated_at") or created_at

    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO market_zones (
                id, name, description, price_level, avg_subscription_min, avg_subscription_max,
                geographic_scope, population_density, avg_household_income_range,
                is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                zone_id,
                data.get("name"),
                data.get("description"),
                data.get("price_level"),
                data.get("avg_subscription_min"),
                data.get("avg_subscription_max"),
                data.get("geographic_scope"),
                data.get("population_density"),
                data.get("avg_household_income_range"),
                1 if data.get("is_active", True) else 0,
                created_at,
                updated_at,
            ),
        )

    zone = fetch_one("SELECT * FROM market_zones WHERE id = ?", (zone_id,))
    if zone:
        zone["is_active"] = bool(zone.get("is_active"))
    return jsonify(zone), 201


@app.route('/api/market-zones/<zone_id>', methods=['PUT'])
def update_market_zone(zone_id: str):
    data = request.get_json() or {}
    with get_db_connection() as conn:
        conn.execute(
            """
            UPDATE market_zones
            SET name = ?, description = ?, price_level = ?, avg_subscription_min = ?, avg_subscription_max = ?,
                geographic_scope = ?, population_density = ?, avg_household_income_range = ?,
                is_active = ?, updated_at = ?
            WHERE id = ?
            """,
            (
                data.get("name"),
                data.get("description"),
                data.get("price_level"),
                data.get("avg_subscription_min"),
                data.get("avg_subscription_max"),
                data.get("geographic_scope"),
                data.get("population_density"),
                data.get("avg_household_income_range"),
                1 if data.get("is_active", True) else 0,
                data.get("updated_at") or now_iso(),
                zone_id,
            ),
        )

    zone = fetch_one("SELECT * FROM market_zones WHERE id = ?", (zone_id,))
    if not zone:
        return jsonify({"error": "Zone not found"}), 404
    zone["is_active"] = bool(zone.get("is_active"))
    return jsonify(zone), 200


@app.route('/api/market-zones/<zone_id>', methods=['DELETE'])
def delete_market_zone(zone_id: str):
    with get_db_connection() as conn:
        conn.execute("DELETE FROM market_zones WHERE id = ?", (zone_id,))
    return jsonify({"status": "deleted"}), 200


@app.route('/api/competitors', methods=['GET'])
def list_competitors():
    gym_id = request.args.get("gym_id")
    if not gym_id:
        return jsonify({"error": "gym_id is required"}), 400
    rows = fetch_all(
        """
        SELECT competitors.*, market_zones.id AS zone_id_ref, market_zones.name AS zone_name,
               market_zones.description AS zone_description, market_zones.price_level AS zone_price_level,
               market_zones.avg_subscription_min AS zone_avg_subscription_min,
               market_zones.avg_subscription_max AS zone_avg_subscription_max,
               market_zones.geographic_scope AS zone_geographic_scope,
               market_zones.population_density AS zone_population_density,
               market_zones.avg_household_income_range AS zone_avg_household_income_range,
               market_zones.is_active AS zone_is_active,
               market_zones.created_at AS zone_created_at,
               market_zones.updated_at AS zone_updated_at
        FROM competitors
        LEFT JOIN market_zones ON market_zones.id = competitors.market_zone_id
        WHERE competitors.gym_id = ? AND competitors.is_active = 1
        ORDER BY competitors.distance_km ASC
        """,
        (gym_id,),
    )
    competitors = []
    for row in rows:
        row["is_active"] = bool(row.get("is_active"))
        for key in ["has_hyrox", "has_weightlifting", "has_gymnastics", "has_childcare", "has_nutrition"]:
            row[key] = bool(row.get(key))
        row["strengths"] = json_loads(row.get("strengths"))
        row["weaknesses"] = json_loads(row.get("weaknesses"))
        row["additional_services"] = json_loads(row.get("additional_services"))
        market_zone = None
        if row.get("zone_id_ref"):
            market_zone = {
                "id": row.get("zone_id_ref"),
                "name": row.get("zone_name"),
                "description": row.get("zone_description"),
                "price_level": row.get("zone_price_level"),
                "avg_subscription_min": row.get("zone_avg_subscription_min"),
                "avg_subscription_max": row.get("zone_avg_subscription_max"),
                "geographic_scope": row.get("zone_geographic_scope"),
                "population_density": row.get("zone_population_density"),
                "avg_household_income_range": row.get("zone_avg_household_income_range"),
                "is_active": bool(row.get("zone_is_active")) if row.get("zone_is_active") is not None else None,
                "created_at": row.get("zone_created_at"),
                "updated_at": row.get("zone_updated_at"),
            }
        row["market_zone"] = market_zone
        competitors.append(row)
    return jsonify(competitors), 200


@app.route('/api/competitors', methods=['POST'])
def create_competitor():
    data = request.get_json() or {}
    if not data.get("gym_id") or not data.get("name"):
        return jsonify({"error": "gym_id and name are required"}), 400
    competitor_id = ensure_id(data)
    created_at = data.get("created_at") or now_iso()
    updated_at = data.get("updated_at") or created_at

    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO competitors (
                id, gym_id, name, address, city, postal_code, latitude, longitude,
                distance_km, travel_time_minutes, market_zone_id, base_subscription_price,
                base_subscription_name, limited_subscription_price, limited_subscription_name,
                premium_subscription_price, premium_subscription_name, trial_price, offers_count, positioning,
                value_proposition, strengths, weaknesses, google_rating, google_reviews_count,
                instagram_followers, website_url, surface_m2, capacity, equipment_quality,
                has_hyrox, has_weightlifting, has_gymnastics, has_childcare, has_nutrition,
                additional_services, number_of_coaches, last_updated, notes, is_active,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                competitor_id,
                data.get("gym_id"),
                data.get("name"),
                data.get("address"),
                data.get("city"),
                data.get("postal_code"),
                data.get("latitude"),
                data.get("longitude"),
                data.get("distance_km"),
                data.get("travel_time_minutes"),
                data.get("market_zone_id"),
                data.get("base_subscription_price"),
                data.get("base_subscription_name"),
                data.get("limited_subscription_price"),
                data.get("limited_subscription_name"),
                data.get("premium_subscription_price"),
                data.get("premium_subscription_name"),
                data.get("trial_price"),
                data.get("offers_count", 0),
                data.get("positioning"),
                data.get("value_proposition"),
                json_dumps(data.get("strengths")),
                json_dumps(data.get("weaknesses")),
                data.get("google_rating"),
                data.get("google_reviews_count", 0),
                data.get("instagram_followers", 0),
                data.get("website_url"),
                data.get("surface_m2"),
                data.get("capacity"),
                data.get("equipment_quality"),
                1 if data.get("has_hyrox") else 0,
                1 if data.get("has_weightlifting") else 0,
                1 if data.get("has_gymnastics") else 0,
                1 if data.get("has_childcare") else 0,
                1 if data.get("has_nutrition") else 0,
                json_dumps(data.get("additional_services")),
                data.get("number_of_coaches"),
                data.get("last_updated") or now_iso(),
                data.get("notes"),
                1 if data.get("is_active", True) else 0,
                created_at,
                updated_at,
            ),
        )

    competitor = fetch_one("SELECT * FROM competitors WHERE id = ?", (competitor_id,))
    if competitor:
        competitor["is_active"] = bool(competitor.get("is_active"))
    return jsonify(competitor), 201


@app.route('/api/competitors/<competitor_id>', methods=['PUT'])
def update_competitor(competitor_id: str):
    data = request.get_json() or {}
    with get_db_connection() as conn:
        conn.execute(
            """
            UPDATE competitors
            SET name = ?, address = ?, city = ?, postal_code = ?, latitude = ?, longitude = ?,
                distance_km = ?, travel_time_minutes = ?, market_zone_id = ?, base_subscription_price = ?,
                base_subscription_name = ?, limited_subscription_price = ?, limited_subscription_name = ?,
                premium_subscription_price = ?, premium_subscription_name = ?, trial_price = ?, offers_count = ?, positioning = ?,
                value_proposition = ?, google_rating = ?, google_reviews_count = ?, instagram_followers = ?,
                website_url = ?, surface_m2 = ?, capacity = ?, equipment_quality = ?,
                has_hyrox = ?, has_weightlifting = ?, has_gymnastics = ?, has_childcare = ?, has_nutrition = ?,
                number_of_coaches = ?, notes = ?, is_active = ?, updated_at = ?
            WHERE id = ?
            """,
            (
                data.get("name"),
                data.get("address"),
                data.get("city"),
                data.get("postal_code"),
                data.get("latitude"),
                data.get("longitude"),
                data.get("distance_km"),
                data.get("travel_time_minutes"),
                data.get("market_zone_id"),
                data.get("base_subscription_price"),
                data.get("base_subscription_name"),
                data.get("limited_subscription_price"),
                data.get("limited_subscription_name"),
                data.get("premium_subscription_price"),
                data.get("premium_subscription_name"),
                data.get("trial_price"),
                data.get("offers_count", 0),
                data.get("positioning"),
                data.get("value_proposition"),
                data.get("google_rating"),
                data.get("google_reviews_count", 0),
                data.get("instagram_followers", 0),
                data.get("website_url"),
                data.get("surface_m2"),
                data.get("capacity"),
                data.get("equipment_quality"),
                1 if data.get("has_hyrox") else 0,
                1 if data.get("has_weightlifting") else 0,
                1 if data.get("has_gymnastics") else 0,
                1 if data.get("has_childcare") else 0,
                1 if data.get("has_nutrition") else 0,
                data.get("number_of_coaches"),
                data.get("notes"),
                1 if data.get("is_active", True) else 0,
                data.get("updated_at") or now_iso(),
                competitor_id,
            ),
        )

    competitor = fetch_one("SELECT * FROM competitors WHERE id = ?", (competitor_id,))
    if not competitor:
        return jsonify({"error": "Competitor not found"}), 404
    competitor["is_active"] = bool(competitor.get("is_active"))
    for key in ["has_hyrox", "has_weightlifting", "has_gymnastics", "has_childcare", "has_nutrition"]:
        competitor[key] = bool(competitor.get(key))
    return jsonify(competitor), 200


@app.route('/api/competitors/<competitor_id>', methods=['DELETE'])
def delete_competitor(competitor_id: str):
    with get_db_connection() as conn:
        conn.execute("DELETE FROM competitors WHERE id = ?", (competitor_id,))
    return jsonify({"status": "deleted"}), 200


@app.route('/api/gym-offers', methods=['GET'])
def list_gym_offers():
    gym_id = request.args.get("gym_id")
    if not gym_id:
        return jsonify({"error": "gym_id is required"}), 400
    offers = fetch_all(
        "SELECT * FROM gym_offers WHERE gym_id = ? ORDER BY sort_order ASC",
        (gym_id,),
        json_fields={"target_audience", "included_services"},
    )
    for offer in offers:
        offer["is_active"] = bool(offer.get("is_active"))
        offer["is_featured"] = bool(offer.get("is_featured"))
    return jsonify(offers), 200


@app.route('/api/gym-offers', methods=['POST'])
def create_gym_offer():
    data = request.get_json() or {}
    if not data.get("gym_id") or not data.get("offer_name"):
        return jsonify({"error": "gym_id and offer_name are required"}), 400
    offer_id = ensure_id(data)
    created_at = data.get("created_at") or now_iso()
    updated_at = data.get("updated_at") or created_at

    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO gym_offers (
                id, gym_id, audit_id, offer_type, offer_name, offer_description, price,
                currency, session_count, duration_months, commitment_months, target_audience,
                restrictions, included_services, is_active, is_featured, sort_order,
                active_subscriptions_count, monthly_revenue, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                offer_id,
                data.get("gym_id"),
                data.get("audit_id"),
                data.get("offer_type"),
                data.get("offer_name"),
                data.get("offer_description"),
                data.get("price"),
                data.get("currency") or "EUR",
                data.get("session_count"),
                data.get("duration_months", 1),
                data.get("commitment_months", 1),
                json_dumps(data.get("target_audience")),
                data.get("restrictions"),
                json_dumps(data.get("included_services")),
                1 if data.get("is_active", True) else 0,
                1 if data.get("is_featured") else 0,
                data.get("sort_order", 0),
                data.get("active_subscriptions_count", 0),
                data.get("monthly_revenue"),
                created_at,
                updated_at,
            ),
        )

    offer = fetch_one(
        "SELECT * FROM gym_offers WHERE id = ?",
        (offer_id,),
        json_fields={"target_audience", "included_services"},
    )
    if offer:
        offer["is_active"] = bool(offer.get("is_active"))
        offer["is_featured"] = bool(offer.get("is_featured"))
    return jsonify(offer), 201


@app.route('/api/gym-offers/<offer_id>', methods=['PUT'])
def update_gym_offer(offer_id: str):
    data = request.get_json() or {}
    with get_db_connection() as conn:
        conn.execute(
            """
            UPDATE gym_offers
            SET offer_type = ?, offer_name = ?, offer_description = ?, price = ?, currency = ?,
                session_count = ?, duration_months = ?, commitment_months = ?, restrictions = ?,
                is_active = ?, is_featured = ?, active_subscriptions_count = ?, updated_at = ?
            WHERE id = ?
            """,
            (
                data.get("offer_type"),
                data.get("offer_name"),
                data.get("offer_description"),
                data.get("price"),
                data.get("currency") or "EUR",
                data.get("session_count"),
                data.get("duration_months", 1),
                data.get("commitment_months", 1),
                data.get("restrictions"),
                1 if data.get("is_active", True) else 0,
                1 if data.get("is_featured") else 0,
                data.get("active_subscriptions_count", 0),
                data.get("updated_at") or now_iso(),
                offer_id,
            ),
        )

    offer = fetch_one(
        "SELECT * FROM gym_offers WHERE id = ?",
        (offer_id,),
        json_fields={"target_audience", "included_services"},
    )
    if not offer:
        return jsonify({"error": "Offer not found"}), 404
    offer["is_active"] = bool(offer.get("is_active"))
    offer["is_featured"] = bool(offer.get("is_featured"))
    return jsonify(offer), 200


@app.route('/api/gym-offers/<offer_id>', methods=['DELETE'])
def delete_gym_offer(offer_id: str):
    with get_db_connection() as conn:
        conn.execute("DELETE FROM gym_offers WHERE id = ?", (offer_id,))
    return jsonify({"status": "deleted"}), 200


@app.route('/api/kpis/upsert', methods=['POST'])
def upsert_kpis():
    data = request.get_json() or {}
    records = data.get("records", [])
    if not records:
        return jsonify({"error": "records is required"}), 400

    now = now_iso()
    with get_db_connection() as conn:
        for record in records:
            if not record.get("audit_id") or not record.get("kpi_code"):
                return jsonify({"error": "audit_id and kpi_code are required"}), 400
            kpi_id = ensure_id(record)
            conn.execute(
                """
                INSERT INTO kpis (
                    id, audit_id, kpi_code, value, unit, computed_at, inputs_snapshot
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(audit_id, kpi_code)
                DO UPDATE SET value = excluded.value, unit = excluded.unit, computed_at = excluded.computed_at
                """,
                (
                    kpi_id,
                    record.get("audit_id"),
                    record.get("kpi_code"),
                    record.get("value"),
                    record.get("unit"),
                    record.get("computed_at") or now,
                    json_dumps(record.get("inputs_snapshot")),
                ),
            )

    return jsonify({"status": "ok"}), 200


@app.route('/api/scores/upsert', methods=['POST'])
def upsert_scores():
    data = request.get_json() or {}
    records = data.get("records", [])
    if not records:
        return jsonify({"error": "records is required"}), 400

    now = now_iso()
    with get_db_connection() as conn:
        for record in records:
            if not record.get("audit_id") or not record.get("pillar_code"):
                return jsonify({"error": "audit_id and pillar_code are required"}), 400
            score_id = ensure_id(record)
            conn.execute(
                """
                INSERT INTO scores (
                    id, audit_id, pillar_code, pillar_name, score, weight, computed_at, details
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(audit_id, pillar_code)
                DO UPDATE SET score = excluded.score, weight = excluded.weight,
                              pillar_name = excluded.pillar_name, computed_at = excluded.computed_at,
                              details = excluded.details
                """,
                (
                    score_id,
                    record.get("audit_id"),
                    record.get("pillar_code"),
                    record.get("pillar_name"),
                    record.get("score"),
                    record.get("weight"),
                    record.get("computed_at") or now,
                    json_dumps(record.get("details")),
                ),
            )

    return jsonify({"status": "ok"}), 200


@app.route('/api/recommendations/replace', methods=['POST'])
def replace_recommendations():
    data = request.get_json() or {}
    audit_id = data.get("audit_id")
    records = data.get("records", [])
    if not audit_id:
        return jsonify({"error": "audit_id is required"}), 400

    with get_db_connection() as conn:
        conn.execute("DELETE FROM recommendations WHERE audit_id = ?", (audit_id,))
        for record in records:
            rec_id = ensure_id(record)
            conn.execute(
                """
                INSERT INTO recommendations (
                    id, audit_id, rec_code, title, description, priority,
                    expected_impact_eur, effort_level, confidence, category, computed_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    rec_id,
                    audit_id,
                    record.get("rec_code"),
                    record.get("title"),
                    record.get("description"),
                    record.get("priority"),
                    record.get("expected_impact_eur"),
                    record.get("effort_level"),
                    record.get("confidence"),
                    record.get("category"),
                    record.get("computed_at") or now_iso(),
                ),
            )

    return jsonify({"status": "ok"}), 200


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
            'POST /api/validate',
            'GET /api/gyms',
            'POST /api/gyms',
            'GET /api/audits',
            'POST /api/audits'
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
