import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if needed
  const { data: { user } } = await supabase.auth.getUser()

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/pricing',
    '/terms',
    '/privacy',
    '/test-auth',
    '/debug-api',
    '/product-of-the-day',
    '/database',
    '/trends',
    '/features',
    '/terms-of-service',
    '/privacy-policy',
    '/account',
    '/products',
  ]

  const { pathname } = request.nextUrl

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isPublicRoute) {
    return supabaseResponse
  }

  // API routes handle their own auth
  if (pathname.startsWith('/api/')) {
    return supabaseResponse
  }

  // Admin-only routes - check this BEFORE general auth check
  if (pathname.startsWith('/admin')) {
    console.log('Middleware: checking admin access for user:', user?.email || 'no user')
    
    // In development, allow bypass
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware: allowing admin access in development mode')
      return supabaseResponse
    }
    
    if (!user) {
      // Redirect to sign in for admin
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
    
    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('Middleware: userData:', userData)

    if (userData?.role !== 'ADMIN') {
      // Also check by email as fallback
      const { data: userByEmail } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email!)
        .single()
      
      console.log('Middleware: userByEmail fallback:', userByEmail)
      
      if (userByEmail?.role !== 'ADMIN') {
        console.log('Middleware: redirecting non-admin user')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    
    console.log('Middleware: allowing admin access')
    return supabaseResponse
  }

  // Protected routes (non-admin)
  if (!user) {
    // Redirect to sign in
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}