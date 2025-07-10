import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Request validation schemas
const createNicheSchema = z.object({
  nicheName: z.string().min(1).max(100),
  asins: z.string().min(1), // comma-separated ASINs
  scheduledDate: z.string().datetime().or(z.string().refine((val) => !isNaN(Date.parse(val))))
})

// GET /api/admin/niches - List all niches for admin
async function handleGet(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (userError || user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
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
      avgBsr: niche.avg_bsr || 0,
      avgPrice: niche.avg_price || 0,
      avgRating: niche.avg_rating || 0,
      totalReviews: niche.total_reviews || 0,
      totalMonthlyRevenue: niche.total_monthly_revenue || 0,
      opportunityScore: niche.opportunity_score || 0,
      competitionLevel: niche.competition_level || 'MEDIUM',
      processTime: niche.process_time || '0',
      analystAssigned: niche.analyst_assigned || 'AI Agent',
      nicheKeywords: niche.niche_keywords ? niche.niche_keywords.split(',').map(k => k.trim()) : [],
      marketSize: niche.market_size || 0,
      aiAnalysis: niche.ai_analysis || null
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (userError || user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    // Parse and validate request body
    const body = await req.json()
    const data = createNicheSchema.parse(body)
    
    // Parse ASINs
    const asinList = data.asins.split(',').map(asin => asin.trim()).filter(asin => asin.length > 0)
    
    // Create niche
    const { data: niche, error: createError } = await supabase
      .from('niches')
      .insert({
        niche_name: data.nicheName,
        asins: asinList.join(','),
        scheduled_date: new Date(data.scheduledDate).toISOString(),
        total_products: asinList.length,
        status: 'pending',
        category: 'Pending',
        competition_level: 'MEDIUM',
        analyst_assigned: 'AI Agent',
        created_by: session.user.id
      })
      .select()
      .single()
    
    if (createError) {
      console.error('Error creating niche:', createError)
      return NextResponse.json({ error: 'Failed to create niche' }, { status: 500 })
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
      avgBsr: niche.avg_bsr || 0,
      avgPrice: niche.avg_price || 0,
      avgRating: niche.avg_rating || 0,
      totalReviews: niche.total_reviews || 0,
      totalMonthlyRevenue: niche.total_monthly_revenue || 0,
      opportunityScore: niche.opportunity_score || 0,
      competitionLevel: niche.competition_level || 'MEDIUM',
      processTime: niche.process_time || '0',
      analystAssigned: niche.analyst_assigned || 'AI Agent',
      nicheKeywords: niche.niche_keywords ? niche.niche_keywords.split(',').map(k => k.trim()) : [],
      marketSize: niche.market_size || 0,
      aiAnalysis: niche.ai_analysis || null
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

export { handleGet as GET, handlePost as POST }