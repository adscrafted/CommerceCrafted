#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyNicheData() {
  const nicheId = 'timeless_1753731633499';
  const asins = ['B07YFF4YDQ', 'B08M3J7XDL', 'B08W2G9YXJ', 'B09H5PGYQP', 'B09TSF3TZS'];
  
  console.log('=== NICHE DATA VERIFICATION ===\n');
  
  // Check niche status
  console.log('1. NICHE STATUS:');
  const { data: niche } = await supabase
    .from('niches')
    .select('*')
    .eq('id', nicheId)
    .single();
    
  console.log(`   Status: ${niche?.status}`);
  console.log(`   Total Products: ${niche?.total_products}`);
  console.log(`   Total Keywords: ${niche?.total_keywords}`);
  console.log(`   Processing Progress: ${JSON.stringify(niche?.processing_progress || {}, null, 2)}`);
  
  // Check products
  console.log('\n2. PRODUCTS:');
  const { data: products, count: productCount } = await supabase
    .from('product')
    .select('asin, title, price, rating, review_count, bsr', { count: 'exact' })
    .in('asin', asins);
    
  console.log(`   Products found: ${productCount}`);
  if (products) {
    products.forEach(p => {
      console.log(`   - ${p.asin}: ${p.title?.substring(0, 50)}... ($${p.price}, ${p.rating}⭐, ${p.review_count} reviews, BSR: ${p.bsr})`);
    });
  }
  
  // Check keywords
  console.log('\n3. KEYWORDS:');
  const { data: keywords, count: keywordCount } = await supabase
    .from('product_keywords')
    .select('product_id, keyword', { count: 'exact' })
    .in('product_id', asins);
    
  console.log(`   Keywords found: ${keywordCount}`);
  if (keywords && keywords.length > 0) {
    const keywordsByProduct = keywords.reduce((acc, kw) => {
      if (!acc[kw.product_id]) acc[kw.product_id] = [];
      acc[kw.product_id].push(kw.keyword);
      return acc;
    }, {} as Record<string, string[]>);
    
    Object.entries(keywordsByProduct).forEach(([asin, kws]) => {
      console.log(`   ${asin}: ${kws.length} keywords (${kws.slice(0, 3).join(', ')}...)`);
    });
  }
  
  // Check reviews
  console.log('\n4. REVIEWS:');
  const { data: reviews, count: reviewCount } = await supabase
    .from('product_customer_reviews')
    .select('product_id', { count: 'exact' })
    .in('product_id', asins);
    
  console.log(`   Reviews found: ${reviewCount}`);
  if (reviews && reviews.length > 0) {
    const reviewsByProduct = reviews.reduce((acc, r) => {
      acc[r.product_id] = (acc[r.product_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(reviewsByProduct).forEach(([asin, count]) => {
      console.log(`   ${asin}: ${count} reviews`);
    });
  }
  
  // Check analysis tables
  console.log('\n5. ANALYSIS TABLES:');
  const analysisTables = [
    'niches_overall_analysis',
    'niches_competition_analysis',
    'niches_demand_analysis',
    'niches_financial_analysis',
    'niches_keyword_analysis',
    'niches_launch_strategy',
    'niches_listing_optimization',
    'niches_market_intelligence'
  ];
  
  for (const table of analysisTables) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('niche_id', nicheId);
      
    console.log(`   ${table}: ${count || 0} records`);
  }
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`✅ Niche exists: ${!!niche}`);
  console.log(`${productCount === 5 ? '✅' : '❌'} Products: ${productCount}/5`);
  console.log(`${keywordCount > 0 ? '✅' : '❌'} Keywords: ${keywordCount}`);
  console.log(`${reviewCount > 0 ? '✅' : '❌'} Reviews: ${reviewCount}`);
  
  const analysisTableCounts = await Promise.all(
    analysisTables.map(async table => {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('niche_id', nicheId);
      return count || 0;
    })
  );
  
  const totalAnalysisRecords = analysisTableCounts.reduce((sum, count) => sum + count, 0);
  console.log(`${totalAnalysisRecords > 0 ? '✅' : '❌'} Analysis tables: ${totalAnalysisRecords} total records`);
  
  console.log('\n🌐 Frontend URL: http://localhost:3005/niches/timeless');
  console.log('Navigate through all tabs to verify data display.');
}

verifyNicheData().catch(console.error);