import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Skip middleware if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
  
  console.log('Middleware: Full user object from getUser():', JSON.stringify(user, null, 2))
  console.log('Middleware: User email:', user?.email)
  console.log('Middleware: User ID:', user?.id)

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
    '/admin', // TEMPORARY: Make admin public for debugging
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
    
    if (!user) {
      console.log('Middleware: no user, redirecting to signin')
      // Don't add callbackUrl to prevent redirect loops
      const signInUrl = new URL('/auth/signin', request.url)
      return NextResponse.redirect(signInUrl)
    }
    
    // Allow known admin email without database checks
    if (user.email === 'anthony@adscrafted.com') {
      console.log('Middleware: allowing known admin user:', user.email)
      return supabaseResponse
    }
    
    // For other users, redirect to dashboard
    console.log('Middleware: non-admin user, redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
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