-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    asin VARCHAR(10) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(255),
    subcategory VARCHAR(255),
    price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    rating DECIMAL(3, 2),
    review_count INTEGER DEFAULT 0,
    image_urls TEXT,
    bsr INTEGER,
    monthly_sales INTEGER,
    status product_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_analyses table
CREATE TABLE IF NOT EXISTS product_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    opportunity_score INTEGER CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
    demand_score INTEGER CHECK (demand_score >= 0 AND demand_score <= 100),
    competition_score INTEGER CHECK (competition_score >= 0 AND competition_score <= 100),
    feasibility_score INTEGER CHECK (feasibility_score >= 0 AND feasibility_score <= 100),
    timing_score INTEGER CHECK (timing_score >= 0 AND timing_score <= 100),
    financial_analysis JSONB DEFAULT '{}',
    market_analysis JSONB DEFAULT '{}',
    competition_analysis JSONB DEFAULT '{}',
    keyword_analysis JSONB DEFAULT '{}',
    review_analysis JSONB DEFAULT '{}',
    supply_chain_analysis JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id)
);

-- Create keywords table
CREATE TABLE IF NOT EXISTS keywords (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    keyword VARCHAR(255) UNIQUE NOT NULL,
    search_volume INTEGER,
    competition_level competition_level,
    cpc DECIMAL(10, 2),
    trend VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_keywords table
CREATE TABLE IF NOT EXISTS product_keywords (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    keyword_id UUID NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    relevance_score DECIMAL(3, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, keyword_id)
);

-- Create daily_features table
CREATE TABLE IF NOT EXISTS daily_features (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    featured_date DATE NOT NULL,
    headline TEXT,
    summary TEXT,
    key_insights JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(featured_date)
);

-- Create saved_products table
CREATE TABLE IF NOT EXISTS saved_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_asin ON products(asin);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_product_analyses_product_id ON product_analyses(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analyses_scores ON product_analyses(opportunity_score, demand_score, competition_score);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_daily_features_date ON daily_features(featured_date);
CREATE INDEX IF NOT EXISTS idx_saved_products_user_id ON saved_products(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_analyses_updated_at BEFORE UPDATE ON product_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON keywords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();