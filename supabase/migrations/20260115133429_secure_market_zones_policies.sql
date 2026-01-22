/*
  # Secure Market Zones RLS Policies

  ## Description
  Fix security warning: market_zones table had overly permissive policies (WITH CHECK true / USING true)
  that bypassed row-level security. Making it read-only for regular authenticated users.

  ## Changes
  - Remove overly permissive INSERT/UPDATE/DELETE policies
  - Keep SELECT policy for read access
  - Market zones is reference data that shouldn't be modified by regular users

  ## Security Impact
  - Eliminates "RLS Policy Always True" security warnings
  - Market zones data is now protected from unauthorized modifications
  - All authenticated users can still read the data
*/

-- ============================================================================
-- Remove Overly Permissive Policies
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can create market zones" ON market_zones;
DROP POLICY IF EXISTS "Authenticated users can update market zones" ON market_zones;
DROP POLICY IF EXISTS "Authenticated users can delete market zones" ON market_zones;

-- ============================================================================
-- Keep Read-Only Access
-- ============================================================================

-- The SELECT policy "Authenticated users can read active market zones" already exists
-- and is properly restrictive (USING is_active = true)

-- ============================================================================
-- Documentation
-- ============================================================================

COMMENT ON TABLE market_zones IS 'Classification des zones de marché CrossFit (lecture seule pour utilisateurs réguliers)';
