// Newsletter Service for CommerceCrafted
// Handles newsletter subscriptions, campaigns, and email delivery

export interface NewsletterSubscription {
  id: string
  email: string
  userId?: string
  subscriptionType: 'daily_deals' | 'weekly_digest' | 'market_updates'
  isActive: boolean
  preferences?: {
    categories?: string[]
    frequency?: string
    format?: 'html' | 'text'
  }
  subscribeSource?: string
  unsubscribeToken: string
  subscribeDate: Date
  lastEmailSent?: Date
  emailsSent: number
  clicksCount: number
  opensCount: number
}

export interface NewsletterCampaign {
  id: string
  name: string
  subject: string
  content: string
  htmlContent?: string
  campaignType: 'daily_deal' | 'weekly_digest' | 'announcement' | 'market_update'
  featuredProductId?: string
  scheduledDate: Date
  sentDate?: Date
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled'
  recipientCount: number
  sentCount: number
  openRate?: number
  clickRate?: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface MockProductData {
  id: string
  asin: string
  title: string
  category: string
  brand: string
  price: number
  originalPrice?: number
  discount?: number
  rating: number
  reviewCount: number
  imageUrl: string
  opportunityScore: number
  estimatedRevenue: number
  competitionLevel: string
  demandTrend: string
  headline?: string
  summary?: string
  keyInsights: string[]
  quickStats: {
    marketSize: string
    growthRate: number
    averageMargin: number
    timeToMarket: string
  }
}

export interface DailDealEmailData {
  product: MockProductData
  unsubscribeUrl: string
  webViewUrl: string
  recipientEmail: string
}

export class NewsletterService {
  
  // Subscribe user to newsletter
  static async subscribe(
    email: string, 
    subscriptionType: string = 'daily_deals',
    userId?: string,
    source?: string
  ): Promise<NewsletterSubscription> {
    const unsubscribeToken = this.generateUnsubscribeToken()
    
    // In production, this would save to database
    const subscription: NewsletterSubscription = {
      id: `sub_${Date.now()}`,
      email,
      userId,
      subscriptionType: subscriptionType as NewsletterSubscription['subscriptionType'],
      isActive: true,
      preferences: {
        categories: ['electronics', 'home-garden', 'health'],
        frequency: 'daily',
        format: 'html'
      },
      subscribeSource: source,
      unsubscribeToken,
      subscribeDate: new Date(),
      emailsSent: 0,
      clicksCount: 0,
      opensCount: 0
    }

    // Send welcome email
    await this.sendWelcomeEmail(subscription)
    
    return subscription
  }

  // Unsubscribe user
  static async unsubscribe(token: string): Promise<boolean> {
    // In production, find subscription by token and deactivate
    console.log(`Unsubscribing user with token: ${token}`)
    return true
  }

  // Create daily deal campaign
  static async createDailyDealCampaign(
    productId: string,
    createdBy: string,
    scheduledDate?: Date
  ): Promise<NewsletterCampaign> {
    // In production, fetch product data from database
    const mockProduct = await this.getMockProductData(productId)
    
    const campaign: NewsletterCampaign = {
      id: `camp_${Date.now()}`,
      name: `Daily Deal - ${new Date().toISOString().split('T')[0]}`,
      subject: `🔥 Today's Amazon Opportunity: ${mockProduct.title.substring(0, 50)}...`,
      content: this.generateDailyDealTextContent(mockProduct),
      htmlContent: this.generateDailyDealHtmlContent(mockProduct),
      campaignType: 'daily_deal',
      featuredProductId: productId,
      scheduledDate: scheduledDate || new Date(),
      status: 'draft',
      recipientCount: 0,
      sentCount: 0,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return campaign
  }

  // Send daily deal email to all subscribers
  static async sendDailyDealCampaign(campaignId: string): Promise<boolean> {
    try {
      // In production:
      // 1. Get campaign from database
      // 2. Get all active daily_deals subscribers
      // 3. Send emails via email service (SendGrid, AWS SES, etc.)
      // 4. Update campaign status and metrics
      
      const mockSubscribers = await this.getMockSubscribers()
      console.log(`Sending daily deal campaign to ${mockSubscribers.length} subscribers`)
      
      // Simulate email sending
      for (const subscriber of mockSubscribers) {
        await this.sendDailyDealEmail(campaignId, subscriber)
      }
      
      return true
    } catch (error) {
      console.error('Failed to send daily deal campaign:', error)
      return false
    }
  }

  // Send individual daily deal email
  static async sendDailyDealEmail(
    campaignId: string, 
    subscription: NewsletterSubscription
  ): Promise<boolean> {
    try {
      // In production, this would use actual email service
      const emailData = await this.prepareDailyDealEmailData(campaignId, subscription)
      
      // Log for demo purposes
      console.log(`Sending daily deal email to: ${subscription.email}`)
      console.log(`Subject: ${emailData.product.headline}`)
      
      // Update subscription metrics
      await this.updateSubscriptionMetrics(subscription.id, 'email_sent')
      
      return true
    } catch (error) {
      console.error(`Failed to send email to ${subscription.email}:`, error)
      return false
    }
  }

  // Send welcome email to new subscriber
  static async sendWelcomeEmail(subscription: NewsletterSubscription): Promise<boolean> {
    try {
      const welcomeContent = this.generateWelcomeEmailContent(subscription)
      
      // In production, send via email service
      console.log(`Sending welcome email to: ${subscription.email}`)
      console.log('Welcome email content:', welcomeContent)
      
      return true
    } catch (error) {
      console.error(`Failed to send welcome email to ${subscription.email}:`, error)
      return false
    }
  }

  // Track email opens
  static async trackEmailOpen(subscriptionId: string, campaignId: string): Promise<void> {
    await this.updateSubscriptionMetrics(subscriptionId, 'email_opened')
    // Update campaign open rate
    console.log(`Email opened for campaign ${campaignId}`)
  }

  // Track email clicks
  static async trackEmailClick(subscriptionId: string, campaignId: string, url: string): Promise<void> {
    await this.updateSubscriptionMetrics(subscriptionId, 'email_clicked')
    // Update campaign click rate
    console.log(`Click tracked for campaign ${campaignId}: ${url}`)
  }

  // Helper Methods

  private static generateUnsubscribeToken(): string {
    return 'unsub_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private static async getMockProductData(productId: string): Promise<MockProductData> {
    // Mock product data - in production, fetch from database
    return {
      id: productId,
      asin: 'B08N5WRWNW',
      title: 'Wireless Noise Cancelling Bluetooth Headphones with 30H Playtime',
      category: 'Electronics > Audio > Headphones',
      brand: 'TechSound Pro',
      price: 79.99,
      originalPrice: 129.99,
      discount: 38,
      rating: 4.3,
      reviewCount: 2847,
      imageUrl: 'https://example.com/product-image.jpg',
      opportunityScore: 8.5,
      estimatedRevenue: 24500,
      competitionLevel: 'medium',
      demandTrend: 'rising',
      headline: 'Premium Audio Market Gap - High Demand, Manageable Competition',
      summary: 'This wireless headphones category shows exceptional growth with 34% YoY increase. Strong profit margins and clear differentiation opportunities make this an excellent entry point.',
      keyInsights: [
        'Market growing 34% YoY with $2.1B TAM',
        'Average profit margins of 65-70%',
        'Peak Q4 demand (+85% during holidays)',
        'Clear mid-tier positioning opportunity',
        'Strong consumer price sensitivity at $50-100 range'
      ],
      quickStats: {
        marketSize: '$2.1B',
        growthRate: 34,
        averageMargin: 67,
        timeToMarket: '6-8 weeks'
      }
    }
  }

  private static async getMockSubscribers(): Promise<NewsletterSubscription[]> {
    // Mock subscribers - in production, fetch from database
    return [
      {
        id: 'sub_1',
        email: 'user1@example.com',
        subscriptionType: 'daily_deals',
        isActive: true,
        unsubscribeToken: 'token_1',
        subscribeDate: new Date(),
        emailsSent: 5,
        clicksCount: 2,
        opensCount: 4
      },
      {
        id: 'sub_2',
        email: 'user2@example.com',
        subscriptionType: 'daily_deals',
        isActive: true,
        unsubscribeToken: 'token_2',
        subscribeDate: new Date(),
        emailsSent: 3,
        clicksCount: 1,
        opensCount: 2
      }
    ] as NewsletterSubscription[]
  }

  private static async prepareDailyDealEmailData(
    campaignId: string, 
    subscription: NewsletterSubscription
  ): Promise<DailDealEmailData> {
    const product = await this.getMockProductData('daily-deal-product')
    
    return {
      product,
      unsubscribeUrl: `https://commercecrafted.com/unsubscribe?token=${subscription.unsubscribeToken}`,
      webViewUrl: `https://commercecrafted.com/newsletter/${campaignId}`,
      recipientEmail: subscription.email
    }
  }

  private static generateDailyDealTextContent(product: MockProductData): string {
    return `
🔥 TODAY'S AMAZON OPPORTUNITY

${product.title}

Opportunity Score: ${product.opportunityScore}/10
Estimated Revenue: $${product.estimatedRevenue.toLocaleString()}
Competition Level: ${product.competitionLevel}

${product.headline}

${product.summary}

Key Insights:
${product.keyInsights.map((insight: string) => `• ${insight}`).join('\n')}

Quick Stats:
• Market Size: ${product.quickStats.marketSize}
• Growth Rate: ${product.quickStats.growthRate}%
• Average Margin: ${product.quickStats.averageMargin}%
• Time to Market: ${product.quickStats.timeToMarket}

View full analysis: https://commercecrafted.com/products/${product.id}

---
Unsubscribe: https://commercecrafted.com/unsubscribe
    `.trim()
  }

  private static generateDailyDealHtmlContent(product: MockProductData): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Today's Amazon Opportunity - CommerceCrafted</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .product-image { width: 100%; max-width: 200px; margin: 0 auto 20px; display: block; border-radius: 8px; }
        .metrics { display: flex; justify-content: space-around; margin: 20px 0; }
        .metric { text-align: center; padding: 10px; background: #f8f9fa; border-radius: 6px; }
        .insights { background: #e8f4f8; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .cta-button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔥 Today's Amazon Opportunity</h1>
            <p>Hand-picked by our research team</p>
        </div>
        
        <div class="content">
            <img src="${product.imageUrl}" alt="${product.title}" class="product-image">
            
            <h2>${product.title}</h2>
            <p><strong>Brand:</strong> ${product.brand} | <strong>Category:</strong> ${product.category}</p>
            <p><strong>Price:</strong> ${formatCurrency(product.price)} ${product.originalPrice ? `(was ${formatCurrency(product.originalPrice)})` : ''}</p>
            
            <div class="metrics">
                <div class="metric">
                    <strong>${product.opportunityScore}/10</strong><br>
                    <small>Opportunity</small>
                </div>
                <div class="metric">
                    <strong>${formatCurrency(product.estimatedRevenue)}</strong><br>
                    <small>Est. Revenue</small>
                </div>
                <div class="metric">
                    <strong>${product.competitionLevel}</strong><br>
                    <small>Competition</small>
                </div>
            </div>
            
            <div class="insights">
                <h3>${product.headline}</h3>
                <p>${product.summary}</p>
                
                <h4>Key Insights:</h4>
                <ul>
                    ${product.keyInsights.map((insight: string) => `<li>${insight}</li>`).join('')}
                </ul>
                
                <h4>Quick Stats:</h4>
                <p>
                    <strong>Market Size:</strong> ${product.quickStats.marketSize} |
                    <strong>Growth:</strong> ${product.quickStats.growthRate}% |
                    <strong>Margin:</strong> ${product.quickStats.averageMargin}% |
                    <strong>Time to Market:</strong> ${product.quickStats.timeToMarket}
                </p>
            </div>
            
            <div style="text-align: center;">
                <a href="https://commercecrafted.com/products/${product.id}" class="cta-button">
                    View Full Analysis
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>You're receiving this because you subscribed to CommerceCrafted daily deals.</p>
            <p>
                <a href="https://commercecrafted.com/unsubscribe">Unsubscribe</a> |
                <a href="https://commercecrafted.com">Visit Website</a>
            </p>
        </div>
    </div>
</body>
</html>
    `.trim()
  }

  private static generateWelcomeEmailContent(subscription: NewsletterSubscription): { subject: string; text: string; html: string } {
    return {
      subject: 'Welcome to CommerceCrafted Daily Deals! 🎉',
      text: `
Welcome to CommerceCrafted!

Thank you for subscribing to our daily Amazon opportunity alerts. You'll now receive:

• Hand-picked product opportunities every morning at 6 AM EST
• Deep market analysis and profit potential assessments
• Competition insights and entry strategies
• Growth trends and demand forecasting

Your first deal will arrive tomorrow morning!

Questions? Reply to this email or visit our help center.

Best regards,
The CommerceCrafted Team

Unsubscribe: https://commercecrafted.com/unsubscribe?token=${subscription.unsubscribeToken}
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to CommerceCrafted!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .welcome-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .benefits { background: #e8f4f8; padding: 15px; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to CommerceCrafted!</h1>
        </div>
        
        <div class="welcome-box">
            <p>Thank you for subscribing to our daily Amazon opportunity alerts!</p>
            
            <div class="benefits">
                <h3>You'll now receive:</h3>
                <ul>
                    <li>✅ Hand-picked product opportunities every morning at 6 AM EST</li>
                    <li>📊 Deep market analysis and profit potential assessments</li>
                    <li>🎯 Competition insights and entry strategies</li>
                    <li>📈 Growth trends and demand forecasting</li>
                </ul>
            </div>
            
            <p><strong>Your first deal will arrive tomorrow morning!</strong></p>
            
            <p>Questions? Reply to this email or visit our <a href="https://commercecrafted.com/help">help center</a>.</p>
            
            <p>Best regards,<br>The CommerceCrafted Team</p>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #666; margin-top: 30px;">
            <p>
                <a href="https://commercecrafted.com/unsubscribe?token=${subscription.unsubscribeToken}">Unsubscribe</a> |
                <a href="https://commercecrafted.com">Visit Website</a>
            </p>
        </div>
    </div>
</body>
</html>
      `.trim()
    }
  }

  private static async updateSubscriptionMetrics(
    subscriptionId: string, 
    action: 'email_sent' | 'email_opened' | 'email_clicked'
  ): Promise<void> {
    // In production, update database
    console.log(`Updating metrics for ${subscriptionId}: ${action}`)
  }

  // Analytics and reporting
  static async getNewsletterAnalytics(timeframe: '7d' | '30d' | '90d' = '30d') {
    // Mock analytics data - in production, query database based on timeframe
    console.log(`Getting analytics for timeframe: ${timeframe}`)
    return {
      totalSubscribers: 15420,
      activeSubscribers: 14890,
      campaignsSent: 28,
      averageOpenRate: 34.2,
      averageClickRate: 8.7,
      unsubscribeRate: 1.2,
      growthRate: 12.5,
      topPerformingCampaigns: [
        { id: '1', subject: 'Gaming Chair Opportunity', openRate: 42.1, clickRate: 12.3 },
        { id: '2', subject: 'Kitchen Gadget Analysis', openRate: 38.9, clickRate: 10.8 },
        { id: '3', subject: 'Tech Accessories Deal', openRate: 36.4, clickRate: 9.2 }
      ]
    }
  }
}