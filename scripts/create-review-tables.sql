-- Create customer_reviews table for storing Amazon reviews
CREATE TABLE IF NOT EXISTS customer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asin VARCHAR(20) NOT NULL,
  review_id VARCHAR(50) NOT NULL,
  title TEXT,
  text TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  verified_purchase BOOLEAN DEFAULT false,
  helpful_votes INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  reviewer_name VARCHAR(255),
  reviewer_profile_url TEXT,
  review_date TIMESTAMP,
  variant_data JSONB,
  images TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(asin, review_id)
);

-- Create social_insights table for Reddit and other social media data
CREATE TABLE IF NOT EXISTS social_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asin VARCHAR(20),
  platform VARCHAR(50) NOT NULL, -- 'reddit', 'twitter', etc
  search_queries TEXT[],
  total_posts INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  engagement_score NUMERIC(10, 2),
  sentiment_distribution JSONB, -- {positive: 0.4, negative: 0.2, neutral: 0.4}
  top_subreddits JSONB[], -- Array of {name, count, avgScore}
  temporal_trends JSONB[], -- Array of {date, mentions, sentiment}
  top_mentions JSONB[], -- Array of {text, count, context}
  competitor_mentions JSONB, -- {brand: count}
  raw_sample JSONB, -- Sample of raw posts
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(asin, platform)
);

-- Create indexes for performance
CREATE INDEX idx_customer_reviews_asin ON customer_reviews(asin);
CREATE INDEX idx_customer_reviews_rating ON customer_reviews(rating);
CREATE INDEX idx_customer_reviews_date ON customer_reviews(review_date DESC);
CREATE INDEX idx_customer_reviews_verified ON customer_reviews(verified_purchase);

CREATE INDEX idx_social_insights_asin ON social_insights(asin);
CREATE INDEX idx_social_insights_platform ON social_insights(platform);
CREATE INDEX idx_social_insights_updated ON social_insights(updated_at DESC);

-- Add RLS policies
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_insights ENABLE ROW LEVEL SECURITY;

-- Allow all operations in development (adjust for production)
CREATE POLICY "Allow all operations on customer_reviews" ON customer_reviews
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on social_insights" ON social_insights
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add public read access for customer reviews (for product pages)
CREATE POLICY "Public read access for customer_reviews" ON customer_reviews
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Public read access for social_insights" ON social_insights
  FOR SELECT TO anon
  USING (true);