import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getStripeInvoices, getStripeUpcomingInvoice, formatCurrency } from '@/lib/stripe'
import { getAllUserUsage } from '@/lib/usage'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, email, subscription_tier, subscription_expires_at, stripe_customer_id, stripe_subscription_id')
      .eq('id', authUser.id)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get usage information
    const usage = await getAllUserUsage(user.id)

    // Get invoices from database
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10) || []

    // Get Stripe invoices if customer exists
    let stripeInvoices: Array<{
      id: string;
      amount: string;
      status: string;
      date: string;
      description: string;
      invoiceUrl: string | null;
      hostedInvoiceUrl: string | null;
      periodStart: Date;
      periodEnd: Date;
    }> = []
    let upcomingInvoice: {
      amount: string;
      date: string;
      description: string;
      periodStart: Date;
      periodEnd: Date;
    } | null = null

    if (user.stripe_customer_id) {
      try {
        const stripeInvoiceList = await getStripeInvoices(user.stripe_customer_id, 10)
        stripeInvoices = stripeInvoiceList.data.map(invoice => ({
          id: invoice.id,
          amount: formatCurrency(invoice.amount_paid || invoice.amount_due),
          status: invoice.status,
          date: new Date(invoice.created * 1000).toLocaleDateString(),
          description: invoice.description || 'Subscription payment',
          invoiceUrl: invoice.invoice_pdf,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          periodStart: new Date((invoice.period_start || 0) * 1000),
          periodEnd: new Date((invoice.period_end || 0) * 1000),
        }))

        upcomingInvoice = await getStripeUpcomingInvoice(user.stripe_customer_id)
        if (upcomingInvoice) {
          upcomingInvoice = {
            amount: formatCurrency(upcomingInvoice.amount_due),
            date: new Date(upcomingInvoice.created * 1000).toLocaleDateString(),
            description: upcomingInvoice.description || 'Upcoming subscription payment',
            periodStart: new Date((upcomingInvoice.period_start || 0) * 1000),
            periodEnd: new Date((upcomingInvoice.period_end || 0) * 1000),
          }
        }
      } catch (error) {
        console.error('Error fetching Stripe invoices:', error)
        // Continue without Stripe data
      }
    }

    // Combine database and Stripe invoice data
    const allInvoices = [
      ...stripeInvoices,
      ...invoices.map(invoice => ({
        id: invoice.stripe_invoice_id,
        amount: formatCurrency(invoice.amount * 100), // Convert back to cents for formatting
        status: invoice.status,
        date: new Date(invoice.created_at).toLocaleDateString(),
        description: invoice.description,
        invoiceUrl: invoice.invoice_url,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        periodStart: new Date(invoice.period_start),
        periodEnd: new Date(invoice.period_end),
      }))
    ]

    // Remove duplicates (prefer Stripe data)
    const uniqueInvoices = allInvoices.filter((invoice, index, arr) => 
      arr.findIndex(i => i.id === invoice.id) === index
    )

    return NextResponse.json({
      user: {
        subscriptionTier: user.subscription_tier,
        subscriptionExpiresAt: user.subscription_expires_at,
        stripeCustomerId: user.stripe_customer_id,
        stripeSubscriptionId: user.stripe_subscription_id,
      },
      usage,
      invoices: uniqueInvoices,
      upcomingInvoice,
    })

  } catch (error) {
    console.error('Error fetching billing data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}