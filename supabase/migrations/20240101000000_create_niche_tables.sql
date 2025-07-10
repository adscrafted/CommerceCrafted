-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search

-- Create enums for status types
CREATE TYPE niche_status AS ENUM ('active', 'archived', 'draft');
CREATE TYPE analysis_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE api_provider AS ENUM ('amazon_sp_api', 'keepa', 'jungle_scout', 'helium10', 'internal');
CREATE TYPE analysis_metric AS ENUM ('competition', 'demand', 'profitability', 'trend', 'saturation');

-- Create niches table
CREATE TABLE niches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    keywords TEXT[] NOT NULL DEFAULT '{}',
    category VARCHAR(255),
    subcategory VARCHAR(255),
    status niche_status NOT NULL DEFAULT 'active',
    
    -- Analysis settings
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    min_rating DECIMAL(3, 2),
    max_competitors INTEGER,
    target_profit_margin DECIMAL(5, 2),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_analyzed_at TIMESTAMPTZ,
    
    -- Ensure price range is valid
    CONSTRAINT valid_price_range CHECK (
        (min_price IS NULL AND max_price IS NULL) OR 
        (min_price IS NOT NULL AND max_price IS NOT NULL AND min_price <= max_price)
    ),
    -- Ensure rating is valid
    CONSTRAINT valid_rating CHECK (min_rating IS NULL OR (min_rating >= 0 AND min_rating <= 5)),
    -- Ensure profit margin is valid percentage
    CONSTRAINT valid_profit_margin CHECK (target_profit_margin IS NULL OR (target_profit_margin >= 0 AND target_profit_margin <= 100))
);

-- Create niche_products table
CREATE TABLE niche_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    niche_id UUID NOT NULL REFERENCES niches(id) ON DELETE CASCADE,
    asin VARCHAR(10) NOT NULL,
    title TEXT NOT NULL,
    brand VARCHAR(255),
    price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    rating DECIMAL(3, 2),
    review_count INTEGER,
    bsr INTEGER,
    bsr_category VARCHAR(255),
    
    -- Product metrics
    monthly_sales_estimate INTEGER,
    monthly_revenue_estimate DECIMAL(12, 2),
    competition_score INTEGER CHECK (competition_score >= 0 AND competition_score <= 100),
    demand_score INTEGER CHECK (demand_score >= 0 AND demand_score <= 100),
    opportunity_score INTEGER CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
    
    -- Additional data
    image_url TEXT,
    product_url TEXT,
    is_amazon_choice BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    has_variations BOOLEAN DEFAULT FALSE,
    variation_count INTEGER,
    
    -- FBA metrics
    fba_fees DECIMAL(10, 2),
    estimated_profit DECIMAL(10, 2),
    profit_margin DECIMAL(5, 2),
    
    -- Tracking
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_source api_provider,
    
    -- Prevent duplicate products in same niche
    UNIQUE(niche_id, asin)
);

-- Create analysis_runs table
CREATE TABLE analysis_runs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    niche_id UUID NOT NULL REFERENCES niches(id) ON DELETE CASCADE,
    status analysis_status NOT NULL DEFAULT 'pending',
    
    -- Run configuration
    config JSONB NOT NULL DEFAULT '{}',
    filters_applied JSONB,
    
    -- Execution details
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN completed_at IS NOT NULL AND started_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (completed_at - started_at))::INTEGER
            ELSE NULL
        END
    ) STORED,
    
    -- Results
    products_found INTEGER DEFAULT 0,
    products_analyzed INTEGER DEFAULT 0,
    new_products_added INTEGER DEFAULT 0,
    products_updated INTEGER DEFAULT 0,
    
    -- Aggregated metrics
    avg_price DECIMAL(10, 2),
    avg_rating DECIMAL(3, 2),
    avg_review_count INTEGER,
    avg_monthly_sales INTEGER,
    total_market_size DECIMAL(15, 2),
    
    -- Analysis insights
    market_trends JSONB,
    top_opportunities JSONB,
    competitive_landscape JSONB,
    recommendations TEXT[],
    
    -- Error handling
    error_message TEXT,
    error_details JSONB,
    retry_count INTEGER DEFAULT 0,
    
    -- API usage
    api_calls_made INTEGER DEFAULT 0,
    api_credits_used INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create api_call_logs table
CREATE TABLE api_call_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_run_id UUID REFERENCES analysis_runs(id) ON DELETE SET NULL,
    provider api_provider NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    
    -- Request details
    request_method VARCHAR(10) NOT NULL DEFAULT 'GET',
    request_url TEXT,
    request_headers JSONB,
    request_body JSONB,
    
    -- Response details
    response_status INTEGER,
    response_headers JSONB,
    response_body JSONB,
    response_time_ms INTEGER,
    
    -- Tracking
    credits_used INTEGER DEFAULT 1,
    cost_usd DECIMAL(10, 4),
    
    -- Error handling
    is_error BOOLEAN DEFAULT FALSE,
    error_type VARCHAR(100),
    error_message TEXT,
    
    -- Metadata
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_niches_user_id ON niches(user_id);
CREATE INDEX idx_niches_status ON niches(status);
CREATE INDEX idx_niches_created_at ON niches(created_at DESC);
CREATE INDEX idx_niches_keywords ON niches USING GIN(keywords);

CREATE INDEX idx_niche_products_niche_id ON niche_products(niche_id);
CREATE INDEX idx_niche_products_asin ON niche_products(asin);
CREATE INDEX idx_niche_products_opportunity_score ON niche_products(opportunity_score DESC);
CREATE INDEX idx_niche_products_competition_score ON niche_products(competition_score);
CREATE INDEX idx_niche_products_demand_score ON niche_products(demand_score DESC);
CREATE INDEX idx_niche_products_price ON niche_products(price);
CREATE INDEX idx_niche_products_bsr ON niche_products(bsr);
CREATE INDEX idx_niche_products_last_updated ON niche_products(last_updated_at DESC);

CREATE INDEX idx_analysis_runs_niche_id ON analysis_runs(niche_id);
CREATE INDEX idx_analysis_runs_status ON analysis_runs(status);
CREATE INDEX idx_analysis_runs_created_at ON analysis_runs(created_at DESC);

CREATE INDEX idx_api_call_logs_analysis_run_id ON api_call_logs(analysis_run_id);
CREATE INDEX idx_api_call_logs_provider ON api_call_logs(provider);
CREATE INDEX idx_api_call_logs_created_at ON api_call_logs(created_at DESC);
CREATE INDEX idx_api_call_logs_user_id ON api_call_logs(user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_niches_updated_at BEFORE UPDATE ON niches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_niche_products_updated_at BEFORE UPDATE ON niche_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update last_analyzed_at on niches
CREATE OR REPLACE FUNCTION update_niche_last_analyzed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE niches 
        SET last_analyzed_at = NOW() 
        WHERE id = NEW.niche_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_niche_last_analyzed_at AFTER UPDATE ON analysis_runs
    FOR EACH ROW EXECUTE FUNCTION update_niche_last_analyzed();

-- Row Level Security (RLS) Policies
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE niche_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_call_logs ENABLE ROW LEVEL SECURITY;

-- Niches policies
CREATE POLICY "Users can view their own niches" ON niches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own niches" ON niches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own niches" ON niches
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own niches" ON niches
    FOR DELETE USING (auth.uid() = user_id);

-- Niche products policies (accessible through niche ownership)
CREATE POLICY "Users can view products in their niches" ON niche_products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM niches 
            WHERE niches.id = niche_products.niche_id 
            AND niches.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add products to their niches" ON niche_products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM niches 
            WHERE niches.id = niche_products.niche_id 
            AND niches.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update products in their niches" ON niche_products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM niches 
            WHERE niches.id = niche_products.niche_id 
            AND niches.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete products from their niches" ON niche_products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM niches 
            WHERE niches.id = niche_products.niche_id 
            AND niches.user_id = auth.uid()
        )
    );

-- Analysis runs policies
CREATE POLICY "Users can view analysis runs for their niches" ON analysis_runs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM niches 
            WHERE niches.id = analysis_runs.niche_id 
            AND niches.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create analysis runs for their niches" ON analysis_runs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM niches 
            WHERE niches.id = analysis_runs.niche_id 
            AND niches.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update analysis runs for their niches" ON analysis_runs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM niches 
            WHERE niches.id = analysis_runs.niche_id 
            AND niches.user_id = auth.uid()
        )
    );

-- API call logs policies
CREATE POLICY "Users can view their own API logs" ON api_call_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view API logs for their analysis runs" ON api_call_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM analysis_runs
            JOIN niches ON niches.id = analysis_runs.niche_id
            WHERE analysis_runs.id = api_call_logs.analysis_run_id
            AND niches.user_id = auth.uid()
        )
    );

-- Create views for common queries
CREATE VIEW niche_summary AS
SELECT 
    n.id,
    n.user_id,
    n.name,
    n.status,
    n.created_at,
    n.last_analyzed_at,
    COUNT(DISTINCT np.id) as product_count,
    AVG(np.opportunity_score) as avg_opportunity_score,
    AVG(np.competition_score) as avg_competition_score,
    AVG(np.demand_score) as avg_demand_score,
    AVG(np.price) as avg_price,
    SUM(np.monthly_revenue_estimate) as total_market_size
FROM niches n
LEFT JOIN niche_products np ON n.id = np.niche_id
GROUP BY n.id;

-- Create function for calculating opportunity scores
CREATE OR REPLACE FUNCTION calculate_opportunity_score(
    p_competition_score INTEGER,
    p_demand_score INTEGER,
    p_profit_margin DECIMAL,
    p_bsr INTEGER,
    p_review_count INTEGER
) RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    profit_weight DECIMAL := 0.3;
    demand_weight DECIMAL := 0.25;
    competition_weight DECIMAL := 0.25;
    bsr_weight DECIMAL := 0.1;
    reviews_weight DECIMAL := 0.1;
BEGIN
    -- Base calculation
    IF p_demand_score IS NOT NULL THEN
        score := score + (p_demand_score * demand_weight);
    END IF;
    
    IF p_competition_score IS NOT NULL THEN
        score := score + ((100 - p_competition_score) * competition_weight);
    END IF;
    
    IF p_profit_margin IS NOT NULL THEN
        score := score + (LEAST(p_profit_margin * 2, 100) * profit_weight);
    END IF;
    
    -- BSR bonus (lower is better)
    IF p_bsr IS NOT NULL AND p_bsr < 10000 THEN
        score := score + ((10000 - p_bsr) / 100 * bsr_weight);
    END IF;
    
    -- Review count penalty (too many reviews = harder to compete)
    IF p_review_count IS NOT NULL THEN
        IF p_review_count < 100 THEN
            score := score + (10 * reviews_weight);
        ELSIF p_review_count < 500 THEN
            score := score + (5 * reviews_weight);
        END IF;
    END IF;
    
    RETURN GREATEST(0, LEAST(100, score::INTEGER));
END;
$$ LANGUAGE plpgsql;

-- Create function to get market insights
CREATE OR REPLACE FUNCTION get_niche_market_insights(p_niche_id UUID)
RETURNS JSONB AS $$
DECLARE
    insights JSONB;
BEGIN
    WITH market_stats AS (
        SELECT 
            COUNT(*) as total_products,
            AVG(price) as avg_price,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) as median_price,
            MIN(price) as min_price,
            MAX(price) as max_price,
            AVG(rating) as avg_rating,
            AVG(review_count) as avg_reviews,
            SUM(monthly_revenue_estimate) as total_revenue,
            AVG(competition_score) as avg_competition,
            AVG(demand_score) as avg_demand
        FROM niche_products
        WHERE niche_id = p_niche_id
    ),
    top_performers AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'asin', asin,
                'title', title,
                'opportunity_score', opportunity_score,
                'monthly_revenue', monthly_revenue_estimate
            ) ORDER BY opportunity_score DESC
        ) as products
        FROM (
            SELECT asin, title, opportunity_score, monthly_revenue_estimate
            FROM niche_products
            WHERE niche_id = p_niche_id
            ORDER BY opportunity_score DESC
            LIMIT 5
        ) t
    ),
    price_distribution AS (
        SELECT jsonb_build_object(
            'under_20', COUNT(*) FILTER (WHERE price < 20),
            '20_to_50', COUNT(*) FILTER (WHERE price >= 20 AND price < 50),
            '50_to_100', COUNT(*) FILTER (WHERE price >= 50 AND price < 100),
            'over_100', COUNT(*) FILTER (WHERE price >= 100)
        ) as distribution
        FROM niche_products
        WHERE niche_id = p_niche_id
    )
    SELECT jsonb_build_object(
        'market_stats', to_jsonb(market_stats.*),
        'top_opportunities', top_performers.products,
        'price_distribution', price_distribution.distribution,
        'market_maturity', CASE 
            WHEN market_stats.avg_competition > 70 THEN 'saturated'
            WHEN market_stats.avg_competition > 50 THEN 'competitive'
            WHEN market_stats.avg_competition > 30 THEN 'growing'
            ELSE 'emerging'
        END,
        'recommendation', CASE
            WHEN market_stats.avg_competition < 50 AND market_stats.avg_demand > 60 THEN 'high_potential'
            WHEN market_stats.avg_competition > 70 AND market_stats.avg_demand < 40 THEN 'avoid'
            ELSE 'moderate'
        END
    ) INTO insights
    FROM market_stats, top_performers, price_distribution;
    
    RETURN insights;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE niches IS 'Stores user-defined product niches for analysis';
COMMENT ON TABLE niche_products IS 'Products discovered within each niche';
COMMENT ON TABLE analysis_runs IS 'Tracks each analysis run for a niche';
COMMENT ON TABLE api_call_logs IS 'Logs all external API calls for debugging and cost tracking';

COMMENT ON COLUMN niches.keywords IS 'Array of keywords used to identify products in this niche';
COMMENT ON COLUMN niche_products.opportunity_score IS 'Calculated score (0-100) indicating product opportunity';
COMMENT ON COLUMN analysis_runs.config IS 'JSON configuration used for this analysis run';
COMMENT ON COLUMN api_call_logs.credits_used IS 'Number of API credits consumed by this call';