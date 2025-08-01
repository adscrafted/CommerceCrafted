/**
 * Get the base URL for API calls
 * This handles different environments and dynamic ports
 * 
 * To run on a different port, update NEXT_PUBLIC_APP_URL in .env.local:
 * NEXT_PUBLIC_APP_URL=http://localhost:3001
 * 
 * This ensures both the Next.js server and background processes use the same port
 */
export function getBaseUrl() {
  // If we have a public app URL configured, use it
  // This is the most reliable way to ensure consistent URLs across all contexts
  if (process.env.NEXT_PUBLIC_APP_URL) {
    // For local development, check if we need to use a different port
    if (process.env.NEXT_PUBLIC_APP_URL.includes('localhost:3000')) {
      // Check if server is actually on 3003
      const actualPort = process.env.PORT || '3003'
      if (actualPort !== '3000') {
        return process.env.NEXT_PUBLIC_APP_URL.replace(':3000', `:${actualPort}`)
      }
    }
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // If we're on the server and have VERCEL_URL, use it
  if (typeof window === 'undefined' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // If we're in the browser, use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // For server-side in development, we need to be smarter about port detection
  // The PORT env variable might not be available in background processes
  
  // First, check if we have a specific dev port configured
  if (process.env.NEXT_PUBLIC_DEV_PORT) {
    return `http://localhost:${process.env.NEXT_PUBLIC_DEV_PORT}`
  }
  
  // In development, check common Next.js dev ports
  // Default to 3000 as that's the standard Next.js port
  if (process.env.NODE_ENV === 'development') {
    // If we have a PORT env var, use it, otherwise default to 3000
    const port = process.env.PORT || '3000'
    console.log('[getBaseUrl] Development mode - using port:', port)
    return `http://localhost:${port}`
  }
  
  // For production server-side, use PORT or default
  const port = process.env.PORT || '3000'
  const host = process.env.HOST || 'localhost'
  
  return `http://${host}:${port}`
}