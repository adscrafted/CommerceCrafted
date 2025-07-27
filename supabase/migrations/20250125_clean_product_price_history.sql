-- Clean up product_price_history table to focus only on price data
-- Remove columns that belong in other history tables

ALTER TABLE product_price_history
  DROP COLUMN IF EXISTS sales_rank_data,
  DROP COLUMN IF EXISTS availability_data,
  DROP COLUMN IF EXISTS rating_data,
  DROP COLUMN IF EXISTS review_count_data,
  DROP COLUMN IF EXISTS price_data;

-- Add a comment explaining the table's purpose
COMMENT ON TABLE product_price_history IS 'Stores historical price data for products. Other metrics (sales rank, ratings, reviews) are stored in their respective history tables.';

-- Ensure we have the essential price-related columns
-- Check if essential columns exist, add if missing
DO $$
BEGIN
  -- Ensure we have price column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_price_history' AND column_name='price') THEN
    ALTER TABLE product_price_history ADD COLUMN price DECIMAL(10,2);
  END IF;
  
  -- Ensure we have currency column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_price_history' AND column_name='currency') THEN
    ALTER TABLE product_price_history ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
  END IF;
  
  -- Ensure we have timestamp column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_price_history' AND column_name='timestamp') THEN
    ALTER TABLE product_price_history ADD COLUMN timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Create an index for efficient querying by ASIN and timestamp
CREATE INDEX IF NOT EXISTS idx_product_price_history_asin_timestamp 
  ON product_price_history(asin, timestamp DESC);