import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a service role client for newsletter operations
const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

export async function subscribeToNewsletter(
  email: string,
  userId?: string | null,
  source: string = 'signup'
) {
  try {
    // Check if already subscribed
    const { data: existing } = await supabaseService
      .from('newsletter_subscriptions')
      .select('id')
      .eq('email', email)
      .eq('subscription_type', 'daily_product')
      .single()
    
    if (existing) {
      // Update existing subscription to active
      await supabaseService
        .from('newsletter_subscriptions')
        .update({
          is_active: true,
          user_id: userId,
          subscribe_source: source,
        })
        .eq('id', existing.id)
      
      return { success: true, message: 'Subscription reactivated' }
    }
    
    // Create new subscription
    const unsubscribeToken = uuidv4()
    
    const { error } = await supabaseService
      .from('newsletter_subscriptions')
      .insert({
        email,
        user_id: userId,
        subscription_type: 'daily_product',
        is_active: true,
        subscribe_source: source,
        unsubscribe_token: unsubscribeToken,
        preferences: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          format: 'html'
        }
      })
    
    if (error) {
      console.error('Newsletter subscription error:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, message: 'Successfully subscribed to Product of the Day' }
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return { success: false, error: 'Failed to subscribe' }
  }
}

export async function unsubscribeFromNewsletter(token: string) {
  try {
    const { error } = await supabaseService
      .from('newsletter_subscriptions')
      .update({ is_active: false })
      .eq('unsubscribe_token', token)
    
    if (error) {
      console.error('Newsletter unsubscribe error:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, message: 'Successfully unsubscribed' }
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return { success: false, error: 'Failed to unsubscribe' }
  }
}