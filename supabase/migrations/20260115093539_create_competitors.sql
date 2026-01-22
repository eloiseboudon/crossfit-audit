/*
  # Create Competitors Table

  ## Description
  Base de données structurée des concurrents CrossFit directs.
  Permet de comparer la salle auditée avec ses concurrents locaux sur tous les critères.

  ## New Tables
    - `competitors`
      - `id` (uuid, primary key) - Identifiant unique du concurrent
      - `gym_id` (uuid, foreign key) - Référence à la salle auditée
      - `name` (text, not null) - Nom du concurrent
      - `address`, `city`, `postal_code` (text) - Adresse complète
      - `latitude`, `longitude` (decimal) - Coordonnées GPS
      - `distance_km` (decimal) - Distance en km de la salle auditée
      - `travel_time_minutes` (integer) - Temps de trajet en minutes
      - `market_zone_id` (uuid, foreign key) - Zone de marché du concurrent
      - Tarification: base_subscription_price, limited_subscription_price, etc.
      - `positioning` (text) - Positionnement stratégique
      - `strengths`, `weaknesses` (text[]) - Forces et faiblesses
      - Visibilité: google_rating, instagram_followers, etc.
      - Infrastructure: surface_m2, capacity, equipment_quality
      - Services: has_hyrox, has_weightlifting, etc.
      - Coaching: number_of_coaches, head_coach_name

  ## Security
    - Enable RLS on `competitors` table
    - Policy: Users can only read/write competitors for their own gyms

  ## Indexes
    - Index on `gym_id` for fast gym-specific queries
    - Index on `market_zone_id` for zone-based analysis
    - Index on `distance_km` for proximity searches
    - Index on `is_active` for active competitors only
*/

-- ============================================================================
-- TABLE: competitors
-- ============================================================================

CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Liaison avec la salle auditée
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,

  -- Identification du concurrent
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),

  -- Proximité
  distance_km DECIMAL(5,2) CHECK (distance_km IS NULL OR distance_km >= 0),
  travel_time_minutes INTEGER CHECK (travel_time_minutes IS NULL OR travel_time_minutes >= 0),

  -- Zone de marché
  market_zone_id UUID REFERENCES market_zones(id) ON DELETE SET NULL,

  -- Tarification concurrentielle
  base_subscription_price DECIMAL(10,2) CHECK (base_subscription_price IS NULL OR base_subscription_price >= 0),
  base_subscription_name TEXT,
  limited_subscription_price DECIMAL(10,2) CHECK (limited_subscription_price IS NULL OR limited_subscription_price >= 0),
  limited_subscription_name TEXT,
  premium_subscription_price DECIMAL(10,2) CHECK (premium_subscription_price IS NULL OR premium_subscription_price >= 0),
  premium_subscription_name TEXT,
  trial_price DECIMAL(10,2) CHECK (trial_price IS NULL OR trial_price >= 0),
  offers_count INTEGER DEFAULT 0 CHECK (offers_count >= 0),

  -- Positionnement stratégique
  positioning TEXT CHECK (positioning IN ('budget', 'standard', 'premium', 'luxe') OR positioning IS NULL),
  value_proposition TEXT,

  -- Forces / Faiblesses
  strengths TEXT[],
  weaknesses TEXT[],

  -- Visibilité & Réputation
  google_rating DECIMAL(2,1) CHECK (google_rating IS NULL OR (google_rating >= 0 AND google_rating <= 5)),
  google_reviews_count INTEGER DEFAULT 0 CHECK (google_reviews_count >= 0),
  google_maps_url TEXT,
  instagram_handle TEXT,
  instagram_followers INTEGER DEFAULT 0 CHECK (instagram_followers >= 0),
  website_url TEXT,

  -- Infrastructure
  surface_m2 INTEGER CHECK (surface_m2 IS NULL OR surface_m2 > 0),
  capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
  equipment_quality TEXT CHECK (equipment_quality IN ('basique', 'standard', 'premium', 'excellent') OR equipment_quality IS NULL),

  -- Offre & Services
  has_hyrox BOOLEAN DEFAULT false NOT NULL,
  has_weightlifting BOOLEAN DEFAULT false NOT NULL,
  has_gymnastics BOOLEAN DEFAULT false NOT NULL,
  has_childcare BOOLEAN DEFAULT false NOT NULL,
  has_nutrition BOOLEAN DEFAULT false NOT NULL,
  additional_services TEXT[],

  -- Coaching
  number_of_coaches INTEGER CHECK (number_of_coaches IS NULL OR number_of_coaches > 0),
  head_coach_name TEXT,

  -- Méta-données
  last_updated TIMESTAMPTZ DEFAULT now() NOT NULL,
  data_source TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_competitors_gym
  ON competitors(gym_id);

CREATE INDEX IF NOT EXISTS idx_competitors_zone
  ON competitors(market_zone_id);

CREATE INDEX IF NOT EXISTS idx_competitors_distance
  ON competitors(distance_km) WHERE distance_km IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_competitors_active
  ON competitors(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_competitors_positioning
  ON competitors(positioning) WHERE positioning IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read competitors for their own gyms"
  ON competitors
  FOR SELECT
  TO authenticated
  USING (
    gym_id IN (
      SELECT id FROM gyms WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create competitors for their own gyms"
  ON competitors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    gym_id IN (
      SELECT id FROM gyms WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update competitors for their own gyms"
  ON competitors
  FOR UPDATE
  TO authenticated
  USING (
    gym_id IN (
      SELECT id FROM gyms WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    gym_id IN (
      SELECT id FROM gyms WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete competitors for their own gyms"
  ON competitors
  FOR DELETE
  TO authenticated
  USING (
    gym_id IN (
      SELECT id FROM gyms WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGER: Auto-update updated_at and last_updated timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_competitors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_competitors_updated_at
  BEFORE UPDATE ON competitors
  FOR EACH ROW
  EXECUTE FUNCTION update_competitors_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE competitors IS 'Base de données structurée des concurrents CrossFit avec tarification et positionnement détaillés';
COMMENT ON COLUMN competitors.gym_id IS 'Référence à la salle auditée (propriétaire de cette analyse concurrentielle)';
COMMENT ON COLUMN competitors.distance_km IS 'Distance en kilomètres entre la salle auditée et le concurrent';
COMMENT ON COLUMN competitors.positioning IS 'Positionnement tarifaire du concurrent: budget, standard, premium, luxe';
COMMENT ON COLUMN competitors.strengths IS 'Array des points forts du concurrent (ex: ["Équipement neuf", "Communauté forte"])';
COMMENT ON COLUMN competitors.weaknesses IS 'Array des points faibles du concurrent (ex: ["Horaires limités", "Peu de créneaux"])';
