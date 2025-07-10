require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function checkRLSPolicies() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('Checking RLS policies for users table...')

  try {
    // First, let's check if RLS is enabled
    const { data: tables, error: tablesError } = await supabase
      .rpc('pg_catalog.pg_tables')
      .select('*')
      .eq('tablename', 'users')

    console.log('\nChecking RLS status...')
    
    // Check with a simple query
    const { data: rlsCheck, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .eq('tablename', 'users')
      .single()

    if (rlsError) {
      console.log('Could not check RLS status directly')
      
      // Try alternative approach - query as admin user
      const { data: adminUser } = await supabase.auth.admin.getUserById('951379b8-b2c6-44a6-90e6-fd02c176de7f')
      console.log('\nAdmin user exists:', !!adminUser)
      
      // Try to query users table with service role key (bypasses RLS)
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(5)
      
      console.log('\nUsers found with service role key:', users?.length || 0)
      if (usersError) {
        console.log('Error with service role query:', usersError.message)
      }
    } else {
      console.log('RLS enabled for users table:', rlsCheck?.rowsecurity)
    }

    // Test if admin can see all users
    console.log('\nTesting admin access to users table...')
    
    // Create a client with admin user session
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@commercecrafted.com',
      password: 'password'
    })

    if (signInError) {
      console.log('Could not sign in as admin:', signInError.message)
    } else if (session) {
      console.log('Signed in as admin successfully')
      
      // Create a new client with the admin session
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false
          }
        }
      )
      
      // Set the session
      await adminClient.auth.setSession(session)
      
      // Try to query users
      const { data: adminUsers, error: adminError } = await adminClient
        .from('users')
        .select('*')
        .limit(5)
      
      console.log('\nUsers visible to admin:', adminUsers?.length || 0)
      if (adminError) {
        console.log('Error querying as admin:', adminError.message)
      }
      
      // Sign out
      await adminClient.auth.signOut()
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkRLSPolicies()