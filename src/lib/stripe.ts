import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
})

export const STRIPE_CONFIG = {
  currency: 'usd',
  plans: {
    pro: {
      id: 'pro',
      name: 'Pro Plan',
      description: 'Perfect for growing Amazon sellers',
      monthly: {
        priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
        name: 'Pro Plan Monthly',
        price: 29,
        interval: 'month',
      },
      annual: {
        priceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual',
        name: 'Pro Plan Annual',
        price: 278.40,
        interval: 'year',
        discount: 20, // 20% discount for annual
      },
      limits: {
        analyses: null, // unlimited
        aiQueries: null, // unlimited
        exports: null, // unlimited
        keywordResearch: null, // unlimited
      },
      features: [
        'Unlimited product analyses',
        'Advanced keyword research',
        'Priority AI assistant',
        'Export capabilities',
        'Email support'
      ]
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise Plan',
      description: 'For teams and agencies',
      monthly: {
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
        name: 'Enterprise Plan Monthly', 
        price: 99,
        interval: 'month',
      },
      annual: {
        priceId: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || 'price_enterprise_annual',
        name: 'Enterprise Plan Annual',
        price: 950.40,
        interval: 'year',
        discount: 20, // 20% discount for annual
      },
      limits: {
        analyses: null, // unlimited
        aiQueries: null, // unlimited
        exports: null, // unlimited
        keywordResearch: null, // unlimited
        teamMembers: 10,
      },
      features: [
        'Everything in Pro',
        'White-label reports',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Phone support'
      ]
    },
    free: {
      id: 'free',
      name: 'Free Plan',
      description: 'Get started with basic features',
      limits: {
        analyses: 5,
        aiQueries: 3,
        exports: 1,
        keywordResearch: 10,
      },
      features: [
        '5 product analyses per month',
        'Basic keyword research',
        'Limited AI assistant',
        'Community support'
      ]
    }
  }
}

export const getStripeCustomerByEmail = async (email: string) => {
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  })
  return customers.data[0]
}

export const createStripeCustomer = async (email: string, name?: string) => {
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      source: 'commercecrafted'
    }
  })
}

export const createCheckoutSession = async ({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata = {}
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) => {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    subscription_data: {
      metadata,
    },
  })
}

export const createBillingPortalSession = async (customerId: string, returnUrl: string) => {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export const getStripeSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.retrieve(subscriptionId)
}

export const cancelStripeSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.cancel(subscriptionId)
}

export const updateStripeSubscription = async (subscriptionId: string, params: any) => {
  return await stripe.subscriptions.update(subscriptionId, params)
}

export const getStripeInvoices = async (customerId: string, limit = 100) => {
  return await stripe.invoices.list({
    customer: customerId,
    limit,
  })
}

export const getStripeInvoice = async (invoiceId: string) => {
  return await stripe.invoices.retrieve(invoiceId)
}

export const getStripeUpcomingInvoice = async (customerId: string) => {
  try {
    return await stripe.invoices.retrieveUpcoming({
      customer: customerId,
    })
  } catch (error) {
    // No upcoming invoice
    return null
  }
}

export const getStripePriceObject = async (priceId: string) => {
  return await stripe.prices.retrieve(priceId)
}

export const formatCurrency = (amount: number, currency = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100) // Stripe amounts are in cents
}

export const getPlanByPriceId = (priceId: string) => {
  for (const [planKey, plan] of Object.entries(STRIPE_CONFIG.plans)) {
    if ('monthly' in plan && 'annual' in plan) {
      if (plan.monthly.priceId === priceId || plan.annual.priceId === priceId) {
        return {
          planId: planKey,
          plan,
          interval: plan.monthly.priceId === priceId ? 'month' : 'year'
        }
      }
    }
  }
  return null
}