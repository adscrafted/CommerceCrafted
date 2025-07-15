'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'

export default function DebugAPIPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testSupabaseAuth = async () => {
    setLoading(true)
    const newResults: any = {}
    
    try {
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      newResults.session = { data: session, error: sessionError }
      
      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      newResults.user = { data: user, error: userError }
      
      // Try to fetch from users table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@commercecrafted.com')
        .single()
      newResults.usersTable = { data: usersData, error: usersError }
      
      // Try to fetch from niches table
      const { data: nichesData, error: nichesError } = await supabase
        .from('niches')
        .select('*')
        .limit(1)
      newResults.nichesTable = { data: nichesData, error: nichesError }
      
    } catch (err) {
      newResults.exception = err
    }
    
    setResults(newResults)
    setLoading(false)
  }

  const testAPIRoute = async () => {
    setLoading(true)
    const newResults: any = {}
    
    try {
      // Test debug auth API first
      const debugResponse = await fetch('/api/debug-auth', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      newResults.debugAPI = {
        status: debugResponse.status,
        statusText: debugResponse.statusText,
        body: await debugResponse.json()
      }
      
      // Test niches API
      const nichesResponse = await fetch('/api/admin/niches', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      newResults.nichesAPI = {
        status: nichesResponse.status,
        statusText: nichesResponse.statusText,
        headers: Object.fromEntries(nichesResponse.headers.entries()),
        body: await nichesResponse.text()
      }
      
      // Get cookies
      newResults.cookies = document.cookie
      
    } catch (err) {
      newResults.exception = err
    }
    
    setResults(newResults)
    setLoading(false)
  }

  const refreshSession = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.refreshSession()
      setResults({ refreshSession: { data, error } })
    } catch (err) {
      setResults({ exception: err })
    }
    setLoading(false)
  }

  const autoLogin = async () => {
    setLoading(true)
    setResults({})
    
    try {
      console.log('Starting auto-login...')
      
      // First, sign out to ensure clean state
      await supabase.auth.signOut()
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Sign in with admin credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@commercecrafted.com',
        password: 'password'
      })
      
      if (error) {
        console.error('Auto-login error:', error)
        setResults({ autoLoginError: error })
      } else {
        console.log('Auto-login successful:', data)
        
        // Wait for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check session
        const { data: { session } } = await supabase.auth.getSession()
        
        setResults({ 
          autoLoginSuccess: true,
          user: data.user,
          session: session
        })
        
        // Redirect to admin after successful login
        setTimeout(() => {
          window.location.href = '/admin'
        }, 2000)
      }
    } catch (err) {
      console.error('Auto-login exception:', err)
      setResults({ autoLoginException: err })
    }
    
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug API Authentication</h1>
      
      <div className="space-y-4 mb-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="font-semibold text-red-800 mb-2">🚨 DEBUG AUTO-LOGIN</h3>
          <p className="text-sm text-red-700 mb-3">
            This will automatically log you in as admin and redirect to /admin
          </p>
          <Button onClick={autoLogin} disabled={loading} variant="destructive" size="lg">
            {loading ? 'Auto-Logging In...' : '🔐 AUTO-LOGIN AS ADMIN'}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={testSupabaseAuth} disabled={loading}>
            Test Supabase Client Auth
          </Button>
          <Button onClick={testAPIRoute} disabled={loading} variant="outline">
            Test API Route
          </Button>
          <Button onClick={refreshSession} disabled={loading} variant="secondary">
            Refresh Session
          </Button>
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {Object.keys(results).length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Results:</h2>
          <pre className="text-xs overflow-auto whitespace-pre-wrap">
            {JSON.stringify(results, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}