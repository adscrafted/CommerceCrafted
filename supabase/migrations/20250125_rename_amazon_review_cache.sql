-- Rename amazon_review_cache to product_customer_reviews_cache for consistency

-- Check if the table exists before renaming
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'amazon_review_cache') THEN
    -- Rename the table
    ALTER TABLE amazon_review_cache RENAME TO product_customer_reviews_cache;
    
    -- Update any indexes
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_amazon_review_cache_asin') THEN
      ALTER INDEX idx_amazon_review_cache_asin RENAME TO idx_product_customer_reviews_cache_asin;
    END IF;
    
    -- Update any other indexes that might exist
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_amazon_review_cache_cached_at') THEN
      ALTER INDEX idx_amazon_review_cache_cached_at RENAME TO idx_product_customer_reviews_cache_cached_at;
    END IF;
    
    RAISE NOTICE 'Successfully renamed amazon_review_cache to product_customer_reviews_cache';
  ELSE
    RAISE NOTICE 'amazon_review_cache table does not exist - skipping rename';
  END IF;
END $$;