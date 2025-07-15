-- Keyword Groups Tables for CommerceCrafted
-- Mirrors JungleAce functionality but uses Supabase/PostgreSQL

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Keyword Groups main table
CREATE TABLE IF NOT EXISTS keyword_groups (
    id VARCHAR(50) PRIMARY KEY, -- Format: kwg_timestamp_random
    name VARCHAR(255) NOT NULL,
    marketplace VARCHAR(10) DEFAULT 'US',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'deleted')),
    asins TEXT[] NOT NULL, -- Array of ASINs
    total_keywords_found INTEGER DEFAULT 0,
    total_keywords_processed INTEGER DEFAULT 0,
    processing_started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASIN metadata for each group
CREATE TABLE IF NOT EXISTS keyword_group_asin_metadata (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    asin VARCHAR(20) NOT NULL,
    group_id VARCHAR(50) NOT NULL REFERENCES keyword_groups(id) ON DELETE CASCADE,
    
    -- Product data from Keepa API
    title TEXT,
    brand VARCHAR(255),
    price DECIMAL(10, 2),
    image_url TEXT,
    secondary_images JSONB, -- Array of image URLs
    product_group VARCHAR(255),
    sales_rank_category VARCHAR(255),
    sales_rank_value INTEGER,
    review_count INTEGER,
    rating DECIMAL(3, 2),
    
    -- FBA/Fulfillment data
    fba_fees DECIMAL(10, 2),
    fba_fees_percentage DECIMAL(5, 2),
    dimensions JSONB, -- {length, width, height, weight}
    
    -- Additional Keepa data
    variations JSONB, -- Color/size variations
    features TEXT[], -- Bullet points
    
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(asin, group_id)
);

-- Raw keywords data with enrichment
CREATE TABLE IF NOT EXISTS keyword_group_keywords (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL REFERENCES keyword_groups(id) ON DELETE CASCADE,
    keyword VARCHAR(500) NOT NULL,
    asin VARCHAR(20) NOT NULL,
    source VARCHAR(50) NOT NULL, -- 'suggested', 'recommended', 'both'
    
    -- Ads API response data
    api_response JSONB, -- Full API response for reference
    
    -- Enriched metrics
    search_volume INTEGER DEFAULT 0,
    competition_level VARCHAR(20),
    suggested_bid DECIMAL(10, 2),
    bid_range_low DECIMAL(10, 2),
    bid_range_high DECIMAL(10, 2),
    
    -- Performance estimates
    estimated_clicks INTEGER DEFAULT 0,
    estimated_orders INTEGER DEFAULT 0,
    estimated_revenue DECIMAL(10, 2),
    estimated_cost DECIMAL(10, 2),
    
    -- Search visibility metrics
    search_impression_share DECIMAL(5, 2), -- Percentage as decimal (0.15 = 15%)
    search_impression_rank INTEGER,
    
    -- Additional metrics
    relevance_score DECIMAL(3, 2),
    match_type VARCHAR(20) DEFAULT 'BROAD',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processing_date DATE DEFAULT CURRENT_DATE
);

-- Processing progress tracking
CREATE TABLE IF NOT EXISTS keyword_group_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL REFERENCES keyword_groups(id) ON DELETE CASCADE,
    phase VARCHAR(50) NOT NULL,
    percentage INTEGER DEFAULT 0,
    message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    UNIQUE(group_id, phase)
);

-- Indexes for performance
CREATE INDEX idx_keyword_groups_user_id ON keyword_groups(user_id);
CREATE INDEX idx_keyword_groups_status ON keyword_groups(status);
CREATE INDEX idx_keyword_groups_created_at ON keyword_groups(created_at DESC);

CREATE INDEX idx_kga_metadata_group_id ON keyword_group_asin_metadata(group_id);
CREATE INDEX idx_kga_metadata_asin ON keyword_group_asin_metadata(asin);

CREATE INDEX idx_kg_keywords_group_id ON keyword_group_keywords(group_id);
CREATE INDEX idx_kg_keywords_keyword ON keyword_group_keywords(keyword);
CREATE INDEX idx_kg_keywords_asin ON keyword_group_keywords(asin);
CREATE INDEX idx_kg_keywords_search_volume ON keyword_group_keywords(search_volume DESC);
CREATE INDEX idx_kg_keywords_processing_date ON keyword_group_keywords(processing_date);

-- Add RLS policies
ALTER TABLE keyword_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_group_asin_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_group_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_group_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see their own keyword groups
CREATE POLICY "Users can view own keyword groups" ON keyword_groups
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own keyword groups" ON keyword_groups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own keyword groups" ON keyword_groups
    FOR UPDATE USING (auth.uid() = user_id);

-- Cascade policies for related tables
CREATE POLICY "Users can view keyword group metadata" ON keyword_group_asin_metadata
    FOR SELECT USING (
        group_id IN (SELECT id FROM keyword_groups WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view keyword group keywords" ON keyword_group_keywords
    FOR SELECT USING (
        group_id IN (SELECT id FROM keyword_groups WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view keyword group progress" ON keyword_group_progress
    FOR SELECT USING (
        group_id IN (SELECT id FROM keyword_groups WHERE user_id = auth.uid())
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_keyword_groups_updated_at BEFORE UPDATE
    ON keyword_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();