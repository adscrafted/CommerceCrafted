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

async function checkSaffronCompleteStatus() {
  console.log('🔍 Comprehensive Saffron Niche Status Check...\n')
  
  try {
    // 1. Get the niche with all fields
    console.log('1️⃣ Fetching complete niche record...')
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .ilike('niche_name', '%saffron%')
      .single()
    
    if (nicheError || !niche) {
      console.error('❌ Error fetching niche:', nicheError)
      return
    }
    
    console.log('✅ Complete Niche Record:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    Object.entries(niche).forEach(([key, value]) => {
      if (key === 'processing_progress' && value) {
        console.log(`   ${key}:`)
        Object.entries(value as any).forEach(([k, v]) => {
          if (k === 'completedAsins' || k === 'failedAsins') {
            console.log(`     ${k}: ${Array.isArray(v) ? `[${(v as any[]).length} items]` : v}`)
          } else {
            console.log(`     ${k}: ${v}`)
          }
        })
      } else if (key === 'asins' && value) {
        const asins = (value as string).split(',').map(a => a.trim())
        console.log(`   ${key}: ${asins.length} ASINs`)
      } else {
        console.log(`   ${key}: ${value}`)
      }
    })
    
    // 2. Check for reviews data
    console.log('\n\n2️⃣ Checking customer_reviews table...')
    const asins = niche.asins?.split(',').map(a => a.trim()).filter(Boolean) || []
    
    const { data: reviews, error: reviewsError } = await supabase
      .from('customer_reviews')
      .select('product_id, id')
      .in('product_id', asins)
    
    if (reviewsError) {
      console.error('❌ Error fetching reviews:', reviewsError)
    } else {
      console.log(`✅ Found ${reviews?.length || 0} reviews total`)
      
      // Count reviews per product
      const reviewCounts = new Map<string, number>()
      reviews?.forEach(review => {
        reviewCounts.set(review.product_id, (reviewCounts.get(review.product_id) || 0) + 1)
      })
      
      if (reviewCounts.size > 0) {
        console.log('\n📊 Reviews per product:')
        Array.from(reviewCounts.entries()).forEach(([asin, count]) => {
          console.log(`   ${asin}: ${count} reviews`)
        })
      }
    }
    
    // 3. Check product_keywords with different approaches
    console.log('\n\n3️⃣ Checking product_keywords (multiple approaches)...')
    
    // Try by niche_id
    const { data: keywordsByNiche, error: keywordsByNicheError } = await supabase
      .from('product_keywords')
      .select('*')
      .eq('niche_id', niche.id)
      .limit(5)
    
    if (!keywordsByNicheError && keywordsByNiche && keywordsByNiche.length > 0) {
      console.log(`✅ Found ${keywordsByNiche.length} keyword records by niche_id`)
    } else {
      console.log('❌ No keywords found by niche_id')
    }
    
    // Try by project_id using niche name
    const { data: projects, error: projectsError } = await supabase
      .from('product_queue_projects')
      .select('*')
      .or(`name.ilike.%saffron%,id.eq.${niche.id}`)
    
    if (!projectsError && projects && projects.length > 0) {
      console.log(`\n✅ Found ${projects.length} related project(s)`)
      for (const project of projects) {
        console.log(`   Project: ${project.id} (${project.name || 'unnamed'})`)
      }
    }
    
    // 4. Check if the niche should be marked as completed
    console.log('\n\n4️⃣ Final Status Analysis...')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    const progress = niche.processing_progress as any
    const isComplete = progress?.percentage === 100 && 
                      progress?.completedAsins?.length === asins.length &&
                      (!progress?.failedAsins || progress.failedAsins.length === 0)
    
    console.log(`   Status: ${niche.status}`)
    console.log(`   Should be complete: ${isComplete ? 'Yes' : 'No'}`)
    console.log(`   Products processed: ${progress?.completedAsins?.length || 0}/${asins.length}`)
    console.log(`   Keywords collected: ${niche.total_keywords || 0}`)
    console.log(`   Reviews collected: ${reviews?.length || 0}`)
    
    if (isComplete && niche.status === 'processing') {
      console.log('\n⚠️  Niche appears complete but status is still "processing"')
      console.log('   The background process may still be running final steps.')
    }
    
    console.log('\n✅ Complete status check finished!')
    
  } catch (error) {
    console.error('❌ Status check failed:', error)
  }
}

// Run the complete status check
checkSaffronCompleteStatus()