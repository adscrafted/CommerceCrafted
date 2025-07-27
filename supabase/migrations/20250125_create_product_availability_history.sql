-- Create product_availability_history table if it doesn't exist
-- This table stores historical availability data separately from price history

CREATE TABLE IF NOT EXISTS product_availability_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  asin TEXT NOT NULL,
  availability_status TEXT NOT NULL, -- 'in_stock', 'out_of_stock', 'limited_stock', etc.
  stock_level INTEGER, -- Actual stock count if available
  ships_from TEXT, -- Amazon, third-party, etc.
  sold_by TEXT, -- Seller information
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign key to product table
  CONSTRAINT fk_product_availability_asin 
    FOREIGN KEY (asin) REFERENCES product(asin) ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_product_availability_history_asin_timestamp 
  ON product_availability_history(asin, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_product_availability_history_timestamp 
  ON product_availability_history(timestamp DESC);

-- Add table comment
COMMENT ON TABLE product_availability_history IS 'Stores historical availability data for products, tracking stock status over time.';