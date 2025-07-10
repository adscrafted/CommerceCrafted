'use client'

import { AuthProvider } from '@/lib/supabase/auth-context'

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthProvider>{children}</AuthProvider>
}