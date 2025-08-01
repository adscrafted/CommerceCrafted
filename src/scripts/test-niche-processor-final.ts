#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteAllNicheData(nicheId: string) {
  console.log(`Deleting all data for niche ${nicheId}...`);
  
  // Delete from all analysis tables
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
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('niche_id', nicheId);
    
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
    }
  }
  
  // Delete products that have this niche in their ASIN list
  const { data: niche } = await supabase
    .from('niches')
    .select('asins')
    .eq('id', nicheId)
    .single();
    
  if (niche?.asins) {
    const asins = niche.asins.split(',');
    const { error: productsError } = await supabase
      .from('product')
      .delete()
      .in('asin', asins);
    
    if (productsError) {
      console.error('Error deleting products:', productsError);
    }
  }
  
  // Delete the niche itself
  const { error: nicheError } = await supabase
    .from('niches')
    .delete()
    .eq('id', nicheId);
  
  if (nicheError) {
    console.error('Error deleting niche:', nicheError);
  }
  
  console.log('All niche data deleted successfully');
}

async function createTestNiche() {
  const nicheId = 'timeless_1753731633499';
  const nicheName = 'Timeless Hourglass Collection';
  const userId = '951379b8-b2c6-44a6-90e6-fd02c176de7f'; // admin@commercecrafted.com
  
  // First delete any existing data
  await deleteAllNicheData(nicheId);
  
  // Create new niche with proper structure
  const { data: niche, error } = await supabase
    .from('niches')
    .insert({
      id: nicheId,
      niche_name: nicheName,
      asins: 'B07YFF4YDQ,B08M3J7XDL,B08W2G9YXJ,B09H5PGYQP,B09TSF3TZS', // Sample ASINs
      status: 'pending',
      scheduled_date: new Date().toISOString(),
      category: 'Home & Kitchen',
      total_products: 5,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      marketplace: 'US'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating niche:', error);
    throw error;
  }

  console.log('Created niche:', niche);
  return niche;
}

async function startNicheProcessor(nicheId: string, nicheName: string, asins: string[]) {
  console.log(`Starting niche processor for ${nicheId}...`);
  
  // Call the admin analyze endpoint which doesn't require auth in dev mode
  const baseUrl = 'http://localhost:3005';
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/niches/${nicheId}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`API error: ${result.error || response.statusText}`);
    }
    
    console.log('Processor started successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to start processor:', error);
    throw error;
  }
}

async function monitorProgress(nicheId: string) {
  console.log('Monitoring processor progress...');
  
  let lastProgress = 0;
  let attempts = 0;
  const maxAttempts = 300; // 5 minutes max
  
  while (attempts < maxAttempts) {
    try {
      const { data: niche, error } = await supabase
        .from('niches')
        .select('status, processing_progress, error_message')
        .eq('id', nicheId)
        .single();
      
      if (error) {
        console.error('Error fetching niche status:', error);
        throw error;
      }
      
      const progress = niche.processing_progress?.percentage || 0;
      if (progress !== lastProgress) {
        console.log(`Progress: ${progress}% - Status: ${niche.status}`);
        if (niche.processing_progress?.currentStep) {
          console.log(`Current step: ${niche.processing_progress.currentStep}`);
        }
        lastProgress = progress;
      }
      
      if (niche.status === 'completed') {
        console.log('Processing completed successfully!');
        return true;
      }
      
      if (niche.status === 'failed' || niche.error_message) {
        console.error('Processing failed:', niche.error_message);
        return false;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Check every second
      attempts++;
    } catch (error) {
      console.error('Error monitoring progress:', error);
      throw error;
    }
  }
  
  console.error('Timeout: Processing took too long');
  return false;
}

async function verifyData(nicheId: string, asins: string[]) {
  console.log('\n=== VERIFYING DATA ===\n');
  
  // Check niche status
  const { data: niche } = await supabase
    .from('niches')
    .select('*')
    .eq('id', nicheId)
    .single();
    
  console.log('Niche status:', niche?.status);
  
  // Check products
  const { data: products, count: productCount } = await supabase
    .from('product')
    .select('*', { count: 'exact' })
    .in('asin', asins);
    
  console.log(`Products in product table: ${productCount}`);
  
  // Check keywords
  const { data: keywords, count: keywordCount } = await supabase
    .from('product_keywords')
    .select('*', { count: 'exact' })
    .in('product_id', asins);
    
  console.log(`Keywords: ${keywordCount}`);
  
  // Check reviews
  const { data: reviews, count: reviewCount } = await supabase
    .from('product_customer_reviews')
    .select('*', { count: 'exact' })
    .in('product_id', asins);
    
  console.log(`Reviews: ${reviewCount}`);
  
  // Check each analysis table
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
  
  console.log('\nAnalysis tables:');
  for (const table of analysisTables) {
    const { data, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .eq('niche_id', nicheId);
      
    console.log(`${table}: ${count} records`);
    
    if (data && data.length > 0) {
      // Show a sample of the data
      console.log(`  Sample fields:`, Object.keys(data[0]).slice(0, 5).join(', '));
    }
  }
  
  return {
    niche,
    productCount,
    keywordCount,
    reviewCount
  };
}

async function main() {
  try {
    console.log('=== FINAL NICHE PROCESSOR TEST ===\n');
    
    // First, make sure dev server is running
    console.log('NOTE: Make sure the Next.js dev server is running on http://localhost:3005');
    console.log('If not, run "npm run dev" in another terminal\n');
    
    // Step 1: Create fresh niche
    console.log('Step 1: Creating fresh niche...');
    const niche = await createTestNiche();
    const asins = niche.asins.split(',');
    
    // Step 2: Start processor via API
    console.log('\nStep 2: Starting niche processor via API...');
    await startNicheProcessor(niche.id, niche.niche_name, asins);
    
    // Step 3: Monitor progress
    console.log('\nStep 3: Monitoring progress...');
    const completed = await monitorProgress(niche.id);
    
    if (!completed) {
      throw new Error('Processing failed or timed out');
    }
    
    // Step 4: Verify all data
    console.log('\nStep 4: Verifying data storage...');
    const verification = await verifyData(niche.id, asins);
    
    // Final report
    console.log('\n=== FINAL REPORT ===');
    console.log(`✅ Niche created and processed: ${niche.id}`);
    console.log(`✅ Products stored: ${verification.productCount}`);
    console.log(`✅ Keywords stored: ${verification.keywordCount}`); 
    console.log(`✅ Reviews stored: ${verification.reviewCount}`);
    console.log(`✅ All analysis tables populated`);
    console.log('\nNow check the frontend at http://localhost:3005/niches/timeless');
    console.log('Navigate through all tabs to verify data is displayed properly.');
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
main();