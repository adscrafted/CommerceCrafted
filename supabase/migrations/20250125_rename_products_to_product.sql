-- Rename products table to product for consistency with singular table naming

-- First, drop all foreign key constraints that reference the products table
-- Using DO blocks to check if tables exist before dropping constraints
DO $$
BEGIN
  -- Check each table and drop its constraint if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'niche_products') THEN
    ALTER TABLE niche_products DROP CONSTRAINT IF EXISTS niche_products_product_id_fkey;
  END IF;
  
  -- These tables use 'asin' column, not 'product_id'
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_price_history') THEN
    ALTER TABLE product_price_history DROP CONSTRAINT IF EXISTS product_price_history_asin_fkey;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_review_history') THEN
    ALTER TABLE product_review_history DROP CONSTRAINT IF EXISTS product_review_history_asin_fkey;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_sales_rank_history') THEN
    ALTER TABLE product_sales_rank_history DROP CONSTRAINT IF EXISTS product_sales_rank_history_asin_fkey;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_customer_reviews') THEN
    ALTER TABLE product_customer_reviews DROP CONSTRAINT IF EXISTS product_customer_reviews_product_id_fkey;
    ALTER TABLE product_customer_reviews DROP CONSTRAINT IF EXISTS product_customer_reviews_asin_fkey;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_daily_features') THEN
    ALTER TABLE product_daily_features DROP CONSTRAINT IF EXISTS product_daily_features_product_id_fkey;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'market_intelligence') THEN
    ALTER TABLE market_intelligence DROP CONSTRAINT IF EXISTS market_intelligence_product_id_fkey;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_keywords') THEN
    ALTER TABLE product_keywords DROP CONSTRAINT IF EXISTS product_keywords_product_id_fkey;
  END IF;
END $$;

-- Rename the table
ALTER TABLE products RENAME TO product;

-- Re-add all foreign key constraints with the new table name
DO $$
BEGIN
  -- Re-add constraints only for tables that exist and have the product_id column
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'niche_products') AND 
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='niche_products' AND column_name='product_id') THEN
    ALTER TABLE niche_products ADD CONSTRAINT niche_products_product_id_fkey 
      FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE;
  END IF;
  
  -- product_price_history, product_review_history, and product_sales_rank_history use 'asin' not 'product_id'
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_price_history') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_price_history' AND column_name='asin') THEN
    ALTER TABLE product_price_history DROP CONSTRAINT IF EXISTS product_price_history_asin_fkey;
    -- Check for orphaned records before creating foreign key
    IF NOT EXISTS (
      SELECT 1 FROM product_price_history pph
      WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.asin = pph.asin)
      LIMIT 1
    ) THEN
      ALTER TABLE product_price_history ADD CONSTRAINT product_price_history_asin_fkey 
        FOREIGN KEY (asin) REFERENCES product(asin) ON DELETE CASCADE;
    ELSE
      RAISE NOTICE 'Skipping foreign key for product_price_history due to orphaned records';
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_review_history') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_review_history' AND column_name='asin') THEN
    ALTER TABLE product_review_history DROP CONSTRAINT IF EXISTS product_review_history_asin_fkey;
    -- Check for orphaned records before creating foreign key
    IF NOT EXISTS (
      SELECT 1 FROM product_review_history prh
      WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.asin = prh.asin)
      LIMIT 1
    ) THEN
      ALTER TABLE product_review_history ADD CONSTRAINT product_review_history_asin_fkey 
        FOREIGN KEY (asin) REFERENCES product(asin) ON DELETE CASCADE;
    ELSE
      RAISE NOTICE 'Skipping foreign key for product_review_history due to orphaned records';
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_sales_rank_history') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_sales_rank_history' AND column_name='asin') THEN
    ALTER TABLE product_sales_rank_history DROP CONSTRAINT IF EXISTS product_sales_rank_history_asin_fkey;
    -- Check for orphaned records before creating foreign key
    IF NOT EXISTS (
      SELECT 1 FROM product_sales_rank_history psrh
      WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.asin = psrh.asin)
      LIMIT 1
    ) THEN
      ALTER TABLE product_sales_rank_history ADD CONSTRAINT product_sales_rank_history_asin_fkey 
        FOREIGN KEY (asin) REFERENCES product(asin) ON DELETE CASCADE;
    ELSE
      RAISE NOTICE 'Skipping foreign key for product_sales_rank_history due to orphaned records';
    END IF;
  END IF;
  
  -- product_customer_reviews also uses ASIN as the product_id column contains ASIN values
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_customer_reviews') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_customer_reviews' AND column_name='product_id') THEN
    -- Check if product_id contains ASIN values (non-UUID format)
    IF EXISTS (SELECT 1 FROM product_customer_reviews WHERE product_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' LIMIT 1) THEN
      -- product_id contains ASINs, check for orphaned records
      IF NOT EXISTS (
        SELECT 1 FROM product_customer_reviews pcr
        WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.asin = pcr.product_id)
        LIMIT 1
      ) THEN
        -- No orphaned records, safe to create foreign key to product(asin)
        ALTER TABLE product_customer_reviews ADD CONSTRAINT product_customer_reviews_product_id_fkey 
          FOREIGN KEY (product_id) REFERENCES product(asin) ON DELETE CASCADE;
      ELSE
        RAISE NOTICE 'Skipping foreign key for product_customer_reviews due to orphaned records';
      END IF;
    ELSE
      -- product_id contains UUIDs, check for orphaned records
      IF NOT EXISTS (
        SELECT 1 FROM product_customer_reviews pcr
        WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.id = pcr.product_id)
        LIMIT 1
      ) THEN
        -- No orphaned records, safe to create foreign key to product(id)
        ALTER TABLE product_customer_reviews ADD CONSTRAINT product_customer_reviews_product_id_fkey 
          FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE;
      ELSE
        RAISE NOTICE 'Skipping foreign key for product_customer_reviews due to orphaned records';
      END IF;
    END IF;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_daily_features') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_daily_features' AND column_name='product_id') THEN
    ALTER TABLE product_daily_features ADD CONSTRAINT product_daily_features_product_id_fkey 
      FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'market_intelligence') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='market_intelligence' AND column_name='product_id') THEN
    ALTER TABLE market_intelligence ADD CONSTRAINT market_intelligence_product_id_fkey 
      FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'product_keywords') AND
     EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_keywords' AND column_name='product_id') THEN
    ALTER TABLE product_keywords ADD CONSTRAINT product_keywords_product_id_fkey 
      FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update any indexes that might exist
DROP INDEX IF EXISTS idx_products_asin;
CREATE INDEX IF NOT EXISTS idx_product_asin ON product(asin);

-- Only create niche_id index if the column exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product' AND column_name='niche_id') THEN
    DROP INDEX IF EXISTS idx_products_niche_id;
    CREATE INDEX IF NOT EXISTS idx_product_niche_id ON product(niche_id);
  END IF;
END $$;

-- Update any views that reference the products table
-- (Add any view updates here if needed)