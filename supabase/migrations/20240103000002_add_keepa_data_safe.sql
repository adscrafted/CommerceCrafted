-- First, let's just add the columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS bullet_points JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS a_plus_content JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS fba_fees JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS keepa_data JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_keepa_sync TIMESTAMPTZ;

-- For the other tables, let's check what exists first
-- Drop existing tables if they have wrong schema
DROP TABLE IF EXISTS keepa_sales_rank_history CASCADE;
DROP TABLE IF EXISTS api_usage CASCADE;

-- Now create them fresh
-- Get the actual type of products.id dynamically
DO $$
DECLARE
    product_id_type text;
BEGIN
    -- Get the data type of products.id
    SELECT data_type INTO product_id_type
    FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'id';
    
    -- Create price history table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'keepa_price_history') THEN
        IF product_id_type = 'uuid' THEN
            CREATE TABLE keepa_price_history (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                timestamp TIMESTAMPTZ NOT NULL,
                price DECIMAL(10, 2),
                price_type VARCHAR(50) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(product_id, timestamp, price_type)
            );
        ELSE
            CREATE TABLE keepa_price_history (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                timestamp TIMESTAMPTZ NOT NULL,
                price DECIMAL(10, 2),
                price_type VARCHAR(50) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(product_id, timestamp, price_type)
            );
        END IF;
    END IF;
    
    -- Create sales rank history table
    IF product_id_type = 'uuid' THEN
        CREATE TABLE keepa_sales_rank_history (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            timestamp TIMESTAMPTZ NOT NULL,
            sales_rank INTEGER,
            category VARCHAR(255),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(product_id, timestamp, category)
        );
    ELSE
        CREATE TABLE keepa_sales_rank_history (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            timestamp TIMESTAMPTZ NOT NULL,
            sales_rank INTEGER,
            category VARCHAR(255),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(product_id, timestamp, category)
        );
    END IF;
END $$;

-- Create API usage tracking table
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    api_name VARCHAR(50) NOT NULL,
    endpoint VARCHAR(255),
    tokens_used INTEGER DEFAULT 1,
    cost DECIMAL(10, 6),
    response_status INTEGER,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_keepa_price_history_product_timestamp ON keepa_price_history(product_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_keepa_sales_rank_history_product_timestamp ON keepa_sales_rank_history(product_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_amazon_api_cache_asin ON amazon_api_cache(asin);
CREATE INDEX IF NOT EXISTS idx_amazon_api_cache_expires ON amazon_api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_name ON api_usage(api_name);

-- Enable RLS
ALTER TABLE keepa_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE keepa_sales_rank_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies (adjust based on your auth setup)
CREATE POLICY "Admin access price history" ON keepa_price_history FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin access sales rank history" ON keepa_sales_rank_history FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin access api usage" ON api_usage FOR ALL TO authenticated USING (true);