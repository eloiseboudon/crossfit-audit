/*
  # Create Competitive Pricing Analysis Table

  ## Description
  Stocke les résultats de l'analyse comparative de tarification.
  Génère des insights sur le positionnement tarifaire de la salle par rapport à sa zone de marché.

  ## New Tables
    - `competitive_pricing_analysis`
      - `id` (uuid, primary key) - Identifiant unique de l'analyse
      - `audit_id` (uuid, foreign key) - Référence à l'audit
      - `market_zone_id` (uuid, foreign key) - Zone de marché de référence
      - Position de la salle: gym_avg_price, gym_min_price, gym_max_price, gym_offers_count
      - Statistiques de zone: zone_avg_price, zone_median_price, zone_min_price, zone_max_price, zone_competitors_count
      - Scoring: pricing_position_score, pricing_power_index, competitive_gap_pct, nearest_competitor_gap_pct
      - Recommandations: optimal_price_range_min, optimal_price_range_max, recommended_action
      - `analysis_details` (jsonb) - Détails de l'analyse en JSON
      - `computed_at` (timestamptz) - Date de calcul
      - `algorithm_version` (text) - Version de l'algorithme

  ## Security
    - Enable RLS on `competitive_pricing_analysis` table
    - Policy: Users can only read/write analyses for their own audits

  ## Indexes
    - Index on `audit_id` for fast audit-specific queries
    - Index on `market_zone_id` for zone-based analysis
*/

-- ============================================================================
-- TABLE: competitive_pricing_analysis
-- ============================================================================

CREATE TABLE IF NOT EXISTS competitive_pricing_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Liaisons
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  market_zone_id UUID REFERENCES market_zones(id) ON DELETE SET NULL,

  -- Position tarifaire de la salle
  gym_avg_price DECIMAL(10,2) NOT NULL CHECK (gym_avg_price >= 0),
  gym_min_price DECIMAL(10,2) CHECK (gym_min_price IS NULL OR gym_min_price >= 0),
  gym_max_price DECIMAL(10,2) CHECK (gym_max_price IS NULL OR gym_max_price >= 0),
  gym_offers_count INTEGER DEFAULT 0 NOT NULL CHECK (gym_offers_count >= 0),

  -- Statistiques de zone
  zone_avg_price DECIMAL(10,2) CHECK (zone_avg_price IS NULL OR zone_avg_price >= 0),
  zone_median_price DECIMAL(10,2) CHECK (zone_median_price IS NULL OR zone_median_price >= 0),
  zone_min_price DECIMAL(10,2) CHECK (zone_min_price IS NULL OR zone_min_price >= 0),
  zone_max_price DECIMAL(10,2) CHECK (zone_max_price IS NULL OR zone_max_price >= 0),
  zone_competitors_count INTEGER DEFAULT 0 NOT NULL CHECK (zone_competitors_count >= 0),

  -- Scoring de positionnement (-100 à +100)
  -- Négatif = sous-tarifé, 0 = aligné, positif = sur-tarifé
  pricing_position_score DECIMAL(5,2) CHECK (pricing_position_score IS NULL OR (pricing_position_score >= -100 AND pricing_position_score <= 100)),

  -- Pricing Power Index (0 à 100)
  -- Capacité à augmenter les prix sans perdre de clients
  pricing_power_index DECIMAL(5,2) CHECK (pricing_power_index IS NULL OR (pricing_power_index >= 0 AND pricing_power_index <= 100)),

  -- Écarts compétitifs
  competitive_gap_pct DECIMAL(5,2),
  nearest_competitor_gap_pct DECIMAL(5,2),

  -- Recommandations tarifaires
  optimal_price_range_min DECIMAL(10,2) CHECK (optimal_price_range_min IS NULL OR optimal_price_range_min >= 0),
  optimal_price_range_max DECIMAL(10,2) CHECK (optimal_price_range_max IS NULL OR optimal_price_range_max >= 0),
  recommended_action TEXT CHECK (recommended_action IN (
    'maintain',          -- Maintenir les prix actuels
    'increase_gradual',  -- Augmenter progressivement
    'increase_immediate',-- Augmenter immédiatement
    'decrease',          -- Réduire (rare)
    'restructure',       -- Restructurer l''offre
    'differentiate'      -- Différencier par la valeur
  ) OR recommended_action IS NULL),

  -- Analyse détaillée
  analysis_details JSONB,

  -- Méta-données
  computed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  algorithm_version TEXT DEFAULT '2.0' NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_pricing_analysis_audit
  ON competitive_pricing_analysis(audit_id);

CREATE INDEX IF NOT EXISTS idx_pricing_analysis_zone
  ON competitive_pricing_analysis(market_zone_id);

CREATE INDEX IF NOT EXISTS idx_pricing_analysis_computed_at
  ON competitive_pricing_analysis(computed_at DESC);

CREATE INDEX IF NOT EXISTS idx_pricing_analysis_recommended_action
  ON competitive_pricing_analysis(recommended_action) WHERE recommended_action IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE competitive_pricing_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read pricing analysis for their own audits"
  ON competitive_pricing_analysis
  FOR SELECT
  TO authenticated
  USING (
    audit_id IN (
      SELECT a.id FROM audits a
      JOIN gyms g ON a.gym_id = g.id
      WHERE g.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pricing analysis for their own audits"
  ON competitive_pricing_analysis
  FOR INSERT
  TO authenticated
  WITH CHECK (
    audit_id IN (
      SELECT a.id FROM audits a
      JOIN gyms g ON a.gym_id = g.id
      WHERE g.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pricing analysis for their own audits"
  ON competitive_pricing_analysis
  FOR UPDATE
  TO authenticated
  USING (
    audit_id IN (
      SELECT a.id FROM audits a
      JOIN gyms g ON a.gym_id = g.id
      WHERE g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    audit_id IN (
      SELECT a.id FROM audits a
      JOIN gyms g ON a.gym_id = g.id
      WHERE g.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pricing analysis for their own audits"
  ON competitive_pricing_analysis
  FOR DELETE
  TO authenticated
  USING (
    audit_id IN (
      SELECT a.id FROM audits a
      JOIN gyms g ON a.gym_id = g.id
      WHERE g.user_id = auth.uid()
    )
  );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE competitive_pricing_analysis IS 'Analyse comparative approfondie du positionnement tarifaire par rapport à la zone de marché et aux concurrents directs';
COMMENT ON COLUMN competitive_pricing_analysis.pricing_position_score IS 'Score de -100 (très sous-tarifé) à +100 (très sur-tarifé), 0 = aligné avec le marché';
COMMENT ON COLUMN competitive_pricing_analysis.pricing_power_index IS 'Index de 0 à 100 mesurant la capacité à augmenter les prix sans impact sur la rétention';
COMMENT ON COLUMN competitive_pricing_analysis.competitive_gap_pct IS 'Écart en pourcentage avec le prix moyen de la zone (positif = au-dessus, négatif = en-dessous)';
COMMENT ON COLUMN competitive_pricing_analysis.recommended_action IS 'Action recommandée: maintain, increase_gradual, increase_immediate, decrease, restructure, differentiate';
COMMENT ON COLUMN competitive_pricing_analysis.analysis_details IS 'Détails de l''analyse au format JSON (facteurs, calculs intermédiaires, etc.)';
