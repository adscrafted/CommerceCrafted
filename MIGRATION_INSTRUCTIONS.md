# Market Intelligence Table Migration

## Issue
The customer personas and market intelligence features are not working because the `niches_market_intelligence` table is missing from the database. The data should be stored at the niche level, not individual product level.

## Solution
You need to create the `niche_market_intelligence` table in your Supabase database.

## Steps

1. **Go to your Supabase Dashboard**
   - Navigate to the SQL Editor

2. **Run this SQL Migration:**

```sql
-- Create niches_market_intelligence table
CREATE TABLE IF NOT EXISTS niches_market_intelligence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  niche_id VARCHAR(255) REFERENCES niches(id) ON DELETE CASCADE,
  customer_personas JSONB DEFAULT '[]'::jsonb,
  voice_of_customer JSONB DEFAULT '{}'::jsonb,
  voice_of_customer_enhanced JSONB,
  emotional_triggers JSONB DEFAULT '[]'::jsonb,
  competitor_analysis JSONB DEFAULT '{}'::jsonb,
  total_reviews_analyzed INTEGER DEFAULT 0,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(niche_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_niches_market_intelligence_niche_id ON niches_market_intelligence(niche_id);
CREATE INDEX IF NOT EXISTS idx_niches_market_intelligence_analysis_date ON niches_market_intelligence(analysis_date);

-- Enable Row Level Security
ALTER TABLE niches_market_intelligence ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow read access to all authenticated users
CREATE POLICY "niches_market_intelligence_read_policy" ON niches_market_intelligence
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow write access for admin users only
CREATE POLICY "niches_market_intelligence_write_policy" ON niches_market_intelligence
  FOR ALL
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'ADMIN'
  ));

-- Create updated_at trigger
CREATE TRIGGER update_niches_market_intelligence_updated_at 
  BEFORE UPDATE ON niches_market_intelligence 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

3. **Populate Sample Data (Optional)**
   
   After creating the table, you can populate it with sample data by calling:
   ```bash
   curl -X POST http://localhost:3000/api/test/populate-niche-market-intelligence
   ```

## What This Fixes

- Customer Personas will now display properly
- Voice of Customer analysis will work
- Emotional Triggers data will be available
- The market intelligence page will show analyzed data instead of just raw reviews

## Files Created for Testing

1. `/src/app/api/test/check-niche-tables/route.ts` - Check if niche tables exist
2. `/src/app/api/test/populate-niche-market-intelligence/route.ts` - Populate sample data
3. `/supabase/migrations/20250127_create_niches_market_intelligence_table.sql` - Migration file for the niches market intelligence table

## Important Note

The market intelligence data is stored at the **niche level**, not the product level. This means:
- One set of customer personas per niche (not per product)
- Voice of customer analysis aggregated across all products in the niche
- Emotional triggers derived from all reviews in the niche

## Next Steps

After running the migration:
1. The market intelligence page should show customer personas and other analyzed data
2. You can start populating real analysis data from your AI processing pipeline
3. The raw reviews will continue to show even without AI analysis