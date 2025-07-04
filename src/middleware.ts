import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

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
      '/api/auth',
    ]

    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => 
      pathname.startsWith(route) || pathname === route
    )

    if (isPublicRoute) {
      return NextResponse.next()
    }

    // If no token and not a public route, redirect to signin
    if (!token) {
      const signInUrl = new URL('/auth/signin', req.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Admin-only routes
    const adminRoutes = ['/admin']
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
    
    if (isAdminRoute && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Analyst or Admin routes
    const analystRoutes = ['/analytics', '/reports']
    const isAnalystRoute = analystRoutes.some(route => pathname.startsWith(route))
    
    if (isAnalystRoute && !['ADMIN', 'ANALYST'].includes(token.role as string)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Pro/Enterprise features
    const premiumRoutes = ['/ai-research', '/advanced-analytics', '/bulk-export']
    const isPremiumRoute = premiumRoutes.some(route => pathname.startsWith(route))
    
    if (isPremiumRoute && token.subscriptionTier === 'free') {
      const pricingUrl = new URL('/pricing', req.url)
      pricingUrl.searchParams.set('feature', pathname.split('/')[1])
      return NextResponse.redirect(pricingUrl)
    }

    // Check subscription expiry for paid features
    if (isPremiumRoute && token.subscriptionTier !== 'free') {
      const now = new Date()
      const expiresAt = token.subscriptionExpiresAt ? new Date(token.subscriptionExpiresAt) : null
      
      if (expiresAt && expiresAt < now) {
        const pricingUrl = new URL('/pricing', req.url)
        pricingUrl.searchParams.set('expired', 'true')
        return NextResponse.redirect(pricingUrl)
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow public routes
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
        ]

        const isPublicRoute = publicRoutes.some(route => 
          pathname.startsWith(route) || pathname === route
        )

        if (isPublicRoute) {
          return true
        }

        // API routes that start with /api/auth are handled by NextAuth
        if (pathname.startsWith('/api/auth')) {
          return true
        }

        // For protected routes, require a valid token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}