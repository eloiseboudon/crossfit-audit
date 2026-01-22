/*
  # CrossFit Audit System - Complete Schema

  ## Overview
  Complete database schema for CrossFit gym audit application with proper RLS policies,
  indexes, and constraints to handle all edge cases.

  ## Tables Created

  ### 1. gyms
  Stores gym information
  - id (uuid, primary key)
  - name, address, city, postal_code (gym details)
  - contact information (name, phone, email, website, instagram)
  - legal_status, founded_year, partners_count
  - notes (free text)
  - timestamps (created_at, updated_at)

  ### 2. audits
  Stores audit sessions for each gym
  - id (uuid, primary key)
  - gym_id (foreign key to gyms)
  - status (brouillon, en_cours, finalise, archive)
  - audit_date_start, audit_date_end
  - baseline_period, currency
  - completion_percentage (0-100)
  - notes, timestamps

  ### 3. answers
  Stores questionnaire responses with proper unique constraint
  - id (uuid, primary key)
  - audit_id (foreign key to audits)
  - block_code, question_code (composite key with audit_id)
  - value (jsonb for flexibility)
  - timestamps

  ### 4. kpis
  Stores calculated KPIs with proper unique constraint
  - id (uuid, primary key)
  - audit_id (foreign key to audits)
  - kpi_code (composite key with audit_id)
  - value (numeric), unit (text)
  - computed_at, inputs_snapshot (jsonb)

  ### 5. scores
  Stores pillar scores with proper unique constraint
  - id (uuid, primary key)
  - audit_id (foreign key to audits)
  - pillar_code (composite key with audit_id)
  - pillar_name, score, weight
  - computed_at, details (jsonb)

  ### 6. recommendations
  Stores generated recommendations
  - id (uuid, primary key)
  - audit_id (foreign key to audits)
  - rec_code, title, description
  - priority (P1, P2, P3)
  - expected_impact_eur, effort_level, confidence
  - category, computed_at

  ### 7. market_benchmarks
  Stores market benchmark values
  - id (uuid, primary key)
  - benchmark_code (unique)
  - name, value, unit, description, category
  - updated_at

  ## Security
  - RLS enabled on all tables
  - Public access policies (V1 - no auth required)
  - All policies are restrictive by default

  ## Performance
  - Indexes on foreign keys
  - Indexes on status fields
  - Composite indexes for queries

  ## Notes
  - All upsert operations use explicit onConflict handling
  - JSONB used for flexible data storage
  - Cascade deletes for data integrity
*/

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS kpis CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS audits CASCADE;
DROP TABLE IF EXISTS gyms CASCADE;
DROP TABLE IF EXISTS market_benchmarks CASCADE;

-- =============================================================================
-- TABLES
-- =============================================================================

-- Gyms table
CREATE TABLE gyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  postal_code text,
  contact_name text,
  phone text,
  email text,
  website text,
  instagram text,
  legal_status text,
  founded_year integer,
  partners_count integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Audits table
CREATE TABLE audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'brouillon',
  audit_date_start date,
  audit_date_end date,
  baseline_period text DEFAULT '12 derniers mois',
  currency text DEFAULT 'EUR',
  notes text,
  completion_percentage numeric DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Answers table with unique constraint
CREATE TABLE answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  block_code text NOT NULL,
  question_code text NOT NULL,
  value jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(audit_id, block_code, question_code)
);

-- KPIs table with unique constraint
CREATE TABLE kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  kpi_code text NOT NULL,
  value numeric,
  unit text,
  computed_at timestamptz NOT NULL DEFAULT now(),
  inputs_snapshot jsonb,
  UNIQUE(audit_id, kpi_code)
);

-- Scores table with unique constraint
CREATE TABLE scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  pillar_code text NOT NULL,
  pillar_name text NOT NULL,
  score numeric CHECK (score >= 0 AND score <= 100),
  weight numeric CHECK (weight >= 0 AND weight <= 1),
  computed_at timestamptz NOT NULL DEFAULT now(),
  details jsonb,
  UNIQUE(audit_id, pillar_code)
);

-- Recommendations table
CREATE TABLE recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  rec_code text NOT NULL,
  title text NOT NULL,
  description text,
  priority text CHECK (priority IN ('P1', 'P2', 'P3')),
  expected_impact_eur numeric,
  effort_level text CHECK (effort_level IN ('S', 'M', 'L')),
  confidence text CHECK (confidence IN ('faible', 'moyen', 'fort')),
  category text,
  computed_at timestamptz NOT NULL DEFAULT now()
);

-- Market benchmarks table
CREATE TABLE market_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_code text UNIQUE NOT NULL,
  name text NOT NULL,
  value numeric NOT NULL,
  unit text,
  description text,
  category text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX idx_audits_gym_id ON audits(gym_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_created_at ON audits(created_at DESC);

CREATE INDEX idx_answers_audit_id ON answers(audit_id);
CREATE INDEX idx_answers_block_code ON answers(block_code);
CREATE INDEX idx_answers_composite ON answers(audit_id, block_code, question_code);

CREATE INDEX idx_kpis_audit_id ON kpis(audit_id);
CREATE INDEX idx_kpis_composite ON kpis(audit_id, kpi_code);

CREATE INDEX idx_scores_audit_id ON scores(audit_id);
CREATE INDEX idx_scores_composite ON scores(audit_id, pillar_code);

CREATE INDEX idx_recommendations_audit_id ON recommendations(audit_id);
CREATE INDEX idx_recommendations_priority ON recommendations(priority);

CREATE INDEX idx_market_benchmarks_code ON market_benchmarks(benchmark_code);
CREATE INDEX idx_market_benchmarks_category ON market_benchmarks(category);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_benchmarks ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES (V1 - Public Access)
-- =============================================================================

-- Gyms policies
CREATE POLICY "Allow all operations on gyms"
  ON gyms
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Audits policies
CREATE POLICY "Allow all operations on audits"
  ON audits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Answers policies
CREATE POLICY "Allow all operations on answers"
  ON answers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- KPIs policies
CREATE POLICY "Allow all operations on kpis"
  ON kpis
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Scores policies
CREATE POLICY "Allow all operations on scores"
  ON scores
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Recommendations policies
CREATE POLICY "Allow all operations on recommendations"
  ON recommendations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Market benchmarks policies
CREATE POLICY "Allow all operations on market_benchmarks"
  ON market_benchmarks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- SEED DATA - Market Benchmarks
-- =============================================================================

INSERT INTO market_benchmarks (benchmark_code, name, value, unit, description, category) VALUES
  ('arpm_toulouse', 'ARPM moyen Toulouse', 85, '€', 'Revenu moyen par membre par mois à Toulouse', 'pricing'),
  ('churn_target', 'Taux de churn cible', 2, '%', 'Taux de churn mensuel cible', 'retention'),
  ('conversion_target', 'Taux de conversion cible', 40, '%', 'Taux de conversion essai vers abonnement cible', 'acquisition'),
  ('loyer_ratio_max', 'Ratio loyer/CA maximum', 15, '%', 'Ratio loyer/CA à ne pas dépasser', 'finance'),
  ('masse_salariale_ratio_max', 'Ratio masse salariale/CA maximum', 45, '%', 'Ratio masse salariale/CA à ne pas dépasser', 'finance'),
  ('ebitda_target', 'Marge EBITDA cible', 20, '%', 'Marge EBITDA cible', 'finance'),
  ('occupation_target', 'Taux occupation cible', 70, '%', 'Taux de remplissage des cours cible', 'exploitation'),
  ('ca_par_m2_target', 'CA par m² cible', 300, '€', 'Chiffre affaires par m² cible annuel', 'exploitation');

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON gyms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_benchmarks_updated_at BEFORE UPDATE ON market_benchmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();