-- Drop redundant columns from niches table
-- These values should be calculated dynamically rather than stored

ALTER TABLE niches
  DROP COLUMN IF EXISTS avg_opportunity_score,
  DROP COLUMN IF EXISTS avg_competition_score,
  DROP COLUMN IF EXISTS avg_demand_score,
  DROP COLUMN IF EXISTS avg_feasibility_score,
  DROP COLUMN IF EXISTS avg_timing_score,
  DROP COLUMN IF EXISTS failed_products,
  DROP COLUMN IF EXISTS notes;

-- Add a comment explaining why these were removed
COMMENT ON TABLE niches IS 'Stores niche collections. Average scores are calculated dynamically from niches_overall_analysis table. Notes can be stored elsewhere if needed.';