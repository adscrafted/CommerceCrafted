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

async function diagnoseNicheFailure(nicheName: string = 'Saffron supplements') {
  console.log('🔍 Diagnosing niche failure...\n')
  
  try {
    // 1. Check if niche exists
    console.log('1️⃣ Checking niche record...')
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('*')
      .eq('niche_name', nicheName)
      .single()
    
    if (nicheError) {
      console.error('❌ Error fetching niche:', nicheError)
      return
    }
    
    console.log('✅ Niche found:', {
      id: niche.id,
      name: niche.niche_name,
      status: niche.status,
      asins: niche.asins,
      error_message: niche.error_message,
      processing_progress: niche.processing_progress
    })
    
    // 2. Check if ASINs are valid
    console.log('\n2️⃣ Checking ASINs...')
    const asins = niche.asins?.split(',').map(a => a.trim()) || []
    console.log(`Found ${asins.length} ASINs:`, asins)
    
    // 3. Test Keepa API connection
    console.log('\n3️⃣ Testing Keepa API...')
    const testAsin = asins[0] || 'B00XTTFI6K' // Test ASIN
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    try {
      const keepaUrl = `${baseUrl}/api/amazon/keepa`
      console.log(`Testing Keepa API at: ${keepaUrl}`)
      
      const response = await fetch(keepaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asin: testAsin })
      })
      
      if (!response.ok) {
        const text = await response.text()
        console.error('❌ Keepa API failed:', response.status, text)
      } else {
        const data = await response.json()
        console.log('✅ Keepa API working:', {
          title: data.title?.substring(0, 50) + '...',
          price: data.currentPrice,
          hasData: !!data
        })
      }
    } catch (error) {
      console.error('❌ Keepa API error:', error)
    }
    
    // 4. Check database permissions
    console.log('\n4️⃣ Testing database write permissions...')
    const testProduct = {
      id: 'TEST_' + Date.now(),
      asin: 'TEST_' + Date.now(),
      title: 'Test Product',
      price: 19.99,
      status: 'ACTIVE' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { error: insertError } = await supabase
      .from('products')
      .insert(testProduct)
    
    if (insertError) {
      console.error('❌ Database write failed:', insertError)
    } else {
      console.log('✅ Database write permissions OK')
      
      // Clean up test product
      await supabase
        .from('products')
        .delete()
        .eq('id', testProduct.id)
    }
    
    // 5. Check environment configuration
    console.log('\n5️⃣ Checking environment configuration...')
    console.log({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
      KEEPA_API_KEY: process.env.KEEPA_API_KEY ? '✓ Set' : '❌ Missing',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✓ Set' : '❌ Missing',
      PORT: process.env.PORT || '3000 (default)'
    })
    
    // 6. Attempt to trigger analysis
    console.log('\n6️⃣ Attempting to trigger analysis...')
    const analyzeUrl = `${baseUrl}/api/admin/niches/${niche.id}/analyze`
    console.log(`Calling: ${analyzeUrl}`)
    
    try {
      const analyzeResponse = await fetch(analyzeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!analyzeResponse.ok) {
        const text = await analyzeResponse.text()
        console.error('❌ Analysis trigger failed:', analyzeResponse.status, text)
      } else {
        const result = await analyzeResponse.json()
        console.log('✅ Analysis triggered:', result)
      }
    } catch (error) {
      console.error('❌ Analysis trigger error:', error)
    }
    
    console.log('\n📊 Diagnosis complete!')
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error)
  }
}

// Run the diagnostic
diagnoseNicheFailure()