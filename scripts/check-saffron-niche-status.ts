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

async function checkSaffronNicheStatus() {
  console.log('🔍 Checking Saffron Supplements Niche Status...\n')
  
  try {
    // 1. Check all niches with "saffron" in the name
    console.log('1️⃣ Searching for Saffron niches...')
    const { data: niches, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .ilike('niche_name', '%saffron%')
      .order('created_at', { ascending: false })
    
    if (nicheError) {
      console.error('❌ Error fetching niches:', nicheError)
      return
    }
    
    if (!niches || niches.length === 0) {
      console.log('❌ No Saffron niches found in database')
      return
    }
    
    console.log(`✅ Found ${niches.length} Saffron niche(s):\n`)
    
    for (const niche of niches) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`📦 Niche: ${niche.niche_name}`)
      console.log(`   ID: ${niche.id}`)
      console.log(`   Status: ${niche.status}`)
      console.log(`   Created: ${new Date(niche.created_at).toLocaleString()}`)
      console.log(`   Updated: ${new Date(niche.updated_at).toLocaleString()}`)
      
      if (niche.processing_progress) {
        console.log(`   Progress: ${JSON.stringify(niche.processing_progress)}`)
      }
      
      if (niche.error_message) {
        console.log(`   ❌ Error: ${niche.error_message}`)
      }
      
      // Parse ASINs
      const asins = niche.asins?.split(',').map(a => a.trim()).filter(Boolean) || []
      console.log(`   ASINs count: ${asins.length}`)
      
      if (asins.length > 0) {
        // 2. Check how many products have been processed
        console.log('\n   📊 Checking processed products...')
        const { data: products, error: productError } = await supabase
          .from('products')
          .select('asin, title, price, bsr, status')
          .in('asin', asins)
        
        if (productError) {
          console.error('   ❌ Error fetching products:', productError)
        } else {
          console.log(`   ✅ Products in database: ${products?.length || 0}/${asins.length}`)
          
          if (products && products.length > 0) {
            console.log('\n   📋 Product Details:')
            products.forEach((product, index) => {
              console.log(`   ${index + 1}. ${product.asin}: ${product.title?.substring(0, 50)}...`)
              console.log(`      Price: $${product.price || 'N/A'} | BSR: ${product.bsr || 'N/A'} | Status: ${product.status}`)
            })
          }
          
          // Show missing ASINs
          if (products && products.length < asins.length) {
            const processedAsins = products.map(p => p.asin)
            const missingAsins = asins.filter(asin => !processedAsins.includes(asin))
            console.log(`\n   ⚠️  Missing ASINs (${missingAsins.length}):`)
            missingAsins.forEach((asin, index) => {
              console.log(`   ${index + 1}. ${asin}`)
            })
          }
        }
        
        // 3. Check niche_products relationship
        console.log('\n   🔗 Checking niche_products relationships...')
        const { data: nicheProducts, error: nicheProductsError } = await supabase
          .from('niche_products')
          .select('*')
          .eq('niche_id', niche.id)
        
        if (nicheProductsError) {
          console.error('   ❌ Error fetching niche_products:', nicheProductsError)
        } else {
          console.log(`   ✅ Niche products linked: ${nicheProducts?.length || 0}`)
        }
        
        // 4. Check product_keywords
        console.log('\n   🔍 Checking keyword data...')
        const { data: keywordData, error: keywordError } = await supabase
          .from('product_keywords')
          .select('product_asin, keywords')
          .in('product_asin', asins)
        
        if (keywordError) {
          console.error('   ❌ Error fetching keywords:', keywordError)
        } else {
          console.log(`   ✅ Products with keywords: ${keywordData?.length || 0}`)
          
          if (keywordData && keywordData.length > 0) {
            let totalKeywords = 0
            keywordData.forEach(kd => {
              if (kd.keywords && Array.isArray(kd.keywords)) {
                totalKeywords += kd.keywords.length
              }
            })
            console.log(`   📈 Total keywords collected: ${totalKeywords}`)
          }
        }
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Status check complete!')
    
  } catch (error) {
    console.error('❌ Status check failed:', error)
  }
}

// Run the status check
checkSaffronNicheStatus()