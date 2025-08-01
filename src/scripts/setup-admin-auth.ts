import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '[SET]' : '[NOT SET]')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupAdminAuth() {
  const adminEmail = 'anthony@adscrafted.com'
  const adminPassword = 'admin123456' // You'll change this after first login
  
  try {
    console.log('Setting up admin user...')
    
    // First, check if the auth user exists
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = authUsers?.users?.find(u => u.email === adminEmail)
    
    let authUserId: string
    
    if (existingAuthUser) {
      console.log('Auth user already exists:', existingAuthUser.id)
      authUserId = existingAuthUser.id
      
      // Update the password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        authUserId,
        { password: adminPassword }
      )
      
      if (updateError) {
        console.error('Error updating password:', updateError)
      } else {
        console.log('Password updated successfully')
      }
    } else {
      // Create new auth user
      console.log('Creating new auth user...')
      const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          name: 'Anthony (Admin)',
          role: 'ADMIN'
        }
      })
      
      if (createError) {
        console.error('Error creating auth user:', createError)
        return
      }
      
      authUserId = newAuthUser.user.id
      console.log('Created auth user:', authUserId)
    }
    
    // Check if user exists in users table
    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single()
    
    if (!dbUser) {
      // Create user in users table
      console.log('Creating user in database...')
      const { data: newDbUser, error: dbError } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          email: adminEmail,
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
      
      if (dbError) {
        console.error('Error creating database user:', dbError)
      } else {
        console.log('Created database user:', newDbUser)
      }
    } else {
      // Update existing user to ensure admin role
      console.log('Updating existing database user...')
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          role: 'ADMIN',
          subscription_tier: 'enterprise',
          email_verified: new Date().toISOString(),
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUserId)
        .select()
        .single()
      
      if (updateError) {
        console.error('Error updating database user:', updateError)
      } else {
        console.log('Updated database user:', updatedUser)
      }
    }
    
    console.log('\n✅ Admin setup complete!')
    console.log('You can now sign in with:')
    console.log(`Email: ${adminEmail}`)
    console.log(`Password: ${adminPassword}`)
    console.log('\n⚠️  IMPORTANT: Change this password after your first login!')
    
  } catch (error) {
    console.error('Setup error:', error)
  }
}

setupAdminAuth()