-- Step 2: Add cascading deletions and triggers AFTER data is clean
-- This migration adds the constraints and triggers

-- 1. Add CASCADE to product_keywords -> product relationship
ALTER TABLE product_keywords 
DROP CONSTRAINT IF EXISTS product_keywords_product_id_fkey;

ALTER TABLE product_keywords
ADD CONSTRAINT product_keywords_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE;

-- 2. Add CASCADE to product_customer_reviews -> product relationship
ALTER TABLE product_customer_reviews 
DROP CONSTRAINT IF EXISTS product_customer_reviews_product_id_fkey;

ALTER TABLE product_customer_reviews
ADD CONSTRAINT product_customer_reviews_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE;

-- 3. Add CASCADE to product_customer_reviews_cache -> product relationship (using ASIN)
CREATE OR REPLACE FUNCTION cleanup_product_cache()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM product_customer_reviews_cache WHERE asin = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cleanup_product_cache_trigger ON product;
CREATE TRIGGER cleanup_product_cache_trigger
AFTER DELETE ON product
FOR EACH ROW
EXECUTE FUNCTION cleanup_product_cache();

-- 4. Create a function to clean up products when a niche is deleted
CREATE OR REPLACE FUNCTION cleanup_niche_products()
RETURNS TRIGGER AS $$
DECLARE
    asin_array TEXT[];
    asin TEXT;
BEGIN
    -- Convert comma-separated ASINs to array
    IF OLD.asins IS NOT NULL AND OLD.asins != '' THEN
        asin_array := string_to_array(OLD.asins, ',');
        
        -- Clean up each ASIN
        FOREACH asin IN ARRAY asin_array
        LOOP
            asin := trim(asin);
            
            -- Delete product if it's not referenced by any other niche
            DELETE FROM product p
            WHERE p.id = asin
            AND NOT EXISTS (
                SELECT 1 FROM niches n 
                WHERE n.id != OLD.id 
                AND n.asins LIKE '%' || asin || '%'
            );
        END LOOP;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cleanup_niche_products_trigger ON niches;
CREATE TRIGGER cleanup_niche_products_trigger
AFTER DELETE ON niches
FOR EACH ROW
EXECUTE FUNCTION cleanup_niche_products();

-- 5. Create a function to clean up products when niches are updated (ASINs removed)
CREATE OR REPLACE FUNCTION cleanup_removed_products()
RETURNS TRIGGER AS $$
DECLARE
    old_asins TEXT[];
    new_asins TEXT[];
    removed_asin TEXT;
BEGIN
    -- Only process if asins column was changed
    IF OLD.asins IS DISTINCT FROM NEW.asins THEN
        -- Convert to arrays
        old_asins := string_to_array(COALESCE(OLD.asins, ''), ',');
        new_asins := string_to_array(COALESCE(NEW.asins, ''), ',');
        
        -- Find removed ASINs
        FOREACH removed_asin IN ARRAY old_asins
        LOOP
            removed_asin := trim(removed_asin);
            
            -- If this ASIN was removed from the current niche
            IF removed_asin != '' AND NOT (removed_asin = ANY(new_asins)) THEN
                -- Delete product if it's not referenced by any niche anymore
                DELETE FROM product p
                WHERE p.id = removed_asin
                AND NOT EXISTS (
                    SELECT 1 FROM niches n 
                    WHERE n.asins LIKE '%' || removed_asin || '%'
                );
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cleanup_removed_products_trigger ON niches;
CREATE TRIGGER cleanup_removed_products_trigger
AFTER UPDATE ON niches
FOR EACH ROW
EXECUTE FUNCTION cleanup_removed_products();

-- 6. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_keywords_product_id ON product_keywords(product_id);
CREATE INDEX IF NOT EXISTS idx_product_customer_reviews_product_id ON product_customer_reviews(product_id);

-- 7. Create a helper function to completely remove a niche and all its data
CREATE OR REPLACE FUNCTION delete_niche_completely(niche_id_param TEXT)
RETURNS void AS $$
BEGIN
    -- Due to CASCADE and triggers, deleting the niche will automatically:
    -- 1. Delete all niches_* analysis tables entries (via CASCADE)
    -- 2. Delete orphaned products (via trigger)
    -- 3. Delete all product-related data (via CASCADE from products)
    DELETE FROM niches WHERE id = niche_id_param;
END;
$$ LANGUAGE plpgsql;

-- 8. Create a function to check for orphaned data (useful for maintenance)
CREATE OR REPLACE FUNCTION check_orphaned_data()
RETURNS TABLE (
    table_name TEXT,
    orphaned_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'orphaned_products'::TEXT, COUNT(*)
    FROM product p
    WHERE NOT EXISTS (
        SELECT 1 FROM niches n 
        WHERE n.asins LIKE '%' || p.id || '%'
    )
    UNION ALL
    SELECT 'orphaned_keywords'::TEXT, COUNT(*)
    FROM product_keywords pk
    WHERE NOT EXISTS (
        SELECT 1 FROM product p WHERE p.id = pk.product_id
    )
    UNION ALL
    SELECT 'orphaned_reviews'::TEXT, COUNT(*)
    FROM product_customer_reviews pcr
    WHERE NOT EXISTS (
        SELECT 1 FROM product p WHERE p.id = pcr.product_id
    );
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments
COMMENT ON FUNCTION delete_niche_completely(TEXT) IS 'Completely removes a niche and all associated data including products not in other niches';
COMMENT ON FUNCTION check_orphaned_data() IS 'Returns count of orphaned records in various tables for maintenance';
COMMENT ON TRIGGER cleanup_niche_products_trigger ON niches IS 'Automatically removes products that are no longer in any niche when niche is deleted';
COMMENT ON TRIGGER cleanup_removed_products_trigger ON niches IS 'Automatically removes products that are no longer in any niche when ASINs are removed from niche';