import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Request validation schemas
const updateNicheSchema = z.object({
  status: z.enum(['pending', 'analyzing', 'completed', 'scheduled']).optional(),
  category: z.string().optional(),
  avgBsr: z.number().int().optional(),
  avgPrice: z.number().optional(),
  avgRating: z.number().optional(),
  totalReviews: z.number().int().optional(),
  totalMonthlyRevenue: z.number().optional(),
  opportunityScore: z.number().int().min(0).max(100).optional(),
  competitionLevel: z.string().optional(),
  processTime: z.string().optional(),
  nicheKeywords: z.string().optional(),
  marketSize: z.number().optional(),
  aiAnalysis: z.any().optional()
})

// GET /api/admin/niches/[id] - Get a specific niche
async function handleGet(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    const { data: niche } = await supabase
      .from('niches')
      .select(`
        *,
        creator:users!niches_creator_id_fkey (
          name,
          email
        )
      `)
      .eq('id', params.id)
      .single()
    
    if (!niche) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 })
    }
    
    // Transform to match admin page format
    const transformedNiche = {
      id: niche.id,
      nicheName: niche.niche_name,
      asins: niche.asins.split(',').map(asin => asin.trim()),
      status: niche.status,
      addedDate: niche.added_date ? new Date(niche.added_date).toISOString().split('T')[0] : null,
      scheduledDate: niche.scheduled_date ? new Date(niche.scheduled_date).toISOString().split('T')[0] : null,
      category: niche.category || 'Pending',
      totalProducts: niche.total_products || 0,
      avgBsr: niche.avg_bsr || 0,
      avgPrice: niche.avg_price || 0,
      avgRating: niche.avg_rating || 0,
      totalReviews: niche.total_reviews || 0,
      totalMonthlyRevenue: niche.total_monthly_revenue || 0,
      opportunityScore: niche.opportunity_score || 0,
      competitionLevel: niche.competition_level || 'Unknown',
      processTime: niche.process_time || '0',
      analystAssigned: niche.analyst_assigned || 'AI Agent',
      nicheKeywords: niche.niche_keywords ? niche.niche_keywords.split(',').map(k => k.trim()) : [],
      marketSize: niche.market_size || 0,
      aiAnalysis: niche.ai_analysis || null
    }
    
    return NextResponse.json(transformedNiche)
  } catch (error) {
    console.error('Error fetching niche:', error)
    return NextResponse.json({ error: 'Failed to fetch niche' }, { status: 500 })
  }
}

// PUT /api/admin/niches/[id] - Update a niche
async function handlePut(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    // Parse and validate request body
    const body = await req.json()
    const data = updateNicheSchema.parse(body)
    
    // Update niche
    const updateData: any = {}
    if (data.status) updateData.status = data.status
    if (data.category) updateData.category = data.category
    if (data.avgBsr !== undefined) updateData.avg_bsr = data.avgBsr
    if (data.avgPrice !== undefined) updateData.avg_price = data.avgPrice
    if (data.avgRating !== undefined) updateData.avg_rating = data.avgRating
    if (data.totalReviews !== undefined) updateData.total_reviews = data.totalReviews
    if (data.totalMonthlyRevenue !== undefined) updateData.total_monthly_revenue = data.totalMonthlyRevenue
    if (data.opportunityScore !== undefined) updateData.opportunity_score = data.opportunityScore
    if (data.competitionLevel) updateData.competition_level = data.competitionLevel
    if (data.processTime) updateData.process_time = data.processTime
    if (data.nicheKeywords) updateData.niche_keywords = data.nicheKeywords
    if (data.marketSize !== undefined) updateData.market_size = data.marketSize
    if (data.aiAnalysis) updateData.ai_analysis = data.aiAnalysis
    
    const { data: niche } = await supabase
      .from('niches')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()
    
    // Transform to match admin page format
    const transformedNiche = {
      id: niche.id,
      nicheName: niche.niche_name,
      asins: niche.asins.split(',').map(asin => asin.trim()),
      status: niche.status,
      addedDate: niche.added_date ? new Date(niche.added_date).toISOString().split('T')[0] : null,
      scheduledDate: niche.scheduled_date ? new Date(niche.scheduled_date).toISOString().split('T')[0] : null,
      category: niche.category || 'Pending',
      totalProducts: niche.total_products || 0,
      avgBsr: niche.avg_bsr || 0,
      avgPrice: niche.avg_price || 0,
      avgRating: niche.avg_rating || 0,
      totalReviews: niche.total_reviews || 0,
      totalMonthlyRevenue: niche.total_monthly_revenue || 0,
      opportunityScore: niche.opportunity_score || 0,
      competitionLevel: niche.competition_level || 'Unknown',
      processTime: niche.process_time || '0',
      analystAssigned: niche.analyst_assigned || 'AI Agent',
      nicheKeywords: niche.niche_keywords ? niche.niche_keywords.split(',').map(k => k.trim()) : [],
      marketSize: niche.market_size || 0,
      aiAnalysis: niche.ai_analysis || null
    }
    
    return NextResponse.json(transformedNiche)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating niche:', error)
    return NextResponse.json({ error: 'Failed to update niche' }, { status: 500 })
  }
}

// DELETE /api/admin/niches/[id] - Delete a niche
async function handleDelete(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    await supabase
      .from('niches')
      .delete()
      .eq('id', params.id)
    
    return NextResponse.json({ message: 'Niche deleted successfully' })
  } catch (error) {
    console.error('Error deleting niche:', error)
    return NextResponse.json({ error: 'Failed to delete niche' }, { status: 500 })
  }
}

export { handleGet as GET, handlePut as PUT, handleDelete as DELETE }