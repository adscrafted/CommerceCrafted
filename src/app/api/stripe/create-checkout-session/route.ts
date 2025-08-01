import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createStripeCustomer, getStripeCustomerByEmail, createCheckoutSession, STRIPE_CONFIG } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { planId, isAnnual, successUrl, cancelUrl } = await request.json()

    if (!planId || !STRIPE_CONFIG.plans[planId as keyof typeof STRIPE_CONFIG.plans]) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    const plan = STRIPE_CONFIG.plans[planId as keyof typeof STRIPE_CONFIG.plans]
    const billing = isAnnual ? plan.annual : plan.monthly
    const priceId = billing.priceId

    // Get user details from database
    const { data: userRecord } = await supabase
      .from('users')
      .select('name')
      .eq('id', authUser.id)
      .single()
    
    // Get or create Stripe customer
    let stripeCustomer = await getStripeCustomerByEmail(authUser.email!)
    
    if (!stripeCustomer) {
      stripeCustomer = await createStripeCustomer(
        authUser.email!,
        userRecord?.name || undefined
      )
    }

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      customerId: stripeCustomer.id,
      priceId,
      successUrl,
      cancelUrl,
      metadata: {
        userId: authUser.id,
        planId,
        isAnnual: isAnnual.toString(),
      }
    })

    return NextResponse.json({ url: checkoutSession.url })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}