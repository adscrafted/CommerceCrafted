-- Fix RLS policies for customer_reviews and amazon_review_cache tables

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can insert reviews" ON customer_reviews;
DROP POLICY IF EXISTS "Service role can update reviews" ON customer_reviews;
DROP POLICY IF EXISTS "Service role can delete reviews" ON customer_reviews;
DROP POLICY IF EXISTS "Service role full access" ON customer_reviews;
DROP POLICY IF EXISTS "Users can read reviews" ON customer_reviews;

DROP POLICY IF EXISTS "Service role can manage cache" ON amazon_review_cache;
DROP POLICY IF EXISTS "Service role full access" ON amazon_review_cache;

-- Enable RLS on tables
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE amazon_review_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for customer_reviews
-- Allow service role to do everything
CREATE POLICY "Service role full access" ON customer_reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read reviews
CREATE POLICY "Users can read reviews" ON customer_reviews
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anon users to read reviews (for public pages)
CREATE POLICY "Anon can read reviews" ON customer_reviews
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for amazon_review_cache
-- Allow service role to do everything
CREATE POLICY "Service role full access" ON amazon_review_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read cache
CREATE POLICY "Users can read cache" ON amazon_review_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Also fix market_intelligence table if needed
ALTER TABLE market_intelligence ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role full access" ON market_intelligence;
DROP POLICY IF EXISTS "Users can read intelligence" ON market_intelligence;

-- Allow service role to do everything
CREATE POLICY "Service role full access" ON market_intelligence
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read market intelligence
CREATE POLICY "Users can read intelligence" ON market_intelligence
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anon users to read market intelligence (for public pages)
CREATE POLICY "Anon can read intelligence" ON market_intelligence
  FOR SELECT
  TO anon
  USING (true);