-- Fix product_keywords table schema by adding missing columns
-- These columns are needed for comprehensive keyword data storage

-- Add missing columns to product_keywords table
ALTER TABLE product_keywords ADD COLUMN IF NOT EXISTS bid_currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE product_keywords ADD COLUMN IF NOT EXISTS estimated_clicks INTEGER;
ALTER TABLE product_keywords ADD COLUMN IF NOT EXISTS estimated_orders INTEGER;  
ALTER TABLE product_keywords ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'api';
ALTER TABLE product_keywords ADD COLUMN IF NOT EXISTS bid_range_start DECIMAL(10,2);
ALTER TABLE product_keywords ADD COLUMN IF NOT EXISTS bid_range_end DECIMAL(10,2);

-- Update existing records to have default currency if null
UPDATE product_keywords SET bid_currency = 'USD' WHERE bid_currency IS NULL;

-- Add helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_keywords_source ON product_keywords(source);
CREATE INDEX IF NOT EXISTS idx_product_keywords_is_primary ON product_keywords(is_primary);
CREATE INDEX IF NOT EXISTS idx_product_keywords_product_id_source ON product_keywords(product_id, source);

-- Add comment for documentation
COMMENT ON TABLE product_keywords IS 'Stores comprehensive keyword data from Amazon Ads API and fallback generation';
COMMENT ON COLUMN product_keywords.bid_currency IS 'Currency for bid amounts (USD, EUR, etc.)';
COMMENT ON COLUMN product_keywords.estimated_clicks IS 'Estimated clicks from Amazon Ads API';
COMMENT ON COLUMN product_keywords.estimated_orders IS 'Estimated orders/conversions from Amazon Ads API';
COMMENT ON COLUMN product_keywords.source IS 'Source of keyword: suggested, recommendations, fallback, etc.';
COMMENT ON COLUMN product_keywords.bid_range_start IS 'Low bid estimate from Amazon Ads API';
COMMENT ON COLUMN product_keywords.bid_range_end IS 'High bid estimate from Amazon Ads API';