require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function resetAdminPassword() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('Resetting admin password...\n')

  try {
    // Update the password
    const { data, error } = await supabase.auth.admin.updateUserById(
      '951379b8-b2c6-44a6-90e6-fd02c176de7f',
      { password: 'password' }
    )

    if (error) {
      console.error('Error updating password:', error)
      return
    }

    console.log('✓ Password updated successfully')

    // Test sign in
    console.log('\nTesting sign in with new password...')
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
      
      // Also log the access token for debugging
      if (signInData.session) {
        console.log('  Access token (first 20 chars):', signInData.session.access_token.substring(0, 20) + '...')
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

resetAdminPassword()