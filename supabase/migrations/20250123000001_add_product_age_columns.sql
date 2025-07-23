-- Add product age columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS first_seen_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS product_age_months INTEGER,
ADD COLUMN IF NOT EXISTS product_age_category TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_age_category ON products(product_age_category);
CREATE INDEX IF NOT EXISTS idx_products_first_seen ON products(first_seen_date);