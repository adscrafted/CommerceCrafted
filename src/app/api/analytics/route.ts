import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      event,
      properties,
      userId,
      timestamp,
      userAgent,
      url,
      referrer,
    } = body

    // Store analytics event in database
    await supabase.from('analytics_events').insert({
      event,
      properties: properties ? JSON.stringify(properties) : null,
      user_id: userId,
      timestamp: new Date(timestamp).toISOString(),
      user_agent: userAgent,
      url,
      referrer,
      ip_address: getClientIP(request),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing analytics event:', error)
    return NextResponse.json(
      { error: 'Failed to store analytics event' },
      { status: 500 }
    )
  }
}

function getClientIP(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  return null
}