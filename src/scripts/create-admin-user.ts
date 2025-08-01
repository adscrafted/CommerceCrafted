import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    // First check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'anthony@adscrafted.com')
      .single()

    if (existingUser) {
      console.log('User already exists:', existingUser)
      
      // Update to ensure admin role
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({
          role: 'ADMIN',
          subscription_tier: 'enterprise',
          email_verified: new Date().toISOString(),
          is_active: true
        })
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating user:', updateError)
      } else {
        console.log('Updated user to admin:', updated)
      }
      return
    }

    // Get the auth user ID
    const { data: authData } = await supabase.auth.admin.listUsers()
    const authUser = authData?.users?.find(u => u.email === 'anthony@adscrafted.com')

    if (!authUser) {
      console.error('No auth user found for anthony@adscrafted.com. Please sign up first.')
      return
    }

    // Create user in users table
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: 'anthony@adscrafted.com',
        name: 'Anthony (Admin)',
        role: 'ADMIN',
        subscription_tier: 'enterprise',
        email_verified: new Date().toISOString(),
        is_active: true,
        last_login_at: new Date().toISOString(),
        email_subscribed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
    } else {
      console.log('Created admin user:', newUser)
    }
  } catch (error) {
    console.error('Script error:', error)
  }
}

createAdminUser()