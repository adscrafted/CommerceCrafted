-- Add missing columns to niches_demand_analysis if they don't exist
DO $$ 
BEGIN
  -- Add market_insights column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'niches_demand_analysis' 
                 AND column_name = 'market_insights') THEN
    ALTER TABLE niches_demand_analysis ADD COLUMN market_insights JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add pricing_trends column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'niches_demand_analysis' 
                 AND column_name = 'pricing_trends') THEN
    ALTER TABLE niches_demand_analysis ADD COLUMN pricing_trends JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add seasonality_insights column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'niches_demand_analysis' 
                 AND column_name = 'seasonality_insights') THEN
    ALTER TABLE niches_demand_analysis ADD COLUMN seasonality_insights JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add social_signals column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'niches_demand_analysis' 
                 AND column_name = 'social_signals') THEN
    ALTER TABLE niches_demand_analysis ADD COLUMN social_signals JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add analysis_date column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'niches_demand_analysis' 
                 AND column_name = 'analysis_date') THEN
    ALTER TABLE niches_demand_analysis ADD COLUMN analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON niches_demand_analysis TO authenticated;
GRANT ALL ON niches_demand_analysis TO service_role;

-- Add RLS policy if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'niches_demand_analysis' 
    AND policyname = 'Enable all operations for all users'
  ) THEN
    CREATE POLICY "Enable all operations for all users" 
    ON niches_demand_analysis
    FOR ALL 
    TO public
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;