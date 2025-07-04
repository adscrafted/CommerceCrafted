import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createBillingPortalSession, getStripeCustomerByEmail } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { returnUrl } = await request.json()

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'Return URL is required' },
        { status: 400 }
      )
    }

    // Get Stripe customer
    const stripeCustomer = await getStripeCustomerByEmail(session.user.email)
    
    if (!stripeCustomer) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    // Create billing portal session
    const portalSession = await createBillingPortalSession(
      stripeCustomer.id,
      returnUrl
    )

    return NextResponse.json({ url: portalSession.url })

  } catch (error) {
    console.error('Error creating billing portal session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}