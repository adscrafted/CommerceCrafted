-- Update existing niches table with missing columns

-- Add marketplace column if it doesn't exist
ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS marketplace VARCHAR(10) DEFAULT 'US';

-- Add processing info columns if they don't exist
ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS processing_progress JSONB;

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS process_started_at TIMESTAMP;

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS process_completed_at TIMESTAMP;

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add aggregated analytics columns if they don't exist
ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS avg_opportunity_score NUMERIC(5, 2);

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS avg_competition_score NUMERIC(5, 2);

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS avg_demand_score NUMERIC(5, 2);

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS avg_feasibility_score NUMERIC(5, 2);

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS avg_timing_score NUMERIC(5, 2);

-- Add financial metrics columns if they don't exist
ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS avg_price NUMERIC(10, 2);

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS avg_bsr INTEGER;

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS total_monthly_revenue NUMERIC(12, 2);

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS market_size NUMERIC(12, 2);

-- Add competition metrics columns if they don't exist
ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS total_reviews INTEGER;

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS total_keywords INTEGER;

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS niche_keywords TEXT;

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS competition_level VARCHAR(20);

-- Add optional fields if they don't exist
ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS failed_products INTEGER DEFAULT 0;

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE niches 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'niches_status_check') THEN
        ALTER TABLE niches ADD CONSTRAINT niches_status_check 
        CHECK (status IN ('pending', 'processing', 'completed', 'failed'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'niches_competition_level_check') THEN
        ALTER TABLE niches ADD CONSTRAINT niches_competition_level_check 
        CHECK (competition_level IN ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'));
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_niches_status ON niches(status);
CREATE INDEX IF NOT EXISTS idx_niches_created_at ON niches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_niches_marketplace ON niches(marketplace);
CREATE INDEX IF NOT EXISTS idx_niches_competition_level ON niches(competition_level);

-- Add/update trigger for updated_at if needed
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_niches_updated_at ON niches;

CREATE TRIGGER update_niches_updated_at 
  BEFORE UPDATE ON niches 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();