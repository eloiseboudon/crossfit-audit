require('dotenv').config();
const { db } = require('../config/database');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const defaultBenchmarks = [
  {
    benchmark_code: 'arpm_toulouse',
    name: 'ARPM moyen Toulouse',
    value: 85,
    unit: '€',
    description: 'Revenu moyen par membre par mois à Toulouse',
    category: 'pricing'
  },
  {
    benchmark_code: 'churn_target',
    name: 'Taux de churn cible',
    value: 2,
    unit: '%',
    description: 'Taux de churn mensuel cible',
    category: 'retention'
  },
  {
    benchmark_code: 'conversion_target',
    name: 'Taux de conversion cible',
    value: 40,
    unit: '%',
    description: "Taux de conversion essai vers abonnement cible",
    category: 'acquisition'
  },
  {
    benchmark_code: 'loyer_ratio_max',
    name: 'Ratio loyer/CA maximum',
    value: 15,
    unit: '%',
    description: 'Ratio loyer/CA à ne pas dépasser',
    category: 'finance'
  },
  {
    benchmark_code: 'masse_salariale_ratio_max',
    name: 'Ratio masse salariale/CA maximum',
    value: 45,
    unit: '%',
    description: 'Ratio masse salariale/CA à ne pas dépasser',
    category: 'finance'
  },
  {
    benchmark_code: 'ebitda_target',
    name: 'Marge EBITDA cible',
    value: 20,
    unit: '%',
    description: 'Marge EBITDA cible',
    category: 'finance'
  },
  {
    benchmark_code: 'occupation_target',
    name: 'Taux occupation cible',
    value: 70,
    unit: '%',
    description: 'Taux de remplissage des cours cible',
    category: 'exploitation'
  },
  {
    benchmark_code: 'ca_par_m2_target',
    name: 'CA par m² cible',
    value: 300,
    unit: '€',
    description: 'Chiffre affaires par m² cible annuel',
    category: 'exploitation'
  }
];

const schema = `
CREATE TABLE IF NOT EXISTS gyms (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  legal_status TEXT,
  founded_year INTEGER,
  partners_count INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audits (
  id TEXT PRIMARY KEY,
  gym_id TEXT NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  audit_date_start TEXT,
  audit_date_end TEXT,
  baseline_period TEXT,
  currency TEXT,
  notes TEXT,
  completion_percentage REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS answers (
  id TEXT PRIMARY KEY,
  audit_id TEXT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  block_code TEXT NOT NULL,
  question_code TEXT NOT NULL,
  value TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(audit_id, block_code, question_code)
);

CREATE TABLE IF NOT EXISTS kpis (
  id TEXT PRIMARY KEY,
  audit_id TEXT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  kpi_code TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT,
  computed_at TEXT NOT NULL,
  inputs_snapshot TEXT,
  UNIQUE(audit_id, kpi_code)
);

CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  audit_id TEXT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  pillar_code TEXT NOT NULL,
  pillar_name TEXT NOT NULL,
  score REAL NOT NULL,
  weight REAL NOT NULL,
  computed_at TEXT NOT NULL,
  details TEXT,
  UNIQUE(audit_id, pillar_code)
);

CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  audit_id TEXT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  rec_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL,
  expected_impact_eur REAL,
  effort_level TEXT NOT NULL,
  confidence TEXT NOT NULL,
  category TEXT,
  computed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS market_benchmarks (
  id TEXT PRIMARY KEY,
  benchmark_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT,
  description TEXT,
  category TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS market_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_level TEXT NOT NULL,
  avg_subscription_min REAL NOT NULL,
  avg_subscription_max REAL NOT NULL,
  geographic_scope TEXT,
  population_density TEXT,
  avg_household_income_range TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS competitors (
  id TEXT PRIMARY KEY,
  gym_id TEXT NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  latitude REAL,
  longitude REAL,
  distance_km REAL,
  travel_time_minutes REAL,
  market_zone_id TEXT REFERENCES market_zones(id) ON DELETE SET NULL,
  base_subscription_price REAL,
  base_subscription_name TEXT,
  limited_subscription_price REAL,
  limited_subscription_name TEXT,
  premium_subscription_price REAL,
  premium_subscription_name TEXT,
  trial_price REAL,
  offers_count INTEGER NOT NULL DEFAULT 0,
  positioning TEXT,
  value_proposition TEXT,
  strengths TEXT,
  weaknesses TEXT,
  google_rating REAL,
  google_reviews_count INTEGER NOT NULL DEFAULT 0,
  google_maps_url TEXT,
  instagram_handle TEXT,
  instagram_followers INTEGER NOT NULL DEFAULT 0,
  website_url TEXT,
  surface_m2 REAL,
  capacity REAL,
  equipment_quality TEXT,
  has_hyrox INTEGER NOT NULL DEFAULT 0,
  has_weightlifting INTEGER NOT NULL DEFAULT 0,
  has_gymnastics INTEGER NOT NULL DEFAULT 0,
  has_childcare INTEGER NOT NULL DEFAULT 0,
  has_nutrition INTEGER NOT NULL DEFAULT 0,
  additional_services TEXT,
  number_of_coaches INTEGER,
  head_coach_name TEXT,
  last_updated TEXT,
  data_source TEXT,
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gym_offers (
  id TEXT PRIMARY KEY,
  gym_id TEXT NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  audit_id TEXT REFERENCES audits(id) ON DELETE CASCADE,
  offer_type TEXT NOT NULL,
  offer_name TEXT NOT NULL,
  offer_description TEXT,
  price REAL NOT NULL,
  currency TEXT NOT NULL,
  session_count INTEGER,
  duration_months INTEGER NOT NULL,
  commitment_months INTEGER NOT NULL,
  target_audience TEXT,
  restrictions TEXT,
  included_services TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active_subscriptions_count INTEGER NOT NULL DEFAULT 0,
  monthly_revenue REAL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gym_user_access (
  id TEXT PRIMARY KEY,
  gym_id TEXT NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL CHECK (access_level IN ('read', 'write')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(gym_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_audits_gym_id ON audits(gym_id);
CREATE INDEX IF NOT EXISTS idx_answers_audit_id ON answers(audit_id);
CREATE INDEX IF NOT EXISTS idx_kpis_audit_id ON kpis(audit_id);
CREATE INDEX IF NOT EXISTS idx_scores_audit_id ON scores(audit_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_audit_id ON recommendations(audit_id);
CREATE INDEX IF NOT EXISTS idx_competitors_gym_id ON competitors(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_offers_gym_id ON gym_offers(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_offers_audit_id ON gym_offers(audit_id);
CREATE INDEX IF NOT EXISTS idx_gym_user_access_gym_id ON gym_user_access(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_user_access_user_id ON gym_user_access(user_id);
`;

const logger = require('../utils/logger');

async function initDatabase() {
  logger.info('🚀 Initialisation de la base de données...');

  try {
    db.exec(schema);

    const now = new Date().toISOString();
    const insertSql = `
      INSERT OR IGNORE INTO market_benchmarks (
        id, benchmark_code, name, value, unit, description, category, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const insertStatement = db.prepare(insertSql);

    defaultBenchmarks.forEach((benchmark) => {
      insertStatement.run(
        uuidv4(),
        benchmark.benchmark_code,
        benchmark.name,
        benchmark.value,
        benchmark.unit,
        benchmark.description,
        benchmark.category,
        now
      );
    });

    logger.info('✅ Base de données initialisée avec succès !');
    logger.info('📊 Tables créées:');
    logger.info('   - users');
    logger.info('   - gyms');
    logger.info('   - audits');
    logger.info('   - answers');
    logger.info('   - kpis');
    logger.info('   - scores');
    logger.info('   - recommendations');
    logger.info('   - market_benchmarks');
    logger.info('   - market_zones');
    logger.info('   - competitors');
    logger.info('   - gym_offers');
    return;
  } catch (err) {
    logger.error('❌ Erreur lors de l\'initialisation:', err.message);
    throw err;
  }
}

// Exécuter si lancé directement
if (require.main === module) {
  initDatabase()
    .then(() => {
      logger.info('\n✅ Initialisation terminée');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('\n❌ Échec de l\'initialisation:', err);
      process.exit(1);
    });
}

module.exports = { initDatabase };
