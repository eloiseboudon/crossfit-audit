/*
  # Add Foreign Key Indexes for Performance

  ## Description
  Adding indexes on all foreign key columns to optimize join performance and foreign key constraint checks.
  Foreign keys without indexes can cause significant performance degradation in queries involving joins.

  ## New Indexes
  1. **audits table**
     - Index on `gym_id` (FK to gyms table)

  2. **competitive_pricing_analysis table**
     - Index on `audit_id` (FK to audits table)
     - Index on `market_zone_id` (FK to market_zones table)

  3. **competitors table**
     - Index on `gym_id` (FK to gyms table)
     - Index on `market_zone_id` (FK to market_zones table)

  4. **gym_offers table**
     - Index on `gym_id` (FK to gyms table)
     - Index on `audit_id` (FK to audits table)

  5. **gyms table**
     - Index on `user_id` (FK to auth.users table)

  ## Performance Impact
  - Significantly faster JOIN operations on foreign key relationships
  - Improved query performance when filtering by foreign keys in WHERE clauses
  - Faster foreign key constraint validation during INSERT/UPDATE operations
  - Better support for RLS policies that check ownership via foreign key joins

  ## Notes
  - All indexes use B-tree (default), which is optimal for equality and range queries
  - These indexes will be automatically maintained by PostgreSQL
*/

-- ============================================================================
-- AUDITS TABLE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_audits_gym_id 
  ON audits(gym_id);

-- ============================================================================
-- COMPETITIVE_PRICING_ANALYSIS TABLE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_competitive_pricing_analysis_audit_id 
  ON competitive_pricing_analysis(audit_id);

CREATE INDEX IF NOT EXISTS idx_competitive_pricing_analysis_market_zone_id 
  ON competitive_pricing_analysis(market_zone_id);

-- ============================================================================
-- COMPETITORS TABLE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_competitors_gym_id 
  ON competitors(gym_id);

CREATE INDEX IF NOT EXISTS idx_competitors_market_zone_id 
  ON competitors(market_zone_id);

-- ============================================================================
-- GYM_OFFERS TABLE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_gym_offers_gym_id 
  ON gym_offers(gym_id);

CREATE INDEX IF NOT EXISTS idx_gym_offers_audit_id 
  ON gym_offers(audit_id);

-- ============================================================================
-- GYMS TABLE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_gyms_user_id 
  ON gyms(user_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON INDEX idx_audits_gym_id IS 'Optimizes queries joining audits with gyms';
COMMENT ON INDEX idx_competitive_pricing_analysis_audit_id IS 'Optimizes queries joining pricing analysis with audits';
COMMENT ON INDEX idx_competitive_pricing_analysis_market_zone_id IS 'Optimizes queries joining pricing analysis with market zones';
COMMENT ON INDEX idx_competitors_gym_id IS 'Optimizes queries joining competitors with gyms';
COMMENT ON INDEX idx_competitors_market_zone_id IS 'Optimizes queries joining competitors with market zones';
COMMENT ON INDEX idx_gym_offers_gym_id IS 'Optimizes queries joining gym offers with gyms';
COMMENT ON INDEX idx_gym_offers_audit_id IS 'Optimizes queries joining gym offers with audits';
COMMENT ON INDEX idx_gyms_user_id IS 'Optimizes queries joining gyms with users and RLS policy checks';
