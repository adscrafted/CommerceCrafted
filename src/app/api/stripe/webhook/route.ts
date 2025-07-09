import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, getPlanByPriceId } from '@/lib/stripe'
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

  // Get the subscription ID from the session
  const subscriptionId = session.subscription as string
  const customerId = session.customer as string

  // Update user subscription in database
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: planId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Will be updated when subscription is processed
    }
  })

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
    
    await prisma.user.updateMany({
      where: { email: customer.email },
      data: {
        subscriptionTier: planName,
        subscriptionExpiresAt: expiresAt,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
      }
    })
    
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
    
    await prisma.user.updateMany({
      where: { email: customer.email },
      data: updateData
    })
    
    console.log(`Subscription updated for ${customer.email}: ${planName} (${subscription.status})`)
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
  console.log(`Payment succeeded for invoice ${invoice.id}`)
  
  if (!invoice.customer || !invoice.id) return

  const customerId = invoice.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (customer.email) {
    // Find user and create/update invoice record
    const user = await prisma.user.findFirst({
      where: { email: customer.email }
    })

    if (user) {
      await prisma.invoice.upsert({
        where: { stripeInvoiceId: invoice.id },
        create: {
          userId: user.id,
          stripeInvoiceId: invoice.id,
          stripeSubscriptionId: invoice.subscription as string || null,
          amount: invoice.amount_paid / 100, // Convert from cents
          currency: invoice.currency,
          status: invoice.status || 'paid',
          description: invoice.description || 'Subscription payment',
          invoiceUrl: invoice.invoice_pdf || null,
          hostedInvoiceUrl: invoice.hosted_invoice_url || null,
          periodStart: new Date((invoice.period_start || 0) * 1000),
          periodEnd: new Date((invoice.period_end || 0) * 1000),
          dueDate: new Date((invoice.due_date || 0) * 1000),
          paidAt: new Date(),
        },
        update: {
          status: invoice.status || 'paid',
          paidAt: new Date(),
          attemptCount: invoice.attempt_count || 0,
        }
      })
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Payment failed for invoice ${invoice.id}`)
  
  if (!invoice.customer || !invoice.id) return

  const customerId = invoice.customer as string
  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
  
  if (customer.email) {
    const user = await prisma.user.findFirst({
      where: { email: customer.email }
    })

    if (user) {
      await prisma.invoice.upsert({
        where: { stripeInvoiceId: invoice.id },
        create: {
          userId: user.id,
          stripeInvoiceId: invoice.id,
          stripeSubscriptionId: invoice.subscription as string || null,
          amount: invoice.amount_due / 100,
          currency: invoice.currency,
          status: invoice.status || 'failed',
          description: invoice.description || 'Subscription payment',
          periodStart: new Date((invoice.period_start || 0) * 1000),
          periodEnd: new Date((invoice.period_end || 0) * 1000),
          dueDate: new Date((invoice.due_date || 0) * 1000),
          attemptCount: invoice.attempt_count || 0,
          nextPaymentAttempt: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : null,
        },
        update: {
          status: invoice.status || 'failed',
          attemptCount: invoice.attempt_count || 0,
          nextPaymentAttempt: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : null,
        }
      })

      // Consider temporarily restricting access for failed payments
      // This depends on your business logic
    }
  }
}