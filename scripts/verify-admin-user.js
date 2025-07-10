require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function verifyAdminUser() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('Verifying admin user setup...\n')

  try {
    // Check auth.users table
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 100
    })

    if (authError) {
      console.error('Error listing auth users:', authError)
      return
    }

    const adminAuthUser = authUsers.users.find(u => u.email === 'admin@commercecrafted.com')
    
    if (adminAuthUser) {
      console.log('✓ Admin user exists in auth.users')
      console.log('  ID:', adminAuthUser.id)
      console.log('  Email:', adminAuthUser.email)
      console.log('  Created:', new Date(adminAuthUser.created_at).toLocaleString())
      console.log('  Confirmed:', adminAuthUser.email_confirmed_at ? 'Yes' : 'No')
    } else {
      console.log('✗ Admin user NOT found in auth.users')
      console.log('\nCreating admin user in auth.users...')
      
      // Create the user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'admin@commercecrafted.com',
        password: 'password',
        email_confirm: true,
        user_metadata: {
          name: 'Admin User',
          role: 'ADMIN'
        }
      })

      if (createError) {
        console.error('Error creating admin user:', createError)
        return
      }

      console.log('✓ Admin user created successfully')
      console.log('  ID:', newUser.user.id)
    }

    // Check public.users table
    console.log('\nChecking public.users table...')
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@commercecrafted.com')
      .single()

    if (publicError) {
      console.log('✗ Admin user NOT found in public.users')
      
      if (adminAuthUser || newUser) {
        const userId = adminAuthUser?.id || newUser.user.id
        console.log('\nCreating admin user in public.users...')
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: 'admin@commercecrafted.com',
            name: 'Admin User',
            role: 'ADMIN',
            subscription_tier: 'enterprise',
            email_verified: new Date().toISOString(),
            is_active: true,
            email_subscribed: false
          })

        if (insertError) {
          console.error('Error inserting into public.users:', insertError)
        } else {
          console.log('✓ Admin user created in public.users')
        }
      }
    } else {
      console.log('✓ Admin user exists in public.users')
      console.log('  ID:', publicUser.id)
      console.log('  Role:', publicUser.role)
      console.log('  Active:', publicUser.is_active)
    }

    // Test sign in
    console.log('\nTesting sign in...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@commercecrafted.com',
      password: 'password'
    })

    if (signInError) {
      console.error('✗ Sign in failed:', signInError.message)
    } else {
      console.log('✓ Sign in successful!')
      console.log('  Session:', !!signInData.session)
      console.log('  User ID:', signInData.user?.id)
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

verifyAdminUser()