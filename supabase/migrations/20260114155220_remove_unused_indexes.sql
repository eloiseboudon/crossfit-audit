/*
  # Remove Unused Indexes

  ## Summary
  Removes database indexes that are not being utilized, reducing unnecessary overhead
  and improving database maintenance performance.

  ## Changes Made

  ### Indexes Removed
  
  **audits table:**
  - `idx_audits_gym_id` - Foreign key index (covered by FK constraint)
  - `idx_audits_status` - Status filter index (low cardinality, not used)

  **answers table:**
  - `idx_answers_audit_id` - Redundant (covered by composite index)
  - `idx_answers_block_code` - Redundant (covered by composite index)

  **kpis table:**
  - `idx_kpis_audit_id` - Redundant (covered by composite index)
  - `idx_kpis_composite` - Unused composite index

  **scores table:**
  - `idx_scores_audit_id` - Redundant (covered by composite index)
  - `idx_scores_composite` - Unused composite index

  **recommendations table:**
  - `idx_recommendations_priority` - Low cardinality, not used

  **market_benchmarks table:**
  - `idx_market_benchmarks_code` - Redundant (covered by UNIQUE constraint)
  - `idx_market_benchmarks_category` - Not used

  ## Performance Impact
  - Reduces storage overhead
  - Improves INSERT/UPDATE/DELETE performance
  - Simplifies index maintenance
  - Composite indexes and UNIQUE constraints still provide query optimization where needed

  ## Notes
  - Indexes can be recreated later if query patterns change
  - Remaining indexes are sufficient for current access patterns
*/

-- Drop unused indexes on audits table
DROP INDEX IF EXISTS idx_audits_gym_id;
DROP INDEX IF EXISTS idx_audits_status;

-- Drop unused indexes on answers table
DROP INDEX IF EXISTS idx_answers_audit_id;
DROP INDEX IF EXISTS idx_answers_block_code;

-- Drop unused indexes on kpis table
DROP INDEX IF EXISTS idx_kpis_audit_id;
DROP INDEX IF EXISTS idx_kpis_composite;

-- Drop unused indexes on scores table
DROP INDEX IF EXISTS idx_scores_audit_id;
DROP INDEX IF EXISTS idx_scores_composite;

-- Drop unused index on recommendations table
DROP INDEX IF EXISTS idx_recommendations_priority;

-- Drop unused indexes on market_benchmarks table
DROP INDEX IF EXISTS idx_market_benchmarks_code;
DROP INDEX IF EXISTS idx_market_benchmarks_category;