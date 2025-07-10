const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('Please make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@commercecrafted.com',
      password: 'password',
      email_confirm: true,
      user_metadata: {
        name: 'Admin User',
        role: 'ADMIN'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('Admin user already exists in Auth')
        
        // Get the existing user
        const { data: users } = await supabase.auth.admin.listUsers()
        const adminUser = users.users.find(u => u.email === 'admin@commercecrafted.com')
        
        if (adminUser) {
          // Update user metadata to ensure role is set
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            adminUser.id,
            {
              user_metadata: {
                name: 'Admin User',
                role: 'ADMIN'
              }
            }
          )
          
          if (updateError) {
            console.error('Error updating user metadata:', updateError)
          } else {
            console.log('Admin user metadata updated successfully')
          }
        }
      } else {
        throw authError
      }
    } else {
      console.log('Admin user created successfully in Auth')
    }

    // Also create/update user in the public.users table if you have one
    const userId = authData?.user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === 'admin@commercecrafted.com')?.id
    
    if (userId) {
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: 'admin@commercecrafted.com',
          name: 'Admin User',
          role: 'ADMIN',
          subscription_tier: 'enterprise',
          email_subscribed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (dbError) {
        console.log('Note: Could not create user in public.users table:', dbError.message)
        console.log('This is normal if you don\'t have a public.users table')
      } else {
        console.log('Admin user created/updated in database')
      }
    }

    console.log('\n✅ Admin user setup complete!')
    console.log('Email: admin@commercecrafted.com')
    console.log('Password: password')
    console.log('\nYou can now sign in at http://localhost:3001/auth/signin')

  } catch (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  }
}

createAdminUser().then(() => {
  process.exit(0)
})