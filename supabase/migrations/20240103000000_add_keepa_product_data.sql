-- Add missing columns to products table for Keepa data
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS bullet_points JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS a_plus_content JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '{}'; -- {width, height, length, weight}
ALTER TABLE products ADD COLUMN IF NOT EXISTS fba_fees JSONB DEFAULT '{}'; -- {referral_fee, fba_fee, storage_fee}
ALTER TABLE products ADD COLUMN IF NOT EXISTS keepa_data JSONB DEFAULT '{}'; -- Raw Keepa response data
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_keepa_sync TIMESTAMPTZ;

-- Create price history table
CREATE TABLE IF NOT EXISTS keepa_price_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    price DECIMAL(10, 2),
    price_type VARCHAR(50) NOT NULL, -- 'AMAZON', 'NEW', 'USED', 'FBA', etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, timestamp, price_type)
);

-- Create sales rank history table
CREATE TABLE IF NOT EXISTS keepa_sales_rank_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    sales_rank INTEGER,
    category VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, timestamp, category)
);

-- Create API cache table for reducing API calls
CREATE TABLE IF NOT EXISTS amazon_api_cache (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    asin VARCHAR(10) NOT NULL,
    api_name VARCHAR(50) NOT NULL, -- 'keepa', 'sp-api', etc.
    response_data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_keepa_price_history_product_timestamp ON keepa_price_history(product_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_keepa_sales_rank_history_product_timestamp ON keepa_sales_rank_history(product_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_amazon_api_cache_asin ON amazon_api_cache(asin);
CREATE INDEX IF NOT EXISTS idx_amazon_api_cache_expires ON amazon_api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_name ON api_usage(api_name);

-- Add triggers for updated_at
CREATE TRIGGER update_amazon_api_cache_updated_at BEFORE UPDATE ON amazon_api_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE keepa_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE keepa_sales_rank_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE amazon_api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admin users can view all price history" ON keepa_price_history
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users WHERE auth.uid() = id AND role = 'ADMIN'
    ));

CREATE POLICY "Admin users can view all sales rank history" ON keepa_sales_rank_history
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users WHERE auth.uid() = id AND role = 'ADMIN'
    ));

CREATE POLICY "Admin users can manage API cache" ON amazon_api_cache
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users WHERE auth.uid() = id AND role = 'ADMIN'
    ));

CREATE POLICY "Admin users can view API usage" ON api_usage
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users WHERE auth.uid() = id AND role = 'ADMIN'
    ));