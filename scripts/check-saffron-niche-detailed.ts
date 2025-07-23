import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSaffronNicheDetailed() {
  console.log('🔍 Detailed Saffron Supplements Niche Status Check...\n')
  
  try {
    // 1. Check the niche record
    console.log('1️⃣ Fetching Saffron niche details...')
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .ilike('niche_name', '%saffron%')
      .single()
    
    if (nicheError) {
      console.error('❌ Error fetching niche:', nicheError)
      return
    }
    
    console.log('✅ Niche Details:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`   Name: ${niche.niche_name}`)
    console.log(`   ID: ${niche.id}`)
    console.log(`   Status: ${niche.status}`)
    console.log(`   Created: ${new Date(niche.created_at).toLocaleString()}`)
    console.log(`   Updated: ${new Date(niche.updated_at).toLocaleString()}`)
    
    if (niche.processing_progress) {
      const progress = niche.processing_progress
      console.log('\n   📊 Processing Progress:')
      console.log(`   - Percentage: ${progress.percentage}%`)
      console.log(`   - Total ASINs: ${progress.total}`)
      console.log(`   - Completed: ${progress.completedAsins?.length || 0}`)
      console.log(`   - Failed: ${progress.failedAsins?.length || 0}`)
      console.log(`   - API Calls Made: ${progress.apiCallsMade || 0}`)
    }
    
    // Parse ASINs
    const asins = niche.asins?.split(',').map(a => a.trim()).filter(Boolean) || []
    console.log(`\n   📦 ASINs (${asins.length} total):`)
    asins.forEach((asin, idx) => {
      console.log(`   ${idx + 1}. ${asin}`)
    })
    
    // 2. Check products with full details
    console.log('\n\n2️⃣ Checking Product Details...')
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .in('asin', asins)
      .order('created_at', { ascending: true })
    
    if (productError) {
      console.error('❌ Error fetching products:', productError)
    } else {
      console.log(`✅ Found ${products?.length || 0}/${asins.length} products in database\n`)
      
      if (products && products.length > 0) {
        products.forEach((product, idx) => {
          console.log(`${idx + 1}. ASIN: ${product.asin}`)
          console.log(`   Title: ${product.title?.substring(0, 60)}...`)
          console.log(`   Price: $${product.price || 'N/A'}`)
          console.log(`   BSR: ${product.bsr || 'N/A'}`)
          console.log(`   Rating: ${product.rating || 'N/A'} (${product.reviews || 0} reviews)`)
          console.log(`   Status: ${product.status}`)
          console.log(`   Added: ${new Date(product.created_at).toLocaleString()}`)
          console.log('')
        })
      }
    }
    
    // 3. Check product_keywords table with correct column name
    console.log('\n3️⃣ Checking Keyword Data...')
    const { data: keywordData, error: keywordError } = await supabase
      .from('product_keywords')
      .select('*')
      .in('product_id', asins)
    
    if (keywordError) {
      console.error('❌ Error fetching keywords:', keywordError)
    } else {
      console.log(`✅ Found ${keywordData?.length || 0} keyword records\n`)
      
      if (keywordData && keywordData.length > 0) {
        let totalKeywords = 0
        const keywordsByProduct = new Map<string, number>()
        
        keywordData.forEach(kd => {
          if (kd.keywords && Array.isArray(kd.keywords)) {
            const count = kd.keywords.length
            totalKeywords += count
            keywordsByProduct.set(kd.product_id, (keywordsByProduct.get(kd.product_id) || 0) + count)
          }
        })
        
        console.log(`📈 Total keywords collected: ${totalKeywords}`)
        console.log('\n📊 Keywords by product:')
        Array.from(keywordsByProduct.entries()).forEach(([asin, count]) => {
          console.log(`   ${asin}: ${count} keywords`)
        })
        
        // Show sample keywords from first product
        if (keywordData[0]?.keywords && keywordData[0].keywords.length > 0) {
          console.log(`\n🔍 Sample keywords from ${keywordData[0].product_id}:`)
          keywordData[0].keywords.slice(0, 5).forEach((kw: any, idx: number) => {
            console.log(`   ${idx + 1}. "${kw.keyword}" - Bid: $${kw.bid || 'N/A'}, Volume: ${kw.searchVolume || 'N/A'}`)
          })
        }
      }
    }
    
    // 4. Check for any analysis data
    console.log('\n\n4️⃣ Checking Analysis Data...')
    const { data: analyses, error: analysisError } = await supabase
      .from('product_analyses')
      .select('*')
      .in('product_id', asins)
    
    if (analysisError) {
      console.error('❌ Error fetching analyses:', analysisError)
    } else {
      console.log(`✅ Found ${analyses?.length || 0} product analyses`)
      
      if (analyses && analyses.length > 0) {
        console.log('\n📊 Analysis Summary:')
        analyses.forEach((analysis) => {
          console.log(`\n   Product: ${analysis.product_id}`)
          console.log(`   - Opportunity Score: ${analysis.opportunity_score}/100`)
          console.log(`   - Competition Score: ${analysis.competition_score}/100`)
          console.log(`   - Demand Score: ${analysis.demand_score}/100`)
          console.log(`   - Feasibility Score: ${analysis.feasibility_score}/100`)
          console.log(`   - Timing Score: ${analysis.timing_score}/100`)
          console.log(`   - Overall Score: ${analysis.overall_score}/100`)
        })
      }
    }
    
    // 5. Summary
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 SUMMARY:')
    console.log(`   Niche Status: ${niche.status}`)
    console.log(`   Products Processed: ${products?.length || 0}/${asins.length}`)
    console.log(`   Keywords Collected: ${keywordData ? 'Yes' : 'No'}`)
    console.log(`   Analyses Complete: ${analyses?.length || 0}`)
    
    if (niche.status === 'processing' && products?.length === asins.length) {
      console.log('\n⚠️  Note: All products appear to be processed but niche status is still "processing"')
      console.log('   This might indicate the keyword collection or final steps are still running.')
    }
    
    console.log('\n✅ Detailed status check complete!')
    
  } catch (error) {
    console.error('❌ Status check failed:', error)
  }
}

// Run the detailed status check
checkSaffronNicheDetailed()