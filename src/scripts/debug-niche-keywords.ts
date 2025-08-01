import { createServiceSupabaseClient } from '@/lib/supabase/server'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function debugNicheKeywords() {
  try {
    const supabase = createServiceSupabaseClient()
    
    console.log('🚀 Debugging niche keywords collection...')
    
    // Find a recent niche with processing status
    const { data: niches, error: nichesError } = await supabase
      .from('niches')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5)
    
    if (nichesError) {
      console.error('❌ Error fetching niches:', nichesError)
      return
    }
    
    console.log(`📦 Found ${niches.length} recent niches:`)
    
    for (const niche of niches) {
      console.log(`\n🎯 Niche: ${niche.title} (${niche.id})`)
      console.log(`   Status: ${niche.status}`)
      console.log(`   ASINs: ${niche.asins || 'N/A'}`)
      console.log(`   Total Keywords: ${niche.total_keywords || 0}`)
      console.log(`   Updated: ${niche.updated_at}`)
      
      // Check if this niche has any keywords in the database
      const { data: keywords, error: keywordsError } = await supabase
        .from('product_keywords')
        .select('*')
        .eq('product_id', niche.id)
        .limit(10)
      
      if (keywordsError) {
        console.log(`   ❌ Error fetching keywords: ${keywordsError.message}`)
      } else {
        console.log(`   🔑 Keywords in DB: ${keywords.length}`)
        if (keywords.length > 0) {
          console.log(`   Sample keywords:`)
          keywords.slice(0, 3).forEach(kw => {
            console.log(`      - ${kw.keyword} (${kw.source})`)
          })
        }
      }
      
      // Check reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('product_customer_reviews')
        .select('count')
        .eq('product_id', niche.id)
        .single()
      
      if (!reviewsError && reviews) {
        console.log(`   💬 Reviews in DB: ${reviews.count || 0}`)
      }
      
      // If this niche has ASINs but no keywords, it's a good candidate for testing
      if (niche.asins && (!niche.total_keywords || niche.total_keywords === 0)) {
        console.log(`   ⚠️ This niche has ASINs but no keywords - potential regression case`)
        
        // Try to extract ASINs
        let asinList = []
        try {
          if (typeof niche.asins === 'string') {
            // Handle comma-separated string
            asinList = niche.asins.split(',').map(a => a.trim()).filter(a => a.length > 0)
          } else if (Array.isArray(niche.asins)) {
            asinList = niche.asins
          }
          
          console.log(`   📦 ASIN List: ${asinList.join(', ')}`)
          
          if (asinList.length > 0) {
            // Test keywords collection for first ASIN
            const testAsin = asinList[0]
            console.log(`   🧪 Testing keywords collection for ${testAsin}...`)
            
            try {
              const response = await fetch('http://localhost:3000/api/amazon/ads-api/keywords', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  asins: [testAsin]
                })
              })
              
              const result = await response.json()
              
              if (result.success) {
                console.log(`   ✅ Keywords API works: ${result.summary.totalKeywords} keywords`)
                console.log(`   📊 API Summary:`, result.summary)
              } else {
                console.log(`   ❌ Keywords API failed:`, result.error)
              }
            } catch (error) {
              console.log(`   ❌ Error testing keywords API:`, error.message)
            }
          }
        } catch (error) {
          console.log(`   ❌ Error parsing ASINs:`, error.message)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging niche keywords:', error)
  }
}

debugNicheKeywords().catch(console.error)