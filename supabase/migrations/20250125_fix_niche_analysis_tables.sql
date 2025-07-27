-- Fix niche analysis tables structure
-- 1. Drop the niche_overall table (it's redundant)
-- 2. Rename niche_overall_analysis to niches_overall_analysis

-- Drop the niche_overall table if it exists
DROP TABLE IF EXISTS niche_overall CASCADE;

-- Rename niche_overall_analysis to niches_overall_analysis
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'niche_overall_analysis') THEN
    ALTER TABLE niche_overall_analysis RENAME TO niches_overall_analysis;
  END IF;
END $$;

-- Ensure the niches_overall_analysis table has the correct structure
ALTER TABLE niches_overall_analysis
  DROP COLUMN IF EXISTS financial_analysis,
  DROP COLUMN IF EXISTS market_analysis,
  DROP COLUMN IF EXISTS competition_analysis,
  DROP COLUMN IF EXISTS keyword_analysis,
  DROP COLUMN IF EXISTS review_analysis,
  DROP COLUMN IF EXISTS supply_chain_analysis,
  DROP COLUMN IF EXISTS ai_generated_content,
  DROP COLUMN IF EXISTS human_edited_content,
  DROP COLUMN IF EXISTS focus_graph_data;

-- Add new score columns only if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niches_overall_analysis' AND column_name='market_intelligence_score') THEN
    ALTER TABLE niches_overall_analysis ADD COLUMN market_intelligence_score DECIMAL(3,2) DEFAULT 0 CHECK (market_intelligence_score >= 0 AND market_intelligence_score <= 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niches_overall_analysis' AND column_name='demand_score') THEN
    ALTER TABLE niches_overall_analysis ADD COLUMN demand_score DECIMAL(3,2) DEFAULT 0 CHECK (demand_score >= 0 AND demand_score <= 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niches_overall_analysis' AND column_name='competition_score') THEN
    ALTER TABLE niches_overall_analysis ADD COLUMN competition_score DECIMAL(3,2) DEFAULT 0 CHECK (competition_score >= 0 AND competition_score <= 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niches_overall_analysis' AND column_name='keywords_score') THEN
    ALTER TABLE niches_overall_analysis ADD COLUMN keywords_score DECIMAL(3,2) DEFAULT 0 CHECK (keywords_score >= 0 AND keywords_score <= 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niches_overall_analysis' AND column_name='overall_score') THEN
    ALTER TABLE niches_overall_analysis ADD COLUMN overall_score DECIMAL(3,2) DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niches_overall_analysis' AND column_name='financial_score') THEN
    ALTER TABLE niches_overall_analysis ADD COLUMN financial_score DECIMAL(3,2) DEFAULT 0 CHECK (financial_score >= 0 AND financial_score <= 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niches_overall_analysis' AND column_name='listing_optimization_score') THEN
    ALTER TABLE niches_overall_analysis ADD COLUMN listing_optimization_score DECIMAL(3,2) DEFAULT 0 CHECK (listing_optimization_score >= 0 AND listing_optimization_score <= 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niches_overall_analysis' AND column_name='launch_strategy_score') THEN
    ALTER TABLE niches_overall_analysis ADD COLUMN launch_strategy_score DECIMAL(3,2) DEFAULT 0 CHECK (launch_strategy_score >= 0 AND launch_strategy_score <= 1);
  END IF;
END $$;

-- Remove the old score columns that are being replaced
ALTER TABLE niches_overall_analysis
  DROP COLUMN IF EXISTS opportunity_score,
  DROP COLUMN IF EXISTS feasibility_score,
  DROP COLUMN IF EXISTS timing_score;

-- Ensure niche_id column exists and has proper foreign key
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niches_overall_analysis' AND column_name='niche_id') THEN
    ALTER TABLE niches_overall_analysis ADD COLUMN niche_id TEXT NOT NULL;
  END IF;
  
  -- Add foreign key constraint
  ALTER TABLE niches_overall_analysis DROP CONSTRAINT IF EXISTS niches_overall_analysis_niche_id_fkey;
  ALTER TABLE niches_overall_analysis ADD CONSTRAINT niches_overall_analysis_niche_id_fkey 
    FOREIGN KEY (niche_id) REFERENCES niches(id) ON DELETE CASCADE;
END $$;