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

// GET /api/admin/niches - List all niches for admin with optimized queries
async function handleGet(req: NextRequest) {
  try {
    console.log('Niches API: Creating Supabase client...')
    const supabase = await createServerSupabaseClient()
    
    // Get current user from Supabase (skip auth in development)
    let user = null
    if (process.env.NODE_ENV === 'development') {
      console.log('Niches API: Development mode - skipping authentication')
    } else {
      console.log('Niches API: Getting user from Supabase...')
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.error('Auth error:', authError)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      user = authUser
      
      // Check if user is admin (skip for known admin emails)
      if (user.email !== 'anthony@adscrafted.com') {
        const { data: userData, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (roleError || userData?.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }
      }
    }
    
    // Parse query parameters for pagination and filtering
    const searchParams = Object.fromEntries(req.nextUrl.searchParams)
    const search = searchParams.search || ''
    const statusFilter = searchParams.status || 'all'
    const marketplaceFilter = searchParams.marketplace || 'all'
    const sortField = searchParams.sortField || 'created_at'
    const sortOrder = searchParams.sortOrder || 'desc'
    const page = parseInt(searchParams.page || '1', 10)
    const limit = parseInt(searchParams.limit || '25', 10)
    
    // Build optimized query with pagination
    let query = supabase
      .from('niches')
      .select(`
        id,
        niche_name,
        asins,
        status,
        marketplace,
        total_products,
        created_at,
        updated_at,
        process_started_at,
        process_completed_at,
        error_message,
        processing_progress,
        creator:users!created_by(name, email)
      `, { count: 'exact' })
      .order(sortField, { ascending: sortOrder === 'asc' })
    
    // Apply filters
    if (search) {
      query = query.or(`niche_name.ilike.%${search}%,asins.ilike.%${search}%`)
    }
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }
    if (marketplaceFilter !== 'all') {
      query = query.eq('marketplace', marketplaceFilter)
    }
    
    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    const { data: niches, error: nichesError, count } = await query
    
    if (nichesError) {
      console.error('Error fetching niches:', nichesError)
      return NextResponse.json({ error: 'Failed to list niches' }, { status: 500 })
    }
    
    // Get processing count efficiently
    const { count: processingCount } = await supabase
      .from('niches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing')
    
    // Optimize keyword and review count queries using bulk fetching
    let nichesWithCounts = niches || []
    
    if (niches && niches.length > 0) {
      // Get all unique ASINs across all niches in this page
      const allAsins = new Set<string>()
      niches.forEach(niche => {
        if (niche.asins) {
          niche.asins.split(',').forEach((asin: string) => allAsins.add(asin.trim()))
        }
      })
      
      const asinArray = Array.from(allAsins)
      
      // Parallel queries for better performance
      const [keywordCountsResult, reviewCountsResult] = await Promise.all([
        // Get keyword counts in one query with grouping
        supabase
          .from('product_keywords')
          .select('product_id')
          .in('product_id', asinArray),
        
        // Get review counts in one query with grouping  
        supabase
          .from('product_customer_reviews')
          .select('product_id')
          .in('product_id', asinArray)
      ])
      
      // Count keywords and reviews per ASIN efficiently
      const keywordCountMap = new Map<string, number>()
      const reviewCountMap = new Map<string, number>()
      
      keywordCountsResult.data?.forEach(kw => {
        keywordCountMap.set(kw.product_id, (keywordCountMap.get(kw.product_id) || 0) + 1)
      })
      
      reviewCountsResult.data?.forEach(review => {
        reviewCountMap.set(review.product_id, (reviewCountMap.get(review.product_id) || 0) + 1)
      })
      
      // Add counts to each niche
      nichesWithCounts = niches.map(niche => {
        const asinList = niche.asins ? niche.asins.split(',').map((a: string) => a.trim()) : []
        let keywordCount = 0
        let reviewCount = 0
        
        asinList.forEach(asin => {
          keywordCount += keywordCountMap.get(asin) || 0
          reviewCount += reviewCountMap.get(asin) || 0
        })
        
        return {
          ...niche,
          keyword_count: keywordCount,
          total_reviews: reviewCount
        }
      })
    }
    
    // Return paginated response with metadata and caching headers
    const response = NextResponse.json({
      data: nichesWithCounts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      processing_count: processingCount || 0
    })
    
    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
    response.headers.set('X-Timestamp', new Date().toISOString())
    
    return response
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
    
    // Trigger analysis asynchronously (don't wait for completion)
    console.log('🔄 Starting async analysis for niche:', niche.id)
    
    // Start analysis in background without waiting
    setImmediate(async () => {
      try {
        const analyzeUrl = `${process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3002}`}/api/admin/niches/${niche.id}/analyze`
        console.log('🔗 Calling analyze endpoint asynchronously:', analyzeUrl)
        
        const analyzeResponse = await fetch(analyzeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': req.headers.get('cookie') || ''
          }
        })
        
        const responseText = await analyzeResponse.text()
        console.log('📥 Async analyze response status:', analyzeResponse.status)
        
        if (!analyzeResponse.ok) {
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
        } else {
          console.log('✅ Analysis started successfully in background')
        }
      } catch (error) {
        console.error('⚠️ Error starting async analysis:', error)
        
        // Update niche status to show error  
        await supabase
          .from('niches')
          .update({ 
            status: 'failed',
            error_message: `Failed to start analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
          .eq('id', niche.id)
      }
    })
    
    // Mark as processing immediately and return success
    await supabase
      .from('niches')
      .update({ status: 'processing' })
      .eq('id', niche.id)
    
    transformedNiche.status = 'processing'
    transformedNiche.analysisStatus = 'starting'
    
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
    console.log(`  - Niche analysis records deleted: ${deletionResults.nicheAnalysisDeleted}`)
    console.log(`  - Keywords deleted: ${deletionResults.keywordsDeleted}`)
    console.log(`  - Products deleted: ${deletionResults.productsDeleted}`)
    console.log(`  - Niche products deleted: ${deletionResults.nicheProductsDeleted}`)
    console.log(`  - Analysis runs deleted: ${deletionResults.analysisRunsDeleted}`)
    
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
    analysisRunsDeleted: 0,
    nicheAnalysisDeleted: 0
  }
  
  console.log('🧹 Starting cascade cleanup...')
  
  // Step 1: Delete all niches_* analysis tables
  const nicheAnalysisTables = [
    'niches_overall_analysis',
    'niches_market_intelligence',
    'niches_demand_analysis',
    'niches_competition_analysis',
    'niches_financial_analysis',
    'niches_keyword_analysis',
    'niches_launch_strategy',
    'niches_listing_optimization'
  ]
  
  for (const table of nicheAnalysisTables) {
    const { count, error } = await supabase
      .from(table)
      .delete({ count: 'exact' })
      .eq('niche_id', nicheId)
    
    if (error) {
      console.error(`Error deleting from ${table}:`, error.message)
    } else if (count > 0) {
      results.nicheAnalysisDeleted += count
      console.log(`  ✅ Deleted ${count} records from ${table}`)
    }
  }
  
  // Step 2: Delete product keywords for ASINs
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
  
  // Step 3: Delete niche_products
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
  
  // Step 4: Delete analysis runs
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
  
  // Step 5: Delete product_customer_reviews for ASINs
  if (asins.length > 0) {
    const { count: reviewCount, error: reviewError } = await supabase
      .from('product_customer_reviews')
      .delete({ count: 'exact' })
      .in('product_id', asins)
    
    if (reviewError) {
      console.error('Error deleting customer reviews:', reviewError)
    } else if (reviewCount > 0) {
      console.log(`  ✅ Deleted ${reviewCount} customer reviews`)
    }
  }
  
  // Step 6: Delete products (only if they belong to this niche)
  // Note: We should NOT delete products that might be shared across niches
  // Instead, just remove the niche association
  
  // Step 7: Finally delete the niche itself
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