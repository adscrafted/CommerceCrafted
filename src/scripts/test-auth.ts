import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  console.log('Testing authentication...\n')
  
  try {
    // Test sign in
    console.log('1. Testing sign in...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'anthony@adscrafted.com',
      password: 'admin123456'
    })
    
    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message)
      return
    }
    
    console.log('✅ Sign in successful!')
    console.log('   User ID:', signInData.user?.id)
    console.log('   Email:', signInData.user?.email)
    console.log('   Session:', signInData.session ? 'Valid' : 'None')
    
    // Test getting current user
    console.log('\n2. Testing getUser()...')
    const { data: { user }, error: getUserError } = await supabase.auth.getUser()
    
    if (getUserError) {
      console.error('❌ Get user failed:', getUserError.message)
    } else {
      console.log('✅ Get user successful!')
      console.log('   User ID:', user?.id)
      console.log('   Email:', user?.email)
    }
    
    // Test database query
    console.log('\n3. Testing database query...')
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'anthony@adscrafted.com')
      .single()
    
    if (dbError) {
      console.error('❌ Database query failed:', dbError.message)
    } else {
      console.log('✅ Database query successful!')
      console.log('   DB User:', {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        subscription_tier: dbUser.subscription_tier
      })
    }
    
    // Sign out
    console.log('\n4. Signing out...')
    await supabase.auth.signOut()
    console.log('✅ Signed out successfully!')
    
  } catch (error) {
    console.error('Test error:', error)
  }
}

testAuth()