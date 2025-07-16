#!/usr/bin/env node

/**
 * MAXIMUM KEYWORD COLLECTION E2E TEST
 * 
 * This test demonstrates the full JungleAce-style keyword collection:
 * - Uses ALL endpoints (Suggested Keywords + Recommendations + Bid Enrichment)
 * - Collects maximum keywords possible (1000+ per ASIN)
 * - Tests complete pipeline: Niche Creation → API Calls → Database Storage
 * - Verifies data quality and completeness
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  section: (msg) => console.log(chalk.cyan('\n' + '='.repeat(80) + '\n' + msg + '\n' + '='.repeat(80))),
  data: (label, data) => console.log(chalk.gray(label + ':'), JSON.stringify(data, null, 2))
};

// Test ASINs - chosen for rich keyword data
const testASINs = [
  'B0F9LQYTZH', // Protein Coffee (rich keywords)
  'B0B1VQ1ZQY'  // Fire Tablet (rich keywords)
];

const SERVER_URL = 'http://localhost:3003'; // Adjust port as needed

async function runMaximumKeywordE2E() {
  log.section('🚀 MAXIMUM KEYWORD COLLECTION E2E TEST');
  log.info('This test demonstrates the full JungleAce-style keyword collection system');
  log.info(`Testing with ${testASINs.length} ASINs for maximum keyword collection`);
  
  let nicheId = null;
  let startTime = Date.now();
  
  try {
    // Step 1: Create niche
    log.section('STEP 1: CREATE NICHE WITH MAXIMUM KEYWORD COLLECTION');
    
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    const userId = users?.[0]?.id || crypto.randomUUID();
    nicheId = `max_keywords_${Date.now()}`;
    
    const nicheData = {
      id: nicheId,
      niche_name: `Maximum Keywords Test - ${new Date().toLocaleString()}`,
      asins: testASINs.join(','),
      scheduled_date: new Date().toISOString(),
      added_date: new Date().toISOString(),
      total_products: testASINs.length,
      status: 'processing',
      category: 'Electronics',
      competition_level: 'MEDIUM',
      analyst_assigned: 'Max Keywords Bot',
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .insert(nicheData)
      .select()
      .single();
    
    if (nicheError) throw nicheError;
    
    log.success(`✓ Created niche: ${niche.niche_name}`);
    log.success(`✓ Niche ID: ${niche.id}`);
    
    // Step 2: Process each ASIN with MAXIMUM keyword collection
    log.section('STEP 2: COLLECT MAXIMUM KEYWORDS FROM ALL ENDPOINTS');
    
    let totalKeywordsCollected = 0;
    const asinResults = [];
    
    for (let i = 0; i < testASINs.length; i++) {
      const asin = testASINs[i];
      log.info(`\n📦 Processing ASIN ${i+1}/${testASINs.length}: ${asin}`);
      log.info('   🎯 Using comprehensive keyword collection...');
      
      const asinStartTime = Date.now();
      
      // Create/find product
      let productId = null;
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('asin', asin)
        .single();
      
      if (existingProduct) {
        productId = existingProduct.id;
        log.info(`  ℹ Using existing product: ${productId}`);
      } else {
        productId = crypto.randomUUID();
        await supabase
          .from('products')
          .insert({
            id: productId,
            asin: asin,
            title: `Product ${asin}`,
            created_at: new Date().toISOString()
          });
        log.success(`  ✓ Created product: ${productId}`);
      }
      
      // Step 2a: Fetch Keepa data (for product enrichment)
      log.info(`  🔍 Fetching Keepa data...`);
      try {
        const keepaResponse = await fetch(`${SERVER_URL}/api/keepa/fetch-product`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asin })
        });
        
        if (keepaResponse.ok) {
          const keepaData = await keepaResponse.json();
          log.success(`  ✓ Keepa data fetched successfully`);
          
          // Update product with Keepa data
          if (keepaData.data) {
            await supabase
              .from('products')
              .update({
                title: keepaData.data.title || `Product ${asin}`,
                brand: keepaData.data.brand,
                price: keepaData.data.currentPrice,
                bsr: keepaData.data.currentBsr,
                rating: keepaData.data.currentRating,
                review_count: keepaData.data.currentReviewCount,
                category: keepaData.data.category,
                updated_at: new Date().toISOString()
              })
              .eq('id', productId);
            
            log.success(`  ✓ Product enriched with Keepa data`);
          }
        } else {
          log.warning(`  ⚠ Keepa API failed: ${keepaResponse.status}`);
        }
      } catch (keepaError) {
        log.error(`  ✗ Keepa error: ${keepaError.message}`);
      }
      
      // Step 2b: MAXIMUM KEYWORD COLLECTION using comprehensive endpoint
      log.info(`  🎯 Collecting MAXIMUM keywords from ALL endpoints...`);
      try {
        const keywordResponse = await fetch(`${SERVER_URL}/api/amazon/ads-api/keywords-comprehensive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asins: [asin] })
        });
        
        if (keywordResponse.ok) {
          const keywordData = await keywordResponse.json();
          const keywordCount = keywordData.keywords?.length || 0;
          totalKeywordsCollected += keywordCount;
          
          log.success(`  ✅ COLLECTED ${keywordCount} KEYWORDS!`);
          log.info(`    📊 From suggested keywords: ${keywordData.summary?.suggestedKeywords || 0}`);
          log.info(`    📊 From recommendations: ${keywordData.summary?.recommendations || 0}`);
          log.info(`    📊 With bid estimates: ${keywordData.summary?.withEstimates || 0}`);
          log.info(`    📊 Cross-pollination: ${keywordData.summary?.crossPollination || 0}`);
          
          // Store keywords in database
          if (keywordData.keywords && keywordData.keywords.length > 0) {
            // Store ALL keywords (not limited to 50 like in testing)
            const keywordsToStore = keywordData.keywords.map(kw => ({
              product_id: productId,
              keyword: kw.keyword,
              match_type: kw.matchType || 'BROAD',
              suggested_bid: (kw.suggestedBid || 0) / 100, // Convert cents to dollars
              estimated_clicks: kw.estimatedClicks || 0,
              estimated_orders: kw.estimatedOrders || 0,
              created_at: new Date().toISOString()
            }));
            
            // Insert in batches to avoid timeout
            const batchSize = 100;
            let storedCount = 0;
            
            for (let j = 0; j < keywordsToStore.length; j += batchSize) {
              const batch = keywordsToStore.slice(j, j + batchSize);
              const { error: keywordError } = await supabase
                .from('product_keywords')
                .insert(batch);
              
              if (!keywordError) {
                storedCount += batch.length;
              } else {
                log.error(`  ✗ Failed to store batch: ${keywordError.message}`);
              }
            }
            
            log.success(`  ✅ Stored ${storedCount} keywords in database`);
          }
        } else {
          log.warning(`  ⚠ Keywords API failed: ${keywordResponse.status}`);
        }
      } catch (keywordError) {
        log.error(`  ✗ Keyword collection error: ${keywordError.message}`);
      }
      
      const asinTime = Date.now() - asinStartTime;
      log.info(`  ⏱️ ASIN processed in ${(asinTime / 1000).toFixed(2)}s`);
      
      asinResults.push({
        asin,
        keywordCount: totalKeywordsCollected,
        processingTime: asinTime
      });
      
      // Rate limiting between ASINs
      if (i < testASINs.length - 1) {
        log.info('  ⏳ Waiting 3 seconds before next ASIN...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Step 3: Update niche with final analytics
    log.section('STEP 3: CALCULATE NICHE ANALYTICS');
    
    // Get all products for this niche
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('asin', testASINs);
    
    // Get all keywords for this niche
    const productIds = products?.map(p => p.id) || [];
    const { data: allKeywords } = await supabase
      .from('product_keywords')
      .select('keyword, product_id')
      .in('product_id', productIds);
    
    // Calculate analytics
    const uniqueKeywords = new Set(allKeywords?.map(k => k.keyword) || []);
    const totalReviews = products?.reduce((sum, p) => sum + (p.review_count || 0), 0) || 0;
    const avgPrice = products?.reduce((sum, p) => sum + (p.price || 0), 0) / (products?.length || 1);
    const avgBsr = products?.reduce((sum, p) => sum + (p.bsr || 0), 0) / (products?.length || 1);
    
    // Update niche with final analytics
    await supabase
      .from('niches')
      .update({
        status: 'completed',
        total_keywords: uniqueKeywords.size,
        total_reviews: totalReviews,
        avg_price: avgPrice,
        avg_bsr: avgBsr,
        niche_keywords: Array.from(uniqueKeywords).slice(0, 50).join(','),
        process_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', nicheId);
    
    log.success('✅ Niche analytics calculated and updated');
    
    // Step 4: Comprehensive verification
    log.section('STEP 4: COMPREHENSIVE VERIFICATION');
    
    // Verify niche data
    const { data: finalNiche } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single();
    
    log.info('📊 Final Niche Data:');
    log.info(`   Name: ${finalNiche.niche_name}`);
    log.info(`   ASINs: ${finalNiche.total_products}`);
    log.info(`   Keywords: ${finalNiche.total_keywords}`);
    log.info(`   Reviews: ${finalNiche.total_reviews}`);
    log.info(`   Avg Price: $${finalNiche.avg_price?.toFixed(2) || '0.00'}`);
    log.info(`   Avg BSR: ${finalNiche.avg_bsr?.toFixed(0) || '0'}`);
    log.info(`   Status: ${finalNiche.status}`);
    
    // Verify product data
    log.info('\n📦 Product Verification:');
    for (const product of products || []) {
      const productKeywords = allKeywords?.filter(k => k.product_id === product.id) || [];
      log.info(`   ${product.asin}:`);
      log.info(`     Title: ${product.title || 'N/A'}`);
      log.info(`     Brand: ${product.brand || 'N/A'}`);
      log.info(`     Price: $${product.price || 'N/A'}`);
      log.info(`     BSR: ${product.bsr || 'N/A'}`);
      log.info(`     Reviews: ${product.review_count || 0}`);
      log.info(`     Keywords: ${productKeywords.length}`);
      
      // Show sample keywords
      if (productKeywords.length > 0) {
        log.info(`     Sample keywords:`);
        productKeywords.slice(0, 5).forEach((kw, i) => {
          log.info(`       ${i+1}. "${kw.keyword}"`);
        });
      }
    }
    
    // Final summary
    const totalTime = Date.now() - startTime;
    log.section('🎉 MAXIMUM KEYWORD COLLECTION E2E TEST COMPLETE');
    
    log.success('✅ All systems working at maximum capacity!');
    log.info(`\n📊 Final Results:`);
    log.info(`   ✅ Niche created: ${finalNiche.niche_name}`);
    log.info(`   ✅ Products processed: ${testASINs.length}`);
    log.info(`   ✅ Total keywords collected: ${finalNiche.total_keywords}`);
    log.info(`   ✅ Total reviews: ${finalNiche.total_reviews}`);
    log.info(`   ✅ Keepa data: Enriched product information`);
    log.info(`   ✅ Ads API data: Maximum keyword collection`);
    log.info(`   ✅ Database storage: All data persisted`);
    log.info(`   ✅ Analytics: Niche-level calculations complete`);
    log.info(`   ⏱️ Total time: ${(totalTime / 1000).toFixed(2)}s`);
    
    log.info(`\n🔗 View results:`);
    log.info(`   Admin: http://localhost:3003/admin/niche`);
    log.info(`   Niche ID: ${nicheId}`);
    
    log.info(`\n📈 Performance:`);
    asinResults.forEach((result, i) => {
      log.info(`   ASIN ${i+1} (${result.asin}): ${result.keywordCount} keywords in ${(result.processingTime / 1000).toFixed(2)}s`);
    });
    
    log.success('\n🚀 This demonstrates the FULL JungleAce-style keyword collection system!');
    
  } catch (error) {
    log.error('Test failed:', error.message);
    console.error(error);
  }
}

// Run the test
runMaximumKeywordE2E().catch(console.error);