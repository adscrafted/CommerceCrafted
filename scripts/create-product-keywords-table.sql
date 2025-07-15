-- Product Keywords Table for CommerceCrafted
-- Stores Amazon Ads API keyword data linked directly to products in the queue

-- Raw keywords data from Amazon Ads API
CREATE TABLE IF NOT EXISTS product_keywords (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    asin VARCHAR(20) NOT NULL,
    keyword VARCHAR(500) NOT NULL,
    
    -- Source information
    source VARCHAR(50) NOT NULL, -- 'suggested', 'recommended', 'both'
    fetch_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Raw API response for reference
    api_response JSONB, -- Full API response data
    
    -- Extracted metrics from API
    search_volume INTEGER DEFAULT 0,
    search_volume_trend VARCHAR(20), -- 'INCREASING', 'DECREASING', 'STABLE'
    competition_level VARCHAR(20), -- 'HIGH', 'MEDIUM', 'LOW'
    
    -- Bid data
    suggested_bid DECIMAL(10, 2),
    bid_range_low DECIMAL(10, 2),
    bid_range_high DECIMAL(10, 2),
    
    -- Performance estimates
    estimated_clicks INTEGER DEFAULT 0,
    estimated_impressions INTEGER DEFAULT 0,
    estimated_orders INTEGER DEFAULT 0,
    estimated_revenue DECIMAL(10, 2),
    estimated_cost DECIMAL(10, 2),
    estimated_acos DECIMAL(5, 2), -- Advertising Cost of Sale percentage
    
    -- Search metrics
    search_impression_share DECIMAL(5, 2), -- Percentage as decimal (0.15 = 15%)
    search_impression_rank INTEGER,
    click_through_rate DECIMAL(5, 2),
    conversion_rate DECIMAL(5, 2),
    
    -- Relevance and matching
    relevance_score DECIMAL(3, 2),
    match_type VARCHAR(20) DEFAULT 'BROAD', -- 'EXACT', 'PHRASE', 'BROAD'
    recommendation_type VARCHAR(50), -- From API response
    
    -- Additional metrics
    monthly_searches INTEGER,
    seasonal_trend JSONB, -- Monthly search volume over 12 months
    top_clicked_asins JSONB, -- Top ASINs that get clicks for this keyword
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Composite unique constraint to prevent duplicates
    UNIQUE(asin, keyword, source)
);

-- Indexes for performance
CREATE INDEX idx_product_keywords_asin ON product_keywords(asin);
CREATE INDEX idx_product_keywords_keyword ON product_keywords(keyword);
CREATE INDEX idx_product_keywords_search_volume ON product_keywords(search_volume DESC);
CREATE INDEX idx_product_keywords_relevance ON product_keywords(relevance_score DESC);
CREATE INDEX idx_product_keywords_created_at ON product_keywords(created_at DESC);
CREATE INDEX idx_product_keywords_asin_volume ON product_keywords(asin, search_volume DESC);

-- Add RLS policies
ALTER TABLE product_keywords ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view product keywords
CREATE POLICY "Users can view product keywords" ON product_keywords
    FOR SELECT USING (true);

-- Only admins can insert/update/delete keywords
CREATE POLICY "Admins can manage product keywords" ON product_keywords
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth.uid() = id 
            AND role = 'ADMIN'
        )
    );

-- Function to update updated_at timestamp
CREATE TRIGGER update_product_keywords_updated_at BEFORE UPDATE
    ON product_keywords FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key to products table if needed (optional, depends on your approach)
-- This is commented out as it may not be necessary if you want loose coupling
-- ALTER TABLE product_keywords 
-- ADD CONSTRAINT fk_product_keywords_asin 
-- FOREIGN KEY (asin) REFERENCES products(asin) ON DELETE CASCADE;