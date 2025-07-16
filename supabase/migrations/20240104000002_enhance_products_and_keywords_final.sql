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

-- Create a new simplified product_keywords table for Ads API data
-- First, check if we need to drop the existing complex structure
DROP TABLE IF EXISTS product_keywords CASCADE;

-- Create new simplified product_keywords table with TEXT product_id to match products.id
CREATE TABLE product_keywords (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    match_type VARCHAR(20) DEFAULT 'BROAD',
    suggested_bid DECIMAL(10, 2) DEFAULT 0,
    estimated_clicks INTEGER DEFAULT 0,
    estimated_orders INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT product_keywords_unique UNIQUE (product_id, keyword, match_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_parent_asin ON products(parent_asin);
CREATE INDEX IF NOT EXISTS idx_products_monthly_orders ON products(monthly_orders);
CREATE INDEX IF NOT EXISTS idx_product_keywords_match_type ON product_keywords(match_type);
CREATE INDEX IF NOT EXISTS idx_product_keywords_suggested_bid ON product_keywords(suggested_bid);
CREATE INDEX IF NOT EXISTS idx_product_keywords_product_id ON product_keywords(product_id);
CREATE INDEX IF NOT EXISTS idx_product_keywords_keyword ON product_keywords(keyword);

-- Enable RLS on the new table
ALTER TABLE product_keywords ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for product_keywords
CREATE POLICY "Allow authenticated users to access product keywords" 
ON product_keywords 
FOR ALL 
TO authenticated 
USING (true);