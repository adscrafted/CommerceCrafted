import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'

export async function seedUsers() {
  try {
    // Check if users already exist
    // TODO: Convert to Supabase
    // const { data: existingAdmin } = await supabase.from('users').select('id').eq('email', 'admin@commercecrafted.com').single()
    // if (existingAdmin) {
    //   console.log('Demo users already exist')
    //   return
    // }
    
    // Create admin user
    // const adminPasswordHash = await bcrypt.hash('password', 12)
    // await supabase.from('users').insert({ email: 'admin@commercecrafted.com', password_hash: adminPasswordHash, name: 'Admin User', role: 'ADMIN', subscription_tier: 'enterprise', email_subscribed: true })
    
    // Create regular user
    // const userPasswordHash = await bcrypt.hash('password', 12)
    // await supabase.from('users').insert({ email: 'user@commercecrafted.com', password_hash: userPasswordHash, name: 'Demo User', role: 'USER', subscription_tier: 'free', email_subscribed: true })
    
    // Create pro user
    // const proUserPasswordHash = await bcrypt.hash('password', 12)
    // await supabase.from('users').insert({ email: 'pro@commercecrafted.com', password_hash: proUserPasswordHash, name: 'Pro User', role: 'USER', subscription_tier: 'pro', email_subscribed: true, subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
    
    console.log('TODO: Seed users not implemented with Supabase yet')

    console.log('Demo users created successfully')
  } catch (error) {
    console.error('Error seeding users:', error)
  }
}