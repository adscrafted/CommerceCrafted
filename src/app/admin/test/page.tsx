'use client'

import React from 'react'
import { useAuthState } from '@/lib/supabase/hooks'

export default function AdminTestPage() {
  const { user, isAuthenticated, loading } = useAuthState()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Test Page</h1>
      
      <div className="space-y-2">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User Email:</strong> {user?.email || 'None'}</p>
        <p><strong>User Role:</strong> {user?.role || 'None'}</p>
        <p><strong>User ID:</strong> {user?.id || 'None'}</p>
      </div>
      
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <pre>{JSON.stringify({ user, isAuthenticated, loading }, null, 2)}</pre>
      </div>
    </div>
  )
}