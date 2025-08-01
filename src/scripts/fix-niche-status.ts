import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixNicheStatus(nicheId: string) {
  console.log(`\nFixing niche status for: ${nicheId}\n`)
  
  try {
    // Update the niche status
    const { data, error } = await supabase
      .from('niches')
      .update({ 
        status: 'completed',
        total_reviews: 129,
        error_message: null,
        process_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', nicheId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating niche:', error)
      return
    }
    
    console.log('✅ Niche status updated successfully!')
    console.log('Updated niche:', {
      id: data.id,
      name: data.niche_name,
      status: data.status,
      total_products: data.total_products,
      total_reviews: data.total_reviews
    })
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

// You can also fix all niches with this issue
async function fixAllFailedNichesWithData() {
  console.log('\nChecking for all failed niches with data...\n')
  
  try {
    // Get all failed niches
    const { data: failedNiches, error } = await supabase
      .from('niches')
      .select('*')
      .eq('status', 'failed')
    
    if (error) {
      console.error('Error fetching niches:', error)
      return
    }
    
    console.log(`Found ${failedNiches?.length || 0} failed niches`)
    
    for (const niche of failedNiches || []) {
      const asinList = niche.asins ? niche.asins.split(',').map((a: string) => a.trim()) : []
      
      // Check if it has products
      const { count: productCount } = await supabase
        .from('product')
        .select('*', { count: 'exact', head: true })
        .in('asin', asinList)
      
      // Check if it has keywords
      const { count: keywordCount } = await supabase
        .from('product_keywords')
        .select('*', { count: 'exact', head: true })
        .in('product_id', asinList)
      
      // Check reviews
      const { count: reviewCount } = await supabase
        .from('product_customer_reviews')
        .select('*', { count: 'exact', head: true })
        .in('product_id', asinList)
      
      if (productCount > 0 && keywordCount > 0) {
        console.log(`\nFixing niche: ${niche.niche_name} (${niche.id})`)
        console.log(`- Products: ${productCount}`)
        console.log(`- Keywords: ${keywordCount}`)
        console.log(`- Reviews: ${reviewCount}`)
        
        // Update the niche
        const { error: updateError } = await supabase
          .from('niches')
          .update({ 
            status: 'completed',
            total_reviews: reviewCount || 0,
            error_message: null,
            process_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', niche.id)
        
        if (updateError) {
          console.error(`Failed to update ${niche.id}:`, updateError)
        } else {
          console.log(`✅ Fixed ${niche.niche_name}`)
        }
      }
    }
    
    console.log('\nDone!')
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

// Fix the specific niche
// fixNicheStatus('timeless_v1_1753684460768')

// Fix all failed niches with data
fixAllFailedNichesWithData()