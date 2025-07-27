import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Test 1: Check if uuid extension exists
    const { data: extensions, error: extError } = await supabase.rpc('get_extensions', {})
    console.log('Extensions:', extensions)
    
    // Test 2: Try to generate a UUID directly
    const { data: uuidTest, error: uuidError } = await supabase.rpc('uuid_generate_v4', {})
    console.log('UUID test:', uuidTest)
    
    // Test 3: Try inserting with explicit UUID
    const testUuid = crypto.randomUUID()
    const { data: insertTest, error: insertError } = await supabase
      .from('product')
      .insert([{
        id: testUuid,
        asin: `TEST-${Date.now()}`,
        title: 'Test Product',
        price: 99.99
      }])
      .select()
      .single()
    
    // Clean up test product
    if (insertTest) {
      await supabase
        .from('product')
        .delete()
        .eq('id', testUuid)
    }
    
    return NextResponse.json({
      extensions: extensions || 'Could not fetch',
      uuidGeneration: uuidTest || uuidError?.message || 'Failed',
      insertWithExplicitUuid: insertTest ? 'Success' : insertError?.message
    })
    
  } catch (error) {
    console.error('Check UUID error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}