import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { asin } = await request.json()
    
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 })
    }
    
    // Create a direct Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    console.log('Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test 1: Simple select query
    console.log('Test 1: Checking if product exists...')
    const { data: existingProduct, error: selectError } = await supabase
      .from('product')
      .select('id, asin')
      .eq('asin', asin)
      .maybeSingle()
    
    if (selectError) {
      console.error('Select error:', selectError)
      return NextResponse.json({ error: 'Select failed', details: selectError }, { status: 500 })
    }
    
    console.log('Select result:', existingProduct)
    
    // Test 2: Try a minimal insert with just required fields
    if (!existingProduct) {
      console.log('Test 2: Inserting minimal product...')
      const { data: newProduct, error: insertError } = await supabase
        .from('product')
        .insert({
          asin: asin,
          title: 'Test Product',
          price: 99.99
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json({ error: 'Insert failed', details: insertError }, { status: 500 })
      }
      
      console.log('Insert successful:', newProduct)
      return NextResponse.json({ success: true, operation: 'insert', product: newProduct })
    }
    
    // Test 3: Try a minimal update
    console.log('Test 3: Updating product...')
    const { data: updatedProduct, error: updateError } = await supabase
      .from('product')
      .update({
        title: 'Updated Test Product',
        updated_at: new Date().toISOString()
      })
      .eq('asin', asin)
      .select()
      .single()
    
    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Update failed', details: updateError }, { status: 500 })
    }
    
    console.log('Update successful:', updatedProduct)
    return NextResponse.json({ success: true, operation: 'update', product: updatedProduct })
    
  } catch (error) {
    console.error('Error in test-db:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}