import { PrismaClient, UserRole, ProductStatus } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash passwords for demo accounts
  const passwordHash = await bcrypt.hash('password', 12)

  // Create admin user with password
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@commercecrafted.com' },
    update: {
      passwordHash: passwordHash,
      isActive: true,
      emailVerified: new Date()
    },
    create: {
      email: 'admin@commercecrafted.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      subscriptionTier: 'enterprise',
      passwordHash: passwordHash,
      isActive: true,
      emailVerified: new Date()
    }
  })

  // Create regular user for demo
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@commercecrafted.com' },
    update: {
      passwordHash: passwordHash,
      isActive: true,
      emailVerified: new Date()
    },
    create: {
      email: 'user@commercecrafted.com',
      name: 'Demo User',
      role: UserRole.USER,
      subscriptionTier: 'free',
      passwordHash: passwordHash,
      isActive: true,
      emailVerified: new Date()
    }
  })

  // Create sample analyst
  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@commercecrafted.com' },
    update: {
      passwordHash: passwordHash,
      isActive: true,
      emailVerified: new Date()
    },
    create: {
      email: 'analyst@commercecrafted.com',
      name: 'Product Analyst',
      role: UserRole.ANALYST,
      subscriptionTier: 'premium',
      passwordHash: passwordHash,
      isActive: true,
      emailVerified: new Date()
    }
  })

  // Create sample keywords
  const keywords = await Promise.all([
    prisma.keyword.upsert({
      where: { keyword: 'bluetooth headphones' },
      update: {},
      create: {
        keyword: 'bluetooth headphones',
        searchVolume: 165000,
        competitionScore: 8.5,
        cpc: 2.45,
        trendData: { trend: 'rising', monthlyData: [120000, 135000, 150000, 165000] }
      }
    }),
    prisma.keyword.upsert({
      where: { keyword: 'wireless earbuds' },
      update: {},
      create: {
        keyword: 'wireless earbuds',
        searchVolume: 201000,
        competitionScore: 9.2,
        cpc: 3.15,
        trendData: { trend: 'stable', monthlyData: [195000, 198000, 203000, 201000] }
      }
    }),
    prisma.keyword.upsert({
      where: { keyword: 'coffee maker' },
      update: {},
      create: {
        keyword: 'coffee maker',
        searchVolume: 74000,
        competitionScore: 6.8,
        cpc: 1.85,
        trendData: { trend: 'seasonal', monthlyData: [65000, 70000, 80000, 74000] }
      }
    }),
    prisma.keyword.upsert({
      where: { keyword: 'yoga mat' },
      update: {},
      create: {
        keyword: 'yoga mat',
        searchVolume: 110000,
        competitionScore: 5.3,
        cpc: 1.25,
        trendData: { trend: 'rising', monthlyData: [85000, 95000, 105000, 110000] }
      }
    }),
    prisma.keyword.upsert({
      where: { keyword: 'phone case' },
      update: {},
      create: {
        keyword: 'phone case',
        searchVolume: 301000,
        competitionScore: 7.9,
        cpc: 2.05,
        trendData: { trend: 'stable', monthlyData: [295000, 298000, 305000, 301000] }
      }
    })
  ])

  // Create sample products
  const products = [
    {
      asin: 'B08PZHYWJS',
      title: 'Sony WH-1000XM4 Wireless Premium Noise Canceling Overhead Headphones',
      category: 'Electronics',
      subcategory: 'Audio',
      brand: 'Sony',
      price: 279.99,
      bsr: 1234,
      rating: 4.4,
      reviewCount: 47821,
      imageUrls: JSON.stringify([
        'https://example.com/sony-headphones-1.jpg',
        'https://example.com/sony-headphones-2.jpg'
      ]),
      analysis: {
        opportunityScore: 8,
        competitionScore: 9,
        demandScore: 9,
        feasibilityScore: 6,
        timingScore: 7,
        financialAnalysis: {
          estimatedRevenue: '$15M-25M annually',
          profitMargin: '35-45%',
          investmentRequired: '$500K-1M',
          breakEvenTime: '8-12 months'
        },
        marketAnalysis: {
          marketSize: '$5.2B',
          growthRate: '12% YoY',
          topCompetitors: ['Bose', 'Apple', 'Sennheiser'],
          marketTrends: ['Active noise cancellation', 'Wireless connectivity', 'Long battery life']
        },
        competitionAnalysis: {
          level: 'High',
          majorCompetitors: 3,
          priceRange: '$200-400',
          differentiators: ['Superior ANC', 'Battery life', 'Sound quality']
        },
        keywordAnalysis: {
          primaryKeywords: ['bluetooth headphones', 'noise canceling headphones'],
          searchVolume: 165000,
          competitionLevel: 'High'
        },
        reviewAnalysis: {
          positivePoints: ['Excellent sound quality', 'Great battery life', 'Comfortable fit'],
          negativePoints: ['Expensive', 'Heavy', 'Complex controls'],
          overallSentiment: 'Very Positive'
        },
        supplyChainAnalysis: {
          complexity: 'High',
          keySuppliers: ['Asian electronics manufacturers'],
          leadTime: '3-6 months',
          risks: ['Component shortages', 'Quality control']
        },
        aiGeneratedContent: 'The Sony WH-1000XM4 represents a premium opportunity in the competitive headphones market. With exceptional noise-canceling technology and strong brand recognition, this product targets affluent consumers willing to pay premium prices for superior audio quality.',
        humanEditedContent: 'After thorough analysis, the Sony WH-1000XM4 shows strong market potential with an opportunity score of 8/10. The product benefits from Sony\'s established brand reputation and cutting-edge ANC technology, though high competition requires significant marketing investment.',
        focusGraphData: {
          centerNode: 'bluetooth headphones',
          connections: [
            { keyword: 'noise canceling', strength: 0.9 },
            { keyword: 'wireless audio', strength: 0.8 },
            { keyword: 'premium headphones', strength: 0.7 }
          ]
        },
        analystId: analyst.id
      },
      keywords: [
        { keywordId: keywords[0].id, relevanceScore: 0.95, position: 3 },
        { keywordId: keywords[1].id, relevanceScore: 0.88, position: 5 }
      ]
    },
    {
      asin: 'B07QR73T66',
      title: 'Breville BES870XL Barista Express Espresso Machine',
      category: 'Kitchen & Dining',
      subcategory: 'Coffee Machines',
      brand: 'Breville',
      price: 599.95,
      bsr: 567,
      rating: 4.2,
      reviewCount: 3421,
      imageUrls: JSON.stringify([
        'https://example.com/breville-espresso-1.jpg',
        'https://example.com/breville-espresso-2.jpg'
      ]),
      analysis: {
        opportunityScore: 7,
        competitionScore: 6,
        demandScore: 8,
        feasibilityScore: 8,
        timingScore: 9,
        financialAnalysis: {
          estimatedRevenue: '$5M-10M annually',
          profitMargin: '25-35%',
          investmentRequired: '$200K-500K',
          breakEvenTime: '6-9 months'
        },
        marketAnalysis: {
          marketSize: '$1.8B',
          growthRate: '8% YoY',
          topCompetitors: ['DeLonghi', 'Nespresso', 'Gaggia'],
          marketTrends: ['Home brewing', 'Artisan coffee', 'All-in-one machines']
        },
        competitionAnalysis: {
          level: 'Medium',
          majorCompetitors: 5,
          priceRange: '$300-800',
          differentiators: ['Built-in grinder', 'Professional features', 'Compact design']
        },
        keywordAnalysis: {
          primaryKeywords: ['espresso machine', 'coffee maker'],
          searchVolume: 74000,
          competitionLevel: 'Medium'
        },
        reviewAnalysis: {
          positivePoints: ['Great espresso quality', 'Built-in grinder', 'Easy to use'],
          negativePoints: ['Loud grinder', 'Learning curve', 'Price point'],
          overallSentiment: 'Positive'
        },
        supplyChainAnalysis: {
          complexity: 'Medium',
          keySuppliers: ['Appliance manufacturers'],
          leadTime: '2-4 months',
          risks: ['Seasonal demand', 'Component costs']
        },
        aiGeneratedContent: 'The Breville Barista Express targets the growing home coffee enthusiast market with professional-grade features at a consumer price point.',
        humanEditedContent: 'Strong opportunity in the expanding home coffee market. The built-in grinder and professional features differentiate this product from basic coffee makers.',
        focusGraphData: {
          centerNode: 'espresso machine',
          connections: [
            { keyword: 'coffee maker', strength: 0.85 },
            { keyword: 'home brewing', strength: 0.75 },
            { keyword: 'barista equipment', strength: 0.7 }
          ]
        },
        analystId: analyst.id
      },
      keywords: [
        { keywordId: keywords[2].id, relevanceScore: 0.92, position: 2 }
      ]
    },
    {
      asin: 'B085218MMG',
      title: 'Gaiam Essentials Thick Yoga Mat Fitness & Exercise Mat',
      category: 'Sports & Outdoors',
      subcategory: 'Yoga',
      brand: 'Gaiam',
      price: 29.98,
      bsr: 2890,
      rating: 4.1,
      reviewCount: 8934,
      imageUrls: JSON.stringify([
        'https://example.com/yoga-mat-1.jpg',
        'https://example.com/yoga-mat-2.jpg'
      ]),
      analysis: {
        opportunityScore: 9,
        competitionScore: 4,
        demandScore: 8,
        feasibilityScore: 9,
        timingScore: 8,
        financialAnalysis: {
          estimatedRevenue: '$8M-15M annually',
          profitMargin: '45-55%',
          investmentRequired: '$100K-300K',
          breakEvenTime: '3-6 months'
        },
        marketAnalysis: {
          marketSize: '$800M',
          growthRate: '15% YoY',
          topCompetitors: ['Manduka', 'Jade Yoga', 'Liforme'],
          marketTrends: ['Home fitness', 'Wellness focus', 'Eco-friendly materials']
        },
        competitionAnalysis: {
          level: 'Low-Medium',
          majorCompetitors: 8,
          priceRange: '$15-80',
          differentiators: ['Thickness', 'Material quality', 'Price point']
        },
        keywordAnalysis: {
          primaryKeywords: ['yoga mat', 'exercise mat'],
          searchVolume: 110000,
          competitionLevel: 'Medium'
        },
        reviewAnalysis: {
          positivePoints: ['Good thickness', 'Affordable price', 'Non-slip surface'],
          negativePoints: ['Chemical smell initially', 'Not eco-friendly', 'Durability concerns'],
          overallSentiment: 'Positive'
        },
        supplyChainAnalysis: {
          complexity: 'Low',
          keySuppliers: ['Foam manufacturers', 'Rubber suppliers'],
          leadTime: '1-3 months',
          risks: ['Material costs', 'Quality variations']
        },
        aiGeneratedContent: 'Exceptional opportunity in the rapidly growing yoga and home fitness market. Low competition and high demand create ideal conditions for market entry.',
        humanEditedContent: 'Outstanding opportunity score of 9/10. The yoga mat market shows strong growth with relatively low competition, making it an ideal product for new entrants.',
        focusGraphData: {
          centerNode: 'yoga mat',
          connections: [
            { keyword: 'exercise mat', strength: 0.9 },
            { keyword: 'fitness equipment', strength: 0.6 },
            { keyword: 'home workout', strength: 0.8 }
          ]
        },
        analystId: analyst.id
      },
      keywords: [
        { keywordId: keywords[3].id, relevanceScore: 0.98, position: 1 }
      ]
    }
  ]

  // Create products with analysis and keywords
  for (const productData of products) {
    const { analysis, keywords: productKeywords, ...productInfo } = productData
    
    const product = await prisma.product.upsert({
      where: { asin: productInfo.asin },
      update: {},
      create: {
        ...productInfo,
        status: ProductStatus.ACTIVE
      }
    })

    // Create analysis
    await prisma.productAnalysis.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        ...analysis
      }
    })

    // Create product-keyword relationships
    for (const pkData of productKeywords) {
      await prisma.productKeyword.upsert({
        where: {
          productId_keywordId: {
            productId: product.id,
            keywordId: pkData.keywordId
          }
        },
        update: {},
        create: {
          productId: product.id,
          keywordId: pkData.keywordId,
          relevanceScore: pkData.relevanceScore,
          position: pkData.position
        }
      })
    }
  }

  // Create a daily feature for today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const featuredProduct = await prisma.product.findFirst({
    where: { asin: 'B085218MMG' }
  })

  if (featuredProduct) {
    await prisma.dailyFeature.upsert({
      where: { featuredDate: today },
      update: {},
      create: {
        productId: featuredProduct.id,
        featuredDate: today,
        headline: 'Yoga Mat Market Boom: Perfect Entry Opportunity',
        summary: 'Our analysis reveals exceptional growth potential in the yoga mat market with a 9/10 opportunity score.',
        createdBy: adminUser.id
      }
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 