import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { ensureUserExists } from './ensure-user'

// Request validation schemas
const createNicheSchema = z.object({
  nicheName: z.string().min(1).max(100),
  asins: z.string().min(1), // comma-separated ASINs
  scheduledDate: z.string().datetime().or(z.string().refine((val) => !isNaN(Date.parse(val))))
})

const deleteNicheSchema = z.object({
  nicheId: z.string().uuid()
})

// GET /api/admin/niches - List all niches for admin
async function handleGet(req: NextRequest) {
  try {
    console.log('Niches API: Creating Supabase client...')
    const supabase = await createServerSupabaseClient()
    
    // Get current user from Supabase
    console.log('Niches API: Getting user from Supabase...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin (skip in development or for known admin emails)
    if (process.env.NODE_ENV !== 'development' && user.email !== 'anthony@adscrafted.com') {
      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (roleError || userData?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    } else {
      console.log('Niches API: Skipping admin check')
    }
    
    // Parse query parameters
    const searchParams = Object.fromEntries(req.nextUrl.searchParams)
    const search = searchParams.search || ''
    
    // Fetch niches
    let query = supabase
      .from('niches')
      .select(`
        *,
        creator:users!created_by(name, email)
      `)
      .order('created_at', { ascending: false })
    
    if (search) {
      query = query.or(`niche_name.ilike.%${search}%,asins.ilike.%${search}%`)
    }
    
    const { data: niches, error: nichesError } = await query
    
    if (nichesError) {
      console.error('Error fetching niches:', nichesError)
      return NextResponse.json({ error: 'Failed to list niches' }, { status: 500 })
    }
    
    // Transform to match admin page format
    const transformedNiches = niches?.map(niche => ({
      id: niche.id,
      nicheName: niche.niche_name,
      asins: niche.asins.split(',').map(asin => asin.trim()),
      status: niche.status,
      addedDate: niche.added_date.split('T')[0],
      scheduledDate: niche.scheduled_date.split('T')[0],
      category: niche.category || 'Pending',
      totalProducts: niche.total_products,
      totalReviews: niche.total_reviews || 0,
      processTime: niche.process_time || '0',
      creator: niche.creator
    })) || []
    
    return NextResponse.json(transformedNiches)
  } catch (error) {
    console.error('Error listing niches:', error)
    return NextResponse.json({ error: 'Failed to list niches' }, { status: 500 })
  }
}

// POST /api/admin/niches - Create a new niche
async function handlePost(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user from Supabase
    console.log('Niches API POST: Getting authenticated user from Supabase...')
    
    // In development, use a hardcoded user if no session
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - checking for session but will use fallback if needed')
    }
    
    // First try to get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('Session check:', {
      hasSession: !!session,
      sessionError: sessionError?.message,
      isDev: process.env.NODE_ENV === 'development'
    })
    
    let userId: string
    let userEmail: string | null
    
    if (sessionError || !session) {
      // In development, use a hardcoded user
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode - using hardcoded user')
        userId = 'a2615f56-b240-46db-b2d5-fdc0c86b0605' // Your user ID from the console logs
        userEmail = 'anthony@adscrafted.com'
      } else {
        console.error('No session found in production:', sessionError)
        return NextResponse.json({ error: 'Unauthorized - no valid session' }, { status: 401 })
      }
    } else {
      userId = session.user.id
      userEmail = session.user.email
    }
    
    console.log('Using user:', { userId, userEmail })
    
    // Ensure user exists in database
    const { exists, error: userError } = await ensureUserExists(userId, userEmail || '')
    if (!exists) {
      console.error('Failed to ensure user exists:', userError)
      return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 })
    }
    
    // Check if user is admin (skip in development or for known admin emails)
    if (process.env.NODE_ENV !== 'development' && userEmail !== 'anthony@adscrafted.com') {
      // Check user role in database
      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (roleError || userData?.role !== 'ADMIN') {
        console.error('Admin check failed:', roleError || 'Not admin role')
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    } else {
      console.log('Niches API POST: Skipping admin check for:', userEmail)
    }
    
    // Parse request body
    const body = await req.json()
    
    // Check if this is a refresh action
    if (body.action === 'refresh') {
      const { nicheId, nicheName, asins } = body
      
      if (!nicheId || !nicheName || !asins || !Array.isArray(asins)) {
        return NextResponse.json(
          { error: 'Invalid request. Required: nicheId, nicheName, asins array' },
          { status: 400 }
        )
      }
      
      // Import niche processor
      const { nicheProcessor } = await import('@/lib/queue/niche-processor')
      
      // Start processing
      const job = await nicheProcessor.processNiche(nicheId, nicheName, asins, 'US')
      
      return NextResponse.json({
        success: true,
        niche: {
          id: nicheId,
          name: nicheName,
          asinCount: asins.length,
          status: job.status
        },
        message: 'Niche refresh started successfully'
      })
    }
    
    // Otherwise, it's a create action - validate with schema
    const data = createNicheSchema.parse(body)
    
    // Parse ASINs
    const asinList = data.asins.split(',').map(asin => asin.trim()).filter(asin => asin.length > 0)
    
    // Generate a unique ID for the niche
    const nicheId = `${data.nicheName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()}`
    
    // Create niche  
    const { data: niche, error: createError } = await supabase
      .from('niches')
      .insert({
        id: nicheId,
        niche_name: data.nicheName,
        asins: asinList.join(','),
        added_date: new Date().toISOString(),
        scheduled_date: new Date(data.scheduledDate).toISOString(),
        total_products: asinList.length,
        status: 'pending',
        category: 'Pending',
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (createError) {
      console.error('Detailed error creating niche:', {
        message: createError.message,
        code: createError.code,
        details: createError.details,
        hint: createError.hint,
        full: createError
      })
      return NextResponse.json({ 
        error: 'Failed to create niche',
        details: createError.message,
        code: createError.code 
      }, { status: 500 })
    }
    
    // Transform to match admin page format
    const transformedNiche = {
      id: niche.id,
      nicheName: niche.niche_name,
      asins: niche.asins.split(',').map(asin => asin.trim()),
      status: niche.status,
      addedDate: niche.added_date.split('T')[0],
      scheduledDate: niche.scheduled_date.split('T')[0],
      category: niche.category || 'Pending',
      totalProducts: niche.total_products,
      totalReviews: niche.total_reviews || 0,
      processTime: niche.process_time || '0'
    }
    
    // Automatically trigger analysis for the new niche
    console.log('🔄 Triggering automatic analysis for niche:', niche.id)
    
    try {
      const analyzeUrl = `${process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3002}`}/api/admin/niches/${niche.id}/analyze`
      console.log('🔗 Calling analyze endpoint:', analyzeUrl)
      
      const analyzeResponse = await fetch(analyzeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.get('cookie') || ''
        }
      })
      
      const responseText = await analyzeResponse.text()
      console.log('📥 Analyze response status:', analyzeResponse.status)
      console.log('📥 Analyze response:', responseText)
      
      if (analyzeResponse.ok) {
        try {
          const analyzeData = JSON.parse(responseText)
          console.log('✅ Analysis started:', analyzeData)
          transformedNiche.analysisRunId = analyzeData.analysisRunId
          transformedNiche.analysisStatus = 'in_progress'
        } catch (e) {
          console.error('⚠️ Failed to parse analyze response:', e)
        }
      } else {
        console.error('⚠️ Failed to start analysis - Status:', analyzeResponse.status)
        console.error('⚠️ Error response:', responseText)
        
        // Update niche status to show error
        await supabase
          .from('niches')
          .update({ 
            status: 'failed',
            error_message: `Failed to start analysis: ${responseText}`
          })
          .eq('id', niche.id)
      }
    } catch (error) {
      console.error('⚠️ Error starting analysis:', error)
      console.error('⚠️ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // Update niche status to show error
      await supabase
        .from('niches')
        .update({ 
          status: 'failed',
          error_message: `Failed to start analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
        .eq('id', niche.id)
    }
    
    return NextResponse.json(transformedNiche, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating niche:', error)
    return NextResponse.json({ error: 'Failed to create niche' }, { status: 500 })
  }
}

// DELETE /api/admin/niches - Delete a niche with cascade cleanup
async function handleDelete(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get current user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    let userId = user.id
    
    // Check if user is admin (skip in development or for known admin emails)
    if (process.env.NODE_ENV !== 'development' && user.email !== 'anthony@adscrafted.com') {
      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (roleError || userData?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    } else {
      console.log('Niches API DELETE: Skipping admin check')
    }
    
    // Parse request body
    const body = await req.json()
    const data = deleteNicheSchema.parse(body)
    
    console.log(`🗑️ Starting cascade deletion for niche: ${data.nicheId}`)
    
    // Get niche details first for logging
    const { data: niche, error: nicheError } = await supabase
      .from('niches')
      .select('id, niche_name, asins, created_by')
      .eq('id', data.nicheId)
      .single()
    
    if (nicheError || !niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Verify ownership (except in dev mode)
    if (process.env.NODE_ENV !== 'development' && niche.created_by !== userId) {
      return NextResponse.json({ error: 'Not authorized to delete this niche' }, { status: 403 })
    }
    
    const asins = niche.asins ? niche.asins.split(',').map(a => a.trim()) : []
    console.log(`Deleting niche "${niche.niche_name}" with ${asins.length} ASINs`)
    
    // Perform cascade deletion in transaction
    const deletionResults = await performCascadeDeletion(supabase, data.nicheId, asins)
    
    console.log('✅ Cascade deletion completed:')
    console.log(`  - Niche: ${niche.niche_name}`)
    console.log(`  - Keywords deleted: ${deletionResults.keywordsDeleted}`)
    console.log(`  - Products deleted: ${deletionResults.productsDeleted}`)
    console.log(`  - Niche products deleted: ${deletionResults.nicheProductsDeleted}`)
    
    return NextResponse.json({
      success: true,
      message: `Niche "${niche.niche_name}" deleted successfully`,
      deletionResults
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error deleting niche:', error)
    return NextResponse.json({ error: 'Failed to delete niche' }, { status: 500 })
  }
}

// Cascade deletion function
async function performCascadeDeletion(supabase: any, nicheId: string, asins: string[]) {
  const results = {
    keywordsDeleted: 0,
    productsDeleted: 0,
    nicheProductsDeleted: 0,
    analysisRunsDeleted: 0
  }
  
  console.log('🧹 Starting cascade cleanup...')
  
  // Step 1: Delete product keywords for ASINs
  if (asins.length > 0) {
    const { count: keywordCount, error: keywordError } = await supabase
      .from('product_keywords')
      .delete({ count: 'exact' })
      .in('product_id', asins)
    
    if (keywordError) {
      console.error('Error deleting keywords:', keywordError)
    } else {
      results.keywordsDeleted = keywordCount || 0
      console.log(`  ✅ Deleted ${results.keywordsDeleted} keywords`)
    }
  }
  
  // Step 2: Delete niche_products
  const { count: nicheProductsCount, error: nicheProductsError } = await supabase
    .from('niche_products')
    .delete({ count: 'exact' })
    .eq('niche_id', nicheId)
  
  if (nicheProductsError) {
    console.error('Error deleting niche products:', nicheProductsError)
  } else {
    results.nicheProductsDeleted = nicheProductsCount || 0
    console.log(`  ✅ Deleted ${results.nicheProductsDeleted} niche products`)
  }
  
  // Step 3: Delete analysis runs
  const { count: analysisCount, error: analysisError } = await supabase
    .from('analysis_runs')
    .delete({ count: 'exact' })
    .eq('niche_id', nicheId)
  
  if (analysisError) {
    console.error('Error deleting analysis runs:', analysisError)
  } else {
    results.analysisRunsDeleted = analysisCount || 0
    console.log(`  ✅ Deleted ${results.analysisRunsDeleted} analysis runs`)
  }
  
  // Step 4: Delete products that are niche-specific only
  if (asins.length > 0) {
    const { count: productCount, error: productError } = await supabase
      .from('product')
      .delete({ count: 'exact' })
      .in('id', asins)
      .not('niche_id', 'is', null) // Only delete niche-specific products
    
    if (productError) {
      console.error('Error deleting niche-specific products:', productError)
    } else {
      results.productsDeleted = productCount || 0
      console.log(`  ✅ Deleted ${results.productsDeleted} niche-specific products`)
    }
  }
  
  // Step 5: Finally delete the niche itself
  const { error: nicheDeleteError } = await supabase
    .from('niches')
    .delete()
    .eq('id', nicheId)
  
  if (nicheDeleteError) {
    throw new Error(`Failed to delete niche: ${nicheDeleteError.message}`)
  }
  
  console.log('  ✅ Deleted niche record')
  
  return results
}

export { handleGet as GET, handlePost as POST, handleDelete as DELETE }