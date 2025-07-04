import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
})

export const STRIPE_CONFIG = {
  currency: 'usd',
  plans: {
    pro: {
      monthly: {
        priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
        name: 'Pro Plan',
        price: 29,
        interval: 'month',
      },
      annual: {
        priceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual',
        name: 'Pro Plan',
        price: 278.40,
        interval: 'year',
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
      monthly: {
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
        name: 'Enterprise Plan', 
        price: 99,
        interval: 'month',
      },
      annual: {
        priceId: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || 'price_enterprise_annual',
        name: 'Enterprise Plan',
        price: 950.40,
        interval: 'year',
      },
      features: [
        'Everything in Pro',
        'White-label reports',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Phone support'
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