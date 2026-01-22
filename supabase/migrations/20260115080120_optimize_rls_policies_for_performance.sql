/*
  # Optimize RLS Policies for Performance

  ## Summary
  This migration optimizes all Row Level Security (RLS) policies to prevent re-evaluation
  of auth.uid() for each row by wrapping it in a SELECT statement. This significantly
  improves query performance at scale.

  ## Changes Made

  ### Performance Optimization Pattern
  Changed all occurrences of `auth.uid()` to `(select auth.uid())` in RLS policies.
  
  **Why this matters:**
  - Without SELECT: auth.uid() is called once per row being evaluated
  - With SELECT: auth.uid() is called once per query and cached
  - At scale: This can mean the difference between 1 function call vs 10,000+ calls

  ### Tables Updated
  1. **gyms** - 4 policies optimized (SELECT, INSERT, UPDATE, DELETE)
  2. **audits** - 4 policies optimized (SELECT, INSERT, UPDATE, DELETE)
  3. **answers** - 4 policies optimized (SELECT, INSERT, UPDATE, DELETE)
  4. **kpis** - 4 policies optimized (SELECT, INSERT, UPDATE, DELETE)
  5. **scores** - 4 policies optimized (SELECT, INSERT, UPDATE, DELETE)
  6. **recommendations** - 4 policies optimized (SELECT, INSERT, UPDATE, DELETE)

  ## Security Impact
  - No change to security model - policies remain equally restrictive
  - Still enforces proper ownership through user_id and relationships

  ## Performance Impact
  - Dramatically reduces auth function calls in large result sets
  - Improves query execution time for all authenticated operations
  - Recommended best practice by Supabase for production workloads

  ## Reference
  https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
*/

-- =============================================================================
-- DROP ALL EXISTING POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Users can view their own gyms" ON gyms;
DROP POLICY IF EXISTS "Users can create their own gyms" ON gyms;
DROP POLICY IF EXISTS "Users can update their own gyms" ON gyms;
DROP POLICY IF EXISTS "Users can delete their own gyms" ON gyms;

DROP POLICY IF EXISTS "Users can view audits for their gyms" ON audits;
DROP POLICY IF EXISTS "Users can create audits for their gyms" ON audits;
DROP POLICY IF EXISTS "Users can update audits for their gyms" ON audits;
DROP POLICY IF EXISTS "Users can delete audits for their gyms" ON audits;

DROP POLICY IF EXISTS "Users can view answers for their audits" ON answers;
DROP POLICY IF EXISTS "Users can create answers for their audits" ON answers;
DROP POLICY IF EXISTS "Users can update answers for their audits" ON answers;
DROP POLICY IF EXISTS "Users can delete answers for their audits" ON answers;

DROP POLICY IF EXISTS "Users can view KPIs for their audits" ON kpis;
DROP POLICY IF EXISTS "Users can create KPIs for their audits" ON kpis;
DROP POLICY IF EXISTS "Users can update KPIs for their audits" ON kpis;
DROP POLICY IF EXISTS "Users can delete KPIs for their audits" ON kpis;

DROP POLICY IF EXISTS "Users can view scores for their audits" ON scores;
DROP POLICY IF EXISTS "Users can create scores for their audits" ON scores;
DROP POLICY IF EXISTS "Users can update scores for their audits" ON scores;
DROP POLICY IF EXISTS "Users can delete scores for their audits" ON scores;

DROP POLICY IF EXISTS "Users can view recommendations for their audits" ON recommendations;
DROP POLICY IF EXISTS "Users can create recommendations for their audits" ON recommendations;
DROP POLICY IF EXISTS "Users can update recommendations for their audits" ON recommendations;
DROP POLICY IF EXISTS "Users can delete recommendations for their audits" ON recommendations;

-- =============================================================================
-- CREATE OPTIMIZED RLS POLICIES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- GYMS TABLE POLICIES (Direct Ownership)
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can view their own gyms"
  ON gyms FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own gyms"
  ON gyms FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own gyms"
  ON gyms FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own gyms"
  ON gyms FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

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
      AND gyms.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create audits for their gyms"
  ON audits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = audits.gym_id
      AND gyms.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update audits for their gyms"
  ON audits FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = audits.gym_id
      AND gyms.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = audits.gym_id
      AND gyms.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete audits for their gyms"
  ON audits FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gyms
      WHERE gyms.id = audits.gym_id
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = answers.audit_id
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = kpis.audit_id
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = scores.audit_id
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      JOIN gyms ON gyms.id = audits.gym_id
      WHERE audits.id = recommendations.audit_id
      AND gyms.user_id = (select auth.uid())
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
      AND gyms.user_id = (select auth.uid())
    )
  );