import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkNicheWithProducts() {
  console.log('Checking for niches with products...\n')
  
  // Get niches
  const { data: niches, error } = await supabase
    .from('niches')
    .select('id, name, status, analysis_completed_at')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error('Error fetching niches:', error)
    return
  }
  
  console.log('Recent niches:')
  for (const niche of niches || []) {
    // Get product count
    const { count } = await supabase
      .from('niche_products')
      .select('*', { count: 'exact', head: true })
      .eq('niche_id', niche.id)
    
    console.log(`\n${niche.name} (${niche.id})`)
    console.log(`  Status: ${niche.status}`)
    console.log(`  Products: ${count || 0}`)
    console.log(`  Completed: ${niche.analysis_completed_at ? new Date(niche.analysis_completed_at).toLocaleString() : 'Not completed'}`)
  }
  
  // Get a completed niche
  const { data: completedNiche, error: nicheError } = await supabase
    .from('niches')
    .select('id, name')
    .eq('status', 'completed')
    .limit(1)
    .single()
  
  if (completedNiche) {
    console.log(`\n\n✅ Found completed niche: ${completedNiche.name}`)
    console.log(`URL: http://localhost:3000/products/${completedNiche.id.replace(/_/g, '-')}/demand?nicheId=${completedNiche.id}`)
    
    // Get products for this niche
    const { data: nicheProducts, error: productsError } = await supabase
      .from('niche_products')
      .select(`
        product_id,
        products (
          asin,
          title,
          first_seen_date,
          product_age_months,
          product_age_category
        )
      `)
      .eq('niche_id', completedNiche.id)
    
    if (nicheProducts && nicheProducts.length > 0) {
      const productsWithAge = nicheProducts.filter(np => np.products?.product_age_months !== null)
      console.log(`\nProducts with age data: ${productsWithAge.length}/${nicheProducts.length}`)
      
      if (productsWithAge.length > 0) {
        console.log('\nSample products with age:')
        productsWithAge.slice(0, 3).forEach(np => {
          const p = np.products
          console.log(`  - ${p.asin}: ${p.product_age_months} months (${p.product_age_category})`)
        })
      }
    }
  }
}

checkNicheWithProducts()