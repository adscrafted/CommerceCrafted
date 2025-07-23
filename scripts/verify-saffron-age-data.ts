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

async function verifySaffronAgeData() {
  console.log('Verifying Saffron niche product age data...\n')
  
  // Get the saffron niche
  const { data: niche, error: nicheError } = await supabase
    .from('niches')
    .select('id, asins')
    .eq('id', 'saffron_supplements_1753229796169')
    .single()
  
  if (nicheError || !niche) {
    console.error('Error fetching niche:', nicheError)
    return
  }
  
  const asinList = niche.asins?.split(',').map((a: string) => a.trim()).filter(Boolean) || []
  console.log(`Found ${asinList.length} ASINs in Saffron niche\n`)
  
  // Get all products for this niche
  const { data: products, error } = await supabase
    .from('products')
    .select('asin, title, first_seen_date, product_age_months, product_age_category')
    .in('asin', asinList)
  
  if (error) {
    console.error('Error fetching products:', error)
    return
  }
  
  console.log(`Retrieved ${products?.length || 0} products\n`)
  
  // Analyze age distribution
  const ageDistribution = {
    '0-6 months': 0,
    '6-12 months': 0,
    '1-2 years': 0,
    '2-3 years': 0,
    '3+ years': 0,
    'No data': 0
  }
  
  let totalAgeMonths = 0
  let productsWithAge = 0
  
  products?.forEach(p => {
    console.log(`${p.asin}: ${p.product_age_category || 'No age data'} (${p.product_age_months || '-'} months)`)
    
    if (p.product_age_category) {
      ageDistribution[p.product_age_category]++
      totalAgeMonths += p.product_age_months || 0
      productsWithAge++
    } else {
      ageDistribution['No data']++
    }
  })
  
  console.log('\n📊 Age Distribution Summary:')
  Object.entries(ageDistribution).forEach(([category, count]) => {
    if (count > 0) {
      const percentage = Math.round((count / (products?.length || 1)) * 100)
      console.log(`  ${category}: ${count} products (${percentage}%)`)
    }
  })
  
  if (productsWithAge > 0) {
    const avgMonths = totalAgeMonths / productsWithAge
    const avgYears = (avgMonths / 12).toFixed(1)
    console.log(`\n📈 Average Age: ${avgMonths.toFixed(0)} months (${avgYears} years)`)
    
    // Calculate launched last year
    const lastYearCount = products?.filter(p => p.product_age_months && p.product_age_months <= 12).length || 0
    const lastYearPercentage = Math.round((lastYearCount / productsWithAge) * 100)
    console.log(`📅 Launched Last Year: ${lastYearCount} products (${lastYearPercentage}%)`)
  }
}

verifySaffronAgeData()