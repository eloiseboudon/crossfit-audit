/*
  # Create Gym Offers Table

  ## Description
  Catalogue détaillé des offres commerciales de chaque salle.
  Remplace le simple "panier_moyen_mensuel" par une structure complète d'offres.

  ## New Tables
    - `gym_offers`
      - `id` (uuid, primary key) - Identifiant unique de l'offre
      - `gym_id` (uuid, foreign key) - Référence à la salle
      - `audit_id` (uuid, foreign key) - Référence à l'audit (optionnel)
      - `offer_type` (text, not null) - Type d'offre (unlimited, limited_sessions, trial, etc.)
      - `offer_name` (text, not null) - Nom de l'offre
      - `offer_description` (text) - Description détaillée
      - `price` (decimal, not null) - Prix de l'offre
      - `currency` (text, default 'EUR') - Devise
      - `session_count` (integer) - Nombre de séances (NULL si illimité)
      - `duration_months` (integer) - Durée de validité en mois
      - `commitment_months` (integer) - Engagement minimum en mois
      - `target_audience` (text[]) - Public cible
      - `restrictions` (text) - Conditions et restrictions
      - `included_services` (text[]) - Services inclus
      - `is_active` (boolean) - Offre active ou archivée
      - `is_featured` (boolean) - Offre mise en avant
      - `sort_order` (integer) - Ordre d'affichage
      - `active_subscriptions_count` (integer) - Nombre d'abonnés actifs
      - `monthly_revenue` (decimal) - Revenu mensuel généré

  ## Security
    - Enable RLS on `gym_offers` table
    - Policy: Users can only read/write offers for their own gyms

  ## Indexes
    - Index on `gym_id` for fast gym-specific queries
    - Index on `audit_id` for audit-specific queries
    - Index on `offer_type` for type-based filtering
    - Index on `is_active` for active offers only
*/

-- ============================================================================
-- TABLE: gym_offers
-- ============================================================================

CREATE TABLE IF NOT EXISTS gym_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Liaisons
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,

  -- Type d'offre
  offer_type TEXT NOT NULL CHECK (offer_type IN (
    'unlimited',           -- Illimité
    'limited_sessions',    -- Séances limitées (ex: 2x/semaine)
    'trial',              -- Essai/Découverte
    'student',            -- Tarif étudiant
    'couple',             -- Tarif couple
    'family',             -- Tarif famille
    'corporate',          -- Entreprise/CE
    'off_peak',           -- Heures creuses
    'early_bird',         -- Tarif précoce (engagement long)
    'annual',             -- Paiement annuel
    'premium',            -- Premium (avec services additionnels)
    'pt_package',         -- Pack Personal Training
    'class_pack'          -- Pack de séances
  )),

  -- Identification de l'offre
  offer_name TEXT NOT NULL,
  offer_description TEXT,

  -- Tarification
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  currency TEXT DEFAULT 'EUR' NOT NULL,

  -- Caractéristiques
  session_count INTEGER CHECK (session_count IS NULL OR session_count > 0),
  duration_months INTEGER DEFAULT 1 NOT NULL CHECK (duration_months > 0),
  commitment_months INTEGER DEFAULT 1 NOT NULL CHECK (commitment_months > 0),

  -- Conditions
  target_audience TEXT[],
  restrictions TEXT,
  included_services TEXT[],

  -- Statut
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,

  -- Performance commerciale
  active_subscriptions_count INTEGER DEFAULT 0 NOT NULL CHECK (active_subscriptions_count >= 0),
  monthly_revenue DECIMAL(10,2) CHECK (monthly_revenue IS NULL OR monthly_revenue >= 0),

  -- Méta-données
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_gym_offers_gym
  ON gym_offers(gym_id);

CREATE INDEX IF NOT EXISTS idx_gym_offers_audit
  ON gym_offers(audit_id);

CREATE INDEX IF NOT EXISTS idx_gym_offers_type
  ON gym_offers(offer_type);

CREATE INDEX IF NOT EXISTS idx_gym_offers_active
  ON gym_offers(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_gym_offers_featured
  ON gym_offers(is_featured) WHERE is_featured = true;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE gym_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read offers for their own gyms"
  ON gym_offers
  FOR SELECT
  TO authenticated
  USING (
    gym_id IN (
      SELECT id FROM gyms WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create offers for their own gyms"
  ON gym_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    gym_id IN (
      SELECT id FROM gyms WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update offers for their own gyms"
  ON gym_offers
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

CREATE POLICY "Users can delete offers for their own gyms"
  ON gym_offers
  FOR DELETE
  TO authenticated
  USING (
    gym_id IN (
      SELECT id FROM gyms WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_gym_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gym_offers_updated_at
  BEFORE UPDATE ON gym_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_gym_offers_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE gym_offers IS 'Catalogue complet des offres commerciales de chaque salle pour analyse tarifaire détaillée';
COMMENT ON COLUMN gym_offers.offer_type IS 'Type d''offre: unlimited, limited_sessions, trial, student, couple, family, corporate, off_peak, early_bird, annual, premium, pt_package, class_pack';
COMMENT ON COLUMN gym_offers.session_count IS 'Nombre de séances incluses (NULL si illimité)';
COMMENT ON COLUMN gym_offers.duration_months IS 'Durée de validité de l''offre en mois';
COMMENT ON COLUMN gym_offers.commitment_months IS 'Engagement minimum requis en mois';
COMMENT ON COLUMN gym_offers.active_subscriptions_count IS 'Nombre de membres ayant souscrit cette offre actuellement';
COMMENT ON COLUMN gym_offers.monthly_revenue IS 'Revenu mensuel récurrent généré par cette offre';
