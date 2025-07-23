import * as React from 'react'

interface ProductOfTheDayEmailProps {
  recipientEmail: string
  recipientName?: string
  productTitle: string
  nicheName: string
  date: string
  monthlyRevenue: string
  productDescription: string
  productImageUrl: string
  productUrl: string
  opportunityScore: number
  competitorCount: number
  avgPrice: string
  marketGrowth: string
  unsubscribeUrl: string
}

export const ProductOfTheDayEmail: React.FC<ProductOfTheDayEmailProps> = ({
  recipientEmail,
  recipientName,
  productTitle,
  nicheName,
  date,
  monthlyRevenue,
  productDescription,
  productImageUrl,
  productUrl,
  opportunityScore,
  competitorCount,
  avgPrice,
  marketGrowth,
  unsubscribeUrl,
}) => {
  const previewText = `${nicheName}: ${monthlyRevenue} Monthly Revenue Opportunity`
  
  return (
    <html>
      <head>
        <meta content="text/html; charset=UTF-8" httpEquiv="Content-Type" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`Product of the Day: ${date}`}</title>
      </head>
      <body style={{ backgroundColor: '#f6f9fc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
          {previewText}
        </div>
        
        <table align="center" width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f6f9fc', padding: '20px 0' }}>
          <tr>
            <td align="center">
              <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {/* Header */}
                <tr>
                  <td style={{ backgroundColor: '#4F46E5', padding: '24px 40px' }}>
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td>
                          <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                            CommerceCrafted
                          </h1>
                        </td>
                        <td align="right">
                          <p style={{ color: '#E0E7FF', fontSize: '14px', margin: 0 }}>
                            Product of the Day: {date}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                {/* Main Content */}
                <tr>
                  <td style={{ padding: '40px' }}>
                    {/* Title Section */}
                    <h2 style={{ color: '#1F2937', fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
                      {nicheName}
                    </h2>
                    
                    <p style={{ color: '#6B7280', fontSize: '16px', lineHeight: '24px', marginBottom: '32px' }}>
                      {productDescription}
                    </p>
                    
                    {/* Product Image */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <img 
                        src={productImageUrl} 
                        alt={productTitle}
                        style={{ 
                          maxWidth: '300px', 
                          height: 'auto', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }} 
                      />
                    </div>
                    
                    {/* Key Metrics */}
                    <div style={{ backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
                      <h3 style={{ color: '#1F2937', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                        Key Metrics
                      </h3>
                      
                      <table width="100%" cellPadding="0" cellSpacing="0">
                        <tr>
                          <td width="50%" style={{ paddingRight: '12px', paddingBottom: '12px' }}>
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '16px', textAlign: 'center' }}>
                              <p style={{ color: '#4F46E5', fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                                {monthlyRevenue}
                              </p>
                              <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
                                Est. Monthly Revenue
                              </p>
                            </div>
                          </td>
                          <td width="50%" style={{ paddingLeft: '12px', paddingBottom: '12px' }}>
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '16px', textAlign: 'center' }}>
                              <p style={{ color: '#10B981', fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                                {opportunityScore}
                              </p>
                              <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
                                Opportunity Score
                              </p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td width="50%" style={{ paddingRight: '12px' }}>
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '16px', textAlign: 'center' }}>
                              <p style={{ color: '#F59E0B', fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                                {competitorCount}
                              </p>
                              <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
                                Competitors
                              </p>
                            </div>
                          </td>
                          <td width="50%" style={{ paddingLeft: '12px' }}>
                            <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '16px', textAlign: 'center' }}>
                              <p style={{ color: '#7C3AED', fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                                +{marketGrowth}%
                              </p>
                              <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
                                YoY Growth
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    {/* CTA Button */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <a 
                        href={productUrl}
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#4F46E5',
                          color: '#ffffff',
                          padding: '16px 32px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}
                      >
                        Read Full Analysis →
                      </a>
                    </div>
                    
                    {/* Time Limit Notice */}
                    <div style={{ 
                      backgroundColor: '#FEF3C7', 
                      border: '1px solid #FDE68A',
                      borderRadius: '6px', 
                      padding: '16px',
                      marginBottom: '32px',
                      textAlign: 'center'
                    }}>
                      <p style={{ color: '#92400E', fontSize: '14px', margin: 0 }}>
                        🕒 Free access until midnight UTC - then available to Pro members only
                      </p>
                    </div>
                    
                    {/* Bottom Section */}
                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '24px' }}>
                      <h4 style={{ color: '#1F2937', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                        Want permanent access to all products?
                      </h4>
                      <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '20px', marginBottom: '16px' }}>
                        Join thousands of Amazon sellers who use CommerceCrafted to find profitable products every day.
                      </p>
                      <a 
                        href="https://commercecrafted.com/pricing"
                        style={{ color: '#4F46E5', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none' }}
                      >
                        Compare plans →
                      </a>
                    </div>
                  </td>
                </tr>
                
                {/* Footer */}
                <tr>
                  <td style={{ backgroundColor: '#F9FAFB', padding: '24px 40px', borderTop: '1px solid #E5E7EB' }}>
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td>
                          <p style={{ color: '#6B7280', fontSize: '12px', margin: '0 0 8px 0' }}>
                            You're receiving this email because you subscribed to CommerceCrafted's Product of the Day.
                          </p>
                          <a 
                            href={unsubscribeUrl}
                            style={{ color: '#6B7280', fontSize: '12px', textDecoration: 'underline' }}
                          >
                            Unsubscribe
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  )
}

// Plain text version
export const ProductOfTheDayEmailText = ({
  nicheName,
  date,
  monthlyRevenue,
  productDescription,
  productUrl,
  opportunityScore,
  competitorCount,
  avgPrice,
  marketGrowth,
  unsubscribeUrl,
}: ProductOfTheDayEmailProps) => {
  return `
CommerceCrafted
Product of the Day: ${date}

${nicheName}

${productDescription}

KEY METRICS:
• Est. Monthly Revenue: ${monthlyRevenue}
• Opportunity Score: ${opportunityScore}
• Competitors: ${competitorCount}
• YoY Growth: +${marketGrowth}%

Read Full Analysis: ${productUrl}

⏰ Free access until midnight UTC - then available to Pro members only

Want permanent access to all products?
Join thousands of Amazon sellers who use CommerceCrafted to find profitable products every day.

Compare plans: https://commercecrafted.com/pricing

---
You're receiving this email because you subscribed to CommerceCrafted's Product of the Day.
Unsubscribe: ${unsubscribeUrl}
`
}