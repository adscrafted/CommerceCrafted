import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
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

  // Update user subscription in database
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: planId,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    }
  })

  console.log(`User ${userId} subscribed to ${planId}`)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (customer.email) {
    const planName = subscription.items.data[0]?.price.nickname || 'pro'
    const expiresAt = new Date((subscription as Stripe.Subscription).current_period_end * 1000)
    
    await prisma.user.updateMany({
      where: { email: customer.email },
      data: {
        subscriptionTier: planName,
        subscriptionExpiresAt: expiresAt,
      }
    })
    
    console.log(`Subscription created for ${customer.email}`)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (customer.email) {
    const planName = subscription.items.data[0]?.price.nickname || 'pro'
    const expiresAt = new Date((subscription as Stripe.Subscription).current_period_end * 1000)
    
    await prisma.user.updateMany({
      where: { email: customer.email },
      data: {
        subscriptionTier: planName,
        subscriptionExpiresAt: expiresAt,
      }
    })
    
    console.log(`Subscription updated for ${customer.email}`)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (customer.email) {
    await prisma.user.updateMany({
      where: { email: customer.email },
      data: {
        subscriptionTier: 'free',
        subscriptionExpiresAt: null,
      }
    })
    
    console.log(`Subscription cancelled for ${customer.email}`)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Handle successful payment
  console.log(`Payment succeeded for invoice ${invoice.id}`)
  
  // You could send a receipt email, update usage limits, etc.
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Handle failed payment
  console.log(`Payment failed for invoice ${invoice.id}`)
  
  // You could send a notification email, temporarily suspend access, etc.
}