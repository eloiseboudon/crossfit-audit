/*
  # Create Market Zones Table

  ## Description
  Classification des zones géographiques par niveau de prix CrossFit.
  Permet de contextualiser les analyses tarifaires selon la zone de chalandise.

  ## New Tables
    - `market_zones`
      - `id` (uuid, primary key) - Identifiant unique de la zone
      - `name` (text, unique, not null) - Nom de la zone (ex: "Paris Intra-Muros")
      - `description` (text, nullable) - Description détaillée de la zone
      - `price_level` (text, not null) - Niveau de prix: budget, standard, premium, luxe
      - `avg_subscription_min` (decimal, not null) - Prix minimum de la fourchette
      - `avg_subscription_max` (decimal, not null) - Prix maximum de la fourchette
      - `geographic_scope` (text, nullable) - Portée géographique
      - `population_density` (text, nullable) - Densité de population
      - `avg_household_income_range` (text, nullable) - Fourchette de revenus moyens
      - `is_active` (boolean, default true) - Zone active ou archivée
      - `created_at` (timestamptz, default now()) - Date de création
      - `updated_at` (timestamptz, default now()) - Date de dernière modification

  ## Security
    - Enable RLS on `market_zones` table
    - Policy: Authenticated users can read all active zones
    - Policy: Authenticated users can insert new zones
    - Policy: Authenticated users can update zones
    - Policy: Authenticated users can delete zones

  ## Indexes
    - Index on `price_level` for fast filtering
    - Index on `is_active` for active zones queries
*/

-- ============================================================================
-- TABLE: market_zones
-- ============================================================================

CREATE TABLE IF NOT EXISTS market_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  name TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Classification tarifaire
  price_level TEXT NOT NULL CHECK (price_level IN ('budget', 'standard', 'premium', 'luxe')),

  -- Fourchettes de prix (abonnement illimité mensuel en EUR)
  avg_subscription_min DECIMAL(10,2) NOT NULL CHECK (avg_subscription_min >= 0),
  avg_subscription_max DECIMAL(10,2) NOT NULL CHECK (avg_subscription_max >= avg_subscription_min),

  -- Portée géographique
  geographic_scope TEXT CHECK (geographic_scope IN ('quartier', 'ville', 'agglomeration', 'region') OR geographic_scope IS NULL),

  -- Caractéristiques de zone
  population_density TEXT CHECK (population_density IN ('rurale', 'periurbaine', 'urbaine', 'metropolitaine') OR population_density IS NULL),
  avg_household_income_range TEXT,

  -- Méta-données
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_market_zones_price_level
  ON market_zones(price_level);

CREATE INDEX IF NOT EXISTS idx_market_zones_active
  ON market_zones(is_active) WHERE is_active = true;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE market_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active market zones"
  ON market_zones
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can create market zones"
  ON market_zones
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update market zones"
  ON market_zones
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete market zones"
  ON market_zones
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_market_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_market_zones_updated_at
  BEFORE UPDATE ON market_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_market_zones_updated_at();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

INSERT INTO market_zones (name, price_level, avg_subscription_min, avg_subscription_max, geographic_scope, population_density, description, avg_household_income_range) VALUES
  (
    'Paris Intra-Muros',
    'luxe',
    250.00,
    350.00,
    'ville',
    'metropolitaine',
    'Zone premium avec fort pouvoir d''achat. Salles haut de gamme avec services premium et équipements d''exception.',
    '55k-80k'
  ),
  (
    'Grandes Métropoles (Lyon, Bordeaux, Lille)',
    'premium',
    180.00,
    250.00,
    'ville',
    'urbaine',
    'Grandes villes avec concurrence élevée. Positionnement premium avec services de qualité et coaching expert.',
    '40k-55k'
  ),
  (
    'Villes Moyennes (Tours, Nantes, Rennes)',
    'standard',
    140.00,
    180.00,
    'ville',
    'urbaine',
    'Villes moyennes avec marché équilibré. Bon rapport qualité-prix et communauté forte.',
    '30k-40k'
  ),
  (
    'Zones Périurbaines & Rurales',
    'budget',
    100.00,
    140.00,
    'agglomeration',
    'periurbaine',
    'Zones avec sensibilité au prix. Positionnement accessible avec accent sur la convivialité.',
    '25k-35k'
  )
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE market_zones IS 'Classification des zones de marché CrossFit par niveau de prix et caractéristiques géographiques';
