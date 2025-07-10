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

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug API Authentication</h1>
      
      <div className="space-y-4 mb-8">
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