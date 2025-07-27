-- Move daily features logic into niches table
-- This eliminates the need for a separate daily_features table

-- Add featured_date column to niches table
ALTER TABLE niches ADD COLUMN IF NOT EXISTS featured_date DATE;

-- Create an index for quick lookup of featured niches
CREATE INDEX IF NOT EXISTS idx_niches_featured_date ON niches(featured_date);

-- Migrate existing daily features data to niches table (if any exist)
DO $$
BEGIN
  -- Check if daily_features table exists and what columns it has
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'daily_features') THEN
    -- Check if it has niche_id column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='daily_features' AND column_name='niche_id') THEN
      -- Update niches table with featured dates from daily_features using niche_id
      UPDATE niches n
      SET featured_date = df.featured_date
      FROM daily_features df
      WHERE n.id = df.niche_id;
      RAISE NOTICE 'Migrated daily_features data to niches table';
    ELSE
      -- Cannot migrate product-based daily features without a way to map products to niches
      RAISE NOTICE 'daily_features table exists but uses product_id - data migration skipped (no product-to-niche mapping)';
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_daily_features') THEN
    -- Check if products have niche_id to map features to niches
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product' AND column_name='niche_id') THEN
      -- Only attempt migration if product has niche_id
      UPDATE niches n
      SET featured_date = pdf.featured_date
      FROM product_daily_features pdf
      JOIN product p ON p.id = pdf.product_id
      WHERE n.id = p.niche_id
      AND p.niche_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM niches WHERE featured_date = pdf.featured_date AND id != n.id);
      RAISE NOTICE 'Migrated product_daily_features data to niches table';
    ELSE
      RAISE NOTICE 'product_daily_features exists but cannot map to niches (products table lacks niche_id) - data migration skipped';
    END IF;
  END IF;
END $$;

-- Drop the daily_features table if it exists
DROP TABLE IF EXISTS daily_features CASCADE;

-- Drop the product_daily_features table if it exists
DROP TABLE IF EXISTS product_daily_features CASCADE;

-- Add a constraint to ensure only one niche can be featured per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_niches_one_featured_per_day 
  ON niches(featured_date) 
  WHERE featured_date IS NOT NULL;