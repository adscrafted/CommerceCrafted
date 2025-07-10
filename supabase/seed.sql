-- Seed data for products and analyses

-- First, let's insert some sample products
INSERT INTO products (asin, title, brand, category, subcategory, price, rating, review_count, bsr, monthly_sales, image_urls) VALUES
('B08N5WRWNW', 'Echo Dot (4th Gen) | Smart speaker with Alexa', 'Amazon', 'Electronics', 'Smart Home', 39.99, 4.7, 425000, 5, 15000, 'https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SL1000_.jpg'),
('B07FZ8S74R', 'Kindle Paperwhite – Now Waterproof with 2x Storage', 'Amazon', 'Electronics', 'E-readers', 129.99, 4.3, 89000, 12, 8500, 'https://m.media-amazon.com/images/I/61eAq6gg-XL._AC_SL1000_.jpg'),
('B0B1VQ1ZQY', 'Fire TV Stick 4K Max streaming device', 'Amazon', 'Electronics', 'Streaming Media Players', 54.99, 4.4, 52000, 8, 12000, 'https://m.media-amazon.com/images/I/41wR5+-+K2L._AC_SL1000_.jpg'),
('B09B8W5FX7', 'Apple AirPods (3rd Generation)', 'Apple', 'Electronics', 'Headphones', 169.00, 4.5, 125000, 3, 25000, 'https://m.media-amazon.com/images/I/61CVih3UpdL._AC_SL1500_.jpg'),
('B09G9BL5CP', 'Apple AirTag 4 Pack', 'Apple', 'Electronics', 'Bluetooth Trackers', 99.00, 4.7, 85000, 7, 18000, 'https://m.media-amazon.com/images/I/71gY9E+cTaS._AC_SL1500_.jpg'),
('B08H75RTZ8', 'iPad Air (4th Generation)', 'Apple', 'Electronics', 'Tablets', 599.00, 4.8, 42000, 15, 6500, 'https://m.media-amazon.com/images/I/71VbHaAqbML._AC_SL1500_.jpg');

-- Add product analyses for each product
INSERT INTO product_analyses (product_id, opportunity_score, demand_score, competition_score, feasibility_score, timing_score, financial_analysis, market_analysis, competition_analysis, keyword_analysis, review_analysis, supply_chain_analysis)
SELECT 
    p.id,
    CASE 
        WHEN p.asin = 'B08N5WRWNW' THEN 85
        WHEN p.asin = 'B07FZ8S74R' THEN 78
        WHEN p.asin = 'B0B1VQ1ZQY' THEN 82
        WHEN p.asin = 'B09B8W5FX7' THEN 75
        WHEN p.asin = 'B09G9BL5CP' THEN 88
        WHEN p.asin = 'B08H75RTZ8' THEN 72
    END as opportunity_score,
    CASE 
        WHEN p.asin = 'B08N5WRWNW' THEN 90
        WHEN p.asin = 'B07FZ8S74R' THEN 75
        WHEN p.asin = 'B0B1VQ1ZQY' THEN 85
        WHEN p.asin = 'B09B8W5FX7' THEN 95
        WHEN p.asin = 'B09G9BL5CP' THEN 92
        WHEN p.asin = 'B08H75RTZ8' THEN 70
    END as demand_score,
    CASE 
        WHEN p.asin = 'B08N5WRWNW' THEN 65
        WHEN p.asin = 'B07FZ8S74R' THEN 70
        WHEN p.asin = 'B0B1VQ1ZQY' THEN 60
        WHEN p.asin = 'B09B8W5FX7' THEN 80
        WHEN p.asin = 'B09G9BL5CP' THEN 55
        WHEN p.asin = 'B08H75RTZ8' THEN 85
    END as competition_score,
    CASE 
        WHEN p.asin = 'B08N5WRWNW' THEN 80
        WHEN p.asin = 'B07FZ8S74R' THEN 85
        WHEN p.asin = 'B0B1VQ1ZQY' THEN 82
        WHEN p.asin = 'B09B8W5FX7' THEN 70
        WHEN p.asin = 'B09G9BL5CP' THEN 90
        WHEN p.asin = 'B08H75RTZ8' THEN 65
    END as feasibility_score,
    CASE 
        WHEN p.asin = 'B08N5WRWNW' THEN 88
        WHEN p.asin = 'B07FZ8S74R' THEN 72
        WHEN p.asin = 'B0B1VQ1ZQY' THEN 85
        WHEN p.asin = 'B09B8W5FX7' THEN 78
        WHEN p.asin = 'B09G9BL5CP' THEN 92
        WHEN p.asin = 'B08H75RTZ8' THEN 68
    END as timing_score,
    jsonb_build_object(
        'projectedMonthlySales', p.monthly_sales,
        'projectedMonthlyRevenue', p.monthly_sales * p.price,
        'estimatedProfitMargin', 0.35,
        'roi', 185
    ) as financial_analysis,
    jsonb_build_object(
        'marketSize', 2300000000,
        'growthRate', 15.2,
        'trends', ARRAY['Growing demand', 'Market expansion']
    ) as market_analysis,
    jsonb_build_object(
        'competitorCount', 28,
        'averageRating', 4.2
    ) as competition_analysis,
    jsonb_build_object(
        'primaryKeywords', ARRAY[p.title, p.brand || ' ' || p.subcategory],
        'searchVolume', 89000,
        'difficulty', 72
    ) as keyword_analysis,
    jsonb_build_object(
        'commonComplaints', ARRAY['Price point', 'Delivery time'],
        'strengthPoints', ARRAY['Quality', 'Value', 'Design']
    ) as review_analysis,
    jsonb_build_object(
        'shippingCost', 17.4
    ) as supply_chain_analysis
FROM products p;

-- Add a daily feature
INSERT INTO daily_features (product_id, featured_date, headline, summary)
SELECT 
    id,
    CURRENT_DATE,
    'Exceptional Smart Home Opportunity',
    'The Echo Dot (4th Gen) represents a prime opportunity in the smart home category with strong demand metrics and favorable market conditions.'
FROM products 
WHERE asin = 'B08N5WRWNW'
LIMIT 1;

-- Add some keywords
INSERT INTO keywords (keyword, search_volume, competition_level, cpc, trend) VALUES
('smart speaker', 125000, 'MEDIUM', 1.25, 'rising'),
('alexa device', 89000, 'LOW', 0.85, 'stable'),
('echo dot', 156000, 'HIGH', 1.45, 'rising'),
('kindle paperwhite', 98000, 'MEDIUM', 1.15, 'stable'),
('fire tv stick', 135000, 'HIGH', 1.35, 'rising'),
('airpods', 450000, 'HIGH', 2.15, 'rising'),
('airtag', 235000, 'MEDIUM', 1.85, 'rising'),
('ipad air', 325000, 'HIGH', 2.45, 'stable');

-- Link keywords to products
INSERT INTO product_keywords (product_id, keyword_id, relevance_score)
SELECT 
    p.id,
    k.id,
    0.95
FROM products p
CROSS JOIN keywords k
WHERE 
    (p.asin = 'B08N5WRWNW' AND k.keyword IN ('smart speaker', 'alexa device', 'echo dot')) OR
    (p.asin = 'B07FZ8S74R' AND k.keyword = 'kindle paperwhite') OR
    (p.asin = 'B0B1VQ1ZQY' AND k.keyword = 'fire tv stick') OR
    (p.asin = 'B09B8W5FX7' AND k.keyword = 'airpods') OR
    (p.asin = 'B09G9BL5CP' AND k.keyword = 'airtag') OR
    (p.asin = 'B08H75RTZ8' AND k.keyword = 'ipad air');