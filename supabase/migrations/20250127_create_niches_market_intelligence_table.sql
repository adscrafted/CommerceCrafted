-- Create niches_market_intelligence table
CREATE TABLE IF NOT EXISTS niches_market_intelligence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  niche_id VARCHAR(255) REFERENCES niches(id) ON DELETE CASCADE,
  customer_personas JSONB DEFAULT '[]'::jsonb,
  voice_of_customer JSONB DEFAULT '{}'::jsonb,
  voice_of_customer_enhanced JSONB,
  emotional_triggers JSONB DEFAULT '[]'::jsonb,
  competitor_analysis JSONB DEFAULT '{}'::jsonb,
  total_reviews_analyzed INTEGER DEFAULT 0,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(niche_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_niches_market_intelligence_niche_id ON niches_market_intelligence(niche_id);
CREATE INDEX IF NOT EXISTS idx_niches_market_intelligence_analysis_date ON niches_market_intelligence(analysis_date);

-- Enable Row Level Security
ALTER TABLE niches_market_intelligence ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow read access to all authenticated users
CREATE POLICY "niches_market_intelligence_read_policy" ON niches_market_intelligence
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow write access for admin users only
CREATE POLICY "niches_market_intelligence_write_policy" ON niches_market_intelligence
  FOR ALL
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  ));

-- Create updated_at trigger
CREATE TRIGGER update_niches_market_intelligence_updated_at 
  BEFORE UPDATE ON niches_market_intelligence 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();