import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignIn() {
  console.log('Testing sign in...')
  
  try {
    // Test sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'anthony@adscrafted.com',
      password: 'password123'
    })
    
    if (error) {
      console.error('Sign in error:', error)
      return
    }
    
    console.log('Sign in successful!')
    console.log('User:', data.user?.email)
    console.log('Session:', data.session ? 'Active' : 'None')
    
    // Check if user exists in database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'anthony@adscrafted.com')
      .single()
    
    if (userError) {
      console.error('Error fetching user from database:', userError)
    } else {
      console.log('User in database:', userData)
    }
    
    // Sign out
    await supabase.auth.signOut()
    console.log('Signed out')
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testSignIn()