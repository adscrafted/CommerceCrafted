import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, getPlanByPriceId } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: unknown) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planId = session.metadata?.planId
  
  if (!userId || !planId) {
    console.error('Missing metadata in checkout session')
    return
  }

  // Get the subscription ID from the session
  const subscriptionId = session.subscription as string
  const customerId = session.customer as string

  // Update user subscription in database
  // TODO: Convert to Supabase
  // await supabase.from('users').update({ subscription_tier: planId, stripe_customer_id: customerId, stripe_subscription_id: subscriptionId, subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }).eq('id', userId)
  console.log('TODO: Update user subscription in Supabase')

  console.log(`User ${userId} subscribed to ${planId}`)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (customer.email) {
    const priceId = subscription.items.data[0]?.price.id
    const planInfo = priceId ? getPlanByPriceId(priceId) : null
    const planName = planInfo?.planId || 'pro'
    const expiresAt = new Date(subscription.current_period_end * 1000)
    
    // TODO: Convert to Supabase
    // await supabase.from('users').update({ subscription_tier: planName, subscription_expires_at: expiresAt, stripe_customer_id: customerId, stripe_subscription_id: subscription.id }).eq('email', customer.email)
    console.log('TODO: Update user subscription in Supabase')
    
    console.log(`Subscription created for ${customer.email}: ${planName}`)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (customer.email) {
    const priceId = subscription.items.data[0]?.price.id
    const planInfo = priceId ? getPlanByPriceId(priceId) : null
    const planName = planInfo?.planId || 'pro'
    const expiresAt = new Date(subscription.current_period_end * 1000)
    
    // Handle subscription status changes
    const updateData: {
      subscriptionExpiresAt: Date | null;
      stripeCustomerId: string;
      stripeSubscriptionId: string;
      subscriptionTier?: string;
    } = {
      subscriptionExpiresAt: expiresAt,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
    }

    if (subscription.status === 'active') {
      updateData.subscriptionTier = planName
    } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      updateData.subscriptionTier = 'free'
      updateData.subscriptionExpiresAt = null
    }
    
    // TODO: Convert to Supabase
    // await supabase.from('users').update(updateData).eq('email', customer.email)
    console.log('TODO: Update user subscription in Supabase')
    
    console.log(`Subscription updated for ${customer.email}: ${planName} (${subscription.status})`)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (customer.email) {
    // TODO: Convert to Supabase
    // await supabase.from('users').update({ subscription_tier: 'free', subscription_expires_at: null }).eq('email', customer.email)
    console.log('TODO: Update user subscription in Supabase')
    
    console.log(`Subscription cancelled for ${customer.email}`)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Payment succeeded for invoice ${invoice.id}`)
  
  if (!invoice.customer || !invoice.id) return

  const customerId = invoice.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (customer.email) {
    // Find user and create/update invoice record
    // TODO: Convert to Supabase
    // const { data: user } = await supabase.from('users').select('id').eq('email', customer.email).single()
    // if (user) {
    //   await supabase.from('invoices').upsert({ ... })
    // }
    console.log('TODO: Update invoice in Supabase')
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Payment failed for invoice ${invoice.id}`)
  
  if (!invoice.customer || !invoice.id) return

  const customerId = invoice.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (customer.email) {
    // TODO: Convert to Supabase
    // const { data: user } = await supabase.from('users').select('id').eq('email', customer.email).single()
    // if (user) {
    //   await supabase.from('invoices').upsert({ ... })
    // }
    console.log('TODO: Update failed invoice in Supabase')

    // Consider temporarily restricting access for failed payments
    // This depends on your business logic
  }
}