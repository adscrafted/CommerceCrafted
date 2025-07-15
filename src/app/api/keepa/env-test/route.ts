import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasKeepaKey: !!process.env.KEEPA_API_KEY,
    keepaKeyPreview: process.env.KEEPA_API_KEY ? 
      process.env.KEEPA_API_KEY.substring(0, 10) + '...' : 
      'NOT SET',
    nodeEnv: process.env.NODE_ENV,
    envKeys: Object.keys(process.env).filter(k => k.includes('KEEPA') || k.includes('SUPABASE'))
  })
}