import { createClient } from '@supabase/supabase-js'

// Test script to verify Keepa integration
async function testKeepaIntegration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('Testing Keepa Integration...\n')
  
  // 1. Check if migration was applied
  console.log('1. Checking database tables...')
  
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('asin, title, last_keepa_sync')
    .limit(5)
  
  if (productsError) {
    console.error('Error fetching products:', productsError)
  } else {
    console.log(`Found ${products?.length || 0} products in database`)
    if (products && products.length > 0) {
      console.log('Sample product:', products[0])
    }
  }
  
  // 2. Check if new tables exist
  const tables = ['keepa_price_history', 'keepa_sales_rank_history', 'amazon_api_cache', 'api_usage']
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1)
    if (error) {
      console.log(`❌ Table '${table}' not found or inaccessible:`, error.message)
    } else {
      console.log(`✅ Table '${table}' exists`)
    }
  }
  
  // 3. Test the API endpoint (requires authentication)
  console.log('\n2. Testing API endpoints...')
  console.log('Note: API endpoints require authentication. Test them via the admin UI at:')
  console.log('http://localhost:3000/admin/keepa-test')
  
  // 4. Check for any niches
  console.log('\n3. Checking for niches...')
  const { data: niches, error: nichesError } = await supabase
    .from('niches')
    .select('id, niche_name, asins, status')
    .limit(5)
  
  if (nichesError) {
    console.error('Error fetching niches:', nichesError)
  } else {
    console.log(`Found ${niches?.length || 0} niches`)
    if (niches && niches.length > 0) {
      console.log('\nSample niche:')
      console.log('- Name:', niches[0].niche_name)
      console.log('- ASINs:', niches[0].asins)
      console.log('- Status:', niches[0].status)
    }
  }
  
  console.log('\n✅ Integration test complete!')
  console.log('\nNext steps:')
  console.log('1. Apply the database migration: npx supabase db push')
  console.log('2. Visit http://localhost:3000/admin/keepa-test to test the Keepa API')
  console.log('3. Create a niche with ASINs to fetch product data')
}

testKeepaIntegration().catch(console.error)