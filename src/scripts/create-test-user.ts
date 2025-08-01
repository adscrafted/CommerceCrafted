import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  try {
    console.log('Creating test user...')
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'anthony@adscrafted.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        name: 'Anthony',
        role: 'ADMIN'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      // If user already exists, try to update password
      if (authError.message?.includes('already been registered')) {
        console.log('User already exists, updating password...')
        const { data: users, error: listError } = await supabase.auth.admin.listUsers()
        
        if (!listError && users?.users) {
          const existingUser = users.users.find(u => u.email === 'anthony@adscrafted.com')
          if (existingUser) {
            const { error: updateError } = await supabase.auth.admin.updateUserById(
              existingUser.id,
              { password: 'password123' }
            )
            
            if (updateError) {
              console.error('Error updating password:', updateError)
              return
            } else {
              console.log('Password updated successfully')
            }
          }
        }
      } else {
        return
      }
    } else {
      console.log('Auth user created:', authData.user?.email)
    }

    // Get the user ID
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users?.users?.find(u => u.email === 'anthony@adscrafted.com')
    
    if (!user) {
      console.error('Could not find created user')
      return
    }

    // Create or update user record in users table
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: 'anthony@adscrafted.com',
        name: 'Anthony',
        role: 'ADMIN',
        subscription_tier: 'enterprise',
        email_verified: true,
        is_active: true,
        email_subscribed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })

    if (dbError) {
      console.error('Error creating/updating user record:', dbError)
    } else {
      console.log('User record created/updated successfully')
    }

    console.log('\nTest user created successfully!')
    console.log('Email: anthony@adscrafted.com')
    console.log('Password: password123')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the script
createTestUser()