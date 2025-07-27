-- Create market_intelligence table
CREATE TABLE IF NOT EXISTS market_intelligence (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id VARCHAR(20) REFERENCES product(asin),
  niche_id VARCHAR(255) REFERENCES niches(id),
  customer_personas JSONB DEFAULT '[]'::jsonb,
  voice_of_customer JSONB DEFAULT '{}'::jsonb,
  voice_of_customer_enhanced JSONB,
  emotional_triggers JSONB DEFAULT '[]'::jsonb,
  competitor_analysis JSONB DEFAULT '{}'::jsonb,
  raw_reviews JSONB DEFAULT '[]'::jsonb,
  total_reviews_analyzed INTEGER DEFAULT 0,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_market_intelligence_product_id ON market_intelligence(product_id);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_niche_id ON market_intelligence(niche_id);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_analysis_date ON market_intelligence(analysis_date);

-- Create RLS policies
ALTER TABLE market_intelligence ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "market_intelligence_read_policy" ON market_intelligence
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow insert/update/delete for admin users only
CREATE POLICY "market_intelligence_write_policy" ON market_intelligence
  FOR ALL
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  ));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_market_intelligence_updated_at 
  BEFORE UPDATE ON market_intelligence 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();