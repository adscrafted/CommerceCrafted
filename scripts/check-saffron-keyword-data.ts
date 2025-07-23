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

async function checkSaffronKeywordData() {
  console.log('🔍 Checking Saffron Niche Keyword Data...\n')
  
  try {
    // Get the niche
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .ilike('niche_name', '%saffron%')
      .single()
    
    if (nicheError || !niche) {
      console.error('❌ Error fetching niche:', nicheError)
      return
    }
    
    console.log(`📦 Niche: ${niche.niche_name} (${niche.id})`)
    console.log(`   Status: ${niche.status}`)
    
    // Parse ASINs
    const asins = niche.asins?.split(',').map(a => a.trim()).filter(Boolean) || []
    console.log(`   ASINs: ${asins.length}`)
    
    // Check product_queue_projects for this niche
    console.log('\n1️⃣ Checking product_queue_projects...')
    const { data: projects, error: projectsError } = await supabase
      .from('product_queue_projects')
      .select('*')
      .eq('project_name', niche.niche_name)
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError)
    } else {
      console.log(`✅ Found ${projects?.length || 0} project(s) for this niche`)
      
      if (projects && projects.length > 0) {
        for (const project of projects) {
          console.log(`\n   Project ID: ${project.id}`)
          console.log(`   Created: ${new Date(project.created_at).toLocaleString()}`)
          console.log(`   Product IDs: ${project.product_ids?.length || 0} products`)
        }
      }
    }
    
    // Check product_keywords with project_id
    console.log('\n2️⃣ Checking product_keywords by project...')
    if (projects && projects.length > 0) {
      for (const project of projects) {
        const { data: keywords, error: keywordsError } = await supabase
          .from('product_keywords')
          .select('*')
          .eq('project_id', project.id)
        
        if (keywordsError) {
          console.error(`❌ Error fetching keywords for project ${project.id}:`, keywordsError)
        } else {
          console.log(`\n   Project ${project.id}: ${keywords?.length || 0} keyword records`)
          
          if (keywords && keywords.length > 0) {
            let totalKeywords = 0
            const keywordsByProduct = new Map<string, number>()
            
            keywords.forEach(kd => {
              if (kd.keywords && Array.isArray(kd.keywords)) {
                const count = kd.keywords.length
                totalKeywords += count
                keywordsByProduct.set(kd.product_id, (keywordsByProduct.get(kd.product_id) || 0) + count)
              }
            })
            
            console.log(`   📈 Total keywords: ${totalKeywords}`)
            console.log('\n   📊 Keywords by product:')
            Array.from(keywordsByProduct.entries()).forEach(([productId, count]) => {
              console.log(`      ${productId}: ${count} keywords`)
            })
            
            // Show sample keywords
            if (keywords[0]?.keywords && keywords[0].keywords.length > 0) {
              console.log(`\n   🔍 Sample keywords from ${keywords[0].product_id}:`)
              keywords[0].keywords.slice(0, 5).forEach((kw: any, idx: number) => {
                console.log(`      ${idx + 1}. "${kw.keyword || kw.keywordText || kw}"`)
                if (kw.bid) console.log(`         Bid: $${kw.bid}`)
                if (kw.searchVolume) console.log(`         Volume: ${kw.searchVolume}`)
                if (kw.clicks) console.log(`         Clicks: ${kw.clicks}`)
                if (kw.impressions) console.log(`         Impressions: ${kw.impressions}`)
              })
            }
          }
        }
      }
    }
    
    // Check product_keywords by product_id directly
    console.log('\n3️⃣ Checking product_keywords by product_id...')
    const { data: keywordsByProduct, error: keywordsByProductError } = await supabase
      .from('product_keywords')
      .select('*')
      .in('product_id', asins)
    
    if (keywordsByProductError) {
      console.error('❌ Error fetching keywords by product:', keywordsByProductError)
    } else {
      console.log(`✅ Found ${keywordsByProduct?.length || 0} keyword records by product_id`)
      
      if (keywordsByProduct && keywordsByProduct.length > 0) {
        let totalKeywords = 0
        keywordsByProduct.forEach(kd => {
          if (kd.keywords && Array.isArray(kd.keywords)) {
            totalKeywords += kd.keywords.length
          }
        })
        console.log(`   📈 Total keywords: ${totalKeywords}`)
      }
    }
    
    // Check for any keyword data in the processing_progress
    console.log('\n4️⃣ Checking processing progress for keyword info...')
    if (niche.processing_progress) {
      const progress = niche.processing_progress
      if (progress.keywordsCollected) {
        console.log(`   Keywords collected flag: ${progress.keywordsCollected}`)
      }
      if (progress.totalKeywords) {
        console.log(`   Total keywords in progress: ${progress.totalKeywords}`)
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Keyword data check complete!')
    
  } catch (error) {
    console.error('❌ Keyword check failed:', error)
  }
}

// Run the keyword data check
checkSaffronKeywordData()