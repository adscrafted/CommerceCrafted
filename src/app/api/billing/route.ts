import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripeInvoices, getStripeUpcomingInvoice, formatCurrency } from '@/lib/stripe'
import { getAllUserUsage } from '@/lib/usage'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        subscriptionExpiresAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get usage information
    const usage = await getAllUserUsage(user.id)

    // Get invoices from database
    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

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

    if (user.stripeCustomerId) {
      try {
        const stripeInvoiceList = await getStripeInvoices(user.stripeCustomerId, 10)
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

        upcomingInvoice = await getStripeUpcomingInvoice(user.stripeCustomerId)
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
        id: invoice.stripeInvoiceId,
        amount: formatCurrency(invoice.amount * 100), // Convert back to cents for formatting
        status: invoice.status,
        date: invoice.createdAt.toLocaleDateString(),
        description: invoice.description,
        invoiceUrl: invoice.invoiceUrl,
        hostedInvoiceUrl: invoice.hostedInvoiceUrl,
        periodStart: invoice.periodStart,
        periodEnd: invoice.periodEnd,
      }))
    ]

    // Remove duplicates (prefer Stripe data)
    const uniqueInvoices = allInvoices.filter((invoice, index, arr) => 
      arr.findIndex(i => i.id === invoice.id) === index
    )

    return NextResponse.json({
      user: {
        subscriptionTier: user.subscriptionTier,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
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