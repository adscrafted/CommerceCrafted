import { createServiceSupabaseClient } from '@/lib/supabase/server'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function createTables() {
  const supabase = createServiceSupabaseClient()
  
  console.log('🚀 Creating missing tables directly...')
  
  // Test connection first
  console.log('Testing connection...')
  const { data: testData, error: testError } = await supabase
    .from('users')
    .select('count')
    .limit(1)
  
  if (testError) {
    console.error('❌ Connection failed:', testError)
    return
  }
  
  console.log('✅ Connection successful')
  
  // Check if tables already exist
  console.log('\nChecking existing tables...')
  
  const tablesToCheck = [
    'product_keywords',
    'product_customer_reviews', 
    'product_customer_reviews_cache'
  ]
  
  for (const table of tablesToCheck) {
    const { error } = await supabase
      .from(table)
      .select('*')
      .limit(1)
    
    if (error) {
      console.log(`❌ Table ${table} does not exist:`, error.message)
    } else {
      console.log(`✅ Table ${table} already exists`)
    }
  }
  
  console.log('\n📝 Tables need to be created manually in Supabase SQL Editor.')
  console.log('📋 Use the following SQL in the Supabase dashboard:')
  console.log('==========================================')
  
  const sql = `
-- Create missing tables for keywords collection and review scraping
-- These tables are required by the niche processor for full functionality

-- 1. product_keywords table - stores keywords collected for each product
CREATE TABLE IF NOT EXISTS product_keywords (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    asin TEXT NOT NULL,
    keyword TEXT NOT NULL,
    match_type TEXT DEFAULT 'BROAD',
    source TEXT DEFAULT 'suggested', -- 'suggested', 'recommendations', 'both'
    suggested_bid DECIMAL(10,2) DEFAULT 0,
    estimated_clicks INTEGER DEFAULT 0,
    estimated_orders INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique keywords per product
    UNIQUE(product_id, keyword, match_type)
);

-- 2. product_customer_reviews table - stores individual customer reviews
CREATE TABLE IF NOT EXISTS product_customer_reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    reviewer_id TEXT NOT NULL,
    reviewer_name TEXT,
    reviewer_url TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    review_date TIMESTAMP WITH TIME ZONE,
    verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    images JSONB DEFAULT '[]',
    variant TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique reviews per product
    UNIQUE(product_id, reviewer_id)
);

-- 3. product_customer_reviews_cache table - caches scraped review data
CREATE TABLE IF NOT EXISTS product_customer_reviews_cache (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    asin TEXT NOT NULL UNIQUE,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    reviews JSONB DEFAULT '[]',
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    compute_units INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_keywords_product_id ON product_keywords(product_id);
CREATE INDEX IF NOT EXISTS idx_product_keywords_asin ON product_keywords(asin);
CREATE INDEX IF NOT EXISTS idx_product_keywords_keyword ON product_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_product_keywords_source ON product_keywords(source);

CREATE INDEX IF NOT EXISTS idx_product_customer_reviews_product_id ON product_customer_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_customer_reviews_rating ON product_customer_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_customer_reviews_review_date ON product_customer_reviews(review_date);
CREATE INDEX IF NOT EXISTS idx_product_customer_reviews_verified_purchase ON product_customer_reviews(verified_purchase);

CREATE INDEX IF NOT EXISTS idx_product_customer_reviews_cache_asin ON product_customer_reviews_cache(asin);
CREATE INDEX IF NOT EXISTS idx_product_customer_reviews_cache_scraped_at ON product_customer_reviews_cache(scraped_at);

-- Add triggers to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_keywords_updated_at BEFORE UPDATE ON product_keywords FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_product_customer_reviews_cache_updated_at BEFORE UPDATE ON product_customer_reviews_cache FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
`
  
  console.log(sql)
  console.log('==========================================')
  console.log('\n🔗 Go to: https://bcqhovifscrhlkvdhkuf.supabase.co/project/default/sql/new')
  console.log('📋 Copy and paste the SQL above, then click "Run"')
}

createTables().catch(console.error)