import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  
  // Get all cookies
  const allCookies = cookieStore.getAll()
  
  // Clear all Supabase-related cookies
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-')) {
      cookieStore.delete(cookie.name)
    }
  }
  
  // Return a response that also clears client-side storage
  return new NextResponse(`
    <html>
      <head>
        <title>Clearing Auth...</title>
      </head>
      <body>
        <h1>Clearing Authentication Data...</h1>
        <script>
          // Clear all localStorage items
          localStorage.clear();
          
          // Clear all sessionStorage items
          sessionStorage.clear();
          
          // Clear specific Supabase items
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) {
              localStorage.removeItem(key);
            }
          });
          
          // Redirect to home after clearing
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        </script>
        <p>Redirecting to home page...</p>
      </body>
    </html>
  `, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    }
  })
}