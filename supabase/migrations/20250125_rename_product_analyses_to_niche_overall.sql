-- Check if product_analyses table exists and rename it
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_analyses') THEN
    ALTER TABLE product_analyses RENAME TO niche_overall;
  END IF;
END $$;

-- Drop the old analysis columns
ALTER TABLE niche_overall
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
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niche_overall' AND column_name='market_intelligence_score') THEN
    ALTER TABLE niche_overall ADD COLUMN market_intelligence_score DECIMAL(3,2) DEFAULT 0 CHECK (market_intelligence_score >= 0 AND market_intelligence_score <= 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niche_overall' AND column_name='demand_score') THEN
    ALTER TABLE niche_overall ADD COLUMN demand_score DECIMAL(3,2) DEFAULT 0 CHECK (demand_score >= 0 AND demand_score <= 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niche_overall' AND column_name='competition_score') THEN
    ALTER TABLE niche_overall ADD COLUMN competition_score DECIMAL(3,2) DEFAULT 0 CHECK (competition_score >= 0 AND competition_score <= 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niche_overall' AND column_name='keywords_score') THEN
    ALTER TABLE niche_overall ADD COLUMN keywords_score DECIMAL(3,2) DEFAULT 0 CHECK (keywords_score >= 0 AND keywords_score <= 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niche_overall' AND column_name='overall_score') THEN
    ALTER TABLE niche_overall ADD COLUMN overall_score DECIMAL(3,2) DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niche_overall' AND column_name='financial_score') THEN
    ALTER TABLE niche_overall ADD COLUMN financial_score DECIMAL(3,2) DEFAULT 0 CHECK (financial_score >= 0 AND financial_score <= 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niche_overall' AND column_name='listing_optimization_score') THEN
    ALTER TABLE niche_overall ADD COLUMN listing_optimization_score DECIMAL(3,2) DEFAULT 0 CHECK (listing_optimization_score >= 0 AND listing_optimization_score <= 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niche_overall' AND column_name='launch_strategy_score') THEN
    ALTER TABLE niche_overall ADD COLUMN launch_strategy_score DECIMAL(3,2) DEFAULT 0 CHECK (launch_strategy_score >= 0 AND launch_strategy_score <= 1);
  END IF;
END $$;

-- Remove the old score columns that are being replaced
ALTER TABLE niche_overall
  DROP COLUMN IF EXISTS opportunity_score,
  DROP COLUMN IF EXISTS feasibility_score,
  DROP COLUMN IF EXISTS timing_score;

-- The columns we keep: id, product_id, created_at, updated_at, and the new score columns

-- Check if we need to add niche_id column (if this table was originally product-based)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niche_overall' AND column_name='niche_id') THEN
    -- If product_id exists, we need to either migrate the data or clear the table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niche_overall' AND column_name='product_id') THEN
      -- Since we're changing from product-based to niche-based analysis,
      -- and the data structure is completely different, we'll need to clear existing data
      -- WARNING: This will delete all existing data in the table
      TRUNCATE TABLE niche_overall;
      
      -- Drop the product_id foreign key if it exists
      ALTER TABLE niche_overall DROP CONSTRAINT IF EXISTS product_analyses_product_id_fkey;
      ALTER TABLE niche_overall DROP CONSTRAINT IF EXISTS niche_overall_product_id_fkey;
      
      -- Drop product_id column
      ALTER TABLE niche_overall DROP COLUMN IF EXISTS product_id;
      
      -- Add niche_id column (matching the type of niches.id which is TEXT)
      ALTER TABLE niche_overall ADD COLUMN niche_id TEXT NOT NULL;
    ELSE
      -- If product_id doesn't exist and niche_id doesn't exist, just add niche_id
      -- First check if table is empty
      IF EXISTS (SELECT 1 FROM niche_overall LIMIT 1) THEN
        -- Table has data but no niche_id or product_id - this is an invalid state
        -- We'll need to clear the table
        TRUNCATE TABLE niche_overall;
      END IF;
      ALTER TABLE niche_overall ADD COLUMN niche_id TEXT NOT NULL;
    END IF;
  END IF;
END $$;

-- Update any foreign key constraints if they exist
DO $$
BEGIN
  -- Only add the foreign key if niche_id column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niche_overall' AND column_name='niche_id') THEN
    ALTER TABLE niche_overall DROP CONSTRAINT IF EXISTS product_analyses_niche_id_fkey;
    ALTER TABLE niche_overall DROP CONSTRAINT IF EXISTS niche_overall_niche_id_fkey;
    ALTER TABLE niche_overall ADD CONSTRAINT niche_overall_niche_id_fkey 
      FOREIGN KEY (niche_id) REFERENCES niches(id) ON DELETE CASCADE;
  END IF;
END $$;