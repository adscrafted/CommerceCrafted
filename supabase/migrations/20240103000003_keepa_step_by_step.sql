-- Step 1: Add columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS bullet_points JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS a_plus_content JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS fba_fees JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS keepa_data JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS last_keepa_sync TIMESTAMPTZ;

-- Step 2: Create keepa_sales_rank_history table
CREATE TABLE IF NOT EXISTS keepa_sales_rank_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    sales_rank INTEGER,
    category VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create api_usage table
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

-- Step 4: Add foreign key constraint separately (in case products.id is TEXT)
DO $$
BEGIN
    -- Try to add the foreign key constraint
    BEGIN
        ALTER TABLE keepa_sales_rank_history 
        ADD CONSTRAINT keepa_sales_rank_history_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    EXCEPTION
        WHEN others THEN
            -- If it fails, it might already exist or products table has different structure
            NULL;
    END;
END $$;

-- Step 5: Add unique constraint
ALTER TABLE keepa_sales_rank_history 
ADD CONSTRAINT keepa_sales_rank_history_unique 
UNIQUE (product_id, timestamp, category);

-- Step 6: Create indexes only after tables exist
CREATE INDEX IF NOT EXISTS idx_keepa_sales_rank_history_product_timestamp 
ON keepa_sales_rank_history(product_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_api_usage_created 
ON api_usage(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_usage_api_name 
ON api_usage(api_name);

-- Step 7: Enable RLS
ALTER TABLE keepa_sales_rank_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Step 8: Create simple RLS policies
CREATE POLICY "Allow authenticated users to access sales rank history" 
ON keepa_sales_rank_history 
FOR ALL 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to access api usage" 
ON api_usage 
FOR ALL 
TO authenticated 
USING (true);