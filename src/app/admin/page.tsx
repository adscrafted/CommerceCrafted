'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to niche page
    router.push('/admin/niche')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-gray-600">Redirecting to Niche management...</p>
    </div>
  )
}