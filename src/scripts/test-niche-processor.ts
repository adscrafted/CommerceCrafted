import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

import { nicheProcessor } from '@/lib/queue/niche-processor'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

async function testNicheProcessor() {
  console.log('🚀 Starting comprehensive end-to-end niche processor test...')
  
  const asins = [
    'B0CFZLNC5F',
    'B07TK5K5TQ',
    'B0DM2N7RNF',
    'B0C3MWF7F1',
    'B0BJD1QW9X',
    'B07FB6NR8V',
    'B0DXPWCY8W',
    'B00L5Q951S',
    'B08PMJFLP8',
    'B0DM43FG22'
  ]
  
  const nicheName = 'Timeless Products Test'
  const nicheId = 'timeless_1753731633499'
  
  try {
    const supabase = createServiceSupabaseClient()
    
    // First, delete the existing niche if it exists
    console.log('🗑️ Deleting existing niche and related data...')
    
    // Delete from all analysis tables first
    const analysisTables = [
      'niches_overall_analysis',
      'niches_market_intelligence',
      'niches_demand_analysis',
      'niches_competition_analysis',
      'niches_financial_analysis',
      'niches_keyword_analysis',
      'niches_launch_strategy',
      'niches_listing_optimization'
    ]
    
    for (const table of analysisTables) {
      const { error } = await supabase.from(table).delete().eq('niche_id', nicheId)
      if (error) console.log(`   Warning: Could not delete from ${table}:`, error.message)
    }
    
    // Delete the niche itself
    const { error: deleteError } = await supabase.from('niches').delete().eq('id', nicheId)
    if (deleteError) console.log('   Warning: Could not delete niche:', deleteError.message)
    
    console.log('✅ Cleanup complete')
    
    // Now create the fresh niche
    
    console.log('📝 Creating niche in database...')
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .insert({
        id: nicheId,
        niche_name: nicheName,
        asins: asins.join(','),
        added_date: new Date().toISOString(),
        scheduled_date: new Date().toISOString(),
        total_products: asins.length,
        status: 'pending',
        category: 'Smart Home',
        created_by: 'a2615f56-b240-46db-b2d5-fdc0c86b0605', // Your user ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (nicheError) {
      console.error('❌ Failed to create niche:', nicheError)
      return
    }
    
    console.log('✅ Niche created:', niche.id)
    
    // Start processing
    console.log('🔄 Starting niche processing...')
    const job = await nicheProcessor.processNiche(nicheId, nicheName, asins, 'US')
    
    console.log('📊 Job started:', {
      nicheId: job.nicheId,
      status: job.status,
      totalAsins: job.asins.length
    })
    
    // Monitor progress with detailed logging
    let lastProgress = -1
    let lastPhase = ''
    const checkInterval = setInterval(async () => {
      const currentJob = nicheProcessor['processingJobs'].get(nicheId)
      
      if (!currentJob) {
        console.log('Job not found in processing queue')
        clearInterval(checkInterval)
        return
      }
      
      // Log phase changes
      if (currentJob.progress.phase !== lastPhase) {
        lastPhase = currentJob.progress.phase
        console.log(`\n🔄 Phase: ${currentJob.progress.phase}`)
      }
      
      // Log progress changes
      if (currentJob.progress.current !== lastProgress) {
        lastProgress = currentJob.progress.current
        console.log(`📈 Progress: ${currentJob.progress.current}/${currentJob.progress.total} ASINs processed`)
        console.log(`   - Completed: ${currentJob.progress.completedAsins.join(', ')}`)
        console.log(`   - Failed: ${currentJob.progress.failedAsins.join(', ')}`)
        
        // Check if products are being saved
        if (currentJob.progress.completedAsins.length > 0) {
          const lastAsin = currentJob.progress.completedAsins[currentJob.progress.completedAsins.length - 1]
          const { count } = await supabase
            .from('product')
            .select('*', { count: 'exact', head: true })
            .eq('id', lastAsin)
          console.log(`   - Product ${lastAsin} saved: ${count > 0 ? 'YES' : 'NO'}`)
        }
      }
      
      if (currentJob.status === 'completed' || currentJob.status === 'failed') {
        clearInterval(checkInterval)
        
        console.log('🏁 Processing completed!')
        console.log(`   - Status: ${currentJob.status}`)
        console.log(`   - Duration: ${currentJob.completedAt ? (currentJob.completedAt.getTime() - currentJob.startedAt!.getTime()) / 1000 : 0}s`)
        console.log(`   - Completed ASINs: ${currentJob.progress.completedAsins.length}`)
        console.log(`   - Failed ASINs: ${currentJob.progress.failedAsins.length}`)
        
        if (currentJob.error) {
          console.error('❌ Error:', currentJob.error)
        }
        
        // Check what data was stored
        await checkStoredData(nicheId)
      }
    }, 2000) // Check every 2 seconds
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

async function checkStoredData(nicheId: string) {
  console.log('\n📊 Performing comprehensive data verification...')
  const supabase = createServiceSupabaseClient()
  
  // First, get the niche details
  const { data: niche, error: nicheError } = await supabase
    .from('niches')
    .select('*')
    .eq('id', nicheId)
    .single()
  
  if (nicheError) {
    console.log('❌ Could not fetch niche:', nicheError.message)
    return
  }
  
  console.log('\n📋 Niche Details:')
  console.log(`   - ID: ${niche.id}`)
  console.log(`   - Name: ${niche.niche_name}`)
  console.log(`   - Status: ${niche.status}`)
  console.log(`   - ASINs: ${niche.asins}`)
  console.log(`   - Total Products: ${niche.total_products}`)
  
  // Check each table
  const tables = [
    'niches',
    'product',
    'product_keywords',
    'product_customer_reviews',
    'niches_overall_analysis',
    'niches_market_intelligence',
    'niches_demand_analysis',
    'niches_competition_analysis',
    'niches_financial_analysis',
    'niches_keyword_analysis',
    'niches_launch_strategy',
    'niches_listing_optimization'
  ]
  
  const asins = niche?.asins?.split(',').map(a => a.trim()) || []
  
  console.log('\n📊 Data Verification Results:')
  
  for (const table of tables) {
    try {
      let query
      let data
      
      if (table === 'niches') {
        query = supabase.from(table).select('*', { count: 'exact' }).eq('id', nicheId)
      } else if (table.startsWith('niches_')) {
        query = supabase.from(table).select('*', { count: 'exact' }).eq('niche_id', nicheId)
      } else if (table === 'product') {
        query = supabase.from(table).select('*', { count: 'exact' }).in('id', asins)
      } else if (table === 'product_keywords' || table === 'product_customer_reviews') {
        query = supabase.from(table).select('*', { count: 'exact' }).in('product_id', asins)
      }
      
      const { count, error, data: records } = await query
      
      if (error) {
        console.log(`   ❌ ${table}: Error - ${error.message}`)
      } else {
        console.log(`   ✅ ${table}: ${count} records`)
        
        // Show sample data for verification
        if (count > 0 && records && records.length > 0) {
          if (table === 'product') {
            console.log(`      Sample: ${records[0].id} - ${records[0].title?.substring(0, 50)}...`)
          } else if (table === 'product_keywords') {
            console.log(`      Sample: ${records[0].keyword} (Volume: ${records[0].search_volume})`)
          } else if (table === 'product_customer_reviews') {
            console.log(`      Sample: ${records[0].rating} stars - "${records[0].title?.substring(0, 40)}..."`)  
          } else if (table.startsWith('niches_')) {
            const keys = Object.keys(records[0]).filter(k => !['id', 'niche_id', 'created_at', 'updated_at'].includes(k))
            console.log(`      Fields populated: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`)
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ ${table}: Error - ${error}`)
    }
  }
  
  // Additional verification - check if AI analysis was generated
  console.log('\n🤖 AI Analysis Verification:')
  const { data: aiAnalysis } = await supabase
    .from('niches_overall_analysis')
    .select('executive_summary, market_opportunity_score')
    .eq('niche_id', nicheId)
    .single()
  
  if (aiAnalysis?.executive_summary) {
    console.log('   ✅ AI Analysis Generated')
    console.log(`      Market Opportunity Score: ${aiAnalysis.market_opportunity_score}`)
    console.log(`      Summary Preview: ${aiAnalysis.executive_summary.substring(0, 100)}...`)
  } else {
    console.log('   ❌ No AI Analysis Found')
  }
}

// Run the test
testNicheProcessor().catch(console.error)