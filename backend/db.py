from __future__ import annotations

import json
import os
import sqlite3
from pathlib import Path
from typing import Any, Iterable

DB_PATH = Path(os.environ.get("SQLITE_DB_PATH", Path(__file__).resolve().parent / "data" / "crossfit.db"))
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"

DEFAULT_BENCHMARKS = [
    {
        "benchmark_code": "arpm_toulouse",
        "name": "ARPM moyen Toulouse",
        "value": 85,
        "unit": "€",
        "description": "Revenu moyen par membre par mois à Toulouse",
        "category": "pricing",
    },
    {
        "benchmark_code": "churn_target",
        "name": "Taux de churn cible",
        "value": 2,
        "unit": "%",
        "description": "Taux de churn mensuel cible",
        "category": "retention",
    },
    {
        "benchmark_code": "conversion_target",
        "name": "Taux de conversion cible",
        "value": 40,
        "unit": "%",
        "description": "Taux de conversion essai vers abonnement cible",
        "category": "acquisition",
    },
    {
        "benchmark_code": "loyer_ratio_max",
        "name": "Ratio loyer/CA maximum",
        "value": 15,
        "unit": "%",
        "description": "Ratio loyer/CA à ne pas dépasser",
        "category": "finance",
    },
    {
        "benchmark_code": "masse_salariale_ratio_max",
        "name": "Ratio masse salariale/CA maximum",
        "value": 45,
        "unit": "%",
        "description": "Ratio masse salariale/CA à ne pas dépasser",
        "category": "finance",
    },
    {
        "benchmark_code": "ebitda_target",
        "name": "Marge EBITDA cible",
        "value": 20,
        "unit": "%",
        "description": "Marge EBITDA cible",
        "category": "finance",
    },
    {
        "benchmark_code": "occupation_target",
        "name": "Taux occupation cible",
        "value": 70,
        "unit": "%",
        "description": "Taux de remplissage des cours cible",
        "category": "exploitation",
    },
    {
        "benchmark_code": "ca_par_m2_target",
        "name": "CA par m² cible",
        "value": 300,
        "unit": "€",
        "description": "Chiffre affaires par m² cible annuel",
        "category": "exploitation",
    },
]


def get_db_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    if not SCHEMA_PATH.exists():
        raise FileNotFoundError(f"Schema file not found: {SCHEMA_PATH}")

    with get_db_connection() as conn:
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))


def seed_benchmarks() -> None:
    from datetime import datetime
    import uuid

    now = datetime.utcnow().isoformat()
    with get_db_connection() as conn:
        existing = conn.execute("SELECT COUNT(*) as count FROM market_benchmarks").fetchone()["count"]
        if existing:
            return
        for benchmark in DEFAULT_BENCHMARKS:
            conn.execute(
                """
                INSERT INTO market_benchmarks (
                    id, benchmark_code, name, value, unit, description, category, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    str(uuid.uuid4()),
                    benchmark["benchmark_code"],
                    benchmark["name"],
                    benchmark["value"],
                    benchmark["unit"],
                    benchmark["description"],
                    benchmark["category"],
                    now,
                ),
            )


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {key: row[key] for key in row.keys()}


def json_dumps(value: Any) -> str | None:
    if value is None:
        return None
    return json.dumps(value, ensure_ascii=False)


def json_loads(value: str | None) -> Any:
    if value is None:
        return None
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return value


def placeholders(values: Iterable[Any]) -> str:
    return ", ".join(["?" for _ in values])
