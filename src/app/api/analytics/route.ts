import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    await prisma.analyticsEvent.create({
      data: {
        event,
        properties: properties ? JSON.stringify(properties) : null,
        userId,
        timestamp: new Date(timestamp),
        userAgent,
        url,
        referrer,
        ipAddress: getClientIP(request),
      },
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