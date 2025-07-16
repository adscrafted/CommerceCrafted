#!/usr/bin/env node

// Fix keyword counts for existing test niches
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixNicheKeywordCounts() {
  console.log('🔧 Fixing Niche Keyword Counts');
  console.log('===============================\n');

  // Get all niches with null or 0 total_keywords
  const { data: niches } = await supabase
    .from('niches')
    .select('id, niche_name, asins, total_keywords')
    .or('total_keywords.is.null,total_keywords.eq.0')
    .order('created_at', { ascending: false });

  if (!niches || niches.length === 0) {
    console.log('✅ No niches need fixing');
    return;
  }

  console.log(`Found ${niches.length} niches to fix:`);
  
  for (const niche of niches) {
    console.log(`\n📦 Processing: ${niche.niche_name}`);
    console.log(`   Current total_keywords: ${niche.total_keywords}`);
    
    // Get ASINs for this niche
    const asins = niche.asins.split(',').map(a => a.trim());
    
    // Get products for these ASINs
    const { data: products } = await supabase
      .from('products')
      .select('id, asin')
      .in('asin', asins);
    
    if (!products || products.length === 0) {
      console.log('   ⚠️  No products found for this niche');
      continue;
    }
    
    // Get all keywords for these products
    const productIds = products.map(p => p.id);
    const { data: keywords } = await supabase
      .from('product_keywords')
      .select('keyword, product_id')
      .in('product_id', productIds);
    
    // Count unique keywords
    const uniqueKeywords = new Set();
    let totalKeywordCount = 0;
    
    if (keywords) {
      keywords.forEach(kw => {
        if (kw.keyword) {
          uniqueKeywords.add(kw.keyword);
          totalKeywordCount++;
        }
      });
    }
    
    console.log(`   Found ${totalKeywordCount} total keywords (${uniqueKeywords.size} unique)`);
    
    // Update niche with correct keyword count
    const { error } = await supabase
      .from('niches')
      .update({
        total_keywords: uniqueKeywords.size,
        niche_keywords: Array.from(uniqueKeywords).slice(0, 50).join(','),
        updated_at: new Date().toISOString()
      })
      .eq('id', niche.id);
    
    if (error) {
      console.log(`   ❌ Error updating niche: ${error.message}`);
    } else {
      console.log(`   ✅ Updated total_keywords to ${uniqueKeywords.size}`);
    }
  }
  
  console.log('\n🎉 Keyword count fixing complete!');
}

fixNicheKeywordCounts().catch(console.error);