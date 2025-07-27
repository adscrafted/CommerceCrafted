import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Check if user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check admin role (you may need to adjust this based on your role system)
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    // Find orphaned products using a SQL query
    const { data: orphanedProducts, error } = await supabase
      .from('product')
      .select('id, asin, title')
      .not('id', 'in', 
        supabase
          .from('niche_products')
          .select('product_id')
      )
    
    if (error) {
      // Fallback approach: get all products and check each one
      const { data: allProducts, error: productsError } = await supabase
        .from('product')
        .select('id, asin, title')
      
      if (productsError) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
      }
      
      const orphaned = []
      for (const product of allProducts || []) {
        const { data: niches } = await supabase
          .from('niche_products')
          .select('niche_id')
          .eq('product_id', product.id)
          .limit(1)
        
        if (!niches || niches.length === 0) {
          orphaned.push(product)
        }
      }
      
      return NextResponse.json({
        orphanedProducts: orphaned,
        count: orphaned.length
      })
    }
    
    return NextResponse.json({
      orphanedProducts: orphanedProducts || [],
      count: orphanedProducts?.length || 0
    })
  } catch (error) {
    console.error('Error finding orphaned products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Check if user is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check admin role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    // First, find all orphaned products
    const { data: allProducts, error: productsError } = await supabase
      .from('product')
      .select('id')
    
    if (productsError) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
    
    const orphanedIds = []
    for (const product of allProducts || []) {
      const { data: niches } = await supabase
        .from('niche_products')
        .select('niche_id')
        .eq('product_id', product.id)
        .limit(1)
      
      if (!niches || niches.length === 0) {
        orphanedIds.push(product.id)
      }
    }
    
    if (orphanedIds.length === 0) {
      return NextResponse.json({
        message: 'No orphaned products found',
        deletedCount: 0
      })
    }
    
    // Delete orphaned products and their related data
    let deletedCount = 0
    const errors = []
    
    for (const productId of orphanedIds) {
      try {
        // Delete product analyses
        await supabase
          .from('niches_overall_analysis')
          .delete()
          .eq('product_id', productId)
        
        // Delete product keywords
        await supabase
          .from('product_keywords')
          .delete()
          .eq('product_id', productId)
        
        // Delete the product itself
        const { error: deleteError } = await supabase
          .from('product')
          .delete()
          .eq('id', productId)
        
        if (deleteError) {
          errors.push({ productId, error: deleteError.message })
        } else {
          deletedCount++
        }
      } catch (err) {
        errors.push({ productId, error: String(err) })
      }
    }
    
    return NextResponse.json({
      message: `Deleted ${deletedCount} orphaned products`,
      deletedCount,
      totalOrphaned: orphanedIds.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error deleting orphaned products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}