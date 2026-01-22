require('dotenv').config();
const { db } = require('../config/database');
const fs = require('fs');
const path = require('path');

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

CREATE INDEX IF NOT EXISTS idx_audits_gym_id ON audits(gym_id);
CREATE INDEX IF NOT EXISTS idx_answers_audit_id ON answers(audit_id);
CREATE INDEX IF NOT EXISTS idx_kpis_audit_id ON kpis(audit_id);
CREATE INDEX IF NOT EXISTS idx_scores_audit_id ON scores(audit_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_audit_id ON recommendations(audit_id);
CREATE INDEX IF NOT EXISTS idx_competitors_gym_id ON competitors(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_offers_gym_id ON gym_offers(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_offers_audit_id ON gym_offers(audit_id);
`;

async function initDatabase() {
  console.log('🚀 Initialisation de la base de données...');
  
  return new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) {
        console.error('❌ Erreur lors de la création des tables:', err.message);
        reject(err);
      } else {
        console.log('✅ Base de données initialisée avec succès !');
        console.log('📊 Tables créées:');
        console.log('   - users');
        console.log('   - gyms');
        console.log('   - audits');
        console.log('   - answers');
        console.log('   - kpis');
        console.log('   - scores');
        console.log('   - recommendations');
        console.log('   - market_benchmarks');
        console.log('   - market_zones');
        console.log('   - competitors');
        console.log('   - gym_offers');
        resolve();
      }
    });
  });
}

// Exécuter si lancé directement
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('\n✅ Initialisation terminée');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Échec de l\'initialisation:', err);
      process.exit(1);
    });
}

module.exports = { initDatabase };
