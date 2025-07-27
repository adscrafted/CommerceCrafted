-- Create niches_demand_analysis table for comprehensive demand analysis data
CREATE TABLE IF NOT EXISTS public.niches_demand_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    niche_id TEXT NOT NULL REFERENCES public.niches(id) ON DELETE CASCADE,
    
    -- Market insights
    market_insights JSONB DEFAULT '{}',
    
    -- Pricing trends
    pricing_trends JSONB DEFAULT '{}',
    
    -- Seasonality insights
    seasonality_insights JSONB DEFAULT '{}',
    
    -- Social signals
    social_signals JSONB DEFAULT '{}',
    
    -- Demand velocity metrics
    demand_velocity JSONB DEFAULT '{}',
    
    -- Market size estimates
    market_size_estimate JSONB DEFAULT '{}',
    
    -- Customer segments
    customer_segments JSONB DEFAULT '{}',
    
    -- Demand drivers
    demand_drivers JSONB DEFAULT '[]',
    
    -- Analysis metadata
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one analysis per niche
    CONSTRAINT unique_niche_demand_analysis UNIQUE (niche_id)
);

-- Create index for faster lookups
CREATE INDEX idx_niches_demand_analysis_niche_id ON public.niches_demand_analysis(niche_id);

-- Create RLS policies
ALTER TABLE public.niches_demand_analysis ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can manage demand analysis" ON public.niches_demand_analysis
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read demand analysis
CREATE POLICY "Authenticated users can read demand analysis" ON public.niches_demand_analysis
    FOR SELECT USING (auth.role() = 'authenticated');

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_niches_demand_analysis_updated_at 
    BEFORE UPDATE ON public.niches_demand_analysis 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE public.niches_demand_analysis IS 'Stores comprehensive demand analysis data for each niche including market insights, pricing trends, seasonality, and customer segments';