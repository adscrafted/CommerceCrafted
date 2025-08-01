import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkNicheStatus(nicheId: string) {
  console.log(`\nChecking niche: ${nicheId}\n`)
  
  try {
    // Get niche data
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()
    
    if (nicheError) {
      console.error('Error fetching niche:', nicheError)
      return
    }
    
    console.log('Niche Details:')
    console.log('- ID:', niche.id)
    console.log('- Name:', niche.niche_name)
    console.log('- Status:', niche.status)
    console.log('- Total Products:', niche.total_products)
    console.log('- Total Reviews:', niche.total_reviews)
    console.log('- ASINs:', niche.asins)
    console.log('- Created:', niche.created_at)
    console.log('- Updated:', niche.updated_at)
    
    if (niche.error_message) {
      console.log('- Error:', niche.error_message)
    }
    
    // Get product counts
    const asinList = niche.asins ? niche.asins.split(',').map((a: string) => a.trim()) : []
    console.log('\nASIN List:', asinList)
    
    // Check products
    const { data: products, count: productCount } = await supabase
      .from('product')
      .select('*', { count: 'exact' })
      .in('asin', asinList)
    
    console.log('\nProduct Stats:')
    console.log('- Expected products:', asinList.length)
    console.log('- Found products:', productCount)
    console.log('- Products in DB:', products?.map(p => p.asin).join(', '))
    
    // Check keywords
    const { count: keywordCount } = await supabase
      .from('product_keywords')
      .select('*', { count: 'exact', head: true })
      .in('product_id', asinList)
    
    console.log('\nKeyword Stats:')
    console.log('- Total keywords:', keywordCount)
    
    // Check reviews
    const { count: reviewCount } = await supabase
      .from('product_customer_reviews')
      .select('*', { count: 'exact', head: true })
      .in('product_id', asinList)
    
    console.log('\nReview Stats:')
    console.log('- Total reviews:', reviewCount)
    
    // Check analysis tables
    console.log('\nAnalysis Tables:')
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
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('niche_id', nicheId)
      
      console.log(`- ${table}: ${count} records`)
    }
    
    // Suggest fix if status is wrong
    if (niche.status === 'failed' && productCount > 0 && keywordCount > 0) {
      console.log('\n⚠️  Status appears to be incorrect!')
      console.log('The niche has data but is marked as failed.')
      console.log('\nTo fix, run:')
      console.log(`UPDATE niches SET status = 'completed', total_reviews = ${reviewCount} WHERE id = '${nicheId}';`)
    }
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

// Check the specific niche mentioned
checkNicheStatus('timeless_1753731633499')