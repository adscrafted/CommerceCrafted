import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateNicheReviewCounts() {
  console.log('🔄 Updating review counts for all niches...')
  
  try {
    // Get all niches
    const { data: niches, error: nicheError } = await supabase
      .from('niches')
      .select('id, niche_name, asins')
    
    if (nicheError) {
      console.error('Error fetching niches:', nicheError)
      return
    }
    
    console.log(`Found ${niches?.length || 0} niches to update`)
    
    for (const niche of niches || []) {
      const asinList = niche.asins?.split(',').map((a: string) => a.trim()).filter(Boolean) || []
      
      if (asinList.length === 0) {
        console.log(`⚠️ Niche ${niche.niche_name} has no ASINs`)
        continue
      }
      
      // Count reviews for this niche
      const { count: reviewCount } = await supabase
        .from('customer_reviews')
        .select('*', { count: 'exact', head: true })
        .in('product_id', asinList)
      
      console.log(`📊 Niche: ${niche.niche_name} (${niche.id})`)
      console.log(`   ASINs: ${asinList.length}`)
      console.log(`   Reviews: ${reviewCount || 0}`)
      
      // Update the niche with the review count
      const { error: updateError } = await supabase
        .from('niches')
        .update({ 
          total_reviews: reviewCount || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', niche.id)
      
      if (updateError) {
        console.error(`❌ Failed to update niche ${niche.id}:`, updateError)
      } else {
        console.log(`✅ Updated niche ${niche.niche_name} with ${reviewCount} reviews`)
      }
    }
    
    console.log('✅ All niches updated!')
    
  } catch (error) {
    console.error('Error updating niche review counts:', error)
  }
}

// Run the update
updateNicheReviewCounts()