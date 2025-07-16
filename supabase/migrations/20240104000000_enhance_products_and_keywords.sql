-- Add new fields to products table for enhanced Keepa data
ALTER TABLE products ADD COLUMN IF NOT EXISTS length DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS width DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS height DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS frequently_purchased_asins TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variation_family TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS parent_asin VARCHAR(10);
ALTER TABLE products ADD COLUMN IF NOT EXISTS monthly_orders INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_urls TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS a_plus_content TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS fba_fees TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS referral_fee DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS bullet_points TEXT;

-- Update product_keywords table to match new Ads API structure
-- Remove unused columns
ALTER TABLE product_keywords DROP COLUMN IF EXISTS search_volume;
ALTER TABLE product_keywords DROP COLUMN IF EXISTS competition_level;
ALTER TABLE product_keywords DROP COLUMN IF EXISTS relevance_score;

-- Add new required columns for Ads API
ALTER TABLE product_keywords ADD COLUMN IF NOT EXISTS match_type VARCHAR(20) DEFAULT 'BROAD';
ALTER TABLE product_keywords ADD COLUMN IF NOT EXISTS suggested_bid DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE product_keywords ADD COLUMN IF NOT EXISTS estimated_clicks INTEGER DEFAULT 0;
ALTER TABLE product_keywords ADD COLUMN IF NOT EXISTS estimated_orders INTEGER DEFAULT 0;

-- Update the unique constraint to include match_type
ALTER TABLE product_keywords DROP CONSTRAINT IF EXISTS product_keywords_product_id_keyword_key;
ALTER TABLE product_keywords ADD CONSTRAINT product_keywords_unique UNIQUE (product_id, keyword, match_type);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_parent_asin ON products(parent_asin);
CREATE INDEX IF NOT EXISTS idx_products_monthly_orders ON products(monthly_orders);
CREATE INDEX IF NOT EXISTS idx_product_keywords_match_type ON product_keywords(match_type);
CREATE INDEX IF NOT EXISTS idx_product_keywords_suggested_bid ON product_keywords(suggested_bid);