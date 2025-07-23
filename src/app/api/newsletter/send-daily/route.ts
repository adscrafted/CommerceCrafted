import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProductOfTheDayEmail, ProductOfTheDayEmailText } from '@/lib/email/templates/product-of-the-day'
import { Resend } from 'resend'
import { render } from '@react-email/render'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorized (e.g., from a cron job)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // For Vercel Cron Jobs, check if it's coming from Vercel
    if (process.env.VERCEL) {
      const isFromVercel = request.headers.get('x-vercel-signature')
      if (!isFromVercel && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerSupabaseClient()
    
    // Get today's daily feature
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    const dateString = today.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
    
    // Fetch the daily feature data
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products/daily-feature`)
    if (!response.ok) {
      throw new Error('Failed to fetch daily feature')
    }
    
    const dailyFeature = await response.json()
    const product = dailyFeature.product
    const nicheName = dailyFeature.nicheName || 'Featured Product'
    
    // Get all newsletter subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('is_active', true)
      .eq('subscription_type', 'daily_product')
    
    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError)
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
    }
    
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No active subscribers' })
    }
    
    // Prepare email data
    const productUrl = `${process.env.NEXT_PUBLIC_APP_URL}/product-of-the-day`
    const monthlyRevenue = product.analysis?.financialAnalysis?.estimatedRevenue || 0
    const formattedRevenue = monthlyRevenue >= 1000 
      ? `$${(monthlyRevenue / 1000).toFixed(0)}K` 
      : `$${monthlyRevenue}`
    
    // Send emails in batches
    const batchSize = 50
    const batches = []
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)
      batches.push(batch)
    }
    
    let sentCount = 0
    let failedCount = 0
    
    for (const batch of batches) {
      const emailPromises = batch.map(async (subscriber) => {
        try {
          const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${subscriber.unsubscribe_token}`
          
          const emailHtml = render(ProductOfTheDayEmail({
            recipientEmail: subscriber.email,
            recipientName: subscriber.name,
            productTitle: product.title,
            nicheName: nicheName,
            date: dateString,
            monthlyRevenue: formattedRevenue,
            productDescription: dailyFeature.reason || product.description || 'High-opportunity Amazon product with strong market potential',
            productImageUrl: product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop',
            productUrl: productUrl,
            opportunityScore: product.analysis?.opportunityScore || 87,
            competitorCount: dailyFeature.nicheProducts?.length || product.analysis?.competitionAnalysis?.competitorCount || 10,
            avgPrice: product.price?.toFixed(2) || '29.99',
            marketGrowth: product.analysis?.marketAnalysis?.growthRate || 127,
            unsubscribeUrl: unsubscribeUrl,
          }))
          
          const emailText = ProductOfTheDayEmailText({
            recipientEmail: subscriber.email,
            recipientName: subscriber.name,
            productTitle: product.title,
            nicheName: nicheName,
            date: dateString,
            monthlyRevenue: formattedRevenue,
            productDescription: dailyFeature.reason || product.description || 'High-opportunity Amazon product with strong market potential',
            productImageUrl: product.imageUrls?.[0] || '',
            productUrl: productUrl,
            opportunityScore: product.analysis?.opportunityScore || 87,
            competitorCount: dailyFeature.nicheProducts?.length || product.analysis?.competitionAnalysis?.competitorCount || 10,
            avgPrice: product.price?.toFixed(2) || '29.99',
            marketGrowth: product.analysis?.marketAnalysis?.growthRate || 127,
            unsubscribeUrl: unsubscribeUrl,
          })
          
          await resend.emails.send({
            from: 'CommerceCrafted <noreply@commercecrafted.com>',
            to: subscriber.email,
            subject: `Product of the Day: ${dateString}`,
            html: emailHtml,
            text: emailText,
          })
          
          sentCount++
          
          // Update last sent date and increment emails sent count
          await supabase
            .from('newsletter_subscriptions')
            .update({ 
              last_email_sent: new Date().toISOString(),
              emails_sent: subscriber.emails_sent + 1
            })
            .eq('id', subscriber.id)
            
        } catch (error) {
          console.error(`Failed to send email to ${subscriber.email}:`, error)
          failedCount++
        }
      })
      
      await Promise.all(emailPromises)
      
      // Add a small delay between batches to avoid rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    // Log the newsletter send
    await supabase
      .from('newsletter_campaigns')
      .insert({
        campaign_type: 'daily_product',
        subject: `Product of the Day: ${dateString}`,
        content: { 
          product_id: product.id,
          niche_name: nicheName,
          date: todayString 
        },
        recipients_count: subscribers.length,
        sent_count: sentCount,
        failed_count: failedCount,
        status: 'completed',
        sent_at: new Date().toISOString()
      })
    
    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: subscribers.length
    })
    
  } catch (error) {
    console.error('Newsletter send error:', error)
    return NextResponse.json(
      { error: 'Failed to send newsletter' },
      { status: 500 }
    )
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST with proper authorization to send newsletter' 
  })
}