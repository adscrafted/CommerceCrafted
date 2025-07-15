-- Create niches table for managing product niches
CREATE TABLE IF NOT EXISTS niches (
  id VARCHAR(255) PRIMARY KEY,
  niche_name VARCHAR(255) NOT NULL,
  asins TEXT NOT NULL, -- Comma-separated list of ASINs
  total_products INTEGER DEFAULT 0,
  marketplace VARCHAR(10) DEFAULT 'US',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Processing info
  processing_progress JSONB,
  process_started_at TIMESTAMP,
  process_completed_at TIMESTAMP,
  error_message TEXT,
  
  -- Aggregated analytics
  avg_opportunity_score NUMERIC(5, 2),
  avg_competition_score NUMERIC(5, 2),
  avg_demand_score NUMERIC(5, 2),
  avg_feasibility_score NUMERIC(5, 2),
  avg_timing_score NUMERIC(5, 2),
  
  -- Financial metrics
  avg_price NUMERIC(10, 2),
  avg_bsr INTEGER,
  total_monthly_revenue NUMERIC(12, 2),
  market_size NUMERIC(12, 2),
  
  -- Competition metrics
  total_reviews INTEGER,
  total_keywords INTEGER,
  niche_keywords TEXT, -- Top keywords comma-separated
  competition_level VARCHAR(20) CHECK (competition_level IN ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH')),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Optional future fields
  failed_products INTEGER DEFAULT 0,
  notes TEXT,
  tags TEXT[] DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX idx_niches_status ON niches(status);
CREATE INDEX idx_niches_created_at ON niches(created_at DESC);
CREATE INDEX idx_niches_marketplace ON niches(marketplace);
CREATE INDEX idx_niches_competition_level ON niches(competition_level);

-- Enable RLS
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin users can manage all niches"
  ON niches
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'ADMIN'
    )
  );

CREATE POLICY "Users can view completed niches"
  ON niches
  FOR SELECT
  USING (status = 'completed');

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_niches_updated_at 
  BEFORE UPDATE ON niches 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();