import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { nicheProcessor } from '@/lib/queue/niche-processor'

async function generateDemandAnalysis() {
  console.log('🚀 Starting demand analysis generation for existing niches...')
  
  const supabase = createServiceSupabaseClient()
  
  try {
    // Get all completed niches
    const { data: niches, error } = await supabase
      .from('niches')
      .select('*')
      .eq('status', 'completed')
    
    if (error) {
      console.error('❌ Error fetching niches:', error)
      return
    }
    
    console.log(`📦 Found ${niches?.length || 0} completed niches`)
    
    if (!niches || niches.length === 0) {
      console.log('⚠️ No completed niches found')
      return
    }
    
    // Process each niche
    for (const niche of niches) {
      console.log(`\n🔄 Processing niche: ${niche.niche_name} (${niche.id})`)
      
      // Call the public generateMarketInsightsForNiche method
      try {
        await nicheProcessor.generateMarketInsightsForNiche(niche.id)
        console.log(`✅ Successfully generated demand analysis for ${niche.niche_name}`)
      } catch (error) {
        console.error(`❌ Failed to generate demand analysis for ${niche.niche_name}:`, error)
      }
    }
    
    console.log('\n✨ Demand analysis generation completed!')
    
  } catch (error) {
    console.error('🚨 Script failed:', error)
  }
}

// Run the script
generateDemandAnalysis()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script error:', error)
    process.exit(1)
  })