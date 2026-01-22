/*
  # Fix Security Issues - Add Ownership Model and Proper RLS

  ## Summary
  This migration fixes critical security vulnerabilities by implementing proper ownership
  tracking and restrictive RLS policies, plus adds missing indexes for query performance.

  ## Changes Made

  ### 1. Schema Changes
  - Add `user_id` column to `gyms` table to track ownership
  - Add missing index on `audits.gym_id` foreign key for query performance

  ### 2. RLS Policy Improvements
  All tables now have proper restrictive RLS policies instead of "always true" policies:

  **gyms table:**
  - Users can only view, create, update, and delete their own gyms
  - Ownership tracked via `user_id = auth.uid()`

  **audits table:**
  - Users can only access audits for gyms they own
  - Ownership checked through gym relationship

  **answers, kpis, scores, recommendations tables:**
  - Users can only access data for audits they own (through gym ownership)
  - Cascading ownership check: audit -> gym -> user

  **market_benchmarks table:**
  - Readable by all authenticated users (reference data)
  - Only service role can modify (admin-only writes)

  ## Security Impact
  - Eliminates "RLS Policy Always True" vulnerabilities on all 7 tables
  - Implements proper authentication checks using `auth.uid()`
  - Enforces ownership at database level
  - Prevents unauthorized access to sensitive audit data

  ## Performance Impact
  - Added index on `audits.gym_id` improves join performance
  - Optimized queries for ownership checks

  ## Notes
  - Existing gyms will have NULL user_id and won't be accessible until ownership is assigned
  - New gyms created through the application will automatically set user_id = auth.uid()
  - Service role bypasses RLS for admin operations
*/

-- =============================================================================
-- SCHEMA CHANGES
-- =============================================================================

-- Add user_id to gyms table for ownership tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gyms' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE gyms ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_gyms_user_id ON gyms(user_id);
  END IF;
END $$;

-- Add missing index on audits.gym_id for query performance
CREATE INDEX IF NOT EXISTS idx_audits_gym_id ON audits(gym_id);

-- =============================================================================
-- DROP ALL INSECURE POLICIES
-- =============================================================================

-- Drop old "Allow all operations" policies
DROP POLICY IF EXISTS "Allow all operations on gyms" ON gyms;
DROP POLICY IF EXISTS "Allow all operations on audits" ON audits;
DROP POLICY IF EXISTS "Allow all operations on answers" ON answers;
DROP POLICY IF EXISTS "Allow all operations on kpis" ON kpis;
DROP POLICY IF EXISTS "Allow all operations on scores" ON scores;
DROP POLICY IF EXISTS "Allow all operations on recommendations" ON recommendations;
DROP POLICY IF EXISTS "Allow all operations on market_benchmarks" ON market_benchmarks;

-- Drop old separate policies if they exist
DROP POLICY IF EXISTS "Gyms are viewable by everyone" ON gyms;
DROP POLICY IF EXISTS "Gyms can be created by everyone" ON gyms;
DROP POLICY IF EXISTS "Gyms can be updated by everyone" ON gyms;
DROP POLICY IF EXISTS "Gyms can be deleted by everyone" ON gyms;

DROP POLICY IF EXISTS "Audits are viewable by everyone" ON audits;
DROP POLICY IF EXISTS "Audits can be created by everyone" ON audits;
DROP POLICY IF EXISTS "Audits can be updated by everyone" ON audits;
DROP POLICY IF EXISTS "Audits can be deleted by everyone" ON audits;

DROP POLICY IF EXISTS "Answers are viewable by everyone" ON answers;
DROP POLICY IF EXISTS "Answers can be created by everyone" ON answers;
DROP POLICY IF EXISTS "Answers can be updated by everyone" ON answers;
DROP POLICY IF EXISTS "Answers can be deleted by everyone" ON answers;

DROP POLICY IF EXISTS "KPIs are viewable by everyone" ON kpis;
DROP POLICY IF EXISTS "KPIs can be created by everyone" ON kpis;
DROP POLICY IF EXISTS "KPIs can be updated by everyone" ON kpis;
DROP POLICY IF EXISTS "KPIs can be deleted by everyone" ON kpis;

DROP POLICY IF EXISTS "Scores are viewable by everyone" ON scores;
DROP POLICY IF EXISTS "Scores can be created by everyone" ON scores;
DROP POLICY IF EXISTS "Scores can be updated by everyone" ON scores;
DROP POLICY IF EXISTS "Scores can be deleted by everyone" ON scores;

DROP POLICY IF EXISTS "Recommendations are viewable by everyone" ON recommendations;
DROP POLICY IF EXISTS "Recommendations can be created by everyone" ON recommendations;
DROP POLICY IF EXISTS "Recommendations can be updated by everyone" ON recommendations;
DROP POLICY IF EXISTS "Recommendations can be deleted by everyone" ON recommendations;

DROP POLICY IF EXISTS "Market benchmarks are viewable by everyone" ON market_benchmarks;
DROP POLICY IF EXISTS "Market benchmarks can be created by everyone" ON market_benchmarks;
DROP POLICY IF EXISTS "Market benchmarks can be updated by everyone" ON market_benchmarks;
DROP POLICY IF EXISTS "Market benchmarks can be deleted by everyone" ON market_benchmarks;

-- =============================================================================
-- CREATE SECURE RLS POLICIES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- GYMS TABLE POLICIES (Direct Ownership)
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can view their own gyms"
  ON gyms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gyms"
  ON gyms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gyms"
  ON gyms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gyms"
  ON gyms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- AUDITS TABLE POLICIES (Ownership through gym)
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can view audits for their gyms"
  ON audits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = audits.gym_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create audits for their gyms"
  ON audits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = audits.gym_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update audits for their gyms"
  ON audits FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = audits.gym_id
      AND gyms.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = audits.gym_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete audits for their gyms"
  ON audits FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = audits.gym_id
      AND gyms.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- ANSWERS TABLE POLICIES (Ownership through audit -> gym)
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can view answers for their audits"
  ON answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = answers.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create answers for their audits"
  ON answers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = answers.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update answers for their audits"
  ON answers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = answers.audit_id
      AND gyms.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = answers.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete answers for their audits"
  ON answers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = answers.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- KPIS TABLE POLICIES (Ownership through audit -> gym)
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can view KPIs for their audits"
  ON kpis FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = kpis.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create KPIs for their audits"
  ON kpis FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = kpis.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update KPIs for their audits"
  ON kpis FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = kpis.audit_id
      AND gyms.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = kpis.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete KPIs for their audits"
  ON kpis FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = kpis.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- SCORES TABLE POLICIES (Ownership through audit -> gym)
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can view scores for their audits"
  ON scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = scores.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create scores for their audits"
  ON scores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = scores.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scores for their audits"
  ON scores FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = scores.audit_id
      AND gyms.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = scores.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scores for their audits"
  ON scores FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = scores.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RECOMMENDATIONS TABLE POLICIES (Ownership through audit -> gym)
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can view recommendations for their audits"
  ON recommendations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = recommendations.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create recommendations for their audits"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = recommendations.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update recommendations for their audits"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = recommendations.audit_id
      AND gyms.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = recommendations.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete recommendations for their audits"
  ON recommendations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = recommendations.audit_id
      AND gyms.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- MARKET BENCHMARKS TABLE POLICIES (Reference Data - Read-only for users)
-- ---------------------------------------------------------------------------

CREATE POLICY "Authenticated users can view market benchmarks"
  ON market_benchmarks FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can modify market benchmarks (admin operations)
-- No INSERT/UPDATE/DELETE policies for regular users