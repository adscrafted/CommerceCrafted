import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from './database.types'

export async function createSupabaseMiddleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  return { supabase, session, res }
}

export async function withSupabaseAuth(
  request: NextRequest,
  handler: (
    request: NextRequest,
    supabase: ReturnType<typeof createMiddlewareClient<Database>>,
    session: any
  ) => Promise<NextResponse>
) {
  const { supabase, session, res } = await createSupabaseMiddleware(request)
  
  try {
    return await handler(request, supabase, session)
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}