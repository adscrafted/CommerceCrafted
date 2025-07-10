'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TestAuthPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSignIn = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // Test direct Supabase sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@commercecrafted.com',
        password: 'password'
      })
      
      if (error) {
        setResult({ error: error.message })
      } else {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        // Try to fetch user from database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', 'admin@commercecrafted.com')
          .single()
        
        setResult({
          authUser: data.user,
          session: session,
          dbUser: userData,
          dbError: userError
        })
      }
    } catch (err) {
      setResult({ error: err })
    } finally {
      setLoading(false)
    }
  }

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const { data: { user } } = await supabase.auth.getUser()
    setResult({ session, user })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setResult({ message: 'Signed out' })
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Auth Page</h1>
      
      <div className="space-y-4 mb-8">
        <Button onClick={testSignIn} disabled={loading}>
          {loading ? 'Testing...' : 'Test Sign In'}
        </Button>
        <Button onClick={checkSession} variant="outline">
          Check Current Session
        </Button>
        <Button onClick={signOut} variant="destructive">
          Sign Out
        </Button>
      </div>

      {result && (
        <Card className="p-4">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}