-- Add review history tracking to Keepa data
-- This table will store historical review count and rating data

CREATE TABLE IF NOT EXISTS keepa_review_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    asin VARCHAR(20) NOT NULL,
    
    -- Review metrics
    review_count INTEGER,
    rating DECIMAL(3,2), -- e.g., 4.5 stars
    
    -- Additional review data from Keepa
    review_count_amazon INTEGER, -- Amazon reviews specifically
    rating_amazon DECIMAL(3,2), -- Amazon rating specifically
    
    -- Timestamp data
    timestamp TIMESTAMPTZ NOT NULL,
    keepa_timestamp BIGINT, -- Keepa's timestamp format
    
    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique entries per product per timestamp
    UNIQUE(product_id, timestamp)
);

-- Indexes for performance
CREATE INDEX idx_keepa_review_history_product_id ON keepa_review_history(product_id);
CREATE INDEX idx_keepa_review_history_asin ON keepa_review_history(asin);
CREATE INDEX idx_keepa_review_history_timestamp ON keepa_review_history(timestamp DESC);
CREATE INDEX idx_keepa_review_history_product_timestamp ON keepa_review_history(product_id, timestamp DESC);

-- Add RLS (Row Level Security)
ALTER TABLE keepa_review_history ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read review history
CREATE POLICY "Users can view review history" ON keepa_review_history
    FOR SELECT USING (true);

-- Only admins can insert/update/delete review history
CREATE POLICY "Admins can manage review history" ON keepa_review_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth.uid()::text = id 
            AND role = 'ADMIN'
        )
    );

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_keepa_review_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_keepa_review_history_updated_at
    BEFORE UPDATE ON keepa_review_history
    FOR EACH ROW
    EXECUTE FUNCTION update_keepa_review_history_updated_at();

-- Add helpful view for latest review data
CREATE OR REPLACE VIEW latest_review_data AS
SELECT DISTINCT ON (product_id)
    product_id,
    asin,
    review_count,
    rating,
    review_count_amazon,
    rating_amazon,
    timestamp
FROM keepa_review_history
ORDER BY product_id, timestamp DESC;