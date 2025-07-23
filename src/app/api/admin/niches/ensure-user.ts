import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function ensureUserExists(userId: string, email: string) {
  const supabase = await createServerSupabaseClient()
  
  // Check if user exists
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()
  
  if (existingUser) {
    return { exists: true, userId }
  }
  
  // If user doesn't exist, create them
  console.log('Creating user in database:', { userId, email })
  
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: email,
      name: email.split('@')[0], // Use email prefix as name
      role: email === 'admin@commercecrafted.com' ? 'ADMIN' : 'USER',
      subscription_tier: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (createError) {
    console.error('Error creating user:', createError)
    return { exists: false, error: createError }
  }
  
  return { exists: true, userId: newUser.id }
}