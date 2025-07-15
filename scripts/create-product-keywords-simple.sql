-- Simple Product Keywords Table
-- Stores essential keyword data from Amazon Ads API

-- Keywords linked to products and projects
CREATE TABLE IF NOT EXISTS product_keywords (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES product_queue_projects(id) ON DELETE CASCADE,
    asin VARCHAR(20) NOT NULL,
    keyword VARCHAR(500) NOT NULL,
    estimated_clicks INTEGER DEFAULT 0,
    estimated_orders INTEGER DEFAULT 0,
    bid DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique keywords per ASIN within a project
    UNIQUE(project_id, asin, keyword)
);

-- Indexes for performance
CREATE INDEX idx_product_keywords_project_id ON product_keywords(project_id);
CREATE INDEX idx_product_keywords_asin ON product_keywords(asin);
CREATE INDEX idx_product_keywords_created_at ON product_keywords(created_at DESC);

-- Add RLS policies
ALTER TABLE product_keywords ENABLE ROW LEVEL SECURITY;

-- Users can view keywords for their own projects
CREATE POLICY "Users can view own project keywords" ON product_keywords
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM product_queue_projects 
            WHERE user_id = auth.uid()
        )
    );

-- Users can manage keywords for their own projects  
CREATE POLICY "Users can manage own project keywords" ON product_keywords
    FOR ALL USING (
        project_id IN (
            SELECT id FROM product_queue_projects 
            WHERE user_id = auth.uid()
        )
    );